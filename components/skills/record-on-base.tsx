"use client"

import { useState, useEffect } from "react"
import { useAccount, useConnect, useDisconnect, useSignMessage, useSwitchChain, useWriteContract } from "wagmi"
import { injected } from "wagmi/connectors"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { computeSkillsProfileHash } from "@/lib/skills-hash"
import { SKILLS_REGISTRY_ABI, getBaseChainId } from "@/lib/base-contract"
import type { ExtractedSkill } from "@/lib/db"
import { ExternalLink, Loader2, Wallet, ShieldCheck, CheckCircle2 } from "lucide-react"
import { getWalletLinkMessage } from "@/lib/wallet-nonce"

const REGISTRY_ADDRESS = process.env.NEXT_PUBLIC_SKILLS_REGISTRY_ADDRESS as `0x${string}` | undefined

interface RecordOnBaseProps {
  skills: ExtractedSkill[]
}

export function RecordOnBase({ skills }: RecordOnBaseProps) {
  const [linkedAddress, setLinkedAddress] = useState<string | null>(null)
  const [onchainAttestation, setOnchainAttestation] = useState<{
    txUrl: string
    txHash: string
  } | null>(null)
  const [verifiedOnChain, setVerifiedOnChain] = useState<boolean | null>(null)
  const [linkLoading, setLinkLoading] = useState(false)
  const [linkError, setLinkError] = useState<string | null>(null)

  const { address, isConnected, chain } = useAccount()
  const { connect, isPending: isConnectPending } = useConnect()
  const { disconnect } = useDisconnect()
  const { signMessageAsync } = useSignMessage()
  const { switchChainAsync, isPending: isSwitchPending } = useSwitchChain()
  const { writeContractAsync, isPending: isWritePending } = useWriteContract()

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const res = await fetch("/api/profile/wallet")
        if (res.ok) {
          const { address: a } = await res.json()
          setLinkedAddress(a ?? null)
        }
      } catch {
        setLinkedAddress(null)
      }
    }
    fetchWallet()
  }, [])

  useEffect(() => {
    const fetchOnchain = async () => {
      try {
        const res = await fetch("/api/skills/onchain")
        if (res.ok) {
          const data = await res.json()
          if (data.attestation?.txUrl) {
            setOnchainAttestation({
              txUrl: data.attestation.txUrl,
              txHash: data.attestation.txHash,
            })
          } else {
            setOnchainAttestation(null)
          }
        }
      } catch {
        setOnchainAttestation(null)
      }
    }
    fetchOnchain()
  }, [])

  useEffect(() => {
    if (!linkedAddress) {
      setVerifiedOnChain(null)
      return
    }
    const fetchVerified = async () => {
      try {
        const res = await fetch("/api/skills/onchain-status")
        if (res.ok) {
          const data = await res.json()
          setVerifiedOnChain(data.recorded === true)
        } else {
          setVerifiedOnChain(false)
        }
      } catch {
        setVerifiedOnChain(false)
      }
    }
    fetchVerified()
  }, [linkedAddress])

  const handleConnect = () => {
    connect({ connector: injected() })
  }

  const handleLinkWallet = async () => {
    if (!address) return
    setLinkLoading(true)
    setLinkError(null)
    try {
      const nonceRes = await fetch("/api/profile/wallet/nonce")
      if (!nonceRes.ok) throw new Error("Failed to get nonce")
      const { nonce } = await nonceRes.json()
      const message = getWalletLinkMessage(nonce)
      const signature = await signMessageAsync({ message })
      const linkRes = await fetch("/api/profile/wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, message, signature }),
      })
      if (!linkRes.ok) {
        const err = await linkRes.json().catch(() => ({}))
        throw new Error(err.error || "Failed to link wallet")
      }
      setLinkedAddress(address.toLowerCase())
    } catch (e) {
      setLinkError(e instanceof Error ? e.message : "Failed to link wallet")
    } finally {
      setLinkLoading(false)
    }
  }

  const handleRecordOnBase = async () => {
    if (!REGISTRY_ADDRESS || skills.length === 0 || !address) return
    const profileHash = computeSkillsProfileHash(skills)
    const chainId = getBaseChainId()
    try {
      if (chain?.id !== chainId && switchChainAsync) {
        await switchChainAsync({ chainId })
      }
      const hash = await writeContractAsync({
        address: REGISTRY_ADDRESS,
        abi: SKILLS_REGISTRY_ABI,
        functionName: "recordAttestation",
        args: [profileHash],
      })
      if (hash) {
        await fetch("/api/skills/onchain", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            txHash: hash,
            profileHash,
            chainId,
          }),
        })
        const baseUrl =
          chainId === 8453 ? "https://basescan.org" : "https://sepolia.basescan.org"
        setOnchainAttestation({ txUrl: `${baseUrl}/tx/${hash}`, txHash: hash })
        setTimeout(() => {
          fetch("/api/skills/onchain-status")
            .then((r) => r.ok && r.json())
            .then((data) => data?.recorded === true && setVerifiedOnChain(true))
            .catch(() => {})
        }, 4000)
      }
    } catch (e) {
      console.error("Record on Base failed:", e)
    }
  }

  const isLinked = linkedAddress && address && linkedAddress === address.toLowerCase()
  const canRecord = REGISTRY_ADDRESS && skills.length > 0 && isLinked
  const pending = isConnectPending || linkLoading || isSwitchPending || isWritePending

  return (
    <Card>
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-wrap items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
          <ShieldCheck className="size-4" />
          Record on Base
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Attest your skill profile on Base so it can be verified on-chain.
        </p>

        {!isConnected && (
          <Button onClick={handleConnect} disabled={pending} variant="default">
            {isConnectPending ? (
              <Loader2 className="size-4 animate-spin mr-2" />
            ) : (
              <Wallet className="size-4 mr-2" />
            )}
            Connect wallet
          </Button>
        )}

        {isConnected && !isLinked && (
          <div className="space-y-2">
            <p className="text-sm">
              Wallet: <code className="text-xs bg-muted px-1 rounded">{address}</code>
            </p>
            <Button onClick={handleLinkWallet} disabled={pending} variant="secondary">
              {linkLoading ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
              Link wallet to account
            </Button>
            {linkError && (
              <p className="text-sm text-destructive">{linkError}</p>
            )}
            <Button variant="ghost" size="sm" onClick={() => disconnect()}>
              Disconnect
            </Button>
          </div>
        )}

        {isConnected && isLinked && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Linked: <code className="text-xs bg-muted px-1 rounded">{address?.slice(0, 6)}...{address?.slice(-4)}</code>
            </p>
            {canRecord ? (
              <Button
                onClick={handleRecordOnBase}
                disabled={pending}
                variant="default"
              >
                {isWritePending ? (
                  <Loader2 className="size-4 animate-spin mr-2" />
                ) : null}
                Record skills on Base
              </Button>
            ) : !REGISTRY_ADDRESS ? (
              <p className="text-sm text-muted-foreground">
                Recording not configured (missing contract address).
              </p>
            ) : skills.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Upload documents and extract skills first.
              </p>
            ) : null}
            <Button variant="ghost" size="sm" onClick={() => disconnect()}>
              Disconnect wallet
            </Button>
          </div>
        )}

        {(onchainAttestation || verifiedOnChain) && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {onchainAttestation && (
              <a
                href={onchainAttestation.txUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
              >
                Recorded on Base <ExternalLink className="size-3" />
              </a>
            )}
            {verifiedOnChain && (
              <Badge variant="secondary" className="gap-1 font-normal text-success border-success/30 bg-success/10">
                <CheckCircle2 className="size-3.5" />
                Verified on-chain
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
