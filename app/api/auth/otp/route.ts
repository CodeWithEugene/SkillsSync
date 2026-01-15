import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

const EMAIL_USER = process.env.GMAIL_USER
const EMAIL_PASS = process.env.GMAIL_APP_PASSWORD

export async function POST(request: NextRequest) {
  const { email, action, code } = await request.json()
  if (!email) return NextResponse.json({ error: "Email is required" }, { status: 400 })

  const supabase = await createClient()

  if (action === "send") {
    // Check if user exists first
    const { data: users, error } = await supabase.rpc('get_user_by_email', { user_email: email })
    if (error || !users || users.length === 0) {
      return NextResponse.json({ error: "No account found with this email. Please sign up first." }, { status: 404 })
    }

    // Use Supabase's built-in OTP system
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback`,
      }
    })

    if (otpError) {
      console.error("Failed to send OTP:", otpError)
      return NextResponse.json({ error: `Failed to send OTP: ${otpError.message}` }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  }

  if (action === "verify") {
    // Verify OTP using Supabase's built-in verification
    const { data: authData, error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: 'email'
    })

    if (verifyError || !authData.user) {
      console.error("OTP verification failed:", verifyError)
      return NextResponse.json({ 
        error: verifyError?.message || "Invalid or expired OTP code" 
      }, { status: 401 })
    }

    // Check if user has completed onboarding
    const { data: userGoal } = await supabase
      .from("user_goals")
      .select("onboarding_completed")
      .eq("user_id", authData.user.id)
      .single()

    // Determine redirect path based on onboarding status
    const redirectPath = userGoal?.onboarding_completed ? "/dashboard" : "/onboarding"

    // OTP verified successfully - session is automatically created by Supabase
    return NextResponse.json({ 
      success: true, 
      redirect: redirectPath
    })
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 })
}

