"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import Image from "next/image"
import { ThemeToggle } from "@/components/theme-toggle"
import { Loader2, CheckCircle2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { notify } from "@/lib/notify"

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  useEffect(() => {
    document.title = "Reset Password | SkillSync"
  }, [])

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      })
      if (error) throw error
      setEmailSent(true)
      notify.success("Reset link sent", `Check ${email} — link expires in 60 minutes.`)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An error occurred"
      setError(msg)
      notify.error("Couldn't send reset link", msg)
    } finally {
      setIsLoading(false)
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
            <p className="editorial-eyebrow">Recover access</p>
            <h1 className="display-serif text-4xl sm:text-5xl leading-[1] tracking-tight">
              Reset your <span className="italic font-light text-primary">password</span>.
            </h1>
            <p className="text-sm text-muted-foreground">
              {emailSent
                ? "Check your email for the reset link."
                : "We&rsquo;ll send a link to your inbox."}
            </p>
          </div>

          {emailSent ? (
            <div className="space-y-5">
              <div className="rounded-md border border-success/30 bg-success/5 p-4 flex items-start gap-3">
                <CheckCircle2 className="size-5 text-success flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-success">Email sent.</p>
                  <p className="text-xs text-muted-foreground">
                    The link expires in 60 minutes.
                  </p>
                </div>
              </div>
              <Link
                href="/auth/login"
                className="text-sm text-foreground underline decoration-border hover:decoration-primary underline-offset-4"
              >
                Back to sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
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
              {error && <p className="text-xs text-destructive">{error}</p>}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Sending…
                  </>
                ) : (
                  "Send reset link"
                )}
              </Button>
              <p className="text-center text-xs text-muted-foreground pt-2">
                Remembered it?{" "}
                <Link
                  href="/auth/login"
                  className="text-foreground underline decoration-border hover:decoration-primary underline-offset-4"
                >
                  Sign in
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
