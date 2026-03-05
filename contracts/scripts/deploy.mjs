#!/usr/bin/env node
/**
 * Deploy SkillsRegistry to Base Sepolia (or Base Mainnet via DEPLOY_CHAIN=base).
 * Requires: PRIVATE_KEY, ETHERSCAN_API_KEY (or BASESCAN_API_KEY) in .env
 * Optional: DEPLOY_CHAIN=base for mainnet (default: base-sepolia)
 */
import { readFileSync, existsSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { execSync } from "child_process"

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, "..", "..")
const envPath = join(root, ".env")

if (existsSync(envPath)) {
  const env = readFileSync(envPath, "utf8")
  for (const line of env.split("\n")) {
    const m = line.match(/^([^#=]+)=(.*)$/)
    if (m) {
      const val = m[2].trim().replace(/\r$/, "").replace(/^["']|["']$/g, "")
      if (!process.env[m[1].trim()]) process.env[m[1].trim()] = val
    }
  }
}

const chain = process.env.DEPLOY_CHAIN === "base" ? "base" : "base-sepolia"
const rpcUrl = chain === "base" ? "https://mainnet.base.org" : "https://sepolia.base.org"
let privateKey = (process.env.PRIVATE_KEY || process.env.DEPLOYER_PRIVATE_KEY || "").trim().replace(/\r/g, "")
// Normalize to 0x + 64 hex chars (strip any non-hex, ensure 0x prefix)
if (privateKey.toLowerCase().startsWith("0x")) privateKey = privateKey.slice(2)
privateKey = "0x" + privateKey.replace(/[^0-9a-fA-F]/g, "")
const etherscanKey = process.env.ETHERSCAN_API_KEY || process.env.BASESCAN_API_KEY

if (!privateKey || privateKey.length !== 66) {
  console.error("Set PRIVATE_KEY or DEPLOYER_PRIVATE_KEY in .env (must be 64 hex chars, with or without 0x prefix)")
  process.exit(1)
}

const verifyFlag = etherscanKey ? `--verify --etherscan-api-key ${etherscanKey}` : ""

try {
  console.log(`Deploying SkillsRegistry to ${chain} (${rpcUrl})...`)
  // Pass key directly; Foundry sometimes fails to decode env:PRIVATE_KEY from Node-spawned env
  const out = execSync(
    `forge create src/SkillsRegistry.sol:SkillsRegistry --rpc-url ${rpcUrl} --private-key "${privateKey}" ${verifyFlag}`.trim(),
    {
      cwd: join(__dirname, ".."),
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"],
      env: { ...process.env, ETHERSCAN_API_KEY: etherscanKey || "" },
    }
  )
  console.log(out)
  const match = out.match(/Deployed to:\s*(0x[a-fA-F0-9]{40})/)
  if (match) {
    console.log("\n---\nSet in your .env:\nNEXT_PUBLIC_SKILLS_REGISTRY_ADDRESS=" + match[1])
    console.log("NEXT_PUBLIC_BASE_CHAIN_ID=" + (chain === "base" ? "8453" : "84532"))
  }
} catch (e) {
  if (e.stdout) console.log(e.stdout)
  if (e.stderr) console.error(e.stderr)
  console.error("Deploy failed:", e.message)
  process.exit(1)
}
