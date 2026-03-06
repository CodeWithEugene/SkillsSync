import { NextRequest, NextResponse } from "next/server"

const SITE_URL = "https://www.skillssync.xyz"

/**
 * Africa's Talking USSD callback handler.
 * Use callback URL: https://www.skillssync.xyz/api/ussd (with www to avoid redirect).
 * Receives POST with: sessionId, serviceCode, phoneNumber, text (menu path e.g. "" or "1" or "1*2").
 * Response must be plain text starting with CON (continue) or END (end session).
 * @see https://developers.africastalking.com/docs/ussd/overview
 */
export async function GET() {
  return new NextResponse("USSD callback expects POST from Africa's Talking.", {
    status: 405,
    headers: { "Content-Type": "text/plain" },
  })
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") ?? ""
    let sessionId = ""
    let serviceCode = ""
    let phoneNumber = ""
    let text = ""

    if (contentType.includes("application/x-www-form-urlencoded")) {
      const body = await request.text()
      const params = new URLSearchParams(body)
      sessionId = params.get("sessionId") ?? ""
      serviceCode = params.get("serviceCode") ?? ""
      phoneNumber = params.get("phoneNumber") ?? ""
      text = params.get("text") ?? ""
    } else {
      const json = await request.json().catch(() => ({}))
      sessionId = json.sessionId ?? ""
      serviceCode = json.serviceCode ?? ""
      phoneNumber = json.phoneNumber ?? ""
      text = json.text ?? ""
    }

    const menu = (text || "").trim()
    let response: string

    if (!menu) {
      response = `CON Welcome to SkillSync
Transform your coursework into verifiable skills.

1. Get started (web)
2. Learn more
3. Contact`
    } else if (menu === "1") {
      response = `END Visit ${SITE_URL} to sign up and start tracking your skills with AI.`
    } else if (menu === "2") {
      response = `CON Learn more
1. What is SkillSync?
2. How it works
0. Back`
    } else if (menu === "3") {
      response = `END Contact us at ${SITE_URL} or email support for help.`
    } else if (menu === "2*1") {
      response = `END SkillSync uses AI to extract and track skills from your coursework and documents. Build your professional profile effortlessly.`
    } else if (menu === "2*2") {
      response = `END Upload documents → AI extracts skills → Track progress. Your data is private and secure. Visit ${SITE_URL}`
    } else if (menu === "2*0") {
      response = `CON Welcome to SkillSync
1. Get started (web)
2. Learn more
3. Contact`
    } else {
      response = `END Invalid option. Dial again or visit ${SITE_URL}`
    }

    return new NextResponse(response, {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    })
  } catch (err) {
    console.error("[ussd] callback error:", err)
    return new NextResponse("END Sorry, something went wrong. Try again later.", {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    })
  }
}
