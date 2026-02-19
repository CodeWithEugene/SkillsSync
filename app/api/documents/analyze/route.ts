import { createClient } from "@/lib/supabase/server"
import { updateDocumentStatus, createExtractedSkill, addSkillHistorySnapshot, getExtractedSkills } from "@/lib/db"
import { openai } from "@/lib/openai"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { documentId } = await request.json()

    if (!documentId) {
      return NextResponse.json({ error: "Document ID required" }, { status: 400 })
    }

    const supabase = await createClient()

    // Fetch document from database
    const { data: document, error: docError } = await supabase
      .from("documents")
      .select("*")
      .eq("id", documentId)
      .single()

    if (docError || !document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 })
    }

    // Check if file is PDF and reject it
    if (document.filename.toLowerCase().endsWith(".pdf")) {
      await updateDocumentStatus(documentId, "FAILED")
      return NextResponse.json({
        error: "PDF files are not supported. Please upload a text file.",
        status: "FAILED",
      })
    }

    // Fetch file content
    const response = await fetch(document.file_url)
    const fileContent = await response.text()

    // Limit content size to avoid token limits
    const limitedContent = fileContent.substring(0, 15000)

    // Call DeepSeek for skill extraction with technical/soft classification
    const prompt = `Analyze the following coursework/document and extract skills, technologies, and competencies demonstrated. Return a JSON array with the following structure:
[
  {
    "skillName": "skill name",
    "category": "specific category (e.g., Programming, Data Analysis, Communication, Leadership, Problem Solving)",
    "skillType": "technical | soft | transferable",
    "confidenceScore": 0.0-1.0,
    "evidenceText": "brief quote or summary from the document"
  }
]

Classification guide:
- "technical": programming languages, tools, frameworks, domain-specific knowledge, hard skills
- "soft": communication, teamwork, leadership, time management, emotional intelligence
- "transferable": critical thinking, problem solving, research, project management, adaptability

Document content:
${limitedContent}

Return only valid JSON array, no markdown formatting.`

    const completion = await openai.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content:
            "You are a skill extraction assistant. Extract and classify skills from academic documents and return them as JSON.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
    })

    const responseText = completion.choices[0]?.message?.content

    if (!responseText) {
      await updateDocumentStatus(documentId, "FAILED")
      return NextResponse.json({ error: "No response from AI" }, { status: 500 })
    }

    // Parse the JSON response
    let skills: Array<{
      skillName: string
      category: string
      skillType: "technical" | "soft" | "transferable"
      confidenceScore: number
      evidenceText: string
    }>

    try {
      const cleanedResponse = responseText
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim()
      skills = JSON.parse(cleanedResponse)
    } catch (parseError) {
      console.error("[skillsync] Failed to parse AI response:", parseError)
      await updateDocumentStatus(documentId, "FAILED")
      return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 })
    }

    // Store extracted skills in database
    for (const skill of skills) {
      await createExtractedSkill(
        document.user_id,
        documentId,
        skill.skillName,
        skill.category,
        skill.confidenceScore,
        skill.evidenceText,
        skill.skillType ?? "technical",
      )
    }

    // Update document status to COMPLETED
    await updateDocumentStatus(documentId, "COMPLETED")

    // Record skill history snapshot for timeline
    const allSkills = await getExtractedSkills(document.user_id)
    const technical = allSkills.filter((s) => s.skillType === "technical").length
    const soft = allSkills.filter((s) => s.skillType === "soft").length
    const transferable = allSkills.filter((s) => s.skillType === "transferable").length

    const categoryCount: Record<string, number> = {}
    for (const s of allSkills) {
      if (s.category) categoryCount[s.category] = (categoryCount[s.category] ?? 0) + 1
    }
    const topCategories = Object.entries(categoryCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([cat]) => cat)

    await addSkillHistorySnapshot(document.user_id, documentId, {
      technical,
      soft,
      transferable,
      total: allSkills.length,
      topCategories,
    })

    return NextResponse.json({ status: "COMPLETED", skillsCount: skills.length })
  } catch (error) {
    console.error("[skillsync] Error analyzing document:", error)
    return NextResponse.json({ error: "Failed to analyze document" }, { status: 500 })
  }
}
