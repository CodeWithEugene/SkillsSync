"use client"

import { DocumentUpload } from "@/components/documents/document-upload"
import { DocumentList } from "@/components/documents/document-list"
import { PaymentModal } from "@/components/documents/payment-modal"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { notify } from "@/lib/notify"
import type { Document } from "@/lib/db"
import { Upload } from "lucide-react"
import { useEffect, useState } from "react"

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showUpload, setShowUpload] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [hasCredit, setHasCredit] = useState<boolean | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    document.title = "Documents | SkillSync"
  }, [])

  // After successful payment redirect: show document upload
  useEffect(() => {
    if (typeof window === "undefined") return
    const params = new URLSearchParams(window.location.search)
    if (params.get("payment") === "success") {
      setHasCredit(true)
      setShowPaymentModal(false)
      setShowUpload(true)
      window.history.replaceState({}, "", "/documents")
    }
  }, [])

  const fetchDocuments = async () => {
    try {
      const response = await fetch("/api/documents")
      if (response.ok) {
        const data = await response.json()
        setDocuments(data)
      }
    } catch (error) {
      console.error("[v0] Failed to fetch documents:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCredits = async () => {
    try {
      const res = await fetch("/api/payments/credits")
      if (res.ok) {
        const data = await res.json()
        setHasCredit(data.hasCredit)
      } else {
        setHasCredit(false)
      }
    } catch {
      setHasCredit(false)
    }
  }

  useEffect(() => {
    fetchDocuments()
  }, [])

  useEffect(() => {
    if (showUpload || showPaymentModal) return
    fetchCredits()
  }, [showUpload, showPaymentModal])

  const handleDelete = async (doc: Document) => {
    setDeletingId(doc.id)
    try {
      const res = await fetch(`/api/documents/${doc.id}`, { method: "DELETE" })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Delete failed")
      }
      await fetchDocuments()
      notify.success("Document removed", `${doc.filename} has been deleted.`)
    } catch (err) {
      console.error("Failed to delete document:", err)
      notify.error(
        "Couldn't delete document",
        err instanceof Error ? err.message : "Try again in a moment.",
      )
    } finally {
      setDeletingId(null)
    }
  }

  const handleUploadClick = async () => {
    // Block re-entry if an upload is already in flight
    if (showUpload) {
      notify.warn(
        "One document at a time",
        "Finish or close the current upload before starting another.",
      )
      return
    }
    const res = await fetch("/api/payments/credits")
    const data = res.ok ? await res.json() : { hasCredit: false }
    setHasCredit(!!data.hasCredit)
    if (data.hasCredit) {
      setShowUpload(true)
    } else {
      setShowPaymentModal(true)
    }
  }

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="04 — Library"
        title={
          <>
            Your <span className="italic font-light text-primary">documents</span>.
          </>
        }
        description="Upload coursework, assignments, projects, transcripts. KES 20 per upload — paid via M-PESA."
        actions={
          !showUpload && (
            <Button onClick={handleUploadClick} className="gap-2">
              <Upload className="size-4" />
              New upload
            </Button>
          )
        }
      />

      <PaymentModal
        open={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSuccess={() => {
          setHasCredit(true)
          setShowPaymentModal(false)
          setShowUpload(true)
        }}
      />

      {showUpload && (
        <DocumentUpload
          onUploadComplete={() => {
            fetchDocuments()
            setShowUpload(false)
            setHasCredit(false)
          }}
          onPaymentRequired={() => setShowPaymentModal(true)}
        />
      )}

      <section className="space-y-4">
        <p className="editorial-eyebrow">Holdings · {documents.length}</p>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading documents…</p>
        ) : (
          <DocumentList
            documents={documents}
            onDelete={handleDelete}
            deletingId={deletingId}
          />
        )}
      </section>
    </div>
  )
}
