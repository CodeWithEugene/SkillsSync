import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/supabase-auth"
import { toggleProfilePublic } from "@/lib/db"

export async function POST(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  let isPublic: boolean
  try {
    const body = await request.json()
    if (typeof body.isPublic !== "boolean") throw new Error()
    isPublic = body.isPublic
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 })
  }

  try {
    await toggleProfilePublic(user.id, isPublic)
    return NextResponse.json({ isPublic })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
