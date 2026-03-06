import { createClient } from "@/lib/supabase/server"
import { createUploadPayment } from "@/lib/db"
import {
  getPaystackAmount,
  getPaystackCurrency,
  paystackInitializeTransaction,
} from "@/lib/paystack"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const phone = body?.phone as string | undefined
    const email = (user.email ?? "").trim()
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Your account needs a valid email. Add one in account settings." },
        { status: 400 }
      )
    }

    const reference = `up_${user.id.slice(0, 8)}_${Date.now()}`
    const amount = getPaystackAmount()
    const currency = getPaystackCurrency()

    await createUploadPayment(user.id, reference, amount) // amount stored for record; Paystack uses subunits

    // CRITICAL: Use only a fixed production URL for callback. Never use x-forwarded-host on Vercel
    // or Paystack will redirect to a deployment-specific URL that can 404 (DEPLOYMENT_NOT_FOUND).
    const isProduction = process.env.VERCEL_ENV === "production" || process.env.NODE_ENV === "production"
    const baseUrl = isProduction
      ? (process.env.PAYSTACK_CALLBACK_BASE_URL?.trim() || process.env.NEXT_PUBLIC_APP_URL?.trim() || "")
      : (process.env.PAYSTACK_CALLBACK_BASE_URL?.trim() ||
          process.env.NEXT_PUBLIC_APP_URL?.trim() ||
          (request.headers.get("x-forwarded-proto") && request.headers.get("x-forwarded-host")
            ? `${request.headers.get("x-forwarded-proto")}://${request.headers.get("x-forwarded-host")}`
            : "http://localhost:3000"))
    if (!baseUrl) {
      console.error("[payments/initiate] Set PAYSTACK_CALLBACK_BASE_URL or NEXT_PUBLIC_APP_URL to your production URL (e.g. https://skillssync.xyz)")
      return NextResponse.json(
        { error: "Payment callback URL not configured. Please set PAYSTACK_CALLBACK_BASE_URL." },
        { status: 500 }
      )
    }
    const callbackUrl = `${baseUrl.replace(/\/$/, "")}/payment-callback`

    const result = await paystackInitializeTransaction({
      email,
      amount,
      currency,
      reference,
      callback_url: callbackUrl,
      metadata: phone ? { phone: typeof phone === "string" ? phone : "" } : undefined,
    })

    return NextResponse.json({
      reference: result.reference,
      authorization_url: result.authorization_url,
      access_code: result.access_code,
      message: "Complete payment in the popup.",
    })
  } catch (err) {
    console.error("[payments/initiate]", err)
    const message = err instanceof Error ? err.message : "Failed to initiate payment"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
