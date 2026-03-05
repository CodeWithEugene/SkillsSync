#!/usr/bin/env node
/**
 * Run SQL migrations against Supabase Postgres.
 * Requires DATABASE_URL or SUPABASE_DB_URL (Supabase Dashboard > Project Settings > Database > Connection string URI).
 * Usage: pnpm run db:migrate
 */
import pg from "pg"
import { readFileSync, existsSync } from "fs"
import { fileURLToPath } from "url"
import { dirname, join } from "path"

const __dirname = dirname(fileURLToPath(import.meta.url))

// Load .env from project root if present
const envPath = join(__dirname, "..", ".env")
if (existsSync(envPath)) {
  const env = readFileSync(envPath, "utf8")
  for (const line of env.split("\n")) {
    const m = line.match(/^([^#=]+)=(.*)$/)
    if (m) {
      const val = m[2].trim().replace(/^["']|["']$/g, "")
      if (!process.env[m[1].trim()]) process.env[m[1].trim()] = val
    }
  }
}

const migrations = ["007_wallet_address.sql", "008_onchain_attestations.sql"]

const connectionString =
  process.env.DATABASE_URL || process.env.SUPABASE_DB_URL

if (!connectionString) {
  console.error(
    "Missing DATABASE_URL or SUPABASE_DB_URL. Set it to your Supabase Postgres connection string (Dashboard > Project Settings > Database > Connection string URI)."
  )
  process.exit(1)
}

const client = new pg.Client({ connectionString })

async function run() {
  try {
    await client.connect()
    for (const name of migrations) {
      const path = join(__dirname, name)
      const sql = readFileSync(path, "utf8")
      console.log(`Running ${name}...`)
      await client.query(sql)
      console.log(`  OK: ${name}`)
    }
    console.log("Migrations completed.")
  } catch (err) {
    console.error("Migration failed:", err.message)
    process.exit(1)
  } finally {
    await client.end()
  }
}

run()
