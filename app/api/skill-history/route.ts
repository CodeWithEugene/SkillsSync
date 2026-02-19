import { createClient } from "@/lib/supabase/server"
import { getSkillHistory } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const history = await getSkillHistory(user.id)
    return NextResponse.json(history)
  } catch (error) {
    console.error("[skillsync] Error fetching skill history:", error)
    return NextResponse.json({ error: "Failed to fetch skill history" }, { status: 500 })
  }
}
