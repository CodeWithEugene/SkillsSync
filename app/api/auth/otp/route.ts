import { NextRequest, NextResponse } from "next/server"
import nodemailer from "nodemailer"
import { createClient } from "@/lib/supabase/server"

// In-memory store for OTPs (for demo; use a DB or cache in production)
const otpStore = new Map<string, { code: string; expires: number }>()

const EMAIL_USER = process.env.GMAIL_USER
const EMAIL_PASS = process.env.GMAIL_APP_PASSWORD

async function sendMail({ to, subject, text, code }: { to: string; subject: string; text: string; code: string }) {
  if (!EMAIL_USER || !EMAIL_PASS) throw new Error("Missing Gmail credentials in .env")
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
  })
  const mailOptions = {
    from: `SkillSync <${EMAIL_USER}>`,
    to,
    subject,
    text,
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; background: #f4f8fb; padding: 32px; border-radius: 12px; max-width: 420px; margin: 0 auto; border: 1px solid #e5e7eb;">
        <div style="text-align: center; margin-bottom: 24px;">
          <img src="https://skillsyncglobal.vercel.app/logo.png" alt="SkillSync Logo" style="width: 240px; height: 120px; object-fit: contain; display: inline-block; margin-bottom: 8px;" />
          <h1 style="color: #0190fe; font-size: 2rem; margin: 0;">Welcome to SkillSync!</h1>
        </div>
        <p style="color: #111827; font-size: 1.1rem; margin-bottom: 24px; text-align: center;">
          Your one-time password (OTP) is:
        </p>
        <div style="background: #3b82f6; color: #fff; font-size: 2rem; font-weight: bold; letter-spacing: 4px; padding: 16px 0; border-radius: 8px; text-align: center; margin-bottom: 24px;">
          ${code}
        </div>
        <p style="color: #374151; font-size: 1rem; text-align: center; margin-bottom: 0;">
          Enter this code to sign in. This code will expire in 5 minutes.<br><br>
          <span style="color: #6b7280; font-size: 0.95rem;">If you did not request this, you can safely ignore this email.</span>
        </p>
        <div style="margin-top: 32px; text-align: center;">
           <a href="https://codewitheugene.top/" style="color: #0190fe; font-weight: 600; font-size: 1rem; text-decoration: none;" target="_blank">Eugene Mutembei, Founder, SkillSync Global.</a>
        </div>
      </div>
    `,
  }
  try {
    await transporter.sendMail(mailOptions)
    return true
  } catch (err) {
    console.error("Failed to send OTP email:", err)
    throw new Error("Failed to send OTP email")
  }
}

export async function POST(request: NextRequest) {
  const { email, action, code } = await request.json()
  if (!email) return NextResponse.json({ error: "Email is required" }, { status: 400 })

  if (action === "send") {
    // Only allow OTP for existing users in Supabase Auth
    const supabase = await createClient()
    const { data: users, error } = await supabase.rpc('get_user_by_email', { user_email: email })
    if (error || !users || users.length === 0) {
      return NextResponse.json({ error: "No account found with this email. Please sign up first." }, { status: 404 })
    }
    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    otpStore.set(email, { code: otp, expires: Date.now() + 5 * 60 * 1000 }) // 5 min expiry

    // Send email (simulate or use a real service in production)
    try {
      await sendMail({
        to: email,
        subject: "Your SkillSync OTP Code",
        text: `Your OTP code is: ${otp}`,
        code: otp,
      })
    } catch (e) {
      return NextResponse.json({ error: "Failed to send OTP email" }, { status: 500 })
    }
    return NextResponse.json({ success: true })
  }

  if (action === "verify") {
    const entry = otpStore.get(email)
    if (!entry || entry.expires < Date.now()) {
      return NextResponse.json({ error: "OTP expired or not found" }, { status: 400 })
    }
    if (entry.code !== code) {
      return NextResponse.json({ error: "Invalid OTP" }, { status: 400 })
    }
    // Check user exists in Supabase Auth
    const supabase = await createClient()
    const { data: users, error } = await supabase.rpc('get_user_by_email', { user_email: email })
    if (error || !users || users.length === 0) {
      return NextResponse.json({ error: "No account found with this email. Please sign up first." }, { status: 404 })
    }
    otpStore.delete(email)
    // Use verifyOtp to create a session for the user
    const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: "email"
    })
    if (verifyError) {
      return NextResponse.json({ error: verifyError.message }, { status: 401 })
    }
    // Success: session cookie should be set by Supabase middleware
    return NextResponse.json({ success: true, redirect: "/dashboard" })
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 })
}
