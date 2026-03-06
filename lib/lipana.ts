import { Lipana } from "@lipana/sdk"

const UPLOAD_FEE_KES = 20

export function getLipanaClient() {
  const apiKey = process.env.LIPANA_SECRET_KEY
  if (!apiKey) throw new Error("LIPANA_SECRET_KEY is not set")
  return new Lipana({
    apiKey,
    environment: process.env.LIPANA_ENVIRONMENT === "production" ? "production" : "sandbox",
  })
}

export function getWebhookSecret(): string {
  const secret = process.env.LIPANA_WEBHOOK_SECRET
  if (!secret) throw new Error("LIPANA_WEBHOOK_SECRET is not set")
  return secret
}

export { UPLOAD_FEE_KES }
