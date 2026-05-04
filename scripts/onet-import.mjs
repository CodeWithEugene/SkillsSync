#!/usr/bin/env node
/**
 * Import the O*NET 30.2 database into Postgres.
 *
 * What it does (idempotent):
 *   1. Apply scripts/010_onet_tables.sql (CREATE TABLE IF NOT EXISTS)
 *   2. Download db_30_2_text.zip into data/onet/ if missing
 *   3. Extract TSVs into data/onet/db_30_2_text/
 *   4. TRUNCATE the three onet_* tables
 *   5. Bulk insert Occupation Data, Content Model Reference, Skills
 *
 * Requires: DATABASE_URL or SUPABASE_DB_URL env var (Supabase Postgres connection string).
 * Run:      pnpm onet:import
 *
 * Re-run any time O*NET ships a new release — bump ONET_VERSION below.
 */
import pg from "pg"
import { readFileSync, existsSync, mkdirSync, writeFileSync, createReadStream } from "fs"
import { fileURLToPath } from "url"
import { dirname, join } from "path"
import { execSync } from "child_process"
import readline from "readline"

const ONET_VERSION = "30_2"
const ZIP_FILENAME = `db_${ONET_VERSION}_text.zip`
const ZIP_URL = `https://www.onetcenter.org/dl_files/database/${ZIP_FILENAME}`
const EXTRACT_SUBDIR = `db_${ONET_VERSION}_text` // O*NET zips extract into this folder

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, "..")
const dataDir = join(root, "data", "onet")
const zipPath = join(dataDir, ZIP_FILENAME)
const extractDir = join(dataDir, EXTRACT_SUBDIR)

