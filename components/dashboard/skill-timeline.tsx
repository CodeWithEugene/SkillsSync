"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Code2, Heart, Repeat2, Loader2, GitCommitVertical } from "lucide-react"
import type { SkillHistory } from "@/lib/db"

interface SkillTimelineProps {
  initialHistory?: SkillHistory[]
}

const TYPE_STYLES = {
  technical: { icon: Code2, color: "text-blue-500", bg: "bg-blue-500/10", label: "Technical" },
  soft: { icon: Heart, color: "text-pink-500", bg: "bg-pink-500/10", label: "Soft" },
  transferable: { icon: Repeat2, color: "text-emerald-500", bg: "bg-emerald-500/10", label: "Transferable" },
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

export function SkillTimeline({ initialHistory = [] }: SkillTimelineProps) {
  const [history, setHistory] = useState<SkillHistory[]>(initialHistory)
  const [loading, setLoading] = useState(initialHistory.length === 0)

  useEffect(() => {
    if (initialHistory.length > 0) return
    fetch("/api/skill-history")
      .then((r) => r.json())
      .then((data) => setHistory(Array.isArray(data) ? data : []))
      .catch(() => setHistory([]))
      .finally(() => setLoading(false))
  }, [initialHistory.length])

  if (loading) {
    return (
      <Card className="bento-card">
        <CardHeader>
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <TrendingUp className="size-5 text-primary" /> Skill Growth Timeline
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  if (history.length === 0) {
    return (
      <Card className="bento-card">
        <CardHeader>
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <TrendingUp className="size-5 text-primary" /> Skill Growth Timeline
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">Your skill progression over time</CardDescription>
        </CardHeader>
        <CardContent className="py-6 text-center">
          <p className="text-sm text-muted-foreground">
            Your skill timeline will appear here after you upload and analyse documents.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bento-card">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-primary/10 p-2.5">
            <TrendingUp className="size-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-base sm:text-lg">Skill Growth Timeline</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Your progression across {history.length} document{history.length !== 1 ? "s" : ""}</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Sparkline-style summary bar */}
        {history.length > 1 && (
          <div className="mb-4 rounded-xl bg-muted/40 p-3 flex items-center justify-between gap-4 flex-wrap">
            {(["technical", "soft", "transferable"] as const).map((type) => {
              const first = history[0].snapshot[type]
              const last = history[history.length - 1].snapshot[type]
              const delta = last - first
              const cfg = TYPE_STYLES[type]
              return (
                <div key={type} className="flex items-center gap-2 min-w-0">
                  <cfg.icon className={`size-3.5 ${cfg.color} shrink-0`} />
                  <span className="text-xs font-medium text-muted-foreground">{cfg.label}</span>
                  <span className="text-xs font-bold tabular-nums">{last}</span>
                  {delta !== 0 && (
                    <span className={`text-[10px] font-semibold ${delta > 0 ? "text-success" : "text-destructive"}`}>
                      {delta > 0 ? "+" : ""}{delta}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Timeline entries */}
        <div className="relative">
          {/* vertical line */}
          <div className="absolute left-3.5 top-2 bottom-2 w-px bg-border" />

          <div className="space-y-4">
            {[...history].reverse().map((entry, idx) => {
              const isLatest = idx === 0
              return (
                <div key={entry.id} className="relative flex gap-4 pl-8">
                  {/* Node */}
                  <div
                    className={`absolute left-0 flex items-center justify-center size-7 rounded-full border-2 ${
                      isLatest ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background"
                    }`}
                  >
                    <GitCommitVertical className={`size-3 ${isLatest ? "text-primary-foreground" : "text-muted-foreground"}`} />
                  </div>

                  <div className="flex-1 min-w-0 pb-1">
                    <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold">
                          {isLatest ? "Latest" : `Document #${history.length - idx}`}
                        </span>
                        {isLatest && (
                          <Badge className="text-[10px] h-4 rounded-md px-1.5 bg-primary/10 text-primary border-primary/20">
                            Current
                          </Badge>
                        )}
                      </div>
                      <span className="text-[11px] text-muted-foreground">{formatDate(entry.recordedAt)}</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
                      <div className="rounded-xl bg-muted/40 p-2 text-center">
                        <p className="text-lg font-bold tabular-nums">{entry.snapshot.total}</p>
                        <p className="text-[10px] text-muted-foreground">Total</p>
                      </div>
                      {(["technical", "soft", "transferable"] as const).map((type) => {
                        const cfg = TYPE_STYLES[type]
                        return (
                          <div key={type} className={`rounded-xl ${cfg.bg} p-2 text-center`}>
                            <p className={`text-lg font-bold tabular-nums ${cfg.color}`}>
                              {entry.snapshot[type]}
                            </p>
                            <p className="text-[10px] text-muted-foreground">{cfg.label}</p>
                          </div>
                        )
                      })}
                    </div>

                    {entry.snapshot.topCategories.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {entry.snapshot.topCategories.slice(0, 4).map((cat) => (
                          <Badge key={cat} variant="outline" className="text-[10px] rounded-lg h-4 px-1.5">
                            {cat}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
