"use client"

import { DocumentUpload } from "@/components/documents/document-upload"
import { DocumentList } from "@/components/documents/document-list"
import { PaymentModal } from "@/components/documents/payment-modal"
import { Fab } from "@/components/ui/fab"
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
      if (res.ok) {
        await fetchDocuments()
      }
    } catch (err) {
      console.error("Failed to delete document:", err)
    } finally {
      setDeletingId(null)
    }
  }

  const handleUploadClick = async () => {
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
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">Documents</h1>
        <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">
          Upload and manage your documents for skill extraction (payment required per upload)
        </p>
      </div>

      {!showUpload && (
        <Fab onClick={handleUploadClick} aria-label="Upload document">
          <Upload className="size-6" />
        </Fab>
      )}

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

      <div>
        <h2 className="mb-3 sm:mb-4 text-xl sm:text-2xl font-semibold">Your Documents</h2>
        {isLoading ? (
          <p className="text-muted-foreground">Loading documents...</p>
        ) : (
          <DocumentList
            documents={documents}
            onDelete={handleDelete}
            deletingId={deletingId}
          />
        )}
      </div>
    </div>
  )
}
