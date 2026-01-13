"use client"

import type { Document } from "@/lib/db"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { File, Clock, CheckCircle, XCircle } from "lucide-react"

interface DocumentListProps {
  documents: Document[]
}

export function DocumentList({ documents }: DocumentListProps) {
  if (documents.length === 0) {
    return (
      <Card className="elevation-1">
        <CardContent className="p-12 text-center">
          <File className="mx-auto size-12 text-muted-foreground" />
          <p className="mt-4 text-lg font-semibold">No documents yet</p>
          <p className="text-sm text-muted-foreground mt-1">Upload your first document to get started</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4">
      {documents.map((doc) => (
        <Card key={doc.id} className="elevation-1 material-transition hover:elevation-3 hover:scale-[1.01]">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/15 elevation-1">
              <File className="size-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">{doc.filename}</p>
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
              {doc.status === "PROCESSING" && <Clock className="mr-1 size-3" />}
              {doc.status === "COMPLETED" && <CheckCircle className="mr-1 size-3" />}
              {doc.status === "FAILED" && <XCircle className="mr-1 size-3" />}
              {doc.status}
            </Badge>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
