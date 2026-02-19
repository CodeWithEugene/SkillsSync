import { requireAuth } from "@/lib/supabase-auth"
import { getUserGoal, getExtractedSkills, getCareerGuidance, getSkillHistory } from "@/lib/db"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import {
  Map,
  Target,
  CheckCircle2,
  Circle,
  TrendingUp,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Code2,
  Heart,
  Repeat2,
  BookOpen,
  FileText,
} from "lucide-react"
import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Roadmap" }

const TYPE_CONFIG = {
  technical: { icon: Code2, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  soft: { icon: Heart, color: "text-pink-500", bg: "bg-pink-500/10", border: "border-pink-500/20" },
  transferable: { icon: Repeat2, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
} as const

function ReadinessArc({ score }: { score: number }) {
  // Half-circle arc (180°)
  const r = 70
  const cx = 90
  const cy = 90
  const circumference = Math.PI * r // half circle
  const offset = circumference - (score / 100) * circumference
  const color = score >= 75 ? "#22c55e" : score >= 50 ? "#f59e0b" : "#ef4444"
  const label = score >= 75 ? "Strong Match" : score >= 50 ? "Good Progress" : "Early Stage"

  return (
    <div className="flex flex-col items-center">
      <svg width="180" height="100" viewBox="0 0 180 100">
        {/* track */}
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none" stroke="currentColor" strokeWidth="12"
          className="text-muted/30" strokeLinecap="round"
        />
        {/* progress */}
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none" stroke={color} strokeWidth="12"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.8s ease" }}
        />
        <text x={cx} y={cy - 8} textAnchor="middle" fontSize="28" fontWeight="bold" fill={color}>{score}</text>
        <text x={cx} y={cy + 14} textAnchor="middle" fontSize="11" fill="currentColor" className="fill-muted-foreground">/100</text>
      </svg>
      <span className="text-sm font-semibold -mt-1" style={{ color }}>{label}</span>
    </div>
  )
}

