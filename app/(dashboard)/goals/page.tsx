import { requireAuth } from "@/lib/supabase-auth"
import { getUserGoal } from "@/lib/db"
import { CareerGoalCard } from "@/components/profile/career-goal-card"
import { PageHeader } from "@/components/ui/page-header"
import { redirect } from "next/navigation"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Goals" }

export default async function GoalsPage() {
  const user = await requireAuth()
  const userGoal = await getUserGoal(user.id)
  if (!userGoal) redirect("/onboarding")

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="03 — Goals"
        title={
          <>
            Your <span className="italic font-light text-primary">north star</span>.
          </>
        }
        description="Career, education, and current focus — the inputs that shape every analysis."
      />

      <div className="grid gap-px bg-border border border-border md:grid-cols-2 stagger-rise">
        {/* Career Goal — editable, bound to O*NET SOC */}
        <div className="bg-card">
          <CareerGoalCard
            initialSocCode={userGoal.socCode}
            initialSocTitle={userGoal.socTitle}
            initialCareerGoal={userGoal.careerGoal}
          />
        </div>

        {/* Education */}
        <div className="bg-card p-5 sm:p-6 space-y-4">
          <p className="editorial-eyebrow">Education</p>
          <div className="space-y-4">
            {userGoal.educationLevel && (
              <div>
                <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground mb-1">
                  Level
                </p>
                <p className="display-serif text-2xl tracking-tight capitalize">
                  {userGoal.educationLevel.replace("-", " ")}
                </p>
              </div>
            )}
            {userGoal.currentStudy && (
              <div>
                <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground mb-1">
                  Programme
                </p>
                <p className="display-serif text-2xl tracking-tight">
                  {userGoal.currentStudy}
                </p>
              </div>
            )}
            {userGoal.studyYear && (
              <div>
                <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground mb-1">
                  Year
                </p>
                <p className="display-serif text-2xl tracking-tight">
                  {userGoal.studyYear}
                </p>
              </div>
            )}
            {!userGoal.educationLevel && !userGoal.currentStudy && !userGoal.studyYear && (
              <p className="text-sm text-muted-foreground">Not set.</p>
            )}
          </div>
        </div>

        {/* Top priority — full width */}
        <div className="bg-card p-5 sm:p-6 md:col-span-2">
          <p className="editorial-eyebrow mb-3">Top priority</p>
          <p className="display-serif text-3xl sm:text-4xl tracking-tight capitalize leading-tight">
            {userGoal.topPriority?.replace("-", " ") ?? "Not set."}
          </p>
        </div>
      </div>
    </div>
  )
}
