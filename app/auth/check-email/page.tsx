import { Mail } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { ThemeToggle } from "@/components/theme-toggle"

export default function CheckEmailPage() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <Image src="/logo.png" alt="SkillSync" width={120} height={120} className="h-7 w-auto" />
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <div className="flex flex-1 items-center justify-center px-5 py-16">
        <div className="w-full max-w-md text-center space-y-5">
          <div className="mx-auto inline-flex items-center justify-center size-14 rounded-full border border-border bg-card">
            <Mail className="size-6 text-primary" />
          </div>
          <p className="editorial-eyebrow">Confirm your inbox</p>
          <h1 className="display-serif text-4xl sm:text-5xl leading-[1] tracking-tight">
            Check your <span className="italic font-light text-primary">email</span>.
          </h1>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            We sent a confirmation link. Click it to activate your account, then sign in.
          </p>
          <Link
            href="/auth/login"
            className="inline-block text-sm text-foreground underline decoration-border hover:decoration-primary underline-offset-4"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
