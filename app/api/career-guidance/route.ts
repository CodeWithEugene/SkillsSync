import { createClient } from "@/lib/supabase/server"
import {
  getExtractedSkills,
  getUserGoal,
  upsertCareerGuidance,
  getCareerGuidance,
} from "@/lib/db"
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
    console.error("[skillsync] Error fetching career guidance:", error)
    return NextResponse.json({ error: "Failed to fetch guidance" }, { status: 500 })
  }
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

    if (!userGoal?.careerGoal) {
      return NextResponse.json(
        { error: "No career goal set. Please complete onboarding first." },
        { status: 400 },
      )
    }

    if (skills.length === 0) {
      return NextResponse.json(
        { error: "No skills found. Please upload and analyze some documents first." },
        { status: 400 },
      )
    }

    // Build a compact skill summary for the prompt
    const skillSummary = skills
      .map((s) => `- ${s.skillName} (${s.skillType}, ${s.category ?? "General"}, confidence: ${Math.round((s.confidenceScore ?? 0.5) * 100)}%)`)
      .join("\n")

    const prompt = `You are a career intelligence advisor for students. Analyze the student's profile and provide actionable career guidance.

Student Profile:
- Career Goal: ${userGoal.careerGoal}
- Current Study: ${userGoal.currentStudy ?? "Not specified"}
- Education Level: ${userGoal.educationLevel ?? "Not specified"}
- Year of Study: ${userGoal.studyYear ?? "Not specified"}
- Current Courses: ${userGoal.courses ?? "Not specified"}
- Top Priority: ${userGoal.topPriority ?? "Not specified"}

Extracted Skills (${skills.length} total):
${skillSummary}

Respond with a JSON object in this exact structure:
{
  "readinessScore": <integer 0-100 representing career readiness for the stated goal>,
  "summary": "<2-3 sentence personalized assessment>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "gaps": [
    { "skill": "<missing skill>", "importance": "high|medium|low", "suggestion": "<specific actionable step>" },
    { "skill": "<missing skill>", "importance": "high|medium|low", "suggestion": "<specific actionable step>" }
  ],
  "recommendations": ["<actionable recommendation 1>", "<actionable recommendation 2>", "<actionable recommendation 3>"]
}

Be specific, honest, and encouraging. Gaps and recommendations should be concrete and actionable. Return only valid JSON.`

    const responseText = await generateText(
      prompt,
      "You are a career intelligence advisor. Provide precise, actionable career guidance as JSON."
    )
    if (!responseText) {
      return NextResponse.json({ error: "No response from AI" }, { status: 500 })
    }

    let parsed: {
      readinessScore: number
      summary: string
      strengths: string[]
      gaps: Array<{ skill: string; importance: string; suggestion: string }>
      recommendations: string[]
    }

    try {
      const clean = responseText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim()
      parsed = JSON.parse(clean)
    } catch {
      return NextResponse.json({ error: "Failed to parse AI guidance" }, { status: 500 })
    }

    const guidance = await upsertCareerGuidance(user.id, {
      careerGoal: userGoal.careerGoal,
      readinessScore: Math.min(100, Math.max(0, parsed.readinessScore)),
      summary: parsed.summary,
      strengths: parsed.strengths ?? [],
      gaps: parsed.gaps ?? [],
      recommendations: parsed.recommendations ?? [],
    })

    return NextResponse.json(guidance)
  } catch (error) {
    console.error("[skillsync] Error generating career guidance:", error)
    return NextResponse.json({ error: "Failed to generate guidance" }, { status: 500 })
  }
}
