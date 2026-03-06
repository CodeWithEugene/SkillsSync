import { NextRequest, NextResponse } from "next/server"

const SITE_URL = "https://www.skillssync.xyz"

const TEXT_PLAIN = { "Content-Type": "text/plain" } as const

/**
 * Africa's Talking USSD callback handler.
 * Use callback URL: https://www.skillssync.xyz/api/ussd (with www to avoid redirect).
 * Supports both GET (query params) and POST (body). Params: sessionId, serviceCode, phoneNumber, text.
 * Response must be plain text starting with CON (continue) or END (end session).
 * @see https://developers.africastalking.com/docs/ussd/overview
 */
function getTextFromGet(request: NextRequest): string {
  const q = request.nextUrl.searchParams
  return (q.get("text") ?? q.get("Text") ?? "").trim()
}

/** GET with ?ping=1 returns a simple OK so you can verify the deployed endpoint. */
function isPing(request: NextRequest): boolean {
  return request.nextUrl.searchParams.get("ping") === "1"
}

function buildUssdResponse(menu: string): string {
  if (!menu) {
    return `CON Welcome to SkillSync
Transform your coursework into verifiable skills.

1. Get started (web)
2. Learn more
3. Contact`
  }
  if (menu === "1") {
    return `END Visit ${SITE_URL} to sign up and start tracking your skills with AI.`
  }
  if (menu === "2") {
    return `CON Learn more
1. What is SkillSync?
2. How it works
0. Back`
  }
  if (menu === "3") {
    return `END Contact us at ${SITE_URL} or email support for help.`
  }
  if (menu === "2*1") {
    return `END SkillSync uses AI to extract and track skills from your coursework and documents. Build your professional profile effortlessly.`
  }
  if (menu === "2*2") {
    return `END Upload documents → AI extracts skills → Track progress. Your data is private and secure. Visit ${SITE_URL}`
  }
  if (menu === "2*0") {
    return `CON Welcome to SkillSync
1. Get started (web)
2. Learn more
3. Contact`
  }
  return `END Invalid option. Dial again or visit ${SITE_URL}`
}

export async function GET(request: NextRequest) {
  try {
    if (isPing(request)) {
      return new NextResponse("OK SkillSync USSD", { status: 200, headers: TEXT_PLAIN })
    }
    const text = getTextFromGet(request)
    const response = buildUssdResponse(text)
    return new NextResponse(response, { status: 200, headers: TEXT_PLAIN })
  } catch (err) {
    console.error("[ussd] GET callback error:", err)
    return new NextResponse("END Sorry, something went wrong. Try again later.", {
      status: 200,
      headers: TEXT_PLAIN,
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") ?? ""
    let text = ""

    if (contentType.includes("application/x-www-form-urlencoded")) {
      const body = await request.text()
      const params = new URLSearchParams(body)
      text = (params.get("text") ?? params.get("Text") ?? "").trim()
    } else {
      const json = await request.json().catch(() => ({}))
      text = (json.text ?? json.Text ?? "").trim()
    }

    const response = buildUssdResponse(text)
    return new NextResponse(response, { status: 200, headers: TEXT_PLAIN })
  } catch (err) {
    console.error("[ussd] callback error:", err)
    return new NextResponse("END Sorry, something went wrong. Try again later.", {
      status: 200,
      headers: TEXT_PLAIN,
    })
  }
}
