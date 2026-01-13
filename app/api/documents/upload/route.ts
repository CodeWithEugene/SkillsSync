import { createClient } from "@/lib/supabase/server"
import { createDocument } from "@/lib/db"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Upload file to Supabase Storage
    const fileExt = file.name.split(".").pop()
    const fileName = `${user.id}/${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage.from("coursework").upload(fileName, file)

    if (uploadError) {
      console.error("[v0] Upload error:", uploadError)
      return NextResponse.json({ error: "Failed to upload file" }, { status: 500 })
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("coursework").getPublicUrl(fileName)

    // Create document record in database
    const document = await createDocument(user.id, file.name, publicUrl)

    // Trigger background analysis
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    fetch(`${appUrl}/api/documents/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ documentId: document.id }),
    }).catch((err) => console.error("[v0] Failed to trigger analysis:", err))

    return NextResponse.json(document)
  } catch (error) {
    console.error("[v0] Error uploading document:", error)
    return NextResponse.json({ error: "Failed to upload document" }, { status: 500 })
  }
}
