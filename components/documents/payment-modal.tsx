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

export function PaymentModal({ open, onClose, onSuccess }: PaymentModalProps) {
  const [phone, setPhone] = useState("")
  const [reference, setReference] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleInitiate = async () => {
    const trimmed = phone.trim()
    if (!trimmed) {
      setError("Enter your M-Pesa phone number")
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/payments/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: trimmed.startsWith("+") ? trimmed : `+254${trimmed.replace(/^0/, "")}` }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to initiate payment")
      setReference(data.reference)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg">Pay KES {UPLOAD_FEE} to upload</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
            <X className="size-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {!reference ? (
            <>
              <p className="text-sm text-muted-foreground">
                You will receive an M-Pesa prompt on your phone. Complete the payment to continue.
              </p>
              <div className="space-y-2">
                <Label htmlFor="phone">M-Pesa phone number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="07XX XXX XXX or +254..."
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={loading}
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button className="w-full" onClick={handleInitiate} disabled={loading}>
                {loading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  `Pay KES ${UPLOAD_FEE} with M-Pesa`
                )}
              </Button>
            </>
          ) : (
            <PaymentPending reference={reference} onSuccess={onSuccess} onClose={onClose} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function PaymentPending({
  reference,
  onSuccess,
  onClose,
}: {
  reference: string
  onSuccess: () => void
  onClose: () => void
}) {
  useEffect(() => {
    let cancelled = false
    const interval = setInterval(async () => {
      if (cancelled) return
      const res = await fetch(`/api/payments/status/${reference}`)
      const data = await res.json()
      if (data.status === "completed") {
        onSuccess()
        onClose()
        clearInterval(interval)
      }
    }, 2500)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [reference, onSuccess, onClose])

  return (
    <div className="space-y-3 text-center">
      <Loader2 className="mx-auto size-8 animate-spin text-primary" />
      <p className="text-sm font-medium">Check your phone</p>
      <p className="text-xs text-muted-foreground">Complete the M-Pesa prompt to continue. This may take a moment.</p>
      <Button variant="outline" size="sm" onClick={onClose}>
        Cancel
      </Button>
    </div>
  )
}
