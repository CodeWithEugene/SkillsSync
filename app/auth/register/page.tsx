"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import Image from "next/image"
import { ThemeToggle } from "@/components/theme-toggle"
import { Loader2, CheckCircle2, XCircle, ArrowUpRight } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import {
  validatePasswordStrength,
  getPasswordRequirements,
  getPasswordStrengthColor,
} from "@/lib/password-validation"

export default function RegisterPage() {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false)

  useEffect(() => {
    document.title = "Create Account | SkillSync"
  }, [])

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    const passwordValidation = validatePasswordStrength(password)
    if (!passwordValidation.isValid) {
      setError(passwordValidation.errors.join(". "))
      setIsLoading(false)
      return
    }

    const supabase = createClient()
    try {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            full_name: `${firstName} ${lastName}`,
          },
        },
      })
      if (signUpError) throw signUpError
      if (signUpData.user) {
        fetch("/api/email/auth-notification", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "signup" }),
        }).catch(() => {})
        window.location.href = "/onboarding"
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred")
      setIsLoading(false)
    }
  }

  const handleGoogleSignUp = async () => {
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

  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword
  const validation = password ? validatePasswordStrength(password) : null

  return (
    <div className="flex min-h-screen w-full flex-col bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <Image src="/logo.png" alt="SkillSync" width={120} height={120} className="h-7 w-auto" />
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <div className="flex flex-1 items-center justify-center px-5 py-10 sm:py-16">
        <div className="w-full max-w-md">
          <div className="mb-8 space-y-2">
            <p className="editorial-eyebrow">Create your account</p>
            <h1 className="display-serif text-4xl sm:text-5xl leading-[1] tracking-tight">
              Begin your <span className="italic font-light text-primary">profile</span>.
            </h1>
            <p className="text-sm text-muted-foreground">
              You&rsquo;ll pick a target career on the next screen.
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleGoogleSignUp}
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

            <div className="flex items-center gap-3 py-1">
              <span className="flex-1 h-px bg-border" />
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Or
              </span>
              <span className="flex-1 h-px bg-border" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="firstName" className="text-xs">First name</Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="Eugene"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lastName" className="text-xs">Last name</Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Mutembei"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
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
                {validation && (
                  <span
                    className={`font-mono text-[10px] uppercase tracking-widest ${getPasswordStrengthColor(validation.strength)}`}
                  >
                    {validation.strength}
                  </span>
                )}
              </div>
              <Input
                id="password"
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setShowPasswordRequirements(true)
                }}
                onFocus={() => setShowPasswordRequirements(true)}
              />
              {showPasswordRequirements && password && (
                <div className="rounded-md border border-border bg-muted/30 p-3 mt-2 space-y-1 text-xs">
                  {getPasswordRequirements(password).map((req, i) => (
                    <div key={i} className="flex items-center gap-2">
                      {req.met ? (
                        <CheckCircle2 className="size-3.5 text-success shrink-0" />
                      ) : (
                        <XCircle className="size-3.5 text-muted-foreground shrink-0" />
                      )}
                      <span className={req.met ? "text-success" : "text-muted-foreground"}>
                        {req.text}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirm-password" className="text-xs">Confirm password</Label>
              <Input
                id="confirm-password"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              {confirmPassword && !passwordsMatch && (
                <p className="text-xs text-destructive">Passwords do not match.</p>
              )}
              {passwordsMatch && (
                <p className="text-xs text-success flex items-center gap-1.5">
                  <CheckCircle2 className="size-3" /> Match.
                </p>
              )}
            </div>

            {error && <p className="text-xs text-destructive">{error}</p>}

            <Button type="submit" className="w-full" disabled={isLoading || isGoogleLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Creating…
                </>
              ) : (
                <>
                  Create account
                  <ArrowUpRight className="size-4" />
                </>
              )}
            </Button>

            <p className="text-center text-xs text-muted-foreground pt-2">
              Already a member?{" "}
              <Link
                href="/auth/login"
                className="text-foreground underline decoration-border hover:decoration-primary underline-offset-4"
              >
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
