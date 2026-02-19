"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Link2, Loader2, Check, Globe, Lock } from "lucide-react"

interface ShareProfileToggleProps {
  userId: string
  initialIsPublic: boolean
}

export function ShareProfileToggle({ userId, initialIsPublic }: ShareProfileToggleProps) {
  const [isPublic, setIsPublic] = useState(initialIsPublic)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const profileUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/p/${userId}`
      : `/p/${userId}`

  async function togglePublic() {
    setLoading(true)
    try {
      const res = await fetch("/api/profile/visibility", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublic: !isPublic }),
      })
      if (!res.ok) throw new Error()
      setIsPublic((v) => !v)
    } catch {
      // silently fail — keep old state
    } finally {
      setLoading(false)
    }
  }

  async function copyLink() {
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}/p/${userId}`
        : `/p/${userId}`
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="rounded-2xl bg-background/50 p-4 space-y-3">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          {isPublic ? (
            <Globe className="size-4 text-success" />
          ) : (
            <Lock className="size-4 text-muted-foreground" />
          )}
          <div>
            <p className="text-sm font-medium">Public Profile</p>
            <p className="text-xs text-muted-foreground">
              {isPublic ? "Anyone with the link can view your skills" : "Only you can see your profile"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <Badge
            variant="outline"
            className={`text-xs rounded-lg ${
              isPublic ? "bg-success/10 text-success border-success/20" : "bg-muted text-muted-foreground"
            }`}
          >
            {isPublic ? "Public" : "Private"}
          </Badge>
          <Button
            variant={isPublic ? "outline" : "default"}
            size="sm"
            onClick={togglePublic}
            disabled={loading}
            className="rounded-xl h-8 text-xs gap-1.5"
          >
            {loading && <Loader2 className="size-3 animate-spin" />}
            {isPublic ? "Make Private" : "Make Public"}
          </Button>
        </div>
      </div>

      {isPublic && (
        <div className="flex items-center gap-2 rounded-xl border bg-muted/50 px-3 py-2">
          <span className="text-xs text-muted-foreground truncate flex-1 font-mono">
            {profileUrl}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={copyLink}
            className="rounded-lg h-7 text-xs gap-1.5 shrink-0"
          >
            {copied ? <Check className="size-3 text-success" /> : <Link2 className="size-3" />}
            {copied ? "Copied!" : "Copy"}
          </Button>
        </div>
      )}
    </div>
  )
}
