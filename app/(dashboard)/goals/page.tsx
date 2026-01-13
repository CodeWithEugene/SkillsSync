import { requireAuth } from "@/lib/supabase-auth"
import { getUserGoal } from "@/lib/db"
import { Target, GraduationCap, BookOpen, Calendar, TrendingUp } from "lucide-react"
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
        <p className="text-base sm:text-lg text-muted-foreground">Your career and learning journey at a glance.</p>
      </div>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2">
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
                  Your ultimate career aspiration
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
          </CardContent>
        </Card>

        {/* Education & Study Card */}
        <Card className="bento-card bento-card-accent hover:bg-primary hover:text-primary-foreground hover:scale-[1.02] transition-all duration-300 group">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-accent/10 group-hover:bg-primary-foreground/20 p-3">
                <GraduationCap className="size-7 text-accent group-hover:text-primary-foreground" />
              </div>
              <div>
                <CardTitle className="text-xl sm:text-2xl group-hover:text-primary-foreground">Education</CardTitle>
                <CardDescription className="text-sm group-hover:text-primary-foreground/80">
                  Your academic background
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {userGoal.educationLevel && (
              <div className="rounded-2xl bg-background/50 group-hover:bg-primary-foreground/10 p-4">
                <p className="text-sm font-medium text-muted-foreground group-hover:text-primary-foreground mb-2">
                  Education Level
                </p>
                <p className="text-base text-foreground group-hover:text-primary-foreground font-medium capitalize">
                  {userGoal.educationLevel.replace("-", " ")}
                </p>
              </div>
            )}
            {userGoal.currentStudy && (
              <div className="rounded-2xl bg-background/50 group-hover:bg-primary-foreground/10 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="size-4 text-muted-foreground group-hover:text-primary-foreground" />
                  <p className="text-sm font-medium text-muted-foreground group-hover:text-primary-foreground">
                    Currently Studying
                  </p>
                </div>
                <p className="text-base text-foreground group-hover:text-primary-foreground font-medium">
                  {userGoal.currentStudy}
                </p>
              </div>
            )}
            {userGoal.studyYear && (
              <div className="rounded-2xl bg-background/50 group-hover:bg-primary-foreground/10 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="size-4 text-muted-foreground group-hover:text-primary-foreground" />
                  <p className="text-sm font-medium text-muted-foreground group-hover:text-primary-foreground">
                    Year of Study
                  </p>
                </div>
                <p className="text-base text-foreground group-hover:text-primary-foreground font-medium">
                  {userGoal.studyYear}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Priority Card */}
        <Card className="bento-card bento-card-success hover:bg-primary hover:text-primary-foreground hover:scale-[1.02] transition-all duration-300 group md:col-span-2">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-success/10 group-hover:bg-primary-foreground/20 p-3">
                <TrendingUp className="size-7 text-success group-hover:text-primary-foreground" />
              </div>
              <div>
                <CardTitle className="text-xl sm:text-2xl group-hover:text-primary-foreground">Top Priority</CardTitle>
                <CardDescription className="text-sm group-hover:text-primary-foreground/80">
                  What you&apos;re focusing on right now
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-2xl bg-background/50 group-hover:bg-primary-foreground/10 p-4 sm:p-6">
              <p className="text-xl sm:text-2xl font-bold text-foreground group-hover:text-primary-foreground capitalize">
                {userGoal.topPriority?.replace("-", " ") || "Not set"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
