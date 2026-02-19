import type { ExtractedSkill } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Code2, Heart, Repeat2 } from "lucide-react"

interface SkillCardProps {
  skill: ExtractedSkill
}

const TYPE_CONFIG = {
  technical: { label: "Technical", color: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800", icon: Code2 },
  soft: { label: "Soft", color: "bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-950 dark:text-pink-300 dark:border-pink-800", icon: Heart },
  transferable: { label: "Transferable", color: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800", icon: Repeat2 },
}

export function SkillCard({ skill }: SkillCardProps) {
  const confidencePercentage = skill.confidenceScore ? Math.round(skill.confidenceScore * 100) : null
  const typeConfig = TYPE_CONFIG[skill.skillType ?? "technical"]
  const TypeIcon = typeConfig.icon

  return (
    <Card className="transition-all hover:shadow-lg hover:border-primary/30 hover:-translate-y-1 group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <CardTitle className="text-base font-semibold group-hover:text-primary transition-colors">
            {skill.skillName}
          </CardTitle>
          {confidencePercentage && (
            <Badge variant="secondary" className="shrink-0 rounded-full px-2.5 py-0.5 text-xs">
              {confidencePercentage}%
            </Badge>
          )}
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          <Badge className={`w-fit rounded-full px-2.5 py-0.5 text-xs border flex items-center gap-1 ${typeConfig.color}`}>
            <TypeIcon className="size-3" />
            {typeConfig.label}
          </Badge>
          {skill.category && (
            <Badge variant="outline" className="w-fit rounded-full px-2.5 py-0.5 text-xs">
              {skill.category}
            </Badge>
          )}
        </div>
      </CardHeader>
      {skill.evidenceText && (
        <CardContent>
          <p className="text-sm text-muted-foreground leading-relaxed">&ldquo;{skill.evidenceText}&rdquo;</p>
        </CardContent>
      )}
    </Card>
  )
}
