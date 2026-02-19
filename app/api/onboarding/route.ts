import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createUserGoal } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { careerGoal, educationLevel, currentStudy, studyYear, topPriority, courses } = body

    const userGoal = await createUserGoal(user.id, {
      careerGoal,
      educationLevel,
      currentStudy,
      studyYear,
      topPriority,
      courses,
    })

    return NextResponse.json(userGoal)
  } catch (error) {
    console.error("Error saving user goals:", error)
    return NextResponse.json({ error: "Failed to save goals" }, { status: 500 })
  }
}
