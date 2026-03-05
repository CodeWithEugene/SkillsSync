import { createWalletLinkNonce } from "@/lib/wallet-nonce"
import { NextResponse } from "next/server"

export async function GET() {
  const nonce = createWalletLinkNonce()
  return NextResponse.json({ nonce })
}
