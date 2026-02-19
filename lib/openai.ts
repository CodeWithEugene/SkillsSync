import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

// Model to use — override via GEMINI_MODEL env var.
export const AI_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash"

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
  const text = result.response.text()
  return text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim()
}
