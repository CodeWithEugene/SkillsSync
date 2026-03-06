"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, X } from "lucide-react"

const UPLOAD_FEE = 20

interface PaymentModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

function normalizePhone(raw: string): string {
  const s = raw.trim().replace(/\s/g, "")
  if (s.startsWith("+254")) return s
  if (s.startsWith("254") && s.length >= 12) return `+${s}`
  if (s.startsWith("0") && s.length >= 10) return `+254${s.slice(1)}`
  if (/^7\d{8}$/.test(s)) return `+254${s}`
  return s.startsWith("+") ? s : `+254${s}`
}

export function PaymentModal({ open, onClose, onSuccess }: PaymentModalProps) {
  const [phone, setPhone] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    const handleMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return
      if (e.data?.type === "paystack_payment_success") {
        onSuccess()
        onClose()
        setCheckoutUrl(null)
      }
    }
    window.addEventListener("message", handleMessage)
    return () => window.removeEventListener("message", handleMessage)
  }, [open, onSuccess, onClose])

  useEffect(() => {
    if (!open) setCheckoutUrl(null)
  }, [open])

  const handlePay = async () => {
    const trimmed = phone.trim()
    if (!trimmed) {
      setError("Enter your M-PESA mobile money number")
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/payments/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: normalizePhone(trimmed) }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to start payment")
      if (!data.authorization_url) throw new Error("No payment URL received")
      setCheckoutUrl(data.authorization_url)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  const openInNewWindow = () => {
    if (checkoutUrl) {
      window.open(checkoutUrl, "paystack_popup", "width=500,height=640,scrollbars=yes")
    }
  }

  if (!open) return null

  // Embedded Paystack checkout (iframe) – shown as popup after "Continue"
  if (checkoutUrl) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        onClick={(e) => { if (e.target === e.currentTarget) { setCheckoutUrl(null); onClose() } }}
        role="dialog"
        aria-modal="true"
      >
        <Card className="flex h-[85vh] max-h-[640px] w-full max-w-lg flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
          <CardContent className="min-h-0 flex-1 p-0">
            <iframe
              src={checkoutUrl}
              title="Paystack checkout"
              className="h-full min-h-[480px] w-full border-0"
            />
          </CardContent>
        </Card>
      </div>
    )
  }

  // Step 1: phone number form
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg">Pay to upload</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
            <X className="size-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Enter your M-PESA mobile money number. You will complete payment in the next screen.
          </p>
          <div className="space-y-2">
            <Label htmlFor="paystack-phone">M-PESA phone number</Label>
            <Input
              id="paystack-phone"
              type="tel"
              placeholder="07XX XXX XXX or +254..."
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={loading}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button className="w-full" onClick={handlePay} disabled={loading}>
            {loading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              `Continue — Pay ${UPLOAD_FEE} KES`
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
