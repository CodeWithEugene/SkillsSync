"use client"

import { SkillsGrid } from "@/components/skills/skills-grid"
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
        const response = await fetch("/api/skills")
        if (response.ok) {
          const data = await response.json()
          setSkills(data)
        }
      } catch (error) {
        console.error("[v0] Failed to fetch skills:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSkills()
  }, [])

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Skills</h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          View all skills automatically extracted from your documents
        </p>
      </div>

      {isLoading ? <p className="text-muted-foreground">Loading skills...</p> : <SkillsGrid skills={skills} />}
    </div>
  )
}
