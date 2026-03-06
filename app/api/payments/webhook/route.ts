import { markUploadPaymentCompletedByReference } from "@/lib/db"
import { paystackVerifyWebhookSignature } from "@/lib/paystack"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const rawBody = await request.text()
    const signature = request.headers.get("x-paystack-signature") ?? ""

    if (!paystackVerifyWebhookSignature(rawBody, signature)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    const payload = JSON.parse(rawBody) as { event?: string; data?: { reference?: string } }
    if (payload.event !== "charge.success") {
      return NextResponse.json({ received: true })
    }
    const reference = payload.data?.reference
    if (!reference) {
      return NextResponse.json({ received: true })
    }

    await markUploadPaymentCompletedByReference(reference)
    return NextResponse.json({ received: true })
  } catch (err) {
    console.error("[payments/webhook]", err)
    return NextResponse.json({ error: "Webhook error" }, { status: 500 })
  }
}
