import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { sendAuthNotification } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const type = body?.type === "signup" ? "signup" : "login"

    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await sendAuthNotification(user.email, type)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("Auth notification email failed:", err)
    return NextResponse.json(
      { error: "Failed to send notification" },
      { status: 500 }
    )
  }
}
