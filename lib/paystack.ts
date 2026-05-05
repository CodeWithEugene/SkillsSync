/**
 * Paystack payment integration.
 * Env: PAYSTACK_SECRET_KEY (live), PAYSTACK_PUBLIC_KEY (live).
 * Optional: PAYSTACK_AMOUNT (subunits, default 2000 = 20 KES), PAYSTACK_CURRENCY (default KES).
 */

import { createHmac } from "crypto"

const PAYSTACK_BASE = "https://api.paystack.co"

export function getPaystackSecretKey(): string {
  const key = process.env.PAYSTACK_SECRET_KEY?.trim()
  if (!key) throw new Error("PAYSTACK_SECRET_KEY is not set")
  return key
}

export function getPaystackPublicKey(): string {
  const key = process.env.PAYSTACK_PUBLIC_KEY?.trim()
  if (!key) throw new Error("PAYSTACK_PUBLIC_KEY is not set")
  return key
}

const DEFAULT_AMOUNT = 2000 // 20 KES in subunits (100 subunits = 1 KES)
const DEFAULT_CURRENCY = "KES"

export function getPaystackAmount(): number {
  const v = process.env.PAYSTACK_AMOUNT
  if (v == null || v === "") return DEFAULT_AMOUNT
  const n = parseInt(v, 10)
  return Number.isFinite(n) ? n : DEFAULT_AMOUNT
}

export function getPaystackCurrency(): string {
  return process.env.PAYSTACK_CURRENCY?.trim() || DEFAULT_CURRENCY
}

export type InitializeResult = {
  authorization_url: string
  access_code: string
  reference: string
}

export async function paystackInitializeTransaction(params: {
  email: string
  amount: number
  currency: string
  reference: string
  callback_url: string
  metadata?: Record<string, string>
}): Promise<InitializeResult> {
  const secret = getPaystackSecretKey()
  const body: Record<string, unknown> = {
    email: params.email,
    amount: params.amount,
    currency: params.currency,
    reference: params.reference,
    callback_url: params.callback_url,
    // M-PESA (mobile_money) first so it is the default; others still show in the list
    channels: ["mobile_money", "card"],
  }
  if (params.metadata && Object.keys(params.metadata).length > 0) {
    body.metadata = params.metadata
  }
  const res = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  })
  const json = (await res.json()) as {
    status?: boolean
    message?: string
    data?: { authorization_url: string; access_code: string; reference: string }
  }
  if (!json.status || !json.data?.authorization_url) {
    throw new Error(json.message || "Failed to initialize Paystack transaction")
  }
  return {
    authorization_url: json.data.authorization_url,
    access_code: json.data.access_code,
    reference: json.data.reference,
  }
}

export type VerifyResult =
  | { status: "success"; amount: number }
  | { status: "pending" }
  | { status: "failed" }

export async function paystackVerifyTransaction(reference: string): Promise<VerifyResult> {
  const secret = getPaystackSecretKey()
  const res = await fetch(`${PAYSTACK_BASE}/transaction/verify/${encodeURIComponent(reference)}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${secret}` },
  })
  const json = (await res.json()) as {
    status?: boolean
    data?: { status: string; amount?: number }
  }
  if (!json.status || !json.data) {
    return { status: "failed" }
  }
  if (json.data.status === "success") {
    return { status: "success", amount: json.data.amount ?? 0 }
  }
  // Charges can sit in 'pending', 'ongoing', 'queued' while STK push is in flight.
  if (
    json.data.status === "pending" ||
    json.data.status === "ongoing" ||
    json.data.status === "queued"
  ) {
    return { status: "pending" }
  }
  return { status: "failed" }
}

/**
 * Direct charge with mobile money — triggers an STK push to the user's phone.
 * No Paystack hosted page; the user just approves on their phone.
 *
 * Initial response status is usually "pay_offline" / "send_pin" / "pending"
 * for M-PESA Kenya — meaning "we sent the prompt, wait for the user". Poll
 * `/transaction/verify/<reference>` (or wait for the `charge.success` webhook)
 * to confirm settlement.
 */
export type ChargeResult = {
  reference: string
  status: string
  display_text?: string
  message?: string
}

/**
 * Normalize a phone number for Paystack's mobile_money endpoint.
 * Paystack's own examples use E.164 (e.g. '+254712345678'), so we convert
 * any input shape into that.
 */
function normalizePhoneForProvider(phone: string, provider: string): string {
  const digits = phone.replace(/[\s\-()+]/g, "")
  if (provider === "mpesa") {
    // Kenya
    if (digits.startsWith("254") && digits.length === 12) return "+" + digits
    if (digits.startsWith("0") && digits.length === 10) return "+254" + digits.slice(1)
    if (/^[17]\d{8}$/.test(digits)) return "+254" + digits // bare 9-digit
    if (digits.length >= 10) return "+" + digits
    return phone // give up — let Paystack tell us
  }
  return digits
}

export async function paystackChargeMobileMoney(params: {
  email: string
  amount: number
  currency: string
  reference: string
  /** Accepts local '07…', '+2547…', or '2547…' — normalized for the provider. */
  phone: string
  /** Default 'mpesa' (Kenya). Other markets: 'mtn', 'atl', 'vod', etc. */
  provider?: string
  metadata?: Record<string, string>
}): Promise<ChargeResult> {
  const secret = getPaystackSecretKey()
  const provider = params.provider ?? "mpesa"
  const phone = normalizePhoneForProvider(params.phone, provider)

  const body: Record<string, unknown> = {
    email: params.email,
    amount: params.amount,
    currency: params.currency,
    reference: params.reference,
    mobile_money: { phone, provider },
  }
  if (params.metadata && Object.keys(params.metadata).length > 0) {
    body.metadata = params.metadata
  }

  const res = await fetch(`${PAYSTACK_BASE}/charge`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  })
  const rawText = await res.text()
  let json: {
    status?: boolean
    message?: string
    errors?: unknown
    data?: { reference: string; status: string; display_text?: string }
  } = {}
  try {
    json = JSON.parse(rawText)
  } catch {
    /* keep empty json */
  }
  if (!res.ok || !json.status || !json.data) {
    // Surface the full Paystack response so we can see field-level errors
    console.error("[paystack/charge] HTTP", res.status, "body:", rawText)
    console.error("[paystack/charge] sent phone:", phone, "provider:", provider)
    const detail =
      (json.errors && JSON.stringify(json.errors)) ||
      json.message ||
      `HTTP ${res.status}`
    throw new Error(`Paystack: ${detail}`)
  }
  return {
    reference: json.data.reference,
    status: json.data.status,
    display_text: json.data.display_text,
    message: json.message,
  }
}

export function paystackVerifyWebhookSignature(payload: string, signature: string): boolean {
  const secret = getPaystackSecretKey()
  const hash = createHmac("sha512", secret).update(payload).digest("hex")
  return hash === signature
}
