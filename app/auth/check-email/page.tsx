import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, Sparkles } from "lucide-react"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"

export default function CheckEmailPage() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <Sparkles className="size-6 text-primary" />
            <span className="text-xl font-bold">SkillSync</span>
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <div className="flex flex-1 items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
          <div className="flex flex-col gap-6">
            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-primary/10">
                  <Mail className="size-6 text-primary" />
                </div>
                <CardTitle className="text-2xl">Check your email</CardTitle>
                <CardDescription>We sent you a confirmation link</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center text-sm text-muted-foreground">
                  Please check your email and click the confirmation link to activate your account. After confirming,
                  you can sign in to SkillSync.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
