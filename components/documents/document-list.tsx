"use client"

import type { Document } from "@/lib/db"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { File, Clock, CheckCircle, XCircle, Trash2 } from "lucide-react"

interface DocumentListProps {
  documents: Document[]
  onDelete?: (doc: Document) => void
  deletingId?: string | null
}

export function DocumentList({ documents, onDelete, deletingId }: DocumentListProps) {
  if (documents.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-12 text-center">
          <File className="mx-auto size-12 text-muted-foreground opacity-50" />
          <p className="mt-4 text-lg font-semibold">No documents yet</p>
          <p className="text-sm text-muted-foreground mt-1">Upload your first document to get started</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {documents.map((doc) => (
        <Card key={doc.id} className="transition-all hover:shadow-md hover:border-primary/20 group">
          <CardContent className="flex items-center gap-4 p-4">
            <div
              className={`flex size-10 shrink-0 items-center justify-center rounded-lg transition-colors ${
                doc.status === "COMPLETED"
                  ? "bg-success/10 text-success group-hover:bg-success/20"
                  : doc.status === "FAILED"
                    ? "bg-destructive/10 text-destructive group-hover:bg-destructive/20"
                    : "bg-warning/10 text-warning group-hover:bg-warning/20"
              }`}
            >
              <File className="size-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate group-hover:text-primary transition-colors">{doc.filename}</p>
              <p className="text-sm text-muted-foreground mt-0.5">
                {new Date(doc.uploadDate).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>
            <Badge
              variant={doc.status === "COMPLETED" ? "default" : doc.status === "FAILED" ? "destructive" : "secondary"}
              className="shrink-0 rounded-full px-3 py-1"
            >
              {doc.status === "PROCESSING" && <Clock className="mr-1.5 size-3" />}
              {doc.status === "COMPLETED" && <CheckCircle className="mr-1.5 size-3" />}
              {doc.status === "FAILED" && <XCircle className="mr-1.5 size-3" />}
              {doc.status}
            </Badge>
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 text-muted-foreground hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(doc)
                }}
                disabled={deletingId === doc.id}
                aria-label={`Delete ${doc.filename}`}
              >
                <Trash2 className="size-4" />
              </Button>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
