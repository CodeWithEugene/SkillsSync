import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/supabase-auth"
import { getOccupationByCode, type OnetOccupation } from "@/lib/onet"
import { updateUserGoal, getUserGoal } from "@/lib/db"

export async function PATCH(request: Request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  let body: { socCode?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const socCode = body?.socCode?.trim()
  if (!socCode || !/^[0-9]{2}-[0-9]{4}\.[0-9]{2}$/.test(socCode)) {
    return NextResponse.json({ error: "Valid socCode is required" }, { status: 400 })
  }

  const occupation: OnetOccupation | null = await getOccupationByCode(socCode)
  if (!occupation) {
    return NextResponse.json({ error: "Unknown occupation" }, { status: 404 })
  }

  // Ensure the user has a goal row to update; create a stub if not.
  const existing = await getUserGoal(user.id)
  if (!existing) {
    const { createUserGoal } = await import("@/lib/db")
    await createUserGoal(user.id, {
      careerGoal: occupation.title,
      socCode: occupation.socCode,
      socTitle: occupation.title,
    })
  } else {
    await updateUserGoal(user.id, {
      careerGoal: occupation.title,
      socCode: occupation.socCode,
      socTitle: occupation.title,
    })
  }

  return NextResponse.json({
    socCode: occupation.socCode,
    socTitle: occupation.title,
    description: occupation.description,
  })
}
