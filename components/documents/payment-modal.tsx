"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, X, CheckCircle2, AlertCircle, Smartphone } from "lucide-react"
import { notify } from "@/lib/notify"

const UPLOAD_FEE = 20
const POLL_INTERVAL_MS = 3000
const POLL_TIMEOUT_MS = 130_000 // 130s — enough for STK push approval + grace

type Phase = "form" | "waiting" | "success" | "failed"

interface PaymentModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

function normalizePhone(raw: string): string {
  const s = raw.trim().replace(/\s/g, "").replace(/[-()]/g, "")
  if (s.startsWith("+254")) return s
  if (s.startsWith("254") && s.length >= 12) return `+${s}`
  if (s.startsWith("0") && s.length >= 10) return `+254${s.slice(1)}`
  if (/^7\d{8}$/.test(s)) return `+254${s}`
  return s.startsWith("+") ? s : `+254${s}`
}

export function PaymentModal({ open, onClose, onSuccess }: PaymentModalProps) {
  const [phase, setPhase] = useState<Phase>("form")
  const [phone, setPhone] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState<string>("")
  const [reference, setReference] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const onSuccessRef = useRef(onSuccess)
  const onCloseRef = useRef(onClose)

  // Keep latest callbacks accessible from inside polling effect without re-running it
  useEffect(() => {
    onSuccessRef.current = onSuccess
    onCloseRef.current = onClose
  }, [onSuccess, onClose])

  // Reset state every time the modal opens
  useEffect(() => {
    if (open) {
      setPhase("form")
      setError(null)
      setStatusMessage("")
      setReference(null)
      setSubmitting(false)
    }
  }, [open])

  // Polling loop while waiting for STK push to settle
  useEffect(() => {
    if (phase !== "waiting" || !reference) return

    let cancelled = false
    const startedAt = Date.now()

    const tick = async () => {
      if (cancelled) return
      try {
        const res = await fetch(`/api/payments/status/${reference}`)
        if (!res.ok) throw new Error("status check failed")
        const data = (await res.json()) as { status: string }
        if (cancelled) return

        if (data.status === "completed") {
          setPhase("success")
          notify.success("Payment received", "Your upload credit is ready.")
          // Brief moment of success state, then notify parent
          setTimeout(() => {
            if (cancelled) return
            onSuccessRef.current()
            onCloseRef.current()
          }, 900)
          return
        }
        if (data.status === "failed") {
          setPhase("failed")
          setError("Payment didn't go through. You can try again.")
          notify.error("Payment failed", "The M-PESA prompt was cancelled or timed out.")
          return
        }
      } catch {
        /* transient — keep polling */
      }

      if (Date.now() - startedAt > POLL_TIMEOUT_MS) {
        if (cancelled) return
        setPhase("failed")
        setError(
          "We didn't see a confirmation in time. If you approved the prompt, give it a moment and try again — your charge may still complete.",
        )
        return
      }

      setTimeout(tick, POLL_INTERVAL_MS)
    }

    tick()
    return () => {
      cancelled = true
    }
  }, [phase, reference])

  const handlePay = async () => {
    const trimmed = phone.trim()
    if (!trimmed) {
      setError("Enter your M-PESA number.")
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch("/api/payments/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: normalizePhone(trimmed) }),
      })
      const data = await res.json()
      if (!res.ok || !data.reference) {
        throw new Error(data.error || "Failed to start payment")
      }
      setReference(data.reference)
      setStatusMessage(data.message ?? "Approve the M-PESA prompt on your phone.")
      setPhase("waiting")
      notify.info(
        "Prompt sent",
        "Check your phone and approve the M-PESA pop-up.",
      )
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Something went wrong."
      setError(msg)
      notify.error("Couldn't start payment", msg)
    } finally {
      setSubmitting(false)
    }
  }

  const handleRetry = () => {
    setPhase("form")
    setError(null)
    setReference(null)
    setStatusMessage("")
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm p-4"
      onClick={(e) => {
        // Allow click-outside-to-close only when not mid-payment
        if (e.target === e.currentTarget && phase !== "waiting") onClose()
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="payment-title"
    >
      <Card className="w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <p className="editorial-eyebrow">Pay-per-upload</p>
            <CardTitle id="payment-title" className="display-serif text-2xl font-normal tracking-tight">
              {phase === "success"
                ? "Received."
                : phase === "waiting"
                  ? "Check your phone."
                  : phase === "failed"
                    ? "Try again."
                    : `Pay ${UPLOAD_FEE} KES`}
            </CardTitle>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            disabled={phase === "waiting"}
            aria-label="Close"
          >
            <X className="size-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-4">
          {phase === "form" && (
            <>
              <p className="text-sm text-muted-foreground">
                We&rsquo;ll send the M-PESA prompt straight to this number — just approve it on
                your phone, no second screen.
              </p>
              <div className="space-y-1.5">
                <div className="flex items-baseline justify-between gap-2">
                  <Label htmlFor="paystack-phone" className="text-xs">
                    M-PESA number
                  </Label>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/80">
                    07… / +254…
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Use Safaricom format — <span className="font-mono">0712345678</span> or{" "}
                  <span className="font-mono">+254712345678</span>. Spaces and dashes are fine.
                </p>
                <Input
                  id="paystack-phone"
                  type="tel"
                  inputMode="tel"
                  placeholder="07XX XXX XXX or +254…"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={submitting}
                  autoFocus
                />
              </div>
              {error && (
                <p className="text-xs text-destructive flex items-center gap-1.5">
                  <AlertCircle className="size-3" />
                  {error}
                </p>
              )}
              <Button className="w-full" onClick={handlePay} disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Sending prompt…
                  </>
                ) : (
                  `Send M-PESA prompt — ${UPLOAD_FEE} KES`
                )}
              </Button>
            </>
          )}

          {phase === "waiting" && (
            <div className="space-y-4 py-2">
              <div className="flex items-center gap-3 rounded-md border border-primary/30 bg-primary/5 p-3">
                <Smartphone className="size-5 text-primary shrink-0" />
                <div className="space-y-0.5">
                  <p className="text-sm font-medium leading-tight">
                    Prompt sent to {normalizePhone(phone)}
                  </p>
                  <p className="text-xs text-muted-foreground leading-snug">{statusMessage}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="size-3.5 animate-spin" />
                Waiting for confirmation…
              </div>
              <p className="text-[11px] text-muted-foreground/80 leading-relaxed">
                Open your M-PESA pop-up, enter your PIN, and we&rsquo;ll auto-detect the
                payment within a few seconds.
              </p>
            </div>
          )}

          {phase === "success" && (
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <CheckCircle2 className="size-10 text-success" />
              <p className="text-sm font-medium">Payment received.</p>
              <p className="text-xs text-muted-foreground">Loading your upload…</p>
            </div>
          )}

          {phase === "failed" && (
            <>
              <div className="flex items-start gap-2 text-sm text-destructive">
                <AlertCircle className="size-4 shrink-0 mt-0.5" />
                <p className="leading-relaxed">{error ?? "Payment failed."}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={onClose}>
                  Close
                </Button>
                <Button className="flex-1" onClick={handleRetry}>
                  Try again
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
