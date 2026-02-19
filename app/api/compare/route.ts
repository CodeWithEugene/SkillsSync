import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/supabase-auth"
import { getExtractedSkills } from "@/lib/db"
import { openai } from "@/lib/openai"

export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

  const body = await req.json()
  const jobDescription: string = body.jobDescription?.trim() ?? ""

  if (!jobDescription || jobDescription.length < 20) {
    return NextResponse.json({ error: "Please provide a job description (at least 20 characters)" }, { status: 400 })
  }

  const skills = await getExtractedSkills(user.id)
  if (skills.length === 0) {
    return NextResponse.json(
      { error: "No skills found. Upload a document first to extract your skills." },
      { status: 400 },
    )
  }

  const skillList = skills.map((s) => `${s.skillName} (${s.skillType})`).join(", ")

  const prompt = `You are a career advisor analysing how well a candidate's skills match a job description.

Candidate's skills: ${skillList}

Job Description:
${jobDescription.slice(0, 4000)}

Analyse the match and respond with a JSON object exactly like this (no markdown, no extra text):
{
  "matchScore": <integer 0-100>,
  "matchedSkills": [<list of skills from candidate's list that are relevant to this job>],
  "missingSkills": [<important skills mentioned in the job description that the candidate lacks>],
  "verdict": "<2-3 sentence summary of how well the candidate fits, what's strong, and what to improve>"
}`

  try {
    const completion = await openai.chat.completions.create({
      model: "deepseek-chat",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      response_format: { type: "json_object" },
    })

    const raw = completion.choices[0]?.message?.content ?? "{}"
    const result = JSON.parse(raw)

    return NextResponse.json({
      matchScore: Math.min(100, Math.max(0, Number(result.matchScore) || 0)),
      matchedSkills: Array.isArray(result.matchedSkills) ? result.matchedSkills : [],
      missingSkills: Array.isArray(result.missingSkills) ? result.missingSkills : [],
      verdict: result.verdict ?? "",
    })
  } catch {
    return NextResponse.json({ error: "AI analysis failed. Please try again." }, { status: 500 })
  }
}
