import type React from "react"
import type { Metadata } from "next"
import { Geist, Fraunces, JetBrains_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
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

export const metadata: Metadata = {
  title: {
    default: "SkillSync - AI-Powered Skill Tracking",
    template: "%s | SkillSync",
  },
  description:
    "Transform your documents into valuable skills with AI-powered analysis. Track your professional development effortlessly.",
  generator: "v0.app",
  metadataBase: new URL("https://skillsyncglobal.vercel.app"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://skillsyncglobal.vercel.app",
    siteName: "SkillSync",
    title: "SkillSync - AI-Powered Skill Tracking",
    description:
      "Transform your documents into valuable skills with AI-powered analysis. Track your professional development effortlessly.",
    images: [
      {
        url: "/logo.png",
        width: 128,
        height: 128,
        alt: "SkillSync Logo",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "SkillSync - AI-Powered Skill Tracking",
    description:
      "Transform your documents into valuable skills with AI-powered analysis. Track your professional development effortlessly.",
    images: ["/logo.png"],
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
        <Analytics />
      </body>
    </html>
  )
}
