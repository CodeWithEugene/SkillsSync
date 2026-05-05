import { getPublicUserProfile } from "@/lib/db"
import { notFound } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Code2, Heart, Repeat2 } from "lucide-react"
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
  technical: {
    icon: Code2,
    color: "text-info",
    bg: "bg-info/10",
    border: "border-info/30",
    label: "Technical",
  },
  soft: {
    icon: Heart,
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/30",
    label: "Soft",
  },
  transferable: {
    icon: Repeat2,
    color: "text-success",
    bg: "bg-success/10",
    border: "border-success/30",
    label: "Transferable",
  },
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
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border sticky top-0 z-10 bg-background/95 backdrop-blur">
        <div className="max-w-4xl mx-auto px-5 sm:px-8 h-14 flex items-center justify-between">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="SkillSync" className="h-7 w-auto" />
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Public profile
          </span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-5 sm:px-8 py-10 sm:py-16 space-y-12">
        {/* Editorial masthead */}
        <header className="space-y-3">
          <p className="editorial-eyebrow">Skills profile</p>
          {safeProfile.careerGoal && (
            <h1 className="display-serif text-4xl sm:text-5xl lg:text-6xl leading-[1] tracking-tight">
              {safeProfile.careerGoal}
            </h1>
          )}
          {safeProfile.skillGoal && (
            <p className="text-base text-muted-foreground max-w-2xl">{safeProfile.skillGoal}</p>
          )}
          {safeProfile.currentStudy && (
            <p className="text-sm text-muted-foreground">{safeProfile.currentStudy}</p>
          )}
          <div className="editorial-rule" />
          <div className="flex items-center gap-1.5 flex-wrap">
            {(["technical", "soft", "transferable"] as const).map((type) => {
              const cfg = TYPE_CONFIG[type]
              const count = skillsByType[type].length
              if (!count) return null
              return (
                <Badge
                  key={type}
                  variant="outline"
                  className={`font-normal normal-case tracking-normal text-xs ${cfg.bg} ${cfg.color} ${cfg.border}`}
                >
                  <cfg.icon className="size-3 mr-1" />
                  {count} {cfg.label}
                </Badge>
              )
            })}
          </div>
        </header>

        {/* Readiness */}
        {safeProfile.guidance && (
          <section className="space-y-4">
            <p className="editorial-eyebrow">Career readiness</p>
            <div className="grid sm:grid-cols-12 gap-5 items-start">
              <p className="sm:col-span-3 display-serif text-6xl sm:text-7xl tabular leading-none">
                {safeProfile.guidance.readinessScore}
                <span className="text-2xl text-muted-foreground font-normal">/100</span>
              </p>
              <p className="sm:col-span-9 text-sm text-foreground/80 leading-relaxed">
                {safeProfile.guidance.summary}
              </p>
            </div>
            {safeProfile.guidance.strengths.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-2">
                {safeProfile.guidance.strengths.map((s) => (
                  <Badge
                    key={s}
                    variant="outline"
                    className="font-normal normal-case tracking-normal text-xs bg-success/5 text-success border-success/30"
                  >
                    {s}
                  </Badge>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Skills by type */}
        {(["technical", "soft", "transferable"] as const).map((type) => {
          const cfg = TYPE_CONFIG[type]
          const grouped = groupByCategory(skillsByType[type])
          const categories = Object.keys(grouped)
          if (!categories.length) return null

          return (
            <section key={type} className="space-y-4">
              <div className="flex items-baseline gap-3 border-b border-border pb-2">
                <p className="editorial-eyebrow">{cfg.label}</p>
                <span className="font-mono text-xs tabular text-muted-foreground">
                  {String(skillsByType[type].length).padStart(2, "0")}
                </span>
              </div>
              <div className="space-y-4">
                {categories.map((cat) => (
                  <div key={cat}>
                    <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground mb-2">
                      {cat}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {grouped[cat].map((skill) => (
                        <Badge
                          key={skill}
                          variant="outline"
                          className="font-normal normal-case tracking-normal text-xs"
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )
        })}

        <footer className="border-t border-border pt-6 text-center">
          <p className="text-xs text-muted-foreground">
            Powered by{" "}
            <a href="/" className="font-semibold text-foreground underline decoration-border hover:decoration-primary underline-offset-4">
              SkillSync
            </a>
            {" "}— evidence-based skill tracking for African students.
          </p>
        </footer>
      </main>
    </div>
  )
}
