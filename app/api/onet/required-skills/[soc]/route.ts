import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/supabase-auth"
import { getOccupationByCode, getRequiredSkillsForOccupation } from "@/lib/onet"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ soc: string }> },
) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { soc } = await params
  if (!/^[0-9]{2}-[0-9]{4}\.[0-9]{2}$/.test(soc)) {
    return NextResponse.json({ error: "Invalid SOC code" }, { status: 400 })
  }

  try {
    const [occupation, skills] = await Promise.all([
      getOccupationByCode(soc),
      getRequiredSkillsForOccupation(soc),
    ])
    if (!occupation) {
      return NextResponse.json({ error: "Occupation not found" }, { status: 404 })
    }
    return NextResponse.json({ occupation, skills })
  } catch (error) {
    console.error("[onet/required-skills]", error)
    return NextResponse.json({ error: "Failed to load required skills" }, { status: 500 })
  }
}
