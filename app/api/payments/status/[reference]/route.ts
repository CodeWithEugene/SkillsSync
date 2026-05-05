import { createClient } from "@/lib/supabase/server"
import {
  getUploadPaymentByReference,
  markUploadPaymentCompletedByReference,
} from "@/lib/db"
import { paystackVerifyTransaction } from "@/lib/paystack"
import { NextResponse } from "next/server"

/**
 * Polled by the payment modal during STK-push waiting state.
 * Returns one of: "pending" | "completed" | "failed".
 *
 * Source-of-truth order:
 *   1. Local DB — if the webhook has already marked completed, return that.
 *   2. Live Paystack verify — for the gap between user-approves-on-phone
 *      and the webhook landing in our app.
 *   3. Local DB status (still pending).
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ reference: string }> }
) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { reference } = await params
    const payment = await getUploadPaymentByReference(reference)
    if (!payment || payment.userId !== user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    // Already settled in our DB
    if (payment.status === "completed") {
      return NextResponse.json({ status: "completed" })
    }
    if (payment.status === "failed") {
      return NextResponse.json({ status: "failed" })
    }

    // Probe Paystack — webhook may not have landed yet
    try {
      const live = await paystackVerifyTransaction(reference)
      if (live.status === "success") {
        await markUploadPaymentCompletedByReference(reference)
        return NextResponse.json({ status: "completed" })
      }
      if (live.status === "failed") {
        return NextResponse.json({ status: "failed" })
      }
    } catch (err) {
      // Network blip — treat as still pending
      console.error("[payments/status] verify error:", err)
    }

    return NextResponse.json({ status: "pending" })
  } catch (err) {
    console.error("[payments/status]", err)
    return NextResponse.json({ error: "Failed to get status" }, { status: 500 })
  }
}
