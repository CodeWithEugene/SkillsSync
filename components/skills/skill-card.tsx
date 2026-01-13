import type { ExtractedSkill } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface SkillCardProps {
  skill: ExtractedSkill
}

export function SkillCard({ skill }: SkillCardProps) {
  const confidencePercentage = skill.confidenceScore ? Math.round(skill.confidenceScore * 100) : null

  return (
    <Card className="elevation-2 material-transition hover:elevation-4 hover:scale-[1.02]">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <CardTitle className="text-lg font-semibold">{skill.skillName}</CardTitle>
          {confidencePercentage && (
            <Badge variant="secondary" className="shrink-0 rounded-full px-3">
              {confidencePercentage}%
            </Badge>
          )}
        </div>
        {skill.category && (
          <Badge variant="outline" className="w-fit rounded-full px-3 mt-2">
            {skill.category}
          </Badge>
        )}
      </CardHeader>
      {skill.evidenceText && (
        <CardContent>
          <p className="text-sm text-muted-foreground italic leading-relaxed">&ldquo;{skill.evidenceText}&rdquo;</p>
        </CardContent>
      )}
    </Card>
  )
}
