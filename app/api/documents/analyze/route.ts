import { createClient } from "@/lib/supabase/server"
import { updateDocumentStatus, createExtractedSkill } from "@/lib/db"
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

    // Fetch file content
    const response = await fetch(document.fileUrl)
    const fileContent = await response.text()

    // Check if file is PDF and reject it
    if (document.filename.toLowerCase().endsWith(".pdf")) {
      await updateDocumentStatus(documentId, "FAILED")
      return NextResponse.json({
        error: "PDF files are not supported. Please upload a text file.",
        status: "FAILED",
      })
    }

    // Limit content size to avoid token limits
    const limitedContent = fileContent.substring(0, 15000)

    // Call OpenAI for skill extraction
    const prompt = `Analyze the following coursework/document and extract skills, technologies, and competencies demonstrated by the student. Return a JSON array of skills with the following structure:
[
  {
    "skillName": "skill name",
    "category": "category (e.g., Programming, Design, Communication)",
    "confidenceScore": 0.0-1.0,
    "evidenceText": "brief quote or summary from the document"
  }
]

Document content:
${limitedContent}

Return only valid JSON array, no markdown formatting.`

    const completion = await openai.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content:
            "You are a skill extraction assistant. Extract skills from academic documents and return them as JSON.",
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
      confidenceScore: number
      evidenceText: string
    }>

    try {
      // Remove markdown code blocks if present
      const cleanedResponse = responseText
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim()
      skills = JSON.parse(cleanedResponse)
    } catch (parseError) {
      console.error("[v0] Failed to parse AI response:", parseError)
      await updateDocumentStatus(documentId, "FAILED")
      return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 })
    }

    // Store extracted skills in database
    for (const skill of skills) {
      await createExtractedSkill(
        document.userId,
        documentId,
        skill.skillName,
        skill.category,
        skill.confidenceScore,
        skill.evidenceText,
      )
    }

    // Update document status to COMPLETED
    await updateDocumentStatus(documentId, "COMPLETED")

    return NextResponse.json({ status: "COMPLETED", skillsCount: skills.length })
  } catch (error) {
    console.error("[v0] Error analyzing document:", error)
    return NextResponse.json({ error: "Failed to analyze document" }, { status: 500 })
  }
}
