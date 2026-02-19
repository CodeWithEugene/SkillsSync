import { getPublicUserProfile } from "@/lib/db"
import { notFound } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Code2, Heart, Repeat2, Target, BookOpen, Sparkles, User } from "lucide-react"
import type { Metadata } from "next"

interface PageProps {
  params: Promise<{ userId: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { userId } = await params
  const profile = await getPublicUserProfile(userId)
  if (!profile) return { title: "Profile not found" }
  return {
    title: `${profile.careerGoal ?? "Skill Profile"} | SkillSync`,
    description: `${profile.skills.length} skills tracked on SkillSync`,
  }
}

const TYPE_CONFIG = {
  technical: { icon: Code2, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20", label: "Technical" },
  soft: { icon: Heart, color: "text-pink-500", bg: "bg-pink-500/10", border: "border-pink-500/20", label: "Soft" },
  transferable: { icon: Repeat2, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20", label: "Transferable" },
} as const

export default async function PublicProfilePage({ params }: PageProps) {
  const { userId } = await params
  const profile = await getPublicUserProfile(userId)

  if (!profile) notFound()

  const safeProfile = profile!

  const skillsByType = {
    technical: safeProfile.skills.filter((s) => s.skillType === "technical"),
    soft: safeProfile.skills.filter((s) => s.skillType === "soft"),
    transferable: safeProfile.skills.filter((s) => s.skillType === "transferable"),
  }

  // Group by category within each type
  function groupByCategory(skills: typeof safeProfile.skills) {
    const map: Record<string, string[]> = {}
    for (const s of skills) {
      const cat = s.category ?? "General"
      if (!map[cat]) map[cat] = []
      map[cat].push(s.skillName)
    }
    return map
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="SkillSync" className="h-7 w-auto" />
          <span className="text-sm text-muted-foreground">Public Profile</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Hero card */}
        <Card className="bento-card bento-card-primary overflow-hidden">
          <CardContent className="pt-6 pb-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
              <div className="rounded-2xl bg-primary/10 p-5 shrink-0">
                <User className="size-10 text-primary" />
              </div>
              <div className="flex-1 text-center sm:text-left space-y-2">
                {safeProfile.careerGoal && (
                  <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                    <Target className="size-4 text-primary shrink-0" />
                    <h1 className="text-xl sm:text-2xl font-bold">{safeProfile.careerGoal}</h1>
                  </div>
                )}
                {safeProfile.skillGoal && (
                  <p className="text-sm text-muted-foreground">{safeProfile.skillGoal}</p>
                )}
                {safeProfile.currentStudy && (
                  <div className="flex items-center justify-center sm:justify-start gap-2 text-sm text-muted-foreground">
                    <BookOpen className="size-4 shrink-0" />
                    <span>{safeProfile.currentStudy}</span>
                  </div>
                )}
                <div className="flex items-center justify-center sm:justify-start gap-2 pt-1 flex-wrap">
                  {(["technical", "soft", "transferable"] as const).map((type) => {
                    const cfg = TYPE_CONFIG[type]
                    const count = skillsByType[type].length
                    if (!count) return null
                    return (
                      <Badge key={type} variant="outline" className={`rounded-lg text-xs ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                        <cfg.icon className="size-3 mr-1" />
                        {count} {cfg.label}
                      </Badge>
                    )
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Readiness score */}
        {safeProfile.guidance && (
          <Card className="bento-card">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-primary/10 p-2.5">
                  <Sparkles className="size-5 text-primary" />
                </div>
                <CardTitle className="text-base sm:text-lg">Career Readiness</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="text-4xl font-bold text-primary tabular-nums">
                  {safeProfile.guidance.readinessScore}
                  <span className="text-lg text-muted-foreground font-normal">/100</span>
                </div>
                <div className="flex-1">
                  <Progress value={safeProfile.guidance.readinessScore} className="h-2 rounded-full mb-2" />
                  <p className="text-xs text-muted-foreground">{safeProfile.guidance.summary}</p>
                </div>
              </div>
              {safeProfile.guidance.strengths.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {safeProfile.guidance.strengths.map((s) => (
                    <Badge key={s} variant="outline" className="rounded-lg text-xs bg-success/5 text-success border-success/20">
                      {s}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Skills by type */}
        {(["technical", "soft", "transferable"] as const).map((type) => {
          const cfg = TYPE_CONFIG[type]
          const grouped = groupByCategory(skillsByType[type])
          const categories = Object.keys(grouped)
          if (!categories.length) return null

          return (
            <Card key={type} className="bento-card">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className={`rounded-2xl ${cfg.bg} p-2.5`}>
                    <cfg.icon className={`size-5 ${cfg.color}`} />
                  </div>
                  <CardTitle className="text-base sm:text-lg">
                    {cfg.label} Skills
                    <Badge variant="outline" className={`ml-2 rounded-lg text-xs ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                      {skillsByType[type].length}
                    </Badge>
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {categories.map((cat) => (
                  <div key={cat}>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">{cat}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {grouped[cat].map((skill) => (
                        <Badge key={skill} variant="outline" className="rounded-lg text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )
        })}

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground pb-4">
          Powered by{" "}
          <a href="/" className="font-semibold text-primary hover:underline">
            SkillSync
          </a>{" "}
          — AI-powered skill tracking for students
        </p>
      </main>
    </div>
  )
}
