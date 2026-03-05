import { createClient } from "@/lib/supabase/server"
import { getUserGoal } from "@/lib/db"
import { getSkillsRegistryAddress, getBaseChainId } from "@/lib/base-contract"
import { createPublicClient, http } from "viem"
import { baseSepolia, base } from "viem/chains"
import { SKILLS_REGISTRY_ABI } from "@/lib/base-contract"
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

    const contractAddress = getSkillsRegistryAddress()
    if (!contractAddress) {
      return NextResponse.json({
        recorded: false,
        profileHash: null,
        timestamp: null,
        txUrl: null,
      })
    }

    const goal = await getUserGoal(user.id)
    const walletAddress = goal?.walletAddress
    if (!walletAddress) {
      return NextResponse.json({
        recorded: false,
        profileHash: null,
        timestamp: null,
        txUrl: null,
      })
    }

    const chainId = getBaseChainId()
    const client = getPublicClient(chainId)

    const [profileHash, timestamp] = await client.readContract({
      address: contractAddress,
      abi: SKILLS_REGISTRY_ABI,
      functionName: "getAttestation",
      args: [walletAddress as `0x${string}`],
    })

    const isRecorded =
      profileHash !== undefined &&
      profileHash !== "0x0000000000000000000000000000000000000000000000000000000000000000" &&
      Number(timestamp ?? 0) > 0

    return NextResponse.json({
      recorded: isRecorded,
      profileHash: isRecorded ? profileHash : null,
      timestamp: isRecorded ? Number(timestamp) : null,
      txUrl: null,
    })
  } catch (error) {
    console.error("[skills/onchain-status] GET error:", error)
    return NextResponse.json(
      { error: "Failed to get onchain status" },
      { status: 500 }
    )
  }
}
