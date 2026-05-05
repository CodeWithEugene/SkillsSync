import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

// Model to use — override via GEMINI_MODEL env var.
export const AI_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash"

function stripFences(text: string): string {
  return text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim()
}

/**
 * Generate text from a prompt using Gemini.
 * Strips markdown code fences from the response.
 */
export async function generateText(prompt: string, systemInstruction?: string): Promise<string> {
  const model = genAI.getGenerativeModel({
    model: AI_MODEL,
    ...(systemInstruction ? { systemInstruction } : {}),
  })
  const result = await model.generateContent(prompt)
  return stripFences(result.response.text())
}

/**
 * Generate text with an attached binary file (PDF, image, etc.).
 * Gemini 2.x reads PDFs natively, including layout, tables, even handwriting —
 * no separate text extraction step needed.
 *
 * Inline data has a ~20 MB request limit. For larger files, switch to the Files API.
 */
export async function generateTextFromMedia(
  prompt: string,
  media: { mimeType: string; base64: string },
  systemInstruction?: string,
): Promise<string> {
  const model = genAI.getGenerativeModel({
    model: AI_MODEL,
    ...(systemInstruction ? { systemInstruction } : {}),
  })
  const result = await model.generateContent([
    { text: prompt },
    { inlineData: { mimeType: media.mimeType, data: media.base64 } },
  ])
  return stripFences(result.response.text())
}
