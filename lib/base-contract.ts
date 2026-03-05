/**
 * SkillsRegistry ABI and config for Base chain.
 * Contract: contracts/src/SkillsRegistry.sol
 */

export const SKILLS_REGISTRY_ABI = [
  {
    inputs: [{ name: "profileHash", type: "bytes32", internalType: "bytes32" }],
    name: "recordAttestation",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "user", type: "address", internalType: "address" }],
    name: "getAttestation",
    outputs: [
      { name: "profileHash", type: "bytes32", internalType: "bytes32" },
      { name: "timestamp", type: "uint256", internalType: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "", type: "address", internalType: "address" }],
    name: "attestations",
    outputs: [
      { name: "profileHash", type: "bytes32", internalType: "bytes32" },
      { name: "timestamp", type: "uint256", internalType: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const

export const BASE_SEPOLIA_CHAIN_ID = 84532
export const BASE_MAINNET_CHAIN_ID = 8453

export function getSkillsRegistryAddress(): `0x${string}` | undefined {
  const addr = process.env.NEXT_PUBLIC_SKILLS_REGISTRY_ADDRESS
  if (!addr || !addr.startsWith("0x")) return undefined
  return addr as `0x${string}`
}

export function getBaseChainId(): number {
  const id = process.env.NEXT_PUBLIC_BASE_CHAIN_ID
  if (id === "8453") return BASE_MAINNET_CHAIN_ID
  return BASE_SEPOLIA_CHAIN_ID
}

export function getBaseExplorerUrl(chainId: number): string {
  return chainId === BASE_MAINNET_CHAIN_ID
    ? "https://basescan.org"
    : "https://sepolia.basescan.org"
}
