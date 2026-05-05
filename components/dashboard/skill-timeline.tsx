"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import type { SkillHistory } from "@/lib/db"

interface SkillTimelineProps {
  initialHistory?: SkillHistory[]
}

const TYPE_LABEL: Record<string, string> = {
  technical: "Technical",
  soft: "Soft",
  transferable: "Transferable",
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  })
}

export function SkillTimeline({ initialHistory = [] }: SkillTimelineProps) {
  const [history, setHistory] = useState<SkillHistory[]>(initialHistory)
  const [loading, setLoading] = useState(initialHistory.length === 0)

  useEffect(() => {
    if (initialHistory.length > 0) return
    fetch("/api/skill-history")
      .then((r) => r.json())
      .then((d) => setHistory(Array.isArray(d) ? d : []))
      .catch(() => setHistory([]))
      .finally(() => setLoading(false))
  }, [initialHistory.length])

  // Loading
  if (loading) {
    return (
      <Card className="bento-card p-0 gap-0 h-full">
        <CardHeader className="pt-5">
          <p className="editorial-eyebrow">Trajectory</p>
          <CardTitle className="display-serif text-2xl sm:text-3xl font-normal tracking-tight">
            Skill growth
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  // Empty
  if (history.length === 0) {
    return (
      <Card className="bento-card p-0 gap-0 h-full">
        <CardHeader className="pt-5">
          <p className="editorial-eyebrow">Trajectory</p>
          <CardTitle className="display-serif text-2xl sm:text-3xl font-normal tracking-tight">
            Skill growth
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-5">
          <p className="text-sm text-muted-foreground">
            Your trajectory will appear here once you analyse your first document.
          </p>
        </CardContent>
      </Card>
    )
  }

  // Compute trend points
  const points = [...history].sort(
    (a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime(),
  )
  const maxTotal = Math.max(...points.map((p) => p.snapshot.total), 1)
  const latest = points[points.length - 1]
  const first = points[0]
  const delta = latest.snapshot.total - first.snapshot.total

  return (
    <Card className="bento-card p-0 gap-0 h-full">
      <CardHeader className="pt-5">
        <div className="flex items-end justify-between gap-3 flex-wrap">
          <div>
            <p className="editorial-eyebrow">Trajectory</p>
            <CardTitle className="display-serif text-2xl sm:text-3xl font-normal tracking-tight leading-tight">
              Skill growth
            </CardTitle>
          </div>
          {points.length > 1 && (
            <div className="text-right">
              <p className="display-serif text-3xl tabular leading-none">
                {delta > 0 ? `+${delta}` : delta}
              </p>
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mt-1">
                Skills total
              </p>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-5 pb-5">
        {/* Bar chart — clean ink bars on hairline grid */}
        <div className="flex items-end gap-2 h-28 border-b border-border pb-1">
          {points.map((p, i) => {
            const heightPct = Math.max((p.snapshot.total / maxTotal) * 100, 6)
            const isLatest = i === points.length - 1
            return (
              <div
                key={p.id}
                className="flex-1 min-w-[18px] flex flex-col items-center gap-1"
              >
                <span className="font-mono text-[10px] tabular text-muted-foreground">
                  {p.snapshot.total}
                </span>
                <div
                  className={`w-full ${
                    isLatest ? "bg-primary" : "bg-foreground/70"
                  } transition-all`}
                  style={{ height: `${heightPct}%`, minHeight: "3px" }}
                />
                <span className="font-mono text-[9px] tabular text-muted-foreground">
                  {formatDate(p.recordedAt)}
                </span>
              </div>
            )
          })}
        </div>

        {/* Latest composition — skill type breakdown */}
        <div>
          <p className="editorial-eyebrow mb-2">Composition · latest</p>
          <ul className="space-y-1.5 text-sm">
            {(["technical", "soft", "transferable"] as const).map((type) => {
              const count = latest.snapshot[type]
              const pct = latest.snapshot.total > 0 ? (count / latest.snapshot.total) * 100 : 0
              return (
                <li key={type} className="flex items-center gap-3">
                  <span className="text-foreground/80 w-24 shrink-0">{TYPE_LABEL[type]}</span>
                  <div className="flex-1 h-1.5 bg-muted overflow-hidden">
                    <div
                      className="h-full bg-foreground/70"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="font-mono text-xs tabular text-muted-foreground w-6 text-right">
                    {count}
                  </span>
                </li>
              )
            })}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
