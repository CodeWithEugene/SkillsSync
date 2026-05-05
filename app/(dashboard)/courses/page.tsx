import { requireAuth } from "@/lib/supabase-auth"
import { getCourses, getCareerGuidance } from "@/lib/db"
import { Badge } from "@/components/ui/badge"
import CoursesList from "@/components/courses/courses-list"
import { PageHeader } from "@/components/ui/page-header"
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
    <div className="space-y-10">
      <PageHeader
        eyebrow="06 — Courses"
        title={
          <>
            What you&rsquo;re <span className="italic font-light text-primary">learning</span>.
          </>
        }
        description="Track courses you&rsquo;re taking or planning, mapped to your skill gaps."
      />

      {/* Stat row */}
      <section className="grid grid-cols-3 gap-px bg-border border border-border">
        {[
          { label: "Total", value: stats.total },
          { label: "Enrolled", value: stats.enrolled },
          { label: "Completed", value: stats.completed },
        ].map(({ label, value }) => (
          <div key={label} className="bg-card p-5 sm:p-6">
            <p className="editorial-eyebrow mb-2">{label}</p>
            <p className="display-serif text-4xl sm:text-5xl tabular leading-none">
              {String(value).padStart(2, "0")}
            </p>
          </div>
        ))}
      </section>

      {aiSuggestedSkills.length > 0 && (
        <section className="bento-card bento-card-primary space-y-3">
          <p className="editorial-eyebrow">Suggested · from your gap analysis</p>
          <div className="flex flex-wrap gap-1.5">
            {aiSuggestedSkills.map((skill) => (
              <Badge
                key={skill}
                variant="outline"
                className="font-normal normal-case tracking-normal text-xs py-0.5 bg-primary/5 text-primary border-primary/30"
              >
                {skill}
              </Badge>
            ))}
          </div>
        </section>
      )}

      <CoursesList initialCourses={courses} />
    </div>
  )
}