// ── Load .env / .env.local from project root ────────────────────────────────
for (const name of [".env.local", ".env"]) {
  const p = join(root, name)
  if (!existsSync(p)) continue
  for (const line of readFileSync(p, "utf8").split("\n")) {
    const m = line.match(/^([^#=]+)=(.*)$/)
    if (!m) continue
    const val = m[2].trim().replace(/\r$/, "").replace(/^["']|["']$/g, "")
    if (!process.env[m[1].trim()]) process.env[m[1].trim()] = val
  }
}

const connectionString = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL || process.env.POSTGRES_URL
if (!connectionString || connectionString.startsWith("<")) {
  console.error(
    "Missing DATABASE_URL / SUPABASE_DB_URL / POSTGRES_URL.\n" +
    "Set it to your Supabase Postgres connection string\n" +
    "(Dashboard → Project Settings → Database → Connection string URI)."
  )
  process.exit(1)
}

const client = new pg.Client({ connectionString })

async function ensureSchema() {
  console.log("📐 Applying schema (010_onet_tables.sql) …")
  const sql = readFileSync(join(__dirname, "010_onet_tables.sql"), "utf8")
  await client.query(sql)
}

async function ensureZip() {
  if (!existsSync(dataDir)) mkdirSync(dataDir, { recursive: true })
  if (existsSync(zipPath)) {
    console.log(`📦 Using cached ${ZIP_FILENAME}`)
    return
  }
  console.log(`⬇️  Downloading ${ZIP_URL} …`)
  const res = await fetch(ZIP_URL, {
    headers: {
      "User-Agent": "SkillsSync/1.0 (info@skillssync.xyz)",
      "Accept": "application/zip",
    },
  })
  if (!res.ok) throw new Error(`Download failed: HTTP ${res.status}`)
  const buf = Buffer.from(await res.arrayBuffer())
  writeFileSync(zipPath, buf)
  console.log(`   ✅  Saved ${(buf.byteLength / 1024 / 1024).toFixed(1)} MB`)
}

async function ensureExtracted() {
  if (existsSync(extractDir)) {
    console.log(`📂 Using cached ${EXTRACT_SUBDIR}/`)
    return
  }
  console.log(`📂 Extracting ${ZIP_FILENAME} …`)
  execSync(`unzip -q -o "${zipPath}" -d "${dataDir}"`, { stdio: "inherit" })
}

// ── TSV parser. O*NET TSVs are header-row + tab-delimited, no quoting. ──────
async function* readTsv(filename) {
  const path = join(extractDir, filename)
  if (!existsSync(path)) throw new Error(`Missing ${filename} in ${extractDir}`)

  const rl = readline.createInterface({
    input: createReadStream(path, { encoding: "utf8" }),
    crlfDelay: Infinity,
  })
  let headers = null
  for await (const raw of rl) {
    if (!raw) continue
    const cols = raw.split("\t")
    if (!headers) {
      headers = cols.map((h) => h.trim())
      continue
    }
    const row = {}
    for (let i = 0; i < headers.length; i++) row[headers[i]] = cols[i] ?? ""
    yield row
  }
}

// Bulk insert in batches. Postgres allows up to ~65k bound parameters per
// statement; with 5 cols per skills row that's ~13k rows — we use 5k for safety.
async function batchInsert(table, columns, rows, batchSize = 5000) {
  if (rows.length === 0) return
  const colList = columns.join(", ")
  for (let start = 0; start < rows.length; start += batchSize) {
    const slice = rows.slice(start, start + batchSize)
    const values = []
    const params = []
    let p = 1
    for (const row of slice) {
      const placeholders = columns.map(() => `$${p++}`).join(", ")
      values.push(`(${placeholders})`)
      for (const col of columns) params.push(row[col])
    }
    const sql = `INSERT INTO ${table} (${colList}) VALUES ${values.join(", ")}`
    await client.query(sql, params)
  }
}

async function importOccupations() {
  console.log("🧩 Loading Occupation Data.txt …")
  const rows = []
  for await (const r of readTsv("Occupation Data.txt")) {
    rows.push({
      soc_code: r["O*NET-SOC Code"],
      title: r["Title"],
      description: r["Description"] || null,
    })
  }
  await client.query("TRUNCATE public.onet_occupations CASCADE")
  await batchInsert("public.onet_occupations", ["soc_code", "title", "description"], rows)
  console.log(`   ✅  ${rows.length} occupations`)
}

async function importContentModel() {
  console.log("🧩 Loading Content Model Reference.txt …")
  const rows = []
  for await (const r of readTsv("Content Model Reference.txt")) {
    rows.push({
      element_id: r["Element ID"],
      element_name: r["Element Name"],
      description: r["Description"] || null,
    })
  }
  await client.query("TRUNCATE public.onet_content_model")
  await batchInsert("public.onet_content_model", ["element_id", "element_name", "description"], rows)
  console.log(`   ✅  ${rows.length} content-model elements`)
}

async function importSkills() {
  console.log("🧩 Loading Skills.txt …")
  const rows = []
  let skipped = 0
  for await (const r of readTsv("Skills.txt")) {
    // Skip rows O*NET says aren't fit for display
    if (r["Recommend Suppress"] === "Y" || r["Not Relevant"] === "Y") {
      skipped++
      continue
    }
    rows.push({
      soc_code: r["O*NET-SOC Code"],
      element_id: r["Element ID"],
      element_name: r["Element Name"],
      scale_id: r["Scale ID"],
      data_value: r["Data Value"] === "" ? null : Number(r["Data Value"]),
    })
  }
  // Skipping cascades from occupations TRUNCATE above; explicit for safety
  await client.query("TRUNCATE public.onet_skills")
  await batchInsert(
    "public.onet_skills",
    ["soc_code", "element_id", "element_name", "scale_id", "data_value"],
    rows,
  )
  console.log(`   ✅  ${rows.length} skills (${skipped} suppressed/not-relevant skipped)`)
}

async function main() {
  console.log("\n🌐 O*NET importer (offline DB)")
  console.log("════════════════════════════════════")

  try {
    await ensureZip()
    await ensureExtracted()
  } catch (err) {
    console.error("Download/extract failed:", err.message)
    process.exit(1)
  }

  await client.connect()
  try {
    await ensureSchema()
    await importOccupations()
    await importContentModel()
    await importSkills()
    console.log("════════════════════════════════════")
    console.log("✅ O*NET import complete.\n")
  } catch (err) {
    console.error("Import failed:", err.message)
    process.exit(1)
  } finally {
    await client.end()
  }
}

main()
