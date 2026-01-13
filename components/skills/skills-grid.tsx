"use client"

import type { ExtractedSkill } from "@/lib/db"
import { SkillCard } from "./skill-card"
import { Card, CardContent } from "@/components/ui/card"
import { Lightbulb } from "lucide-react"

interface SkillsGridProps {
  skills: ExtractedSkill[]
}

export function SkillsGrid({ skills }: SkillsGridProps) {
  if (skills.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Lightbulb className="mx-auto size-12 text-muted-foreground" />
          <p className="mt-4 text-lg font-medium">No skills extracted yet</p>
          <p className="text-sm text-muted-foreground">Upload documents to automatically extract your skills</p>
        </CardContent>
      </Card>
    )
  }

  // Group skills by category
  const skillsByCategory = skills.reduce(
    (acc, skill) => {
      const category = skill.category || "Other"
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push(skill)
      return acc
    },
    {} as Record<string, ExtractedSkill[]>,
  )

  return (
    <div className="space-y-8">
      {Object.entries(skillsByCategory).map(([category, categorySkills]) => (
        <div key={category}>
          <h3 className="mb-4 text-xl font-semibold">{category}</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {categorySkills.map((skill) => (
              <SkillCard key={skill.id} skill={skill} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
