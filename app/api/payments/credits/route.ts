import { createClient } from "@/lib/supabase/server"
import { hasUnconsumedUploadCredit } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const hasCredit = await hasUnconsumedUploadCredit(user.id)
    return NextResponse.json({ hasCredit })
  } catch (err) {
    console.error("[payments/credits]", err)
    return NextResponse.json({ error: "Failed to check credits" }, { status: 500 })
  }
}
