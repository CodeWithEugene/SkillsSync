import { NextResponse, type NextRequest } from "next/server"
import { getCurrentUser } from "@/lib/supabase-auth"
import { searchOccupations } from "@/lib/onet"

export async function GET(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const q = request.nextUrl.searchParams.get("q")?.trim() ?? ""
  if (q.length < 2) return NextResponse.json({ careers: [] })

  try {
    const careers = await searchOccupations(q, 10)
    return NextResponse.json({ careers })
  } catch (error) {
    console.error("[onet/careers]", error)
    return NextResponse.json({ error: "Failed to search careers" }, { status: 500 })
  }
}
