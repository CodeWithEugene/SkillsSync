"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import type { Course } from "@/lib/db"
import {
  Plus,
  X,
  ExternalLink,
  CheckCircle2,
  BookOpen,
  Loader2,
  Trash2,
  GraduationCap,
} from "lucide-react"

const STATUS_CONFIG: Record<
  Course["status"],
  { label: string; color: string; bg: string; border: string }
> = {
  planned: {
    label: "Planned",
    color: "text-muted-foreground",
    bg: "bg-muted/40",
    border: "border-border",
  },
  enrolled: {
    label: "Enrolled",
    color: "text-info",
    bg: "bg-info/10",
    border: "border-info/20",
  },
  completed: {
    label: "Completed",
    color: "text-success",
    bg: "bg-success/10",
    border: "border-success/20",
  },
}

function CourseCard({
  course,
  onStatusChange,
  onDelete,
}: {
  course: Course
  onStatusChange: (id: string, status: Course["status"]) => void
  onDelete: (id: string) => void
}) {
  const cfg = STATUS_CONFIG[course.status]
  const statusOptions: Course["status"][] = ["planned", "enrolled", "completed"]

  return (
    <Card className="bento-card group">
      <CardContent className="pt-4 pb-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{course.name}</p>
            {course.provider && (
              <p className="text-xs text-muted-foreground mt-0.5">{course.provider}</p>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {course.url && (
              <a href={course.url} target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="icon" className="size-7 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                  <ExternalLink className="size-3.5" />
                </Button>
              </a>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="size-7 rounded-lg text-destructive opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10"
              onClick={() => onDelete(course.id)}
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        </div>

        {course.skillTags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {course.skillTags.map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="text-[10px] rounded-md h-4 px-1.5 bg-primary/5 text-primary border-primary/20"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}

        <div className="flex gap-1 flex-wrap">
          {statusOptions.map((s) => {
            const c = STATUS_CONFIG[s]
            return (
              <button
                key={s}
                onClick={() => onStatusChange(course.id, s)}
                className={`text-[11px] font-medium px-2.5 py-0.5 rounded-lg border transition-all ${
                  course.status === s
                    ? `${c.bg} ${c.color} ${c.border}`
                    : "bg-transparent text-muted-foreground border-transparent hover:bg-muted/40"
                }`}
              >
                {s === "completed" && <CheckCircle2 className="size-3 inline mr-1" />}
                {c.label}
              </button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

export default function CoursesList({ initialCourses }: { initialCourses: Course[] }) {
  const [courses, setCourses] = useState<Course[]>(initialCourses)
  const [showForm, setShowForm] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const [form, setForm] = useState({
    name: "",
    provider: "",
    url: "",
    status: "planned" as Course["status"],
    skillTagsRaw: "",
  })

  async function handleAdd() {
    if (!form.name.trim()) return

    const skillTags = form.skillTagsRaw
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)

    const res = await fetch("/api/courses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        provider: form.provider || undefined,
        url: form.url || undefined,
        status: form.status,
        skillTags,
      }),
    })

    if (res.ok) {
      const { course } = await res.json()
      setCourses((prev) => [course, ...prev])
      setForm({ name: "", provider: "", url: "", status: "planned", skillTagsRaw: "" })
      setShowForm(false)
    }
  }

  async function handleStatusChange(id: string, status: Course["status"]) {
    const res = await fetch(`/api/courses/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
    if (res.ok) {
      setCourses((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)))
    }
  }

  async function handleDelete(id: string) {
    await fetch(`/api/courses/${id}`, { method: "DELETE" })
    setCourses((prev) => prev.filter((c) => c.id !== id))
  }

  const planned = courses.filter((c) => c.status === "planned")
  const enrolled = courses.filter((c) => c.status === "enrolled")
  const completed = courses.filter((c) => c.status === "completed")

  const sections: { title: string; items: Course[]; icon: React.ReactNode; badge: string }[] = [
    { title: "Enrolled", items: enrolled, icon: <BookOpen className="size-4 text-info" />, badge: "bg-info/10 text-info border-info/20" },
    { title: "Planned", items: planned, icon: <GraduationCap className="size-4 text-muted-foreground" />, badge: "bg-muted text-muted-foreground" },
    { title: "Completed", items: completed, icon: <CheckCircle2 className="size-4 text-success" />, badge: "bg-success/10 text-success border-success/20" },
  ]

  return (
    <div className="space-y-6">
      {/* Add course button / form */}
      {!showForm ? (
        <Button onClick={() => setShowForm(true)} className="rounded-2xl gap-2">
          <Plus className="size-4" /> Add Course
        </Button>
      ) : (
        <Card className="bento-card">
          <CardContent className="pt-4 pb-4 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Add a Course</p>
              <Button variant="ghost" size="icon" className="size-7 rounded-lg" onClick={() => setShowForm(false)}>
                <X className="size-4" />
              </Button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs">Course name *</Label>
                <Input
                  placeholder="e.g. Machine Learning A-Z"
                  className="rounded-xl text-sm h-9"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Provider</Label>
                <Input
                  placeholder="e.g. Coursera, Udemy…"
                  className="rounded-xl text-sm h-9"
                  value={form.provider}
                  onChange={(e) => setForm((f) => ({ ...f, provider: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">URL</Label>
                <Input
                  placeholder="https://..."
                  className="rounded-xl text-sm h-9"
                  value={form.url}
                  onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Status</Label>
                <select
                  className="w-full h-9 rounded-xl border border-input bg-background px-3 text-sm"
                  value={form.status}
                  onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as Course["status"] }))}
                >
                  <option value="planned">Planned</option>
                  <option value="enrolled">Enrolled</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-xs">Skill tags (comma-separated)</Label>
                <Input
                  placeholder="e.g. Python, Machine Learning, Data Science"
                  className="rounded-xl text-sm h-9"
                  value={form.skillTagsRaw}
                  onChange={(e) => setForm((f) => ({ ...f, skillTagsRaw: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" className="rounded-xl" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button
                size="sm"
                className="rounded-xl gap-1.5"
                onClick={handleAdd}
                disabled={!form.name.trim() || isPending}
              >
                {isPending ? <Loader2 className="size-3.5 animate-spin" /> : <Plus className="size-3.5" />}
                Add
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Kanban-style sections */}
      {courses.length === 0 ? (
        <Card className="bento-card">
          <CardContent className="py-12 flex flex-col items-center gap-3">
            <div className="rounded-2xl bg-primary/10 p-4">
              <BookOpen className="size-8 text-primary" />
            </div>
            <p className="text-base font-semibold">No courses yet</p>
            <p className="text-sm text-muted-foreground text-center max-w-xs">
              Add courses you&apos;re taking or planning — great for tracking your skill development journey.
            </p>
          </CardContent>
        </Card>
      ) : (
        sections
          .filter((s) => s.items.length > 0)
          .map(({ title, items, icon, badge }) => (
            <div key={title} className="space-y-3">
              <div className="flex items-center gap-2">
                {icon}
                <h2 className="text-sm font-semibold">{title}</h2>
                <Badge variant="outline" className={`text-[10px] rounded-md h-4 px-1.5 ${badge}`}>
                  {items.length}
                </Badge>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((c) => (
                  <CourseCard
                    key={c.id}
                    course={c}
                    onStatusChange={handleStatusChange}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </div>
          ))
      )}
    </div>
  )
}
