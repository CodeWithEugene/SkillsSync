"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import Image from "next/image"
import { ThemeToggle } from "@/components/theme-toggle"
import { Loader2, ArrowUpRight } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { notify } from "@/lib/notify"

export default function LoginPage() {
  const [showOtp, setShowOtp] = useState(false)
  const [otpEmail, setOtpEmail] = useState("")
  const [otpCode, setOtpCode] = useState("")
  const [isOtpSending, setIsOtpSending] = useState(false)
  const [isOtpVerifying, setIsOtpVerifying] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [otpError, setOtpError] = useState<string | null>(null)

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  useEffect(() => {
    document.title = "Sign In | SkillSync"
  }, [])

  const handleSendOtp = async () => {
    setIsOtpSending(true)
    setOtpError(null)
    setOtpSent(false)
    try {
      const res = await fetch("/api/auth/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: otpEmail, action: "send" }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to send OTP")
      setOtpSent(true)
      notify.success("OTP sent", `Check ${otpEmail} for the code.`)
    } catch (err: any) {
      setOtpError(err.message)
      notify.error("Couldn't send OTP", err.message)
    } finally {
      setIsOtpSending(false)
    }
  }

  const handleVerifyOtp = async () => {
    setIsOtpVerifying(true)
    setOtpError(null)
    try {
      const res = await fetch("/api/auth/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: otpEmail, action: "verify", code: otpCode }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to verify OTP")
      window.location.href = data.redirect || "/dashboard"
    } catch (err: any) {
      setOtpError(err.message)
    } finally {
      setIsOtpVerifying(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)
    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      if (authData.user) {
        fetch("/api/email/auth-notification", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "login" }),
        }).catch(() => {})
        const { data: userGoal } = await supabase
          .from("user_goals")
          .select("onboarding_completed")
          .eq("user_id", authData.user.id)
          .single()
        window.location.href = userGoal?.onboarding_completed ? "/dashboard" : "/onboarding"
      } else {
        window.location.href = "/dashboard"
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An error occurred"
      setError(msg)
      notify.error("Sign-in failed", msg)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    const supabase = createClient()
    setIsGoogleLoading(true)
    setError(null)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      })
      if (error) throw error
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred")
      setIsGoogleLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <Image src="/logo.png" alt="SkillSync" width={595} height={118} priority className="h-9 w-auto max-w-[200px] object-contain object-left" />
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <div className="flex flex-1 items-center justify-center px-5 py-10 sm:py-16">
        <div className="w-full max-w-md">
          <div className="mb-8 space-y-2">
            <p className="editorial-eyebrow">Sign in</p>
            <h1 className="display-serif text-4xl sm:text-5xl leading-[1] tracking-tight">
              Welcome <span className="italic font-light text-primary">back</span>.
            </h1>
            <p className="text-sm text-muted-foreground">Continue to SkillSync.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading || isLoading}
            >
              {isGoogleLoading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Connecting…
                </>
              ) : (
                <>
                  <svg className="size-4" viewBox="0 0 24 24" aria-hidden>
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Continue with Google
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => setShowOtp((v) => !v)}
              disabled={isLoading}
            >
              {showOtp ? "Hide email-OTP" : "Sign in with email OTP"}
            </Button>

            {showOtp && (
              <div className="space-y-3 rounded-md border border-border bg-card p-4">
                <div className="space-y-1.5">
                  <Label htmlFor="otp-email" className="text-xs">Email</Label>
                  <Input
                    id="otp-email"
                    type="email"
                    placeholder="you@example.com"
                    required
                    value={otpEmail}
                    onChange={(e) => setOtpEmail(e.target.value)}
                  />
                </div>
                <Button
                  type="button"
                  className="w-full"
                  onClick={handleSendOtp}
                  disabled={isOtpSending}
                  size="sm"
                >
                  {isOtpSending ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Sending OTP…
                    </>
                  ) : (
                    "Send OTP"
                  )}
                </Button>
                {otpSent && (
                  <>
                    <div className="space-y-1.5">
                      <Label htmlFor="otp-code" className="text-xs">Code</Label>
                      <Input
                        id="otp-code"
                        type="text"
                        placeholder="123456"
                        required
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                      />
                    </div>
                    <Button
                      type="button"
                      className="w-full"
                      onClick={handleVerifyOtp}
                      disabled={isOtpVerifying}
                      size="sm"
                    >
                      {isOtpVerifying ? (
                        <>
                          <Loader2 className="size-4 animate-spin" />
                          Verifying…
                        </>
                      ) : (
                        "Verify OTP"
                      )}
                    </Button>
                  </>
                )}
                {otpError && (
                  <p className="text-xs text-destructive">{otpError}</p>
                )}
              </div>
            )}

            <div className="flex items-center gap-3 py-1">
              <span className="flex-1 h-px bg-border" />
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Or
              </span>
              <span className="flex-1 h-px bg-border" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs">Password</Label>
                <Link
                  href="/auth/reset-password"
                  className="text-xs text-muted-foreground hover:text-foreground underline decoration-border underline-offset-4"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <p className="text-xs text-destructive">{error}</p>
            )}

            <Button type="submit" className="w-full" disabled={isLoading || isGoogleLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Signing in…
                </>
              ) : (
                <>
                  Sign in
                  <ArrowUpRight className="size-4" />
                </>
              )}
            </Button>

            <p className="text-center text-xs text-muted-foreground pt-2">
              No account yet?{" "}
              <Link
                href="/auth/register"
                className="text-foreground underline decoration-border hover:decoration-primary underline-offset-4"
              >
                Create one
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
