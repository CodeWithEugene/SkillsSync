import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/supabase-auth"
import { getCourses, createCourse } from "@/lib/db"

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

  try {
    const courses = await getCourses(user.id)
    return NextResponse.json({ courses })
  } catch {
    return NextResponse.json({ error: "Failed to load courses" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

  const body = await req.json()
  const { name, provider, url, status, skillTags, notes } = body

  if (!name?.trim()) return NextResponse.json({ error: "Course name is required" }, { status: 400 })

  try {
    const course = await createCourse(user.id, { name: name.trim(), provider, url, status, skillTags, notes })
    return NextResponse.json({ course }, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Failed to create course" }, { status: 500 })
  }
}
