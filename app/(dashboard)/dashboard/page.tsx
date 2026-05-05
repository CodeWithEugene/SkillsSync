import { requireAuth } from "@/lib/supabase-auth"
import {
  getDocuments,
  getExtractedSkills,
  getUserGoal,
  getCareerGuidance,
  getSkillHistory,
} from "@/lib/db"
import { DocumentList } from "@/components/documents/document-list"
import { CareerGuidanceWidget } from "@/components/dashboard/career-guidance-widget"
import { SkillTimeline } from "@/components/dashboard/skill-timeline"
import { PageHeader } from "@/components/ui/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { redirect } from "next/navigation"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Dashboard" }

interface MetricBlockProps {
  index: string
  label: string
  value: number | string
  caption: string
}
function MetricBlock({ index, label, value, caption }: MetricBlockProps) {
  return (
    <div className="bg-card p-5 sm:p-6 metric-block">
      <p className="font-mono text-[10px] tracking-widest text-muted-foreground/70">
        {index}
      </p>
      <p className="editorial-eyebrow mt-1 mb-3">{label}</p>
      <p className="metric-value text-5xl sm:text-6xl tabular">{value}</p>
      <p className="text-xs text-muted-foreground mt-2">{caption}</p>
    </div>
  )
}

export default async function DashboardPage() {
  const user = await requireAuth()

  const userGoal = await getUserGoal(user.id)
  if (!userGoal) {
    redirect("/onboarding")
  }

  const [documents, skills, guidance, skillHistory] = await Promise.all([
    getDocuments(user.id),
    getExtractedSkills(user.id),
    getCareerGuidance(user.id),
    getSkillHistory(user.id),
  ])

  const completedDocs = documents.filter((d) => d.status === "COMPLETED").length
  const processingDocs = documents.filter((d) => d.status === "PROCESSING").length
  const userHasSkills = skills.length > 0
  const careerLabel = userGoal.socTitle ?? userGoal.careerGoal ?? ""

  const firstName =
    user.user_metadata?.first_name || user.email?.split("@")[0] || "there"

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="01 — Dashboard"
        title={
          <>
            Welcome back,{" "}
            <span className="italic font-light text-primary">{firstName}</span>.
          </>
        }
        description={
          careerLabel
            ? `Tracking progress toward ${careerLabel}.`
            : "Set a career goal to start tracking your progress."
        }
      />

      {/* Metric row — gap-px on a bordered grid produces clean editorial inner rules */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-border border border-border stagger-rise">
        <MetricBlock
          index="01"
          label="Documents"
          value={documents.length.toString().padStart(2, "0")}
          caption={`${completedDocs} analysed${processingDocs ? ` · ${processingDocs} in queue` : ""}`}
        />
        <MetricBlock
          index="02"
          label="Skills"
          value={skills.length.toString().padStart(2, "0")}
          caption="Unique competencies extracted"
        />
        <MetricBlock
          index="03"
          label="Readiness"
          value={guidance ? `${guidance.readinessScore}` : "—"}
          caption={guidance ? "Out of 100, vs O*NET benchmark" : "Generate guidance to see"}
        />
        <MetricBlock
          index="04"
          label="Gaps"
          value={guidance ? guidance.gaps.length.toString().padStart(2, "0") : "—"}
          caption={
            guidance
              ? `${guidance.gaps.filter((g) => g.importance === "high").length} high priority`
              : "Awaiting analysis"
          }
        />
      </section>

      {/* Asymmetric 7/5 split — guidance heavy, timeline beside */}
      <section className="grid lg:grid-cols-12 gap-5 lg:gap-6">
        <div className="lg:col-span-7">
          <CareerGuidanceWidget
            initialGuidance={guidance}
            userHasSkills={userHasSkills}
            careerGoal={careerLabel}
          />
        </div>
        <div className="lg:col-span-5">
          <SkillTimeline initialHistory={skillHistory} />
        </div>
      </section>

      <section>
        <Card className="bento-card max-h-72 sm:max-h-96 flex flex-col overflow-hidden p-0 gap-0">
          <CardHeader className="pb-3 sm:pb-4 pt-5">
            <p className="editorial-eyebrow">Library</p>
            <CardTitle className="display-serif text-2xl sm:text-3xl tracking-tight font-normal">
              Recent documents
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto scrollbar-primary pb-5">
            <DocumentList documents={documents.slice(0, 5)} />
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
