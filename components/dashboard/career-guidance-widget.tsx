"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Loader2,
  AlertCircle,
  RefreshCw,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import type { CareerGuidance } from "@/lib/db"

interface CareerGuidanceWidgetProps {
  initialGuidance: CareerGuidance | null
  userHasSkills: boolean
  careerGoal: string
}

const IMPORTANCE_TONE: Record<
  string,
  { label: string; cls: string }
> = {
  high: { label: "High", cls: "bg-destructive/10 text-destructive border-destructive/30" },
  medium: { label: "Medium", cls: "bg-warning/10 text-warning border-warning/30" },
  low: { label: "Low", cls: "bg-muted text-muted-foreground border-border" },
}

function ReadinessRing({ score }: { score: number }) {
  // Wider stroke, ink-on-paper feel
  const radius = 46
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  const verdict =
    score >= 75 ? "Strong" : score >= 50 ? "Progressing" : "Early stage"

  return (
    <div className="relative flex flex-col items-center justify-center gap-1.5">
      <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120" aria-hidden>
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          className="text-border"
        />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="text-primary transition-[stroke-dashoffset] duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="display-serif text-4xl font-medium leading-none tabular">
          {score}
        </span>
        <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground mt-1">
          / 100
        </span>
      </div>
      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-foreground mt-2">
        {verdict}
      </span>
    </div>
  )
}

export function CareerGuidanceWidget({
  initialGuidance,
  userHasSkills,
  careerGoal,
}: CareerGuidanceWidgetProps) {
  const [guidance, setGuidance] = useState<CareerGuidance | null>(initialGuidance)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showAllGaps, setShowAllGaps] = useState(false)

  async function generate() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/career-guidance", { method: "POST" })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to generate guidance")
      setGuidance(data)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  // Empty states ────────────────────────────────────────────────────────
  if (!userHasSkills) {
    return (
      <Card className="bento-card bento-card-primary p-0 gap-0">
        <CardHeader className="pt-5">
          <p className="editorial-eyebrow">Career readiness</p>
          <CardTitle className="display-serif text-2xl sm:text-3xl font-normal tracking-tight">
            Awaiting evidence
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-start gap-3 pb-5">
          <p className="text-sm text-muted-foreground max-w-md">
            Upload and analyse a document to unlock readiness scoring against
            the O*NET requirements for your target career.
          </p>
        </CardContent>
      </Card>
    )
  }

  if (!guidance) {
    return (
      <Card className="bento-card bento-card-primary p-0 gap-0">
        <CardHeader className="pt-5">
          <p className="editorial-eyebrow">Career readiness</p>
          <CardTitle className="display-serif text-2xl sm:text-3xl font-normal tracking-tight">
            Run the benchmark
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pb-5">
          <p className="text-sm text-muted-foreground">
            Compare your extracted skills against O*NET&rsquo;s required profile for{" "}
            <span className="text-foreground font-medium">{careerGoal || "your career"}</span>.
            Deterministic gap analysis — no LLM hallucinations.
          </p>
          {error && (
            <p className="text-xs text-destructive flex items-center gap-1.5">
              <AlertCircle className="size-3" /> {error}
            </p>
          )}
          <Button onClick={generate} disabled={loading} size="sm">
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Analysing…
              </>
            ) : (
              "Generate guidance"
            )}
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Result ──────────────────────────────────────────────────────────────
  const visibleGaps = showAllGaps ? guidance.gaps : guidance.gaps.slice(0, 3)

  return (
    <Card className="bento-card bento-card-primary p-0 gap-0">
      <CardHeader className="pt-5">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="space-y-1.5">
            <p className="editorial-eyebrow">Career readiness</p>
            <CardTitle className="display-serif text-2xl sm:text-3xl font-normal tracking-tight leading-tight">
              {guidance.careerGoal}
            </CardTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={generate} disabled={loading}>
            {loading ? (
              <Loader2 className="size-3 animate-spin" />
            ) : (
              <RefreshCw className="size-3" />
            )}
            Refresh
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pb-6">
        {/* Score + summary — asymmetric */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-start pt-2">
          <div className="sm:col-span-4">
            <ReadinessRing score={guidance.readinessScore} />
          </div>
          <p className="sm:col-span-8 text-sm text-foreground/80 leading-relaxed">
            {guidance.summary}
          </p>
        </div>

        {/* Strengths */}
        {guidance.strengths.length > 0 && (
          <div className="space-y-2 pt-3 border-t border-border">
            <p className="editorial-eyebrow">Strengths</p>
            <div className="flex flex-wrap gap-1.5">
              {guidance.strengths.map((s) => (
                <Badge key={s} variant="outline" className="font-normal normal-case tracking-normal text-xs py-0.5 bg-success/5 text-success border-success/30">
                  {s}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Gaps */}
        {guidance.gaps.length > 0 && (
          <div className="space-y-2 pt-3 border-t border-border">
            <p className="editorial-eyebrow">Skill gaps</p>
            <ul className="divide-y divide-border">
              {visibleGaps.map((gap) => {
                const tone = IMPORTANCE_TONE[gap.importance?.toLowerCase()] ?? IMPORTANCE_TONE.low
                return (
                  <li key={gap.skill} className="py-3 flex items-start gap-3">
                    <Badge variant="outline" className={`shrink-0 mt-0.5 ${tone.cls}`}>
                      {tone.label}
                    </Badge>
                    <div className="min-w-0">
                      <p className="text-sm font-medium leading-tight">{gap.skill}</p>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        {gap.suggestion}
                      </p>
                    </div>
                  </li>
                )
              })}
            </ul>
            {guidance.gaps.length > 3 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAllGaps((v) => !v)}
                className="w-full"
              >
                {showAllGaps ? (
                  <>
                    <ChevronUp className="size-3" /> Show less
                  </>
                ) : (
                  <>
                    <ChevronDown className="size-3" /> Show {guidance.gaps.length - 3} more
                  </>
                )}
              </Button>
            )}
          </div>
        )}

        {/* Recommendations */}
        {guidance.recommendations.length > 0 && (
          <div className="space-y-2 pt-3 border-t border-border">
            <p className="editorial-eyebrow">Next moves</p>
            <ol className="space-y-2 mt-1">
              {guidance.recommendations.map((r, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-foreground/80">
                  <span className="font-mono text-[10px] tracking-widest text-primary mt-1 shrink-0 w-5">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="leading-relaxed">{r}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {error && (
          <p className="text-xs text-destructive flex items-center gap-1.5">
            <AlertCircle className="size-3" /> {error}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
