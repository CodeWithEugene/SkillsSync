import { requireAuth } from "@/lib/supabase-auth"
import { getCourses, getCareerGuidance } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Lightbulb } from "lucide-react"
import CoursesList from "@/components/courses/courses-list"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Courses" }

export default async function CoursesPage() {
  const user = await requireAuth()

  const [courses, guidance] = await Promise.all([
    getCourses(user.id),
    getCareerGuidance(user.id),
  ])

  const aiSuggestedSkills =
    guidance?.gaps
      .filter((g) => g.importance === "high" || g.importance === "medium")
      .map((g) => g.skill)
      .slice(0, 6) ?? []

  const stats = {
    total: courses.length,
    enrolled: courses.filter((c) => c.status === "enrolled").length,
    completed: courses.filter((c) => c.status === "completed").length,
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="space-y-1 sm:space-y-2">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight flex items-center gap-3">
          <BookOpen className="size-7 text-primary" /> Courses
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground">
          Track courses you&apos;re taking or planning to close your skill gaps.
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {[
          { label: "Total", value: stats.total, className: "bento-card" },
          { label: "Enrolled", value: stats.enrolled, className: "bento-card bento-card-info" },
          { label: "Completed", value: stats.completed, className: "bento-card bento-card-success" },
        ].map(({ label, value, className }) => (
          <Card key={label} className={className}>
            <CardContent className="pt-4 pb-4 text-center">
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* AI gap suggestions */}
      {aiSuggestedSkills.length > 0 && (
        <Card className="bento-card bento-card-primary">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="rounded-2xl bg-primary/10 p-2.5">
                <Lightbulb className="size-5 text-primary" />
              </div>
              <CardTitle className="text-sm sm:text-base">Suggested Skills to Learn</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-3">
              Based on your AI career guidance, these are the top skills to focus on:
            </p>
            <div className="flex flex-wrap gap-2">
              {aiSuggestedSkills.map((skill) => (
                <Badge
                  key={skill}
                  variant="outline"
                  className="rounded-xl text-sm py-1 px-3 bg-primary/5 text-primary border-primary/20"
                >
                  {skill}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <CoursesList initialCourses={courses} />
    </div>
  )
}
