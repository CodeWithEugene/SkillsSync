import { createClient } from "@/lib/supabase/server"
import { getUserGoal } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const origin = requestUrl.origin

  // If no code is provided, redirect to login
  if (!code) {
    return NextResponse.redirect(`${origin}/auth/login?error=missing_code`)
  }

  const supabase = await createClient()
  
  // Exchange the code for a session
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

  if (exchangeError) {
    return NextResponse.redirect(`${origin}/auth/login?error=${encodeURIComponent(exchangeError.message)}`)
  }

  // Get the authenticated user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return NextResponse.redirect(`${origin}/auth/login?error=${encodeURIComponent(userError?.message || "authentication_failed")}`)
  }

  // Check if user has completed onboarding
  try {
    const userGoal = await getUserGoal(user.id)
    
    if (!userGoal || !userGoal.onboardingCompleted) {
      // New user or incomplete onboarding: redirect to onboarding
      return NextResponse.redirect(`${origin}/onboarding`)
    }

    // Existing user with completed onboarding: redirect to dashboard
    return NextResponse.redirect(`${origin}/dashboard`)
  } catch (error) {
    // If there's an error checking onboarding, redirect to onboarding as a safe default
    console.error("Error checking user goal:", error)
    return NextResponse.redirect(`${origin}/onboarding`)
  }
}