export default async function RoadmapPage() {
  const user = await requireAuth()

  const [userGoal, skills, guidance, history] = await Promise.all([
    getUserGoal(user.id),
    getExtractedSkills(user.id),
    getCareerGuidance(user.id),
    getSkillHistory(user.id),
  ])

  if (!userGoal) redirect("/onboarding")

  const skillsByType = {
    technical: skills.filter((s) => s.skillType === "technical"),
    soft: skills.filter((s) => s.skillType === "soft"),
    transferable: skills.filter((s) => s.skillType === "transferable"),
  }

  // Build milestone steps
  const milestones = [
    {
      id: "onboarded",
      label: "Set Career Goal",
      description: userGoal.careerGoal ?? "—",
      done: !!userGoal.careerGoal,
      icon: Target,
    },
    {
      id: "uploaded",
      label: "Upload Documents",
      description: `${history.length} document${history.length !== 1 ? "s" : ""} analysed`,
      done: history.length > 0,
      icon: FileText,
    },
    {
      id: "skills",
      label: "Build Skill Profile",
      description: `${skills.length} skill${skills.length !== 1 ? "s" : ""} extracted`,
      done: skills.length >= 5,
      icon: Sparkles,
    },
    {
      id: "guidance",
      label: "Generate AI Guidance",
      description: guidance ? `Readiness score: ${guidance.readinessScore}/100` : "Not yet generated",
      done: !!guidance,
      icon: TrendingUp,
    },
    {
      id: "gaps",
      label: "Close Skill Gaps",
      description: guidance
        ? guidance.gaps.length === 0
          ? "No critical gaps found!"
          : `${guidance.gaps.filter((g) => g.importance === "high").length} high-priority gaps remain`
        : "Generate AI guidance first",
      done: !!guidance && guidance.gaps.filter((g) => g.importance === "high").length === 0,
      icon: BookOpen,
    },
    {
      id: "ready",
      label: "Reach Target Role",
      description: userGoal.careerGoal ?? "Your goal",
      done: !!guidance && guidance.readinessScore >= 80,
      icon: Target,
    },
  ]

  const completedMilestones = milestones.filter((m) => m.done).length
  const progressPct = Math.round((completedMilestones / milestones.length) * 100)

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="space-y-1 sm:space-y-2">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight flex items-center gap-3">
          <Map className="size-7 text-primary" /> Career Roadmap
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground">
          Your journey from where you are to where you want to be.
        </p>
      </div>

      {/* 3-zone overview */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-3">
        {/* Where You Are */}
        <Card className="bento-card bento-card-info">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Where You Are
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {guidance ? (
              <ReadinessArc score={guidance.readinessScore} />
            ) : (
              <div className="text-center py-4">
                <AlertCircle className="size-8 text-muted-foreground/50 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">Generate AI guidance to see your readiness score</p>
              </div>
            )}
            <div className="space-y-1.5 pt-1">
              {(["technical", "soft", "transferable"] as const).map((type) => {
                const cfg = TYPE_CONFIG[type]
                const count = skillsByType[type].length
                return (
                  <div key={type} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <cfg.icon className={`size-3 ${cfg.color}`} />
                      <span className="text-muted-foreground capitalize">{type}</span>
                    </div>
                    <Badge variant="outline" className={`text-[10px] h-4 px-1.5 rounded-md ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                      {count}
                    </Badge>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* The Gap */}
        <Card className="bento-card bento-card-warning">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              The Gap
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {guidance && guidance.gaps.length > 0 ? (
              <>
                <div className="space-y-2">
                  {guidance.gaps.slice(0, 4).map((gap) => (
                    <div key={gap.skill} className="flex items-start gap-2 rounded-xl bg-muted/30 p-2.5">
                      <Badge
                        variant="outline"
                        className={`text-[10px] rounded-md shrink-0 mt-0.5 ${
                          gap.importance === "high"
                            ? "bg-destructive/10 text-destructive border-destructive/20"
                            : gap.importance === "medium"
                            ? "bg-warning/10 text-warning border-warning/20"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {gap.importance}
                      </Badge>
                      <p className="text-xs font-medium leading-tight">{gap.skill}</p>
                    </div>
                  ))}
                </div>
                {guidance.gaps.length > 4 && (
                  <p className="text-xs text-muted-foreground text-center">+{guidance.gaps.length - 4} more gaps</p>
                )}
              </>
            ) : guidance && guidance.gaps.length === 0 ? (
              <div className="text-center py-6">
                <CheckCircle2 className="size-8 text-success mx-auto mb-2" />
                <p className="text-xs text-success font-medium">No critical gaps found!</p>
              </div>
            ) : (
              <div className="text-center py-6">
                <AlertCircle className="size-8 text-muted-foreground/50 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">Generate AI guidance to see your skill gaps</p>
                <Link href="/dashboard">
                  <Button variant="outline" size="sm" className="mt-3 rounded-xl text-xs h-7">
                    Go to Dashboard
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Where You're Going */}
        <Card className="bento-card bento-card-success">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Where You&apos;re Going
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-2xl bg-primary/5 border border-primary/10 p-4 text-center">
              <Target className="size-6 text-primary mx-auto mb-2" />
              <p className="text-base font-bold leading-tight">{userGoal.careerGoal ?? "No goal set"}</p>
            </div>
            {userGoal.skillGoal && (
              <p className="text-xs text-muted-foreground leading-relaxed">{userGoal.skillGoal}</p>
            )}
            {guidance && guidance.recommendations.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Next steps</p>
                {guidance.recommendations.slice(0, 3).map((r, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <span className="mt-0.5 size-4 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[9px] font-bold shrink-0">
                      {i + 1}
                    </span>
                    <span className="leading-relaxed">{r}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Journey progress bar */}
      <Card className="bento-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base sm:text-lg">Journey Progress</CardTitle>
            <Badge variant="outline" className="rounded-lg text-xs">
              {completedMilestones}/{milestones.length} milestones
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <Progress value={progressPct} className="h-2 rounded-full" />
          <p className="text-xs text-muted-foreground text-right">{progressPct}% of your roadmap complete</p>
        </CardContent>
      </Card>

      {/* Milestone timeline */}
      <Card className="bento-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg">Milestones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {/* vertical connector */}
            <div className="absolute left-4 top-5 bottom-5 w-0.5 bg-border" />

            <div className="space-y-0">
              {milestones.map((m, idx) => {
                const Icon = m.icon
                const isLast = idx === milestones.length - 1
                const isNext = !m.done && milestones.slice(0, idx).every((p) => p.done)

                return (
                  <div key={m.id} className="relative flex items-start gap-4 pl-10 py-3">
                    {/* Node */}
                    <div
                      className={`absolute left-0 flex items-center justify-center size-9 rounded-full border-2 shrink-0 z-10 ${
                        m.done
                          ? "border-primary bg-primary text-primary-foreground"
                          : isNext
                          ? "border-primary bg-background text-primary animate-pulse"
                          : "border-border bg-background text-muted-foreground"
                      }`}
                    >
                      {m.done ? (
                        <CheckCircle2 className="size-4" />
                      ) : (
                        <Circle className="size-4" />
                      )}
                    </div>

                    <div className={`flex-1 rounded-2xl p-3 transition-all ${
                      m.done ? "bg-primary/5 border border-primary/10" :
                      isNext ? "bg-muted/60 border border-border ring-1 ring-primary/20" :
                      "bg-muted/30"
                    }`}>
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className={`rounded-lg p-1.5 ${m.done ? "bg-primary/10" : "bg-muted"}`}>
                          <Icon className={`size-3.5 ${m.done ? "text-primary" : "text-muted-foreground"}`} />
                        </div>
                        <p className={`text-sm font-semibold ${m.done ? "text-foreground" : "text-muted-foreground"}`}>
                          {m.label}
                        </p>
                        {isNext && (
                          <Badge className="text-[10px] h-4 rounded-md px-1.5 bg-primary/10 text-primary border-primary/20 ml-auto">
                            Next
                          </Badge>
                        )}
                        {isLast && m.done && (
                          <Badge className="text-[10px] h-4 rounded-md px-1.5 bg-success/10 text-success border-success/20 ml-auto">
                            🎉 Achieved
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 ml-8 leading-relaxed">{m.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Strengths banner */}
      {guidance && guidance.strengths.length > 0 && (
        <Card className="bento-card">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-5 text-success" />
              <CardTitle className="text-base sm:text-lg">Your Strengths</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {guidance.strengths.map((s) => (
                <Badge key={s} variant="outline" className="rounded-xl text-sm py-1 px-3 bg-success/5 text-success border-success/20">
                  {s}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* CTA row */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Link href="/documents">
          <Card className="bento-card hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer group">
            <CardContent className="pt-4 pb-4 flex items-center gap-3">
              <div className="rounded-xl bg-info/10 p-2.5">
                <FileText className="size-5 text-info" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">Upload Documents</p>
                <p className="text-xs text-muted-foreground">Add more to improve your score</p>
              </div>
              <ArrowRight className="size-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
            </CardContent>
          </Card>
        </Link>
        <Link href="/courses">
          <Card className="bento-card hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer group">
            <CardContent className="pt-4 pb-4 flex items-center gap-3">
              <div className="rounded-xl bg-success/10 p-2.5">
                <BookOpen className="size-5 text-success" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">Browse Courses</p>
                <p className="text-xs text-muted-foreground">Close your skill gaps faster</p>
              </div>
              <ArrowRight className="size-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
            </CardContent>
          </Card>
        </Link>
        <Link href="/compare">
          <Card className="bento-card hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer group">
            <CardContent className="pt-4 pb-4 flex items-center gap-3">
              <div className="rounded-xl bg-warning/10 p-2.5">
                <Sparkles className="size-5 text-warning" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">Match a Job</p>
                <p className="text-xs text-muted-foreground">See how well you fit a role</p>
              </div>
              <ArrowRight className="size-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
