"use client"

import type { ExtractedSkill } from "@/lib/db"
import { SkillCard } from "./skill-card"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Lightbulb, Code2, Heart, Repeat2 } from "lucide-react"
import { useState } from "react"

interface SkillsGridProps {
  skills: ExtractedSkill[]
}

type Tab = "all" | "technical" | "soft" | "transferable"

const TABS: { key: Tab; label: string; icon: React.ElementType; color: string }[] = [
  { key: "all", label: "All Skills", icon: Lightbulb, color: "text-primary" },
  { key: "technical", label: "Technical", icon: Code2, color: "text-blue-500" },
  { key: "soft", label: "Soft Skills", icon: Heart, color: "text-pink-500" },
  { key: "transferable", label: "Transferable", icon: Repeat2, color: "text-emerald-500" },
]

export function SkillsGrid({ skills }: SkillsGridProps) {
  const [activeTab, setActiveTab] = useState<Tab>("all")

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

  const filtered = activeTab === "all" ? skills : skills.filter((s) => s.skillType === activeTab)

  const skillsByCategory = filtered.reduce(
    (acc, skill) => {
      const cat = skill.category || "Other"
      if (!acc[cat]) acc[cat] = []
      acc[cat].push(skill)
      return acc
    },
    {} as Record<string, ExtractedSkill[]>,
  )

  const counts = {
    all: skills.length,
    technical: skills.filter((s) => s.skillType === "technical").length,
    soft: skills.filter((s) => s.skillType === "soft").length,
    transferable: skills.filter((s) => s.skillType === "transferable").length,
  }

  return (
    <div className="space-y-6">
      {/* Skill type summary bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {TABS.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-3 rounded-xl border p-3 sm:p-4 text-left transition-all hover:border-primary/40 ${
                isActive ? "border-primary bg-primary/5" : "border-border bg-card"
              }`}
            >
              <div className={`rounded-lg p-2 ${isActive ? "bg-primary/10" : "bg-muted"}`}>
                <Icon className={`size-4 ${isActive ? tab.color : "text-muted-foreground"}`} />
              </div>
              <div>
                <p className={`text-xs font-medium ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                  {tab.label}
                </p>
                <p className="text-xl font-bold">{counts[tab.key]}</p>
              </div>
            </button>
          )
        })}
      </div>

      {/* Category groups */}
      {Object.keys(skillsByCategory).length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">No {activeTab} skills found yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {Object.entries(skillsByCategory)
            .sort((a, b) => b[1].length - a[1].length)
            .map(([category, categorySkills]) => (
              <div key={category}>
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="text-lg font-semibold">{category}</h3>
                  <Badge variant="secondary" className="rounded-full text-xs">
                    {categorySkills.length}
                  </Badge>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {categorySkills.map((skill) => (
                    <SkillCard key={skill.id} skill={skill} />
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  )
}
