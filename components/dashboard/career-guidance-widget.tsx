"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Sparkles,
  Loader2,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
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

const IMPORTANCE_CONFIG: Record<string, { label: string; className: string }> = {
  high: { label: "High", className: "bg-destructive/10 text-destructive border-destructive/20" },
  medium: { label: "Medium", className: "bg-warning/10 text-warning border-warning/20" },
  low: { label: "Low", className: "bg-muted text-muted-foreground border-border" },
}

function ReadinessRing({ score }: { score: number }) {
  const radius = 40
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  const color =
    score >= 75 ? "text-success" : score >= 50 ? "text-warning" : "text-destructive"

  return (
    <div className="relative flex items-center justify-center w-28 h-28">
      <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/30" />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={`${color} transition-all duration-700`}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className={`text-2xl font-bold ${color}`}>{score}</span>
        <span className="text-[10px] text-muted-foreground font-medium">/ 100</span>
      </div>
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

  async function generateGuidance() {
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

  if (!userHasSkills) {
    return (
      <Card className="bento-card bento-card-primary">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-primary/10 p-2.5">
              <Sparkles className="size-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base sm:text-lg">Career Readiness</CardTitle>
              <CardDescription className="text-xs sm:text-sm">AI-powered career guidance</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-3 py-4 text-center">
          <AlertCircle className="size-10 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground max-w-xs">
            Upload and analyze at least one document to unlock AI career guidance and your readiness score.
          </p>
        </CardContent>
      </Card>
    )
  }

  if (!guidance) {
    return (
      <Card className="bento-card bento-card-primary">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-primary/10 p-2.5">
              <Sparkles className="size-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base sm:text-lg">Career Readiness</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Get personalized AI guidance for your goal
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4 py-4 text-center">
          <div className="rounded-2xl bg-primary/5 p-4">
            <Sparkles className="size-8 text-primary/60" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">Ready to analyse your career readiness?</p>
            <p className="text-xs text-muted-foreground max-w-xs">
              AI will score your skills against <span className="font-semibold">{careerGoal}</span> and surface your
              top gaps with tailored recommendations.
            </p>
          </div>
          {error && (
            <p className="text-xs text-destructive flex items-center gap-1">
              <AlertCircle className="size-3" /> {error}
            </p>
          )}
          <Button onClick={generateGuidance} disabled={loading} className="rounded-xl gap-2">
            {loading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
            {loading ? "Analysing…" : "Generate Guidance"}
          </Button>
        </CardContent>
      </Card>
    )
  }

  const visibleGaps = showAllGaps ? guidance.gaps : guidance.gaps.slice(0, 3)

  return (
    <Card className="bento-card bento-card-primary">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-primary/10 p-2.5">
              <Sparkles className="size-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base sm:text-lg">Career Readiness</CardTitle>
              <CardDescription className="text-xs sm:text-sm truncate max-w-50 sm:max-w-none">
                Goal: {guidance.careerGoal}
              </CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={generateGuidance}
            disabled={loading}
            className="rounded-xl gap-1.5 text-xs h-8"
          >
            {loading ? <Loader2 className="size-3 animate-spin" /> : <RefreshCw className="size-3" />}
            Refresh
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Score + Summary row */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 rounded-2xl bg-muted/40 p-4">
          <ReadinessRing score={guidance.readinessScore} />
          <div className="flex-1 space-y-2 text-center sm:text-left">
            <p className="text-sm font-semibold">
              {guidance.readinessScore >= 75
                ? "Strong Match"
                : guidance.readinessScore >= 50
                ? "Good Progress"
                : "Early Stage"}
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">{guidance.summary}</p>
          </div>
        </div>

        {/* Strengths */}
        {guidance.strengths.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-success" />
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Strengths</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {guidance.strengths.map((s) => (
                <Badge key={s} variant="outline" className="rounded-lg text-xs bg-success/5 text-success border-success/20">
                  {s}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Gaps */}
        {guidance.gaps.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="size-4 text-warning" />
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Skill Gaps</span>
            </div>
            <div className="space-y-2">
              {visibleGaps.map((gap) => {
                const cfg = IMPORTANCE_CONFIG[gap.importance?.toLowerCase()] ?? IMPORTANCE_CONFIG.low
                return (
                  <div key={gap.skill} className="flex items-start gap-3 rounded-xl bg-muted/30 p-3">
                    <Badge variant="outline" className={`rounded-lg text-[10px] shrink-0 mt-0.5 ${cfg.className}`}>
                      {cfg.label}
                    </Badge>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold truncate">{gap.skill}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{gap.suggestion}</p>
                    </div>
                  </div>
                )
              })}
            </div>
            {guidance.gaps.length > 3 && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full rounded-xl text-xs h-7 gap-1"
                onClick={() => setShowAllGaps((v) => !v)}
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
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-primary" />
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Recommendations
              </span>
            </div>
            <ul className="space-y-1.5">
              {guidance.recommendations.map((r, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <span className="mt-0.5 size-4 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[9px] font-bold shrink-0">
                    {i + 1}
                  </span>
                  {r}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Progress bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>Overall readiness</span>
            <span>{guidance.readinessScore}%</span>
          </div>
          <Progress value={guidance.readinessScore} className="h-1.5 rounded-full" />
        </div>

        {error && (
          <p className="text-xs text-destructive flex items-center gap-1">
            <AlertCircle className="size-3" /> {error}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
