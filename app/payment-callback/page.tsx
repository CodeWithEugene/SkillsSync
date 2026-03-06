"use client"

import { useEffect, useState } from "react"

export default function PaymentCallbackPage() {
  const [status, setStatus] = useState<"verifying" | "success" | "failed">("verifying")

  useEffect(() => {
    const params = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "")
    const reference = params.get("reference")
    if (!reference) {
      setStatus("failed")
      return
    }

    let cancelled = false
    fetch(`/api/payments/verify?reference=${encodeURIComponent(reference)}`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return
        if (data.success) {
          setStatus("success")
          if (window.opener) {
            window.opener.postMessage({ type: "paystack_payment_success", reference }, window.location.origin)
            window.close()
          } else if (window.self !== window.top) {
            window.parent.postMessage({ type: "paystack_payment_success", reference }, window.location.origin)
          } else {
            // Full-page redirect: take user to Documents with upload area visible
            window.location.replace("/documents?payment=success")
          }
        } else {
          setStatus("failed")
        }
      })
      .catch(() => {
        if (!cancelled) setStatus("failed")
      })

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6">
      {status === "verifying" && (
        <>
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Verifying payment...</p>
        </>
      )}
      {status === "success" && (
        <p className="text-sm text-green-600">Payment successful. You can close this window.</p>
      )}
      {status === "failed" && (
        <p className="text-sm text-destructive">Payment verification failed. Please try again from the Documents page.</p>
      )}
    </div>
  )
}
