import { requireAuth } from "@/lib/supabase-auth"
import { getUserGoal } from "@/lib/db"
import { Target, GraduationCap, Calendar, TrendingUp } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { redirect } from "next/navigation"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Goals",
}

export default async function GoalsPage() {
  const user = await requireAuth()

  const userGoal = await getUserGoal(user.id)
  if (!userGoal) {
    redirect("/onboarding")
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="space-y-1 sm:space-y-2">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">My Goals</h1>
        <p className="text-base sm:text-lg text-muted-foreground">Track your career and learning journey.</p>
      </div>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Career Goal Card */}
        <Card className="bento-card bento-card-primary hover:bg-primary hover:text-primary-foreground hover:scale-[1.02] transition-all duration-300 group">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-primary/10 group-hover:bg-primary-foreground/20 p-3">
                <Target className="size-7 text-primary group-hover:text-primary-foreground" />
              </div>
              <div>
                <CardTitle className="text-xl sm:text-2xl group-hover:text-primary-foreground">Career Goal</CardTitle>
                <CardDescription className="text-sm group-hover:text-primary-foreground/80">
                  Your target career path
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl bg-background/50 group-hover:bg-primary-foreground/10 p-4 sm:p-6">
              <p className="text-2xl sm:text-3xl font-bold text-foreground group-hover:text-primary-foreground">
                {userGoal.careerGoal || "Not set"}
              </p>
            </div>
            {userGoal.skillGoal && (
              <div className="rounded-2xl bg-background/50 group-hover:bg-primary-foreground/10 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="size-4 text-muted-foreground group-hover:text-primary-foreground" />
                  <p className="text-sm font-medium text-muted-foreground group-hover:text-primary-foreground">
                    Target Skills
                  </p>
                </div>
                <p className="text-base text-foreground group-hover:text-primary-foreground">{userGoal.skillGoal}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Learning Journey Card */}
        <Card className="bento-card bento-card-accent hover:bg-primary hover:text-primary-foreground hover:scale-[1.02] transition-all duration-300 group">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-accent/10 group-hover:bg-primary-foreground/20 p-3">
                <GraduationCap className="size-7 text-accent group-hover:text-primary-foreground" />
              </div>
              <div>
                <CardTitle className="text-xl sm:text-2xl group-hover:text-primary-foreground">
                  Learning Journey
                </CardTitle>
                <CardDescription className="text-sm group-hover:text-primary-foreground/80">
                  Your study path
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {userGoal.currentStudy && (
              <div className="rounded-2xl bg-background/50 group-hover:bg-primary-foreground/10 p-4">
                <p className="text-sm font-medium text-muted-foreground group-hover:text-primary-foreground mb-2">
                  Currently Learning
                </p>
                <p className="text-base text-foreground group-hover:text-primary-foreground font-medium">
                  {userGoal.currentStudy}
                </p>
              </div>
            )}
            {userGoal.wantToStudy && (
              <div className="rounded-2xl bg-background/50 group-hover:bg-primary-foreground/10 p-4">
                <p className="text-sm font-medium text-muted-foreground group-hover:text-primary-foreground mb-2">
                  Next Goals
                </p>
                <p className="text-base text-foreground group-hover:text-primary-foreground font-medium">
                  {userGoal.wantToStudy}
                </p>
              </div>
            )}
            {userGoal.studyDuration && (
              <div className="rounded-2xl bg-background/50 group-hover:bg-primary-foreground/10 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="size-4 text-muted-foreground group-hover:text-primary-foreground" />
                  <p className="text-sm font-medium text-muted-foreground group-hover:text-primary-foreground">
                    Timeline
                  </p>
                </div>
                <p className="text-base text-foreground group-hover:text-primary-foreground font-medium">
                  {userGoal.studyDuration}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
