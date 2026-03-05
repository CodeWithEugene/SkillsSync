"use client"

import { createConfig, http, WagmiProvider } from "wagmi"
import { base, baseSepolia } from "wagmi/chains"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

const config = createConfig({
  chains: [baseSepolia, base],
  transports: {
    [baseSepolia.id]: http(
      process.env.NEXT_PUBLIC_BASE_RPC_URL || "https://sepolia.base.org"
    ),
    [base.id]: http(
      process.env.NEXT_PUBLIC_BASE_RPC_URL || "https://mainnet.base.org"
    ),
  },
})

const queryClient = new QueryClient()

export function WagmiProviderWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  )
}
