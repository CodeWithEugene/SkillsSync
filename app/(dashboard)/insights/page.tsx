import { requireAuth } from "@/lib/supabase-auth"
import { getExtractedSkills, getCareerGuidance, getSkillHistory, getDocuments } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  BarChart2,
  TrendingUp,
  Code2,
  Heart,
  Repeat2,
  FileText,
  CheckCircle2,
  XCircle,
  Loader2,
  Sparkles,
} from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Insights" }

function PercentBar({ pct, colorClass }: { pct: number; colorClass: string }) {
  return (
    <div className="h-2 w-full rounded-full bg-muted/40 overflow-hidden">
      <div className={`h-full rounded-full transition-all ${colorClass}`} style={{ width: `${pct}%` }} />
    </div>
  )
}

export default async function InsightsPage() {
  const user = await requireAuth()

  const [skills, guidance, history, documents] = await Promise.all([
    getExtractedSkills(user.id),
    getCareerGuidance(user.id),
    getSkillHistory(user.id),
    getDocuments(user.id),
  ])

  const total = skills.length
  const technical = skills.filter((s) => s.skillType === "technical").length
  const soft = skills.filter((s) => s.skillType === "soft").length
  const transferable = skills.filter((s) => s.skillType === "transferable").length

  // category frequency map
  const categoryMap: Record<string, number> = {}
  for (const s of skills) {
    const cat = s.category ?? "Uncategorised"
    categoryMap[cat] = (categoryMap[cat] ?? 0) + 1
  }
  const topCategories = Object.entries(categoryMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)

  const topCategoryMax = topCategories[0]?.[1] ?? 1

  // document stats
  const completed = documents.filter((d) => d.status === "COMPLETED").length
  const failed = documents.filter((d) => d.status === "FAILED").length
  const processing = documents.filter((d) => d.status === "PROCESSING").length

  // skill history – readiness trend
  const historyAsc = [...history].sort(
    (a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime(),
  )
  const trendPoints = historyAsc.map((h) => ({
    date: new Date(h.recordedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
    total: h.snapshot.total,
  }))

  const growthDelta =
    trendPoints.length >= 2 ? trendPoints[trendPoints.length - 1].total - trendPoints[0].total : null

  const typeConfig = [
    {
      label: "Technical",
      count: technical,
      icon: Code2,
      color: "text-blue-500",
      bar: "bg-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      label: "Soft",
      count: soft,
      icon: Heart,
      color: "text-pink-500",
      bar: "bg-pink-500",
      bg: "bg-pink-500/10",
    },
    {
      label: "Transferable",
      count: transferable,
      icon: Repeat2,
      color: "text-emerald-500",
      bar: "bg-emerald-500",
      bg: "bg-emerald-500/10",
    },
  ]

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="space-y-1 sm:space-y-2">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight flex items-center gap-3">
          <BarChart2 className="size-7 text-primary" /> Insights
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground">
          A deep dive into your skills, growth, and career readiness.
        </p>
      </div>

      {/* Stat cards row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: "Total Skills", value: total, icon: Sparkles, className: "bento-card-primary" },
          { label: "Documents Analysed", value: completed, icon: FileText, className: "bento-card-info" },
          {
            label: "Readiness Score",
            value: guidance ? `${guidance.readinessScore}/100` : "—",
            icon: TrendingUp,
            className: "bento-card-success",
          },
          { label: "Skill Gaps", value: guidance ? guidance.gaps.length : "—", icon: BarChart2, className: "bento-card-warning" },
        ].map(({ label, value, icon: Icon, className }) => (
          <Card key={label} className={`bento-card ${className}`}>
            <CardContent className="pt-4 pb-4 flex flex-col gap-1.5">
              <div className="rounded-xl bg-primary/10 w-fit p-2">
                <Icon className="size-4 text-primary" />
              </div>
              <p className="text-xl sm:text-2xl font-bold">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Skill type breakdown */}
      <Card className="bento-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg">Skill Type Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {total === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No skills yet — upload a document to get started.
            </p>
          ) : (
            typeConfig.map(({ label, count, icon: Icon, color, bar, bg }) => {
              const pct = total > 0 ? Math.round((count / total) * 100) : 0
              return (
                <div key={label} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className={`rounded-lg p-1.5 ${bg}`}>
                        <Icon className={`size-3.5 ${color}`} />
                      </div>
                      <span className="font-medium">{label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground text-xs">{pct}%</span>
                      <Badge variant="outline" className={`text-[10px] rounded-md h-4 px-1.5 ${bg} ${color}`}>
                        {count}
                      </Badge>
                    </div>
                  </div>
                  <PercentBar pct={pct} colorClass={bar} />
                </div>
              )
            })
          )}
        </CardContent>
      </Card>

      {/* Top skill categories + Document health side by side */}
      <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
        {/* Top categories */}
        <Card className="bento-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base sm:text-lg">Top Skill Categories</CardTitle>
          </CardHeader>
          <CardContent>
            {topCategories.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No categories yet.</p>
            ) : (
              <div className="space-y-2">
                {topCategories.map(([cat, count]) => (
                  <div key={cat} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-28 truncate shrink-0">{cat}</span>
                    <div className="flex-1">
                      <PercentBar
                        pct={Math.round((count / topCategoryMax) * 100)}
                        colorClass="bg-primary"
                      />
                    </div>
                    <span className="text-xs font-semibold w-5 text-right shrink-0">{count}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Document health */}
        <Card className="bento-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base sm:text-lg">Document Health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {documents.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No documents uploaded yet.</p>
            ) : (
              <>
                {[
                  {
                    label: "Completed",
                    count: completed,
                    icon: CheckCircle2,
                    color: "text-success",
                    bg: "bg-success/10",
                  },
                  { label: "Processing", count: processing, icon: Loader2, color: "text-info", bg: "bg-info/10" },
                  { label: "Failed", count: failed, icon: XCircle, color: "text-destructive", bg: "bg-destructive/10" },
                ].map(({ label, count, icon: Icon, color, bg }) => (
                  <div key={label} className="flex items-center gap-3 rounded-xl p-3 bg-muted/30">
                    <div className={`rounded-xl p-2 ${bg}`}>
                      <Icon className={`size-4 ${color}`} />
                    </div>
                    <span className="text-sm font-medium flex-1">{label}</span>
                    <Badge variant="outline" className="text-xs rounded-lg">
                      {count}
                    </Badge>
                  </div>
                ))}
                <div className="pt-1">
                  <Progress value={(completed / documents.length) * 100} className="h-1.5 rounded-full" />
                  <p className="text-xs text-muted-foreground mt-1 text-right">
                    {Math.round((completed / documents.length) * 100)}% success rate
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Skill growth timeline */}
      {trendPoints.length > 0 && (
        <Card className="bento-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base sm:text-lg">Skill Growth Over Time</CardTitle>
              {growthDelta !== null && (
                <Badge
                  variant="outline"
                  className={`text-xs rounded-lg ${
                    growthDelta > 0
                      ? "bg-success/10 text-success border-success/20"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {growthDelta > 0 ? `+${growthDelta}` : growthDelta} skills total
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2 h-24 overflow-x-auto pb-1">
              {trendPoints.map((pt, i) => {
                const maxTotal = Math.max(...trendPoints.map((p) => p.total), 1)
                const heightPct = Math.max((pt.total / maxTotal) * 100, 8)
                return (
                  <div key={i} className="flex flex-col items-center gap-1 shrink-0" style={{ minWidth: "40px" }}>
                    <span className="text-[10px] text-muted-foreground font-medium">{pt.total}</span>
                    <div
                      className="w-8 rounded-t-lg bg-primary/60 hover:bg-primary transition-colors"
                      style={{ height: `${heightPct}%` }}
                    />
                    <span className="text-[9px] text-muted-foreground text-center leading-tight">{pt.date}</span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Guidance summary */}
      {guidance && (
        <Card className="bento-card bento-card-primary">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="rounded-2xl bg-primary/10 p-2.5">
                <Sparkles className="size-5 text-primary" />
              </div>
              <CardTitle className="text-base sm:text-lg">AI Career Summary</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground leading-relaxed">{guidance.summary}</p>
            {guidance.strengths.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {guidance.strengths.map((s) => (
                  <Badge key={s} variant="outline" className="text-xs rounded-xl bg-success/5 text-success border-success/20">
                    {s}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
