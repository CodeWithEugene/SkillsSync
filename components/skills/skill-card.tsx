import type { ExtractedSkill } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface SkillCardProps {
  skill: ExtractedSkill
}

export function SkillCard({ skill }: SkillCardProps) {
  const confidencePercentage = skill.confidenceScore ? Math.round(skill.confidenceScore * 100) : null

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
        {skill.category && (
          <Badge variant="outline" className="w-fit rounded-full px-2.5 py-0.5 text-xs mt-2">
            {skill.category}
          </Badge>
        )}
      </CardHeader>
      {skill.evidenceText && (
        <CardContent>
          <p className="text-sm text-muted-foreground leading-relaxed">&ldquo;{skill.evidenceText}&rdquo;</p>
        </CardContent>
      )}
    </Card>
  )
}
