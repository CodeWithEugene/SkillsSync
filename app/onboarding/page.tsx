"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sparkles, Target, GraduationCap, BookOpen, TrendingUp } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    careerGoal: "",
    educationLevel: "",
    currentStudy: "",
    studyYear: "",
    topPriority: "",
  })

  const totalSteps = 5
  const progress = (step / totalSteps) * 100

  useEffect(() => {
    document.title = "Welcome | SkillSync"
  }, [])

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
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

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4 sm:p-6">
      <Card className="w-full max-w-2xl shadow-2xl">
        <CardHeader className="space-y-2 sm:space-y-3 text-center px-4 sm:px-6">
          <div className="mx-auto flex size-12 sm:size-16 items-center justify-center rounded-full bg-primary/10">
            <Sparkles className="size-6 sm:size-8 text-primary flex-shrink-0" />
          </div>
          <CardTitle className="text-2xl sm:text-3xl">Welcome to SkillSync!</CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Let&apos;s personalize your learning journey in just a few steps
          </CardDescription>
          <Progress value={progress} className="mt-3 sm:mt-4" />
          <p className="text-xs text-muted-foreground">
            Step {step} of {totalSteps}
          </p>
        </CardHeader>

        <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
          {/* Step 1: Career Goal */}
          {step === 1 && (
            <div className="space-y-4 sm:space-y-6 animate-in fade-in-50 duration-500">
              <div className="flex items-center gap-2 sm:gap-3 rounded-xl bg-primary/5 p-3 sm:p-4">
                <Target className="size-5 sm:size-6 text-primary flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-sm sm:text-base">Career Goal</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">What&apos;s your ultimate career goal?</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="careerGoal">What is your ultimate career goal?</Label>
                <Input
                  id="careerGoal"
                  placeholder="e.g., Data Scientist, Full Stack Developer, UX Designer..."
                  value={formData.careerGoal}
                  onChange={(e) => setFormData({ ...formData, careerGoal: e.target.value })}
                />
              </div>
            </div>
          )}

          {/* Step 2: Education Level */}
          {step === 2 && (
            <div className="space-y-4 sm:space-y-6 animate-in fade-in-50 duration-500">
              <div className="flex items-center gap-2 sm:gap-3 rounded-xl bg-primary/5 p-3 sm:p-4">
                <GraduationCap className="size-5 sm:size-6 text-primary flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-sm sm:text-base">Education Level</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">Tell us about your current education</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="educationLevel">What is your current level of education?</Label>
                <Select
                  value={formData.educationLevel}
                  onValueChange={(value) => setFormData({ ...formData, educationLevel: value })}
                >
                  <SelectTrigger id="educationLevel">
                    <SelectValue placeholder="Select your education level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high-school">High School</SelectItem>
                    <SelectItem value="undergraduate">Undergraduate</SelectItem>
                    <SelectItem value="graduate">Graduate</SelectItem>
                    <SelectItem value="self-taught">Self-Taught</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Step 3: Current Study */}
          {step === 3 && (
            <div className="space-y-4 sm:space-y-6 animate-in fade-in-50 duration-500">
              <div className="flex items-center gap-2 sm:gap-3 rounded-xl bg-primary/5 p-3 sm:p-4">
                <BookOpen className="size-5 sm:size-6 text-primary flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-sm sm:text-base">Current Studies</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">What are you currently studying?</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="currentStudy">What are you currently studying?</Label>
                <Input
                  id="currentStudy"
                  placeholder="e.g., B.Sc. in Computer Science, Web Development Bootcamp..."
                  value={formData.currentStudy}
                  onChange={(e) => setFormData({ ...formData, currentStudy: e.target.value })}
                />
              </div>
            </div>
          )}

          {/* Step 4: Study Year */}
          {step === 4 && (
            <div className="space-y-4 sm:space-y-6 animate-in fade-in-50 duration-500">
              <div className="flex items-center gap-2 sm:gap-3 rounded-xl bg-primary/5 p-3 sm:p-4">
                <GraduationCap className="size-5 sm:size-6 text-primary flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-sm sm:text-base">Year of Study</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">This helps us understand your skill depth</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="studyYear">What year of study are you in?</Label>
                <Input
                  id="studyYear"
                  placeholder="e.g., Year 2, Final Year, 6 months in..."
                  value={formData.studyYear}
                  onChange={(e) => setFormData({ ...formData, studyYear: e.target.value })}
                />
              </div>
            </div>
          )}

          {/* Step 5: Top Priority */}
          {step === 5 && (
            <div className="space-y-4 sm:space-y-6 animate-in fade-in-50 duration-500">
              <div className="flex items-center gap-2 sm:gap-3 rounded-xl bg-primary/5 p-3 sm:p-4">
                <TrendingUp className="size-5 sm:size-6 text-primary flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-sm sm:text-base">Your Priority</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">What matters most to you right now?</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="topPriority">What is your top priority right now?</Label>
                <Select
                  value={formData.topPriority}
                  onValueChange={(value) => setFormData({ ...formData, topPriority: value })}
                >
                  <SelectTrigger id="topPriority">
                    <SelectValue placeholder="Select your priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="finding-internship">Finding an internship</SelectItem>
                    <SelectItem value="degree-worth">Checking if my degree is worth it</SelectItem>
                    <SelectItem value="skill-gaps">Identifying skill gaps</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            {step > 1 && (
              <Button type="button" variant="outline" onClick={handleBack} className="w-full sm:flex-1 bg-transparent">
                Back
              </Button>
            )}
            {step < totalSteps ? (
              <Button type="button" onClick={handleNext} className="w-full sm:flex-1">
                Next
              </Button>
            ) : (
              <Button type="button" onClick={handleSubmit} disabled={isSubmitting} className="w-full sm:flex-1">
                {isSubmitting ? "Saving..." : "Complete Setup"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
