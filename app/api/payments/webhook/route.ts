import { getLipanaClient, getWebhookSecret } from "@/lib/lipana"
import { markUploadPaymentCompletedByTransactionId } from "@/lib/db"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const rawBody = await request.text()
    const signature = request.headers.get("x-lipana-signature") ?? ""
    const secret = getWebhookSecret()
    const lipana = getLipanaClient()

    const isValid = lipana.webhooks.verify(rawBody, signature, secret)
    if (!isValid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    const payload = JSON.parse(rawBody) as {
      event?: string
      data?: { transactionId?: string; transaction_id?: string }
    }
    if (payload.event !== "payment.success") {
      return NextResponse.json({ received: true })
    }
    const transactionId =
      payload.data?.transactionId ?? payload.data?.transaction_id
    if (!transactionId) {
      return NextResponse.json({ received: true })
    }

    await markUploadPaymentCompletedByTransactionId(transactionId)
    return NextResponse.json({ received: true })
  } catch (err) {
    console.error("[payments/webhook]", err)
    return NextResponse.json({ error: "Webhook error" }, { status: 500 })
  }
}
