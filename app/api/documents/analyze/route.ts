import { createClient } from "@/lib/supabase/server"
import { updateDocumentStatus, createExtractedSkill, addSkillHistorySnapshot, getExtractedSkills } from "@/lib/db"
import { generateText, generateTextFromMedia } from "@/lib/openai"
import {
  SOFTWARE_ENGINEERING_FILENAME,
  SOFTWARE_ENGINEERING_INSIGHTS,
} from "@/lib/software-engineering-insights"
import { NextResponse } from "next/server"

// Gemini inline-data limit is ~20 MB request size. Cap at 18 MB to leave headroom
// for headers + the prompt text.
const MAX_INLINE_BYTES = 18 * 1024 * 1024

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

    const filename = (document.filename ?? (document as { file_name?: string }).file_name ?? "").trim()
    if (!filename) {
      await updateDocumentStatus(documentId, "FAILED")
      return NextResponse.json({ error: "Document has no filename", status: "FAILED" }, { status: 400 })
    }

    const isPdf = filename.toLowerCase().endsWith(".pdf")

    // Option A: Predefined insights for software-engineering.docx
    const isSoftwareEngineering = filename.toLowerCase() === SOFTWARE_ENGINEERING_FILENAME.toLowerCase()
    if (isSoftwareEngineering) {
      for (const skill of SOFTWARE_ENGINEERING_INSIGHTS) {
        await createExtractedSkill(
          document.user_id,
          documentId,
          skill.skillName,
          skill.category,
          skill.confidenceScore,
          skill.evidenceText,
          skill.skillType,
        )
      }
      await updateDocumentStatus(documentId, "COMPLETED")
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
      return NextResponse.json({
        status: "COMPLETED",
        skillsCount: SOFTWARE_ENGINEERING_INSIGHTS.length,
        source: "predefined",
      })
    }

    // ── Standard AI extraction (PDF + plain-text/doc/docx) ─────────────────
    const fileResponse = await fetch(document.file_url)
    if (!fileResponse.ok) {
      await updateDocumentStatus(documentId, "FAILED")
      return NextResponse.json({ error: "Failed to fetch document" }, { status: 500 })
    }

    const baseInstructions = `Analyze the attached coursework/document and extract skills, technologies, and competencies demonstrated. Return a JSON array with the following structure:
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

Return only valid JSON array, no markdown formatting.`

    const systemInstruction =
      "You are a skill extraction assistant. Extract and classify skills from academic documents and return them as JSON."

    let responseText: string

    if (isPdf) {
      // Send the PDF directly to Gemini — it reads layout, tables, even handwriting.
      const buffer = Buffer.from(await fileResponse.arrayBuffer())
      if (buffer.byteLength > MAX_INLINE_BYTES) {
        await updateDocumentStatus(documentId, "FAILED")
        return NextResponse.json(
          {
            error: `PDF is too large (${(buffer.byteLength / 1024 / 1024).toFixed(1)} MB). Max 18 MB.`,
            status: "FAILED",
          },
          { status: 400 },
        )
      }
      responseText = await generateTextFromMedia(
        baseInstructions,
        { mimeType: "application/pdf", base64: buffer.toString("base64") },
        systemInstruction,
      )
    } else {
      // Plain text path — used for .txt, and (best-effort) .doc/.docx.
      const fileContent = await fileResponse.text()
      const limitedContent = fileContent.substring(0, 15000)
      const prompt = `${baseInstructions}\n\nDocument content:\n${limitedContent}`
      responseText = await generateText(prompt, systemInstruction)
    }

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
      skills = JSON.parse(responseText)
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
