"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Sparkles, GraduationCap, Target, Clock } from "lucide-react"
import { Progress } from "@/components/ui/progress"

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    currentStudy: "",
    wantToStudy: "",
    studyDuration: "",
    careerGoal: "",
    skillGoal: "",
  })

  const totalSteps = 4
  const progress = (step / totalSteps) * 100

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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-6">
      <Card className="w-full max-w-2xl shadow-2xl">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary/10">
            <Sparkles className="size-8 text-primary" />
          </div>
          <CardTitle className="text-3xl">Welcome to SkillSync!</CardTitle>
          <CardDescription className="text-base">
            Let&apos;s personalize your learning journey in just a few steps
          </CardDescription>
          <Progress value={progress} className="mt-4" />
          <p className="text-xs text-muted-foreground">
            Step {step} of {totalSteps}
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in-50 duration-500">
              <div className="flex items-center gap-3 rounded-xl bg-primary/5 p-4">
                <GraduationCap className="size-6 text-primary" />
                <div>
                  <h3 className="font-semibold">Your Current Studies</h3>
                  <p className="text-sm text-muted-foreground">Tell us what you&apos;re currently learning</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="currentStudy">What are you currently studying?</Label>
                <Textarea
                  id="currentStudy"
                  placeholder="e.g., Computer Science, Web Development, Data Analysis..."
                  value={formData.currentStudy}
                  onChange={(e) => setFormData({ ...formData, currentStudy: e.target.value })}
                  rows={4}
                  className="resize-none"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in-50 duration-500">
              <div className="flex items-center gap-3 rounded-xl bg-primary/5 p-4">
                <Target className="size-6 text-primary" />
                <div>
                  <h3 className="font-semibold">Future Learning Goals</h3>
                  <p className="text-sm text-muted-foreground">What skills do you want to develop?</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="wantToStudy">What do you want to learn next?</Label>
                  <Textarea
                    id="wantToStudy"
                    placeholder="e.g., Machine Learning, Cloud Computing, Mobile Development..."
                    value={formData.wantToStudy}
                    onChange={(e) => setFormData({ ...formData, wantToStudy: e.target.value })}
                    rows={4}
                    className="resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in fade-in-50 duration-500">
              <div className="flex items-center gap-3 rounded-xl bg-primary/5 p-4">
                <Clock className="size-6 text-primary" />
                <div>
                  <h3 className="font-semibold">Timeline & Commitment</h3>
                  <p className="text-sm text-muted-foreground">How long do you plan to study?</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="studyDuration">Study duration or timeline</Label>
                <Input
                  id="studyDuration"
                  placeholder="e.g., 6 months, 1 year, 2 hours per day..."
                  value={formData.studyDuration}
                  onChange={(e) => setFormData({ ...formData, studyDuration: e.target.value })}
                />
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6 animate-in fade-in-50 duration-500">
              <div className="flex items-center gap-3 rounded-xl bg-primary/5 p-4">
                <Target className="size-6 text-primary" />
                <div>
                  <h3 className="font-semibold">Career Aspirations</h3>
                  <p className="text-sm text-muted-foreground">Define your career and skill goals</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="careerGoal">What career are you working towards?</Label>
                  <Textarea
                    id="careerGoal"
                    placeholder="e.g., Full Stack Developer, Data Scientist, UX Designer..."
                    value={formData.careerGoal}
                    onChange={(e) => setFormData({ ...formData, careerGoal: e.target.value })}
                    rows={3}
                    className="resize-none"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="skillGoal">Key skills you want to master</Label>
                  <Textarea
                    id="skillGoal"
                    placeholder="e.g., React, Python, Data Visualization, System Design..."
                    value={formData.skillGoal}
                    onChange={(e) => setFormData({ ...formData, skillGoal: e.target.value })}
                    rows={3}
                    className="resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-3 pt-4">
            {step > 1 && (
              <Button type="button" variant="outline" onClick={handleBack} className="flex-1 bg-transparent">
                Back
              </Button>
            )}
            {step < totalSteps ? (
              <Button type="button" onClick={handleNext} className="flex-1">
                Next
              </Button>
            ) : (
              <Button type="button" onClick={handleSubmit} disabled={isSubmitting} className="flex-1">
                {isSubmitting ? "Saving..." : "Complete Setup"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
