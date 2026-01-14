import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { getUserGoal } from "@/lib/db"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const origin = requestUrl.origin

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      return NextResponse.redirect(`${origin}/auth/login?error=${error.message}`)
    }

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      const userGoal = await getUserGoal(user.id)

      // If user has completed onboarding, go to dashboard; otherwise, go to onboarding
      const redirectPath = userGoal?.onboardingCompleted ? "/dashboard" : "/onboarding"
      return NextResponse.redirect(`${origin}${redirectPath}`)
    }
  }

  // Fallback to login if no code
  return NextResponse.redirect(`${origin}/auth/login`)
}
