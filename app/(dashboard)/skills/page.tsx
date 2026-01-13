"use client"

import { SkillsGrid } from "@/components/skills/skills-grid"
import type { ExtractedSkill } from "@/lib/db"
import { useEffect, useState } from "react"

export default function SkillsPage() {
  const [skills, setSkills] = useState<ExtractedSkill[]>([])
  const [isLoading, setIsLoading] = useState(true)

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
    <div className="flex h-full flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Skills</h1>
        <p className="text-muted-foreground">View all skills automatically extracted from your documents</p>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading skills...</p>
      ) : (
        <div className="flex-1 overflow-y-auto">
          <SkillsGrid skills={skills} />
        </div>
      )}
    </div>
  )
}
