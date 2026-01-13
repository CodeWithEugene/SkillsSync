import { createClient } from "@/lib/supabase/server"
import { getExtractedSkills } from "@/lib/db"
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

    const skills = await getExtractedSkills(user.id)
    return NextResponse.json(skills)
  } catch (error) {
    console.error("[v0] Error fetching skills:", error)
    return NextResponse.json({ error: "Failed to fetch skills" }, { status: 500 })
  }
}
