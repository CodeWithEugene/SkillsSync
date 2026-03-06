/**
 * setup-lipana-webhook.mjs
 *
 * Uses the Lipana SDK to set the webhook URL in your Lipana dashboard.
 * Run from project root with LIPANA_SECRET_KEY in .env:
 *
 *   node scripts/setup-lipana-webhook.mjs
 *
 * Optional: LIPANA_ENVIRONMENT=sandbox|production (default: production)
 * Optional: LIPANA_WEBHOOK_BASE_URL=https://skillssync.xyz (default)
 */

import { readFileSync } from "fs"
import { resolve, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))

// Load .env from project root
const envPath = resolve(__dirname, "../.env")
try {
  const envLines = readFileSync(envPath, "utf-8").split("\n")
  for (const line of envLines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue
    const eqIdx = trimmed.indexOf("=")
    if (eqIdx === -1) continue
    const key = trimmed.slice(0, eqIdx).trim()
    let val = trimmed.slice(eqIdx + 1).trim()
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'")))
      val = val.slice(1, -1)
    if (!process.env[key]) process.env[key] = val
  }
} catch (e) {
  if (e.code !== "ENOENT") throw e
}

let apiKey = (process.env.LIPANA_SECRET_KEY || "").trim().replace(/\r/g, "")
if (!apiKey) {
  console.error("Missing LIPANA_SECRET_KEY in .env")
  process.exit(1)
}

const baseUrl = process.env.LIPANA_WEBHOOK_BASE_URL || "https://skillssync.xyz"
const webhookUrl = `${baseUrl.replace(/\/$/, "")}/api/payments/webhook`
const environment = process.env.LIPANA_ENVIRONMENT === "sandbox" ? "sandbox" : "production"

const { Lipana } = await import("@lipana/sdk")
const lipana = new Lipana({ apiKey, environment })

console.log("Lipana webhook setup")
console.log("  Environment:", environment)
console.log("  Webhook URL:", webhookUrl)
console.log("")

try {
  const settings = await lipana.webhooks.updateSettings({
    webhookUrl,
    enabled: true,
  })
  console.log("Webhook settings updated successfully.")
  if (settings?.webhookUrl) console.log("  Webhook URL:", settings.webhookUrl)
  if (settings?.webhooksEnabled !== undefined)
    console.log("  Enabled:", settings.webhooksEnabled)
  if (settings?.webhookSecret)
    console.log("  Secret: (use LIPANA_WEBHOOK_SECRET in .env; copy from dashboard if needed)")
} catch (err) {
  console.error("Error:", err.message)
  if (err.response?.data) console.error("  Details:", err.response.data)
  if (err.message?.includes("No response")) {
    console.error("\nTip: Run this from a machine that can reach api.lipana.dev (or api-sandbox.lipana.dev).")
  }
  if (err.message?.includes("Not authorized") || err.statusCode === 401) {
    console.error("\nTip: For production, use a production API key (lip_sk_live_...) from the Lipana dashboard.")
    console.error("If webhook settings require dashboard login, set the webhook URL manually in the Lipana dashboard:")
    console.error("  → https://skillssync.xyz/api/payments/webhook")
  }
  process.exit(1)
}
