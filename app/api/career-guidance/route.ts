import { createClient } from "@/lib/supabase/server"
import {
  getExtractedSkills,
  getUserGoal,
  upsertCareerGuidance,
  getCareerGuidance,
  updateUserGoal,
} from "@/lib/db"
import {
  getOccupationByCode,
  getRequiredSkillsForOccupation,
  searchOccupations,
  type OnetRequiredSkill,
} from "@/lib/onet"
import { generateText } from "@/lib/openai"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const guidance = await getCareerGuidance(user.id)
    return NextResponse.json(guidance)
  } catch (error) {
    console.error("[career-guidance] GET", error)
    return NextResponse.json({ error: "Failed to fetch guidance" }, { status: 500 })
  }
}

function bucketImportance(dataValue: number): "high" | "medium" | "low" {
  if (dataValue >= 4.0) return "high"
  if (dataValue >= 3.5) return "medium"
  return "low"
}

/**
 * If the user only has free-text careerGoal (no socCode yet), pick the closest
 * O*NET occupation by fuzzy title search and persist it. Returns the resolved
 * SOC + title, or null if nothing reasonable came back.
 */
async function lazyResolveSocCode(
  userId: string,
  careerGoal: string,
): Promise<{ socCode: string; socTitle: string } | null> {
  const candidates = await searchOccupations(careerGoal, 1)
  if (candidates.length === 0) return null
  const top = candidates[0]
  await updateUserGoal(userId, { socCode: top.socCode, socTitle: top.title })
  return { socCode: top.socCode, socTitle: top.title }
}

export async function POST() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const [skills, userGoal] = await Promise.all([
      getExtractedSkills(user.id),
      getUserGoal(user.id),
    ])

    if (!userGoal) {
      return NextResponse.json(
        { error: "Please complete onboarding first." },
        { status: 400 },
      )
    }
    if (skills.length === 0) {
      return NextResponse.json(
        { error: "No skills found. Upload and analyze a document first." },
        { status: 400 },
      )
    }

    // ── Resolve SOC code ────────────────────────────────────────────────────
    let socCode = userGoal.socCode
    let socTitle = userGoal.socTitle
    if (!socCode) {
      if (!userGoal.careerGoal) {
        return NextResponse.json(
          { error: "No career goal set. Please complete onboarding first." },
          { status: 400 },
        )
      }
      const resolved = await lazyResolveSocCode(user.id, userGoal.careerGoal)
      if (!resolved) {
        return NextResponse.json(
          {
            error:
              `Couldn't match "${userGoal.careerGoal}" to a known career. ` +
              `Update your career goal on the Goals page to pick a specific occupation.`,
          },
          { status: 400 },
        )
      }
      socCode = resolved.socCode
      socTitle = resolved.socTitle
    }

    // ── Pull O*NET required skills ──────────────────────────────────────────
    const occupation = await getOccupationByCode(socCode)
    if (!occupation) {
      return NextResponse.json(
        { error: "Career not found in O*NET. Update your goal." },
        { status: 400 },
      )
    }
    const requiredSkills = await getRequiredSkillsForOccupation(socCode, 3.0)
    if (requiredSkills.length === 0) {
      return NextResponse.json(
        { error: "No required skills available for this career." },
        { status: 500 },
      )
    }

    // ── Ask Gemini to do ONE constrained job: semantic match + commentary ───
    const requiredList = requiredSkills
      .map(
        (s) =>
          `- ${s.elementName} (importance ${s.importance.toFixed(1)}/5)${
            s.description ? ` — ${s.description}` : ""
          }`,
      )
      .join("\n")

    const studentList = skills
      .map(
        (s) =>
          `- ${s.skillName} [${s.skillType}, ${s.category ?? "General"}]`,
      )
      .join("\n")

    const prompt = `You are evaluating a student's readiness for a target career using O*NET data.

Target career: ${socTitle ?? occupation.title} (${socCode})
${occupation.description ? occupation.description + "\n" : ""}

REQUIRED SKILLS (from O*NET, scored 1-5 by importance):
${requiredList}

STUDENT'S EXTRACTED SKILLS (from their coursework / documents):
${studentList}

Your tasks (be moderately strict — only count clear semantic matches):
1. For each REQUIRED skill, list which (if any) of the student's EXTRACTED skills semantically support it. A required skill like "Programming" can be supported by extracted skills like "Python", "JavaScript", "React". Use the EXACT extracted-skill name as written.
2. Write a 2-3 sentence summary assessing where the student stands toward this career.
3. For each REQUIRED skill the student has NO match for, write one specific actionable suggestion to acquire it (one sentence).
4. List 3 top-priority recommendations to close the biggest gaps.

Return ONLY valid JSON in this exact shape (no markdown fences):
{
  "matches": { "<Required Skill Name>": ["<extracted skill 1>", ...], ... },
  "summary": "...",
  "gapSuggestions": { "<Missing Skill Name>": "<suggestion>", ... },
  "recommendations": ["...", "...", "..."]
}
Use the EXACT required-skill names from the list above as keys in "matches" and "gapSuggestions".`

    const responseText = await generateText(
      prompt,
      "You are a career intelligence advisor. Output strict JSON only.",
    )
    if (!responseText) {
      return NextResponse.json({ error: "No response from AI" }, { status: 500 })
    }

    let parsed: {
      matches: Record<string, string[]>
      summary: string
      gapSuggestions: Record<string, string>
      recommendations: string[]
    }
    try {
      parsed = JSON.parse(responseText)
    } catch {
      return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 })
    }

    // ── Deterministic computation ──────────────────────────────────────────
    const matches = parsed.matches ?? {}
    const matchedRequired: OnetRequiredSkill[] = []
    const missingRequired: OnetRequiredSkill[] = []
    for (const r of requiredSkills) {
      const studentMatches = matches[r.elementName] ?? []
      if (Array.isArray(studentMatches) && studentMatches.length > 0) {
        matchedRequired.push(r)
      } else {
        missingRequired.push(r)
      }
    }

    // Strengths = student-side names that matched at least one required skill,
    // ordered by the importance of the highest required skill they matched.
    const strengthScore = new Map<string, number>()
    for (const [reqName, studentNames] of Object.entries(matches)) {
      const req = requiredSkills.find((r) => r.elementName === reqName)
      if (!req || !Array.isArray(studentNames)) continue
      for (const s of studentNames) {
        const prev = strengthScore.get(s) ?? 0
        if (req.importance > prev) strengthScore.set(s, req.importance)
      }
    }
    const strengths = [...strengthScore.entries()]
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([name]) => name)

    // Gaps = required skills with zero matches, sorted by importance, capped 12
    const gaps = missingRequired
      .sort((a, b) => b.importance - a.importance)
      .slice(0, 12)
      .map((r) => ({
        skill: r.elementName,
        importance: bucketImportance(r.importance),
        suggestion:
          parsed.gapSuggestions?.[r.elementName] ??
          `Build experience in ${r.elementName.toLowerCase()} through coursework or projects.`,
      }))

    const readinessScore = Math.round(
      (matchedRequired.length / requiredSkills.length) * 100,
    )

    const guidance = await upsertCareerGuidance(user.id, {
      careerGoal: socTitle ?? occupation.title,
      readinessScore: Math.min(100, Math.max(0, readinessScore)),
      summary: parsed.summary ?? "",
      strengths,
      gaps,
      recommendations: parsed.recommendations ?? [],
    })

    return NextResponse.json(guidance)
  } catch (error) {
    console.error("[career-guidance] POST", error)
    return NextResponse.json({ error: "Failed to generate guidance" }, { status: 500 })
  }
}
