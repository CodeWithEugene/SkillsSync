"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Upload, Loader2 } from "lucide-react"
import { useCallback, useState } from "react"
import { useDropzone, type FileRejection } from "react-dropzone"
import { notify } from "@/lib/notify"

interface DocumentUploadProps {
  onUploadComplete?: () => void
  onPaymentRequired?: () => void
}

const MAX_BYTES = 18 * 1024 * 1024

export function DocumentUpload({ onUploadComplete, onPaymentRequired }: DocumentUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return

      const file = acceptedFiles[0]
      setIsUploading(true)
      setError(null)
      const loadingId = notify.loading(
        "Uploading…",
        `${file.name} — extraction will start when upload completes`,
      )

      try {
        const formData = new FormData()
        formData.append("file", file)

        const response = await fetch("/api/documents/upload", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          const data = await response.json()
          if (response.status === 402) {
            notify.dismiss(loadingId)
            notify.warn("Payment required", "Pay 20 KES per upload to continue.")
            onPaymentRequired?.()
            throw new Error("Payment required. Please pay KES 20 first to upload.")
          }
          throw new Error(data.error || "Upload failed")
        }

        const document = (await response.json()) as { id: string }
        notify.dismiss(loadingId)
        const analyzingId = notify.loading(
          "Analysing skills…",
          "We're reading your document — usually 5-15 seconds.",
        )

        const analyzeRes = await fetch("/api/documents/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ documentId: document.id }),
        })
        notify.dismiss(analyzingId)
        if (!analyzeRes.ok) {
          const err = await analyzeRes.json().catch(() => ({}))
          throw new Error((err as { error?: string }).error || "Analysis failed")
        }
        const result = (await analyzeRes.json().catch(() => ({}))) as {
          skillsCount?: number
        }
        notify.success(
          "Document analysed",
          result.skillsCount
            ? `${result.skillsCount} skill${result.skillsCount === 1 ? "" : "s"} extracted.`
            : "Skills extracted successfully.",
        )

        onUploadComplete?.()
      } catch (err) {
        notify.dismiss(loadingId)
        const message = err instanceof Error ? err.message : "Upload failed"
        setError(message)
        // 402 already showed a friendlier toast above; avoid double-warning
        if (!message.includes("Payment required")) {
          notify.error("Upload failed", message)
        }
      } finally {
        setIsUploading(false)
      }
    },
    [onUploadComplete, onPaymentRequired],
  )

  const onDropRejected = useCallback((rejections: FileRejection[]) => {
    if (rejections.length === 0) return
    const tooMany = rejections.find((r) =>
      r.errors.some((e) => e.code === "too-many-files"),
    )
    if (tooMany || rejections.length > 1) {
      notify.warn(
        "One document at a time",
        "You can upload one document per 20 KES payment. Pay again to upload another.",
      )
      return
    }
    const r = rejections[0]
    const code = r.errors[0]?.code
    if (code === "file-too-large") {
      notify.error(
        "File too large",
        `${r.file.name} exceeds 18 MB. Try a smaller file or split it up.`,
      )
    } else if (code === "file-invalid-type") {
      notify.error(
        "Unsupported file type",
        "Use PDF, DOCX, DOC, or TXT.",
      )
    } else {
      notify.error(
        "Couldn't accept that file",
        r.errors[0]?.message ?? "Unknown error",
      )
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected,
    accept: {
      "text/plain": [".txt"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "application/pdf": [".pdf"],
    },
    multiple: false,
    maxFiles: 1,
    maxSize: MAX_BYTES,
    disabled: isUploading,
  })

  return (
    <Card className="bento-card p-0 overflow-hidden">
      <CardContent className="p-4 sm:p-6">
        <div
          {...getRootProps()}
          className={`cursor-pointer rounded-md border border-dashed p-8 sm:p-12 text-center transition-colors ${
            isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25"
          } ${isUploading ? "pointer-events-none opacity-50" : ""}`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-3 sm:gap-4">
            {isUploading ? (
              <Loader2 className="size-9 sm:size-10 animate-spin text-primary" />
            ) : (
              <Upload className="size-9 sm:size-10 text-primary" />
            )}
            <div>
              <p className="display-serif text-xl sm:text-2xl tracking-tight">
                {isUploading
                  ? "Uploading…"
                  : isDragActive
                    ? "Drop to upload."
                    : "Drag a document here, or click to choose."}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                One document per 20 KES payment · PDF, DOCX, DOC, TXT · up to 18 MB
              </p>
            </div>
          </div>
        </div>
        {error && (
          <div className="mt-3 sm:mt-4 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-xs sm:text-sm text-destructive">
            <p className="font-medium">{error}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
