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

export type VerifyResult = { status: "success"; amount: number } | { status: "failed" }

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
  return { status: "failed" }
}

export function paystackVerifyWebhookSignature(payload: string, signature: string): boolean {
  const secret = getPaystackSecretKey()
  const hash = createHmac("sha512", secret).update(payload).digest("hex")
  return hash === signature
}
