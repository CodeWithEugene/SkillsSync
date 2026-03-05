import { createClient } from "@/lib/supabase/server"
import { getOnchainAttestation, upsertOnchainAttestation } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const attestation = await getOnchainAttestation(user.id)
    if (!attestation) {
      return NextResponse.json({ attestation: null })
    }

    const baseUrl =
      attestation.chainId === 8453
        ? "https://basescan.org"
        : "https://sepolia.basescan.org"
    return NextResponse.json({
      attestation: {
        ...attestation,
        txUrl: `${baseUrl}/tx/${attestation.txHash}`,
      },
    })
  } catch (error) {
    console.error("[skills/onchain] GET error:", error)
    return NextResponse.json(
      { error: "Failed to get onchain attestation" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { txHash, profileHash, chainId } = body as {
      txHash?: string
      profileHash?: string
      chainId?: number
    }

    if (!txHash || !profileHash || chainId == null) {
      return NextResponse.json(
        { error: "txHash, profileHash, and chainId are required" },
        { status: 400 }
      )
    }

    const attestation = await upsertOnchainAttestation(user.id, {
      txHash,
      profileHash,
      chainId,
    })

    const baseUrl =
      chainId === 8453 ? "https://basescan.org" : "https://sepolia.basescan.org"
    return NextResponse.json({
      attestation: {
        ...attestation,
        txUrl: `${baseUrl}/tx/${attestation.txHash}`,
      },
    })
  } catch (error) {
    console.error("[skills/onchain] POST error:", error)
    return NextResponse.json(
      { error: "Failed to save onchain attestation" },
      { status: 500 }
    )
  }
}
