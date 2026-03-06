import { createClient } from "@/lib/supabase/server"
import { createUploadPayment, setUploadPaymentLipanaTransactionId } from "@/lib/db"
import { getLipanaClient, UPLOAD_FEE_KES } from "@/lib/lipana"
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
    if (!phone || typeof phone !== "string") {
      return NextResponse.json({ error: "Phone number is required" }, { status: 400 })
    }

    const normalizedPhone = phone.startsWith("+") ? phone : `+${phone}`
    const reference = `up_${user.id.slice(0, 8)}_${Date.now()}`

    const payment = await createUploadPayment(user.id, reference, UPLOAD_FEE_KES)

    const lipana = getLipanaClient()
    const stkResponse = await lipana.transactions.initiateStkPush({
      phone: normalizedPhone,
      amount: UPLOAD_FEE_KES,
      accountReference: reference,
      transactionDesc: "SkillSync document upload (KES 20)",
    })

    const transactionId =
      (stkResponse as { transactionId?: string; data?: { transactionId?: string } }).transactionId ??
      (stkResponse as { data?: { transactionId?: string } }).data?.transactionId
    if (transactionId) {
      await setUploadPaymentLipanaTransactionId(payment.id, transactionId)
    }

    return NextResponse.json({
      reference,
      message: "STK push sent. Complete payment on your phone.",
    })
  } catch (err) {
    console.error("[payments/initiate]", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to initiate payment" },
      { status: 500 }
    )
  }
}
