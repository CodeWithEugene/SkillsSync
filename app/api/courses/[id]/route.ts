import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/supabase-auth"
import { updateCourse, deleteCourse } from "@/lib/db"

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

  const { id } = await params
  const body = await req.json()

  try {
    const course = await updateCourse(id, user.id, body)
    return NextResponse.json({ course })
  } catch {
    return NextResponse.json({ error: "Failed to update course" }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

  const { id } = await params

  try {
    await deleteCourse(id, user.id)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Failed to delete course" }, { status: 500 })
  }
}
