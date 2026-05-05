import type React from "react"
import type { Metadata } from "next"
import { Geist, Fraunces, JetBrains_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "sonner"
import { ThemeProvider } from "@/components/theme-provider"
import { WagmiProviderWrapper } from "@/components/providers/wagmi-provider"
import "./globals.css"

// Body type — restrained, technical
const geist = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
})

// Display type — Fraunces, expressive serif with optical-size + soft/hard axes.
// Used for h1/h2 hero moments, page titles, oversized metrics.
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  axes: ["SOFT", "opsz"],
})

// Mono — used for SOC codes, tx hashes, technical chips
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
})

const SITE_URL = "https://www.skillssync.xyz"
const OG_IMAGE = "/og-image.png"
const TITLE = "SkillSync — AI-powered skill tracking"
const DESCRIPTION =
  "Turn coursework into verifiable career evidence. SkillSync extracts skills from your documents and benchmarks them against O*NET career requirements."

export const metadata: Metadata = {
  title: {
    default: TITLE,
    template: "%s | SkillSync",
  },
  description: DESCRIPTION,
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: SITE_URL },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "SkillSync",
    title: TITLE,
    description: DESCRIPTION,
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "SkillSync — Turn coursework into verifiable career evidence",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [OG_IMAGE],
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.svg", type: "image/svg+xml", sizes: "any" },
    ],
    shortcut: { url: "/favicon.svg", type: "image/svg+xml" },
    apple: { url: "/favicon.svg", type: "image/svg+xml" },
  },
  manifest: "/site.webmanifest",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`dark ${geist.variable} ${fraunces.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      </head>
      <body className="font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem storageKey="skillsync-theme">
          <WagmiProviderWrapper>{children}</WagmiProviderWrapper>
        </ThemeProvider>
        <Toaster
          position="top-right"
          theme="system"
          closeButton
          duration={5000}
          toastOptions={{
            classNames: {
              toast:
                "!rounded-md !border !border-border !bg-card !text-card-foreground !shadow-lg !font-sans",
              title: "!font-medium !text-sm",
              description: "!text-muted-foreground !text-xs",
              success: "!border-success/40",
              error: "!border-destructive/40",
              actionButton: "!bg-primary !text-primary-foreground !rounded-sm !text-xs",
              cancelButton: "!bg-muted !text-muted-foreground !rounded-sm !text-xs",
              closeButton: "!bg-muted !text-muted-foreground !border-0",
            },
          }}
        />
        <Analytics />
      </body>
    </html>
  )
}
