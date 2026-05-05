"use client"

import { SkillsGrid } from "@/components/skills/skills-grid"
import { RecordOnBase } from "@/components/skills/record-on-base"
import { PageHeader } from "@/components/ui/page-header"
import type { ExtractedSkill } from "@/lib/db"
import { useEffect, useState } from "react"

export default function SkillsPage() {
  const [skills, setSkills] = useState<ExtractedSkill[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    document.title = "Skills | SkillSync"
  }, [])

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const res = await fetch("/api/skills")
        if (res.ok) setSkills(await res.json())
      } catch (e) {
        console.error("Failed to fetch skills:", e)
      } finally {
        setIsLoading(false)
      }
    }
    fetchSkills()
  }, [])

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="05 — Skills"
        title={
          <>
            Your <span className="italic font-light text-primary">competency</span> ledger.
          </>
        }
        description="Every skill we extracted, with evidence quoted from your documents. Anchor it on Base for tamper-evident proof."
      />

      <RecordOnBase skills={skills} />

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading skills…</p>
      ) : (
        <SkillsGrid skills={skills} />
      )}
    </div>
  )
}
