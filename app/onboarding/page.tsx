"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CareerPicker, type PickedCareer } from "@/components/career/career-picker"

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    careerGoal: "",
    socCode: "" as string | "",
    socTitle: "" as string | "",
    educationLevel: "",
    currentStudy: "",
    studyYear: "",
    courses: "",
    topPriority: "",
  })

  const pickedCareer: PickedCareer | null = formData.socCode
    ? { socCode: formData.socCode, socTitle: formData.socTitle }
    : null

  function handleCareerPick(picked: PickedCareer | null) {
    setFormData((f) => ({
      ...f,
      socCode: picked?.socCode ?? "",
      socTitle: picked?.socTitle ?? "",
      careerGoal: picked?.socTitle ?? "",
    }))
  }

  const totalSteps = 6

  useEffect(() => {
    document.title = "Welcome | SkillSync"
  }, [])

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1)
  }
  const handleBack = () => {
    if (step > 1) setStep(step - 1)
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setError(null)
    try {
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to save goals")
      }
      window.location.href = "/dashboard"
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  const stepConfig = [
    { eyebrow: "Step 01 — Career", title: "What career are you aiming for?", help: "We benchmark every analysis against this O*NET occupation." },
    { eyebrow: "Step 02 — Education", title: "Where are you in your studies?", help: null },
    { eyebrow: "Step 03 — Field", title: "What are you studying right now?", help: null },
    { eyebrow: "Step 04 — Year", title: "How far along are you?", help: "This helps us judge your skill depth." },
    { eyebrow: "Step 05 — Courses", title: "What courses are you taking?", help: "Comma-separated; helps us tailor recommendations." },
    { eyebrow: "Step 06 — Priority", title: "What matters most right now?", help: null },
  ]
  const cur = stepConfig[step - 1]

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-3xl px-5 sm:px-8 py-10 sm:py-16">
        {/* Editorial progress dashes */}
        <div className="flex items-center gap-2 mb-10">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <span
              key={i}
              className={`h-0.5 flex-1 transition-colors ${
                i < step ? "bg-primary" : "bg-border"
              }`}
            />
          ))}
        </div>

        <header className="space-y-2 mb-8">
          <p className="editorial-eyebrow">{cur.eyebrow}</p>
          <h1 className="display-serif text-4xl sm:text-5xl leading-[1.02] tracking-tight">
            {cur.title}
          </h1>
          {cur.help && (
            <p className="text-sm text-muted-foreground max-w-xl pt-2">{cur.help}</p>
          )}
          <div className="editorial-rule" />
        </header>

        <div className="space-y-6 min-h-[200px]">
          {step === 1 && (
            <div className="space-y-3 animate-in fade-in-50 duration-500">
              <Label className="text-xs">Target career</Label>
              <CareerPicker value={pickedCareer} onChange={handleCareerPick} autoFocus />
              <p className="text-xs text-muted-foreground">
                Type to search the O*NET database — over 1,000 occupations.
              </p>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3 animate-in fade-in-50 duration-500 max-w-md">
              <Label htmlFor="educationLevel" className="text-xs">Education level</Label>
              <Select
                value={formData.educationLevel}
                onValueChange={(v) => setFormData({ ...formData, educationLevel: v })}
              >
                <SelectTrigger id="educationLevel">
                  <SelectValue placeholder="Choose one" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high-school">High school</SelectItem>
                  <SelectItem value="undergraduate">Undergraduate</SelectItem>
                  <SelectItem value="graduate">Graduate</SelectItem>
                  <SelectItem value="self-taught">Self-taught</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3 animate-in fade-in-50 duration-500 max-w-md">
              <Label htmlFor="currentStudy" className="text-xs">Current programme</Label>
              <Input
                id="currentStudy"
                placeholder="B.Sc. Computer Science, web bootcamp…"
                value={formData.currentStudy}
                onChange={(e) => setFormData({ ...formData, currentStudy: e.target.value })}
                autoFocus
              />
            </div>
          )}

          {step === 4 && (
            <div className="space-y-3 animate-in fade-in-50 duration-500 max-w-md">
              <Label htmlFor="studyYear" className="text-xs">Year of study</Label>
              <Input
                id="studyYear"
                placeholder="Year 2, final year, six months in…"
                value={formData.studyYear}
                onChange={(e) => setFormData({ ...formData, studyYear: e.target.value })}
                autoFocus
              />
            </div>
          )}

          {step === 5 && (
            <div className="space-y-3 animate-in fade-in-50 duration-500">
              <Label htmlFor="courses" className="text-xs">Active courses</Label>
              <textarea
                id="courses"
                rows={4}
                className="flex w-full rounded-md border border-input bg-card px-3 py-2 text-sm placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40 outline-none"
                placeholder="Intro to Machine Learning, Data Structures, Web Development…"
                value={formData.courses}
                onChange={(e) => setFormData({ ...formData, courses: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">Comma-separated or new lines.</p>
            </div>
          )}

          {step === 6 && (
            <div className="space-y-3 animate-in fade-in-50 duration-500 max-w-md">
              <Label htmlFor="topPriority" className="text-xs">Top priority right now</Label>
              <Select
                value={formData.topPriority}
                onValueChange={(v) => setFormData({ ...formData, topPriority: v })}
              >
                <SelectTrigger id="topPriority">
                  <SelectValue placeholder="Choose one" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="finding-internship">Finding an internship</SelectItem>
                  <SelectItem value="degree-worth">Checking if my degree is worth it</SelectItem>
                  <SelectItem value="skill-gaps">Identifying skill gaps</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>

        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 mt-10 pt-6 border-t border-border">
          <span className="font-mono text-xs tabular text-muted-foreground">
            {String(step).padStart(2, "0")} / {String(totalSteps).padStart(2, "0")}
          </span>
          <div className="flex gap-2 sm:justify-end">
            {step > 1 && (
              <Button type="button" variant="outline" onClick={handleBack}>
                Back
              </Button>
            )}
            {step < totalSteps ? (
              <Button
                type="button"
                onClick={handleNext}
                disabled={step === 1 && !formData.socCode}
              >
                Continue
              </Button>
            ) : (
              <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? "Saving…" : "Complete setup"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
