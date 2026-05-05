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
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 p-6 bg-background text-foreground text-center">
      {status === "verifying" && (
        <>
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="editorial-eyebrow">Verifying</p>
          <p className="display-serif text-3xl tracking-tight">One moment.</p>
        </>
      )}
      {status === "success" && (
        <>
          <p className="editorial-eyebrow text-success">Confirmed</p>
          <h1 className="display-serif text-4xl sm:text-5xl tracking-tight leading-[1]">
            Payment <span className="italic font-light text-primary">received</span>.
          </h1>
          <p className="text-sm text-muted-foreground max-w-sm">
            You can close this window.
          </p>
        </>
      )}
      {status === "failed" && (
        <>
          <p className="editorial-eyebrow text-destructive">Failed</p>
          <h1 className="display-serif text-4xl sm:text-5xl tracking-tight leading-[1]">
            Could not verify.
          </h1>
          <p className="text-sm text-muted-foreground max-w-sm">
            Please try again from the Documents page.
          </p>
        </>
      )}
    </div>
  )
}
