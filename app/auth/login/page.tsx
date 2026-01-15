"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import Image from "next/image"
import { ThemeToggle } from "@/components/theme-toggle"
import { Sparkles, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function LoginPage() {
  // OTP state hooks
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
  const router = useRouter()

  useEffect(() => {
    document.title = "Sign In | SkillSync"
  }, [])

  // OTP handlers
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
    } catch (err: any) {
      setOtpError(err.message)
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
      
      // Set the session using the tokens from the API
      if (data.session) {
        const supabase = createClient()
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token
        })
        
        if (sessionError) {
          console.error("Failed to set session:", sessionError)
          throw new Error("Failed to establish session")
        }
      }
      
      // Redirect to the appropriate page
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
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error

      // Check if user has completed onboarding
      if (authData.user) {
        const { data: userGoal } = await supabase
          .from("user_goals")
          .select("onboarding_completed")
          .eq("user_id", authData.user.id)
          .single()

        // Redirect based on onboarding status
        window.location.href = userGoal?.onboarding_completed ? "/dashboard" : "/onboarding"
      } else {
        window.location.href = "/dashboard"
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    const supabase = createClient()
    setIsGoogleLoading(true)
    setError(null)

    try {
      const redirectUrl = process.env.NEXT_PUBLIC_APP_URL
        ? `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`
        : `${window.location.origin}/auth/callback`

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
        },
      })
      if (error) throw error
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
      setIsGoogleLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2 group">
            <Image
              src="/logo.png"
              alt="SkillSync Logo"
              width={160}
              height={160}
              className="rounded-lg transition-transform group-hover:scale-110"
            />
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <div className="flex flex-1 items-center justify-center p-4 sm:p-6 md:p-10">
        <div className="w-full max-w-sm">
          <Card className="shadow-lg">
            <CardHeader className="text-center space-y-1 sm:space-y-2 px-4 sm:px-6">
              <CardTitle className="text-xl sm:text-2xl font-bold">Welcome back</CardTitle>
              <CardDescription className="text-sm">Sign in to continue to SkillSync</CardDescription>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <form onSubmit={handleLogin} className="space-y-3 sm:space-y-4">

                <Button
                  type="button"
                  variant="outline"
                  className="w-full transition-all hover:scale-[1.02] bg-transparent hover:text-foreground"
                  onClick={handleGoogleSignIn}
                  disabled={isGoogleLoading || isLoading}
                >
                  {isGoogleLoading ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <svg className="mr-2 size-4" viewBox="0 0 24 24">
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
                  className="w-full transition-all hover:scale-[1.02] bg-transparent hover:text-foreground mt-2"
                  onClick={() => setShowOtp(true)}
                  disabled={isLoading}
                >
                  Sign in with OTP
                </Button>

                {showOtp && (
                  <div className="space-y-2 mt-4">
                    <Label htmlFor="otp-email">Email</Label>
                    <Input
                      id="otp-email"
                      type="email"
                      placeholder="you@example.com"
                      required
                      value={otpEmail}
                      onChange={(e) => setOtpEmail(e.target.value)}
                      className="transition-all focus:ring-2 focus:ring-primary"
                    />
                    <Button
                      type="button"
                      className="w-full mt-2"
                      onClick={handleSendOtp}
                      disabled={isOtpSending}
                    >
                      {isOtpSending ? (
                        <><Loader2 className="mr-2 size-4 animate-spin" />Sending OTP...</>
                      ) : (
                        "Send OTP"
                      )}
                    </Button>
                    {otpSent && (
                      <>
                        <Label htmlFor="otp-code">Enter OTP</Label>
                        <Input
                          id="otp-code"
                          type="text"
                          placeholder="Enter the code you received"
                          required
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value)}
                          className="transition-all focus:ring-2 focus:ring-primary"
                        />
                        <Button
                          type="button"
                          className="w-full mt-2"
                          onClick={handleVerifyOtp}
                          disabled={isOtpVerifying}
                        >
                          {isOtpVerifying ? (
                            <><Loader2 className="mr-2 size-4 animate-spin" />Verifying...</>
                          ) : (
                            "Verify OTP"
                          )}
                        </Button>
                      </>
                    )}
                    {otpError && (
                      <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3">
                        <p className="text-sm text-destructive">{otpError}</p>
                      </div>
                    )}
                  </div>
                )}

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="transition-all focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="transition-all focus:ring-2 focus:ring-primary"
                  />
                </div>
                {error && (
                  <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3">
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}
                <Button
                  type="submit"
                  className="w-full transition-all hover:scale-[1.02]"
                  disabled={isLoading || isGoogleLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Signing you in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
                <div className="text-center text-sm text-muted-foreground">
                  Don&apos;t have an account?{" "}
                  <Link href="/auth/register" className="font-medium text-primary hover:underline">
                    Create account
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
