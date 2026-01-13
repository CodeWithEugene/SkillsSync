import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// Legacy compatibility endpoint - redirects to the signup page
export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    const supabase = await createClient()
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error("[v0] Error in register route:", error)
    return NextResponse.json({ error: "Failed to register" }, { status: 500 })
  }
}
