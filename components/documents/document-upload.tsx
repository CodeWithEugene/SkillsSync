"use client"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, type File, Loader2 } from "lucide-react"
import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"

interface DocumentUploadProps {
  onUploadComplete?: () => void
}

export function DocumentUpload({ onUploadComplete }: DocumentUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return

      const file = acceptedFiles[0]
      setIsUploading(true)
      setError(null)

      try {
        const formData = new FormData()
        formData.append("file", file)

        const response = await fetch("/api/documents/upload", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || "Upload failed")
        }

        onUploadComplete?.()
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed")
      } finally {
        setIsUploading(false)
      }
    },
    [onUploadComplete],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/plain": [".txt"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    },
    maxFiles: 1,
    disabled: isUploading,
  })

  return (
    <Card className="elevation-2 material-transition hover:elevation-4">
      <CardContent className="p-4 sm:p-6">
        <div
          {...getRootProps()}
          className={`cursor-pointer rounded-2xl border-2 border-dashed p-8 sm:p-12 text-center material-transition ${
            isDragActive ? "border-primary bg-primary/10 scale-[1.02]" : "border-muted-foreground/25"
          } ${isUploading ? "pointer-events-none opacity-50" : ""}`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-3 sm:gap-4">
            {isUploading ? (
              <Loader2 className="size-10 sm:size-12 animate-spin text-primary" />
            ) : (
              <Upload className="size-10 sm:size-12 text-primary" />
            )}
            <div>
              <p className="text-base sm:text-lg font-semibold">
                {isUploading ? "Uploading..." : isDragActive ? "Drop your file here" : "Drag and drop your document"}
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">or click to browse</p>
              <p className="mt-2 sm:mt-3 text-xs text-muted-foreground">Supported formats: TXT, DOC, DOCX</p>
            </div>
          </div>
        </div>
        {error && (
          <div className="mt-3 sm:mt-4 rounded-2xl bg-destructive/15 p-3 sm:p-4 text-xs sm:text-sm text-destructive elevation-1">
            <p className="font-medium">{error}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
