"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Briefcase,
  Sparkles,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertCircle,
  RefreshCcw,
} from "lucide-react"

type MatchResult = {
  matchScore: number
  matchedSkills: string[]
  missingSkills: string[]
  verdict: string
}

function ScoreRing({ score }: { score: number }) {
  const r = 54
  const cx = 64
  const cy = 64
  const circumference = 2 * Math.PI * r
  const offset = circumference - (score / 100) * circumference
  const color = score >= 75 ? "#22c55e" : score >= 50 ? "#f59e0b" : "#ef4444"
  const label = score >= 75 ? "Great Match" : score >= 50 ? "Decent Fit" : "Weak Match"

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="128" height="128" viewBox="0 0 128 128">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="currentColor" strokeWidth="10" className="text-muted/30" />
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`}
          style={{ transition: "stroke-dashoffset 0.8s ease" }}
        />
        <text x={cx} y={cy + 2} textAnchor="middle" dominantBaseline="middle" fontSize="26" fontWeight="bold" fill={color}>
          {score}
        </text>
        <text x={cx} y={cy + 22} textAnchor="middle" fontSize="11" fill="currentColor" className="fill-muted-foreground">
          / 100
        </text>
      </svg>
      <span className="text-sm font-semibold" style={{ color }}>{label}</span>
    </div>
  )
}

export default function CompareClient() {
  const [jobDescription, setJobDescription] = useState("")
  const [result, setResult] = useState<MatchResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleAnalyse() {
    if (!jobDescription.trim() || jobDescription.trim().length < 20) {
      setError("Please paste a full job description (at least 20 characters).")
      return
    }
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch("/api/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobDescription }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.")
        return
      }
      setResult(data)
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  function handleReset() {
    setResult(null)
    setJobDescription("")
    setError(null)
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Input card */}
      {!result && (
        <Card className="bento-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base sm:text-lg">Paste a Job Description</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <textarea
              className="w-full min-h-48 rounded-2xl border border-input bg-muted/20 px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-muted-foreground/50 transition-all"
              placeholder="Paste the full job description here… (requirements, responsibilities, etc.)"
              value={jobDescription}
              onChange={(e) => {
                setJobDescription(e.target.value)
                setError(null)
              }}
              disabled={loading}
            />
            {error && (
              <div className="flex items-center gap-2 text-destructive text-xs">
                <AlertCircle className="size-3.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            <Button
              onClick={handleAnalyse}
              disabled={loading || !jobDescription.trim()}
              className="rounded-2xl gap-2 w-full sm:w-auto"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Analysing…
                </>
              ) : (
                <>
                  <Sparkles className="size-4" />
                  Analyse Match
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-4">
          {/* Score + verdict */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="bento-card bento-card-primary flex flex-col items-center py-6">
              <ScoreRing score={result.matchScore} />
            </Card>

            <Card className="bento-card">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <div className="rounded-2xl bg-primary/10 p-2.5">
                    <Sparkles className="size-5 text-primary" />
                  </div>
                  <CardTitle className="text-base">AI Verdict</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">{result.verdict}</p>
              </CardContent>
            </Card>
          </div>

          {/* Matched + Missing side by side */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="bento-card bento-card-success">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-5 text-success" />
                  <CardTitle className="text-sm">Matched Skills</CardTitle>
                  <Badge variant="outline" className="ml-auto rounded-lg text-xs bg-success/10 text-success border-success/20">
                    {result.matchedSkills.length}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {result.matchedSkills.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No direct matches found.</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {result.matchedSkills.map((s) => (
                      <Badge key={s} variant="outline" className="rounded-xl text-xs bg-success/5 text-success border-success/20">
                        {s}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bento-card bento-card-warning">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <XCircle className="size-5 text-destructive" />
                  <CardTitle className="text-sm">Missing Skills</CardTitle>
                  <Badge variant="outline" className="ml-auto rounded-lg text-xs bg-destructive/10 text-destructive border-destructive/20">
                    {result.missingSkills.length}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {result.missingSkills.length === 0 ? (
                  <p className="text-xs text-success">You have all key skills! 🎉</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {result.missingSkills.map((s) => (
                      <Badge key={s} variant="outline" className="rounded-xl text-xs bg-destructive/5 text-destructive border-destructive/20">
                        {s}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Button variant="outline" onClick={handleReset} className="rounded-2xl gap-2">
            <RefreshCcw className="size-4" />
            Try Another Job
          </Button>
        </div>
      )}
    </div>
  )
}
