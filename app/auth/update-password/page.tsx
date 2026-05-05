"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import Image from "next/image"
import { ThemeToggle } from "@/components/theme-toggle"
import { Loader2, CheckCircle2, XCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import {
  validatePasswordStrength,
  getPasswordRequirements,
  getPasswordStrengthColor,
} from "@/lib/password-validation"

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false)
  const [success, setSuccess] = useState(false)
  const [countdown, setCountdown] = useState(3)
  const router = useRouter()

  useEffect(() => {
    document.title = "Update Password | SkillSync"
  }, [])

  useEffect(() => {
    if (success && countdown > 0) {
      const t = setTimeout(() => setCountdown((c) => c - 1), 1000)
      return () => clearTimeout(t)
    } else if (success && countdown === 0) {
      router.push("/auth/login")
    }
  }, [success, countdown, router])

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }
    const validation = validatePasswordStrength(password)
    if (!validation.isValid) {
      setError(validation.errors.join(". "))
      setIsLoading(false)
      return
    }
    const supabase = createClient()
    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      setSuccess(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const validation = password ? validatePasswordStrength(password) : null

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
            <p className="editorial-eyebrow">New password</p>
            <h1 className="display-serif text-4xl sm:text-5xl leading-[1] tracking-tight">
              Pick a new <span className="italic font-light text-primary">passphrase</span>.
            </h1>
          </div>

          {success ? (
            <div className="space-y-5">
              <div className="rounded-md border border-success/30 bg-success/5 p-5 flex flex-col items-center gap-3 text-center">
                <CheckCircle2 className="size-10 text-success" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-success">Password updated.</p>
                  <p className="text-xs text-muted-foreground">
                    Redirecting to sign-in in {countdown}s…
                  </p>
                </div>
              </div>
              <Button onClick={() => router.push("/auth/login")} className="w-full">
                Go to sign in
              </Button>
            </div>
          ) : (
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs">New password</Label>
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
                <Label htmlFor="confirm" className="text-xs">Confirm new password</Label>
                <Input
                  id="confirm"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-xs text-destructive">Passwords do not match.</p>
                )}
              </div>

              {error && <p className="text-xs text-destructive">{error}</p>}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Updating…
                  </>
                ) : (
                  "Update password"
                )}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
