import { createClient } from "@/lib/supabase/server"
import { updateUserGoal, getUserGoal } from "@/lib/db"
import {
  consumeWalletLinkNonce,
  parseNonceFromMessage,
} from "@/lib/wallet-nonce"
import { createPublicClient, http } from "viem"
import { baseSepolia, base } from "viem/chains"
import { getBaseChainId } from "@/lib/base-contract"
import { NextResponse } from "next/server"

function getPublicClient(chainId: number) {
  const chain = chainId === 8453 ? base : baseSepolia
  const rpc =
    process.env.NEXT_PUBLIC_BASE_RPC_URL ||
    (chainId === 8453 ? "https://mainnet.base.org" : "https://sepolia.base.org")
  return createPublicClient({
    chain,
    transport: http(rpc),
  })
}

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const goal = await getUserGoal(user.id)
    const address = goal?.walletAddress ?? null
    return NextResponse.json({ address })
  } catch (error) {
    console.error("[profile/wallet] GET error:", error)
    return NextResponse.json({ error: "Failed to get wallet" }, { status: 500 })
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
    const { address, message, signature } = body as {
      address?: string
      message?: string
      signature?: string
    }

    if (!address || !message || typeof message !== "string" || !signature) {
      return NextResponse.json(
        { error: "address, message, and signature are required" },
        { status: 400 }
      )
    }

    const nonce = parseNonceFromMessage(message)
    if (!nonce || !consumeWalletLinkNonce(nonce)) {
      return NextResponse.json(
        { error: "Invalid or expired nonce" },
        { status: 401 }
      )
    }

    const chainId = getBaseChainId()
    const client = getPublicClient(chainId)

    const valid = await client.verifyMessage({
      address: address as `0x${string}`,
      message,
      signature: signature as `0x${string}`,
    })

    if (!valid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    let goal = await getUserGoal(user.id)
    if (!goal) {
      const { createUserGoal } = await import("@/lib/db")
      goal = await createUserGoal(user.id, {})
    }

    await updateUserGoal(user.id, { walletAddress: address.toLowerCase() })

    return NextResponse.json({ success: true, address: address.toLowerCase() })
  } catch (error) {
    console.error("[profile/wallet] Error:", error)
    return NextResponse.json(
      { error: "Failed to link wallet" },
      { status: 500 }
    )
  }
}
