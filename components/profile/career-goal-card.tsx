"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Target, Loader2, Edit2, Check, AlertCircle } from "lucide-react"
import { CareerPicker, type PickedCareer } from "@/components/career/career-picker"

interface CareerGoalCardProps {
  initialSocCode: string | null
  initialSocTitle: string | null
  /** Free-text career goal kept as fallback for users who haven't picked an SOC yet. */
  initialCareerGoal: string | null
}

export function CareerGoalCard({
  initialSocCode,
  initialSocTitle,
  initialCareerGoal,
}: CareerGoalCardProps) {
  const [socCode, setSocCode] = useState(initialSocCode)
  const [socTitle, setSocTitle] = useState(initialSocTitle)
  const [editing, setEditing] = useState(false)
  const [picked, setPicked] = useState<PickedCareer | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function save() {
    if (!picked) return
    setSaving(true)
    setError(null)
    try {
      const res = await fetch("/api/profile/career", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ socCode: picked.socCode }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Failed to update career")
      setSocCode(data.socCode)
      setSocTitle(data.socTitle)
      setEditing(false)
      setPicked(null)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  function cancel() {
    setEditing(false)
    setPicked(null)
    setError(null)
  }

  const hasSoc = !!socCode
  const displayTitle = socTitle ?? initialCareerGoal ?? "Not set"

  return (
    <Card className="bento-card bento-card-primary">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-primary/10 p-3">
            <Target className="size-7 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-xl sm:text-2xl">Career Goal</CardTitle>
            <CardDescription className="text-sm">Your target career, benchmarked against O*NET</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!editing ? (
          <>
            <div className="rounded-2xl bg-background/50 p-4 sm:p-6 space-y-2">
              <p className="text-2xl sm:text-3xl font-bold leading-tight">{displayTitle}</p>
              {hasSoc && socCode && (
                <Badge variant="outline" className="rounded-lg text-[11px] font-mono">
                  O*NET {socCode}
                </Badge>
              )}
              {!hasSoc && (
                <div className="flex items-start gap-2 mt-2 text-xs text-warning">
                  <AlertCircle className="size-3.5 shrink-0 mt-0.5" />
                  <span>Pick a specific occupation to unlock O*NET-grounded gap analysis.</span>
                </div>
              )}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setEditing(true)}
              className="rounded-xl gap-2"
            >
              <Edit2 className="size-3.5" />
              {hasSoc ? "Change career" : "Pick a career"}
            </Button>
          </>
        ) : (
          <>
            <CareerPicker value={picked} onChange={setPicked} autoFocus />
            {error && (
              <div className="flex items-start gap-2 text-xs text-destructive">
                <AlertCircle className="size-3.5 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={cancel}
                disabled={saving}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={save}
                disabled={!picked || saving}
                className="rounded-xl gap-1.5"
              >
                {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />}
                Save
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
