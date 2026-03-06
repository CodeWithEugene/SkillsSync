import { markUploadPaymentCompletedByReference } from "@/lib/db"
import { paystackVerifyTransaction } from "@/lib/paystack"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const reference = searchParams.get("reference")
    if (!reference) {
      return NextResponse.json({ error: "Missing reference" }, { status: 400 })
    }

    const result = await paystackVerifyTransaction(reference)
    if (result.status !== "success") {
      return NextResponse.json({ success: false, status: "failed" })
    }

    await markUploadPaymentCompletedByReference(reference)
    return NextResponse.json({ success: true, status: "success" })
  } catch (err) {
    console.error("[payments/verify]", err)
    return NextResponse.json({ success: false, error: "Verification failed" }, { status: 500 })
  }
}
