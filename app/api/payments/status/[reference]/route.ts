import { createClient } from "@/lib/supabase/server"
import { getUploadPaymentByReference } from "@/lib/db"
import { NextResponse } from "next/server"

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

    return NextResponse.json({ status: payment.status })
  } catch (err) {
    console.error("[payments/status]", err)
    return NextResponse.json({ error: "Failed to get status" }, { status: 500 })
  }
}
