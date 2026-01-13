"use client"

import { DocumentUpload } from "@/components/documents/document-upload"
import { DocumentList } from "@/components/documents/document-list"
import { Fab } from "@/components/ui/fab"
import type { Document } from "@/lib/db"
import { Upload } from "lucide-react"
import { useEffect, useState } from "react"

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showUpload, setShowUpload] = useState(false)

  useEffect(() => {
    document.title = "SkillSync - Documents"
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

  useEffect(() => {
    fetchDocuments()
  }, [])

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">Documents</h1>
        <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">
          Upload and manage your documents for skill extraction
        </p>
      </div>

      {!showUpload && (
        <Fab onClick={() => setShowUpload(true)} aria-label="Upload document">
          <Upload className="size-6" />
        </Fab>
      )}

      {showUpload && (
        <DocumentUpload
          onUploadComplete={() => {
            fetchDocuments()
            setShowUpload(false)
          }}
        />
      )}

      <div>
        <h2 className="mb-3 sm:mb-4 text-xl sm:text-2xl font-semibold">Your Documents</h2>
        {isLoading ? (
          <p className="text-muted-foreground">Loading documents...</p>
        ) : (
          <DocumentList documents={documents} />
        )}
      </div>
    </div>
  )
}
