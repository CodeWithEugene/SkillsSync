import { createClient } from "@/lib/supabase/server"
import { createUploadPayment } from "@/lib/db"
import {
  getPaystackAmount,
  getPaystackCurrency,
  paystackChargeMobileMoney,
} from "@/lib/paystack"
import { NextResponse } from "next/server"

/**
 * Direct M-PESA STK push — no Paystack hosted page.
 * The user enters their phone in our modal once; Paystack sends the prompt
 * to their phone immediately; they approve with their PIN.
 * The frontend polls /api/payments/status/<reference> until it settles.
 */
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
    const phoneRaw = body?.phone
    if (!phoneRaw || typeof phoneRaw !== "string" || phoneRaw.trim().length < 8) {
      return NextResponse.json(
        { error: "A valid M-PESA phone number is required." },
        { status: 400 }
      )
    }

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

    await createUploadPayment(user.id, reference, amount)

    let charge
    try {
      charge = await paystackChargeMobileMoney({
        email,
        amount,
        currency,
        reference,
        phone: phoneRaw.trim(),
        metadata: { user_id: user.id },
      })
    } catch (err) {
      console.error("[payments/initiate] charge error:", err)
      const message =
        err instanceof Error ? err.message : "Couldn't reach Paystack"
      return NextResponse.json({ error: message }, { status: 502 })
    }

    // Charge.status is 'pay_offline' | 'send_pin' | 'pending' | 'success' | 'failed' …
    // For M-PESA Kenya the typical first state is 'pay_offline' meaning the STK
    // push went out and we wait for the user to confirm on their phone.
    return NextResponse.json({
      reference: charge.reference,
      status: charge.status,
      message:
        charge.display_text ??
        "Approve the M-PESA prompt on your phone to complete payment.",
    })
  } catch (err) {
    console.error("[payments/initiate]", err)
    const message = err instanceof Error ? err.message : "Failed to initiate payment"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
