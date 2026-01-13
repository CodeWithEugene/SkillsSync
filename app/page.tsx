import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, Sparkles, TrendingUp, Lock } from "lucide-react"
import Link from "next/link"
import { getCurrentUser } from "@/lib/supabase-auth"
import { redirect } from "next/navigation"
import { ThemeToggle } from "@/components/theme-toggle"

export default async function HomePage() {
  const user = await getCurrentUser()
  if (user) {
    redirect("/dashboard")
  }

  const currentYear = new Date().getFullYear()

  return (
    <div className="flex flex-col min-h-screen overflow-hidden">
      <header className="fixed top-0 z-50 w-full border-b bg-background/95 backdrop-blur-sm">
        <div className="container mx-auto flex h-14 items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <Sparkles className="size-5 text-primary" />
            <span className="text-lg font-bold">SkillSync</span>
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button variant="ghost" size="sm" className="hidden sm:inline-flex" asChild>
              <Link href="/auth/login">Sign In</Link>
            </Button>
            <Button size="sm" className="hidden sm:inline-flex" asChild>
              <Link href="/auth/register">Get Started</Link>
            </Button>
            <Button size="sm" className="sm:hidden" asChild>
              <Link href="/auth/register">Start</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col pt-14">
        <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <div className="container mx-auto max-w-7xl">
            {/* Hero Section - Compact */}
            <div className="text-center mb-8 lg:mb-12">
              <h1 className="mb-3 lg:mb-4 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
                Transform Your Documents Into
                <span className="text-primary"> Valuable Skills</span>
              </h1>
              <p className="mx-auto mb-4 lg:mb-6 max-w-2xl text-base lg:text-lg text-muted-foreground">
                SkillSync uses AI to automatically extract and track skills from your coursework, projects, and
                documents. Build your professional profile effortlessly.
              </p>
              <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button size="default" className="w-full sm:w-auto" asChild>
                  <Link href="/auth/register">Get Started Free</Link>
                </Button>
                <Button size="default" variant="outline" className="w-full sm:w-auto bg-transparent" asChild>
                  <Link href="/auth/login">Sign In</Link>
                </Button>
              </div>
            </div>

            {/* Feature Cards - Compact 4-column grid */}
            <div className="grid gap-4 lg:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
              <Card className="bento-card bento-card-primary hover:scale-105 transition-transform duration-200">
                <CardHeader className="p-4 lg:p-6">
                  <div className="rounded-xl bg-primary/10 p-2 w-fit mb-3">
                    <Upload className="size-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Upload Documents</CardTitle>
                  <CardDescription className="text-sm">Drop your coursework, projects, or any document</CardDescription>
                </CardHeader>
              </Card>

              <Card className="bento-card bento-card-accent hover:scale-105 transition-transform duration-200">
                <CardHeader className="p-4 lg:p-6">
                  <div className="rounded-xl bg-accent/10 p-2 w-fit mb-3">
                    <Sparkles className="size-6 text-accent" />
                  </div>
                  <CardTitle className="text-lg">AI Analysis</CardTitle>
                  <CardDescription className="text-sm">
                    Our AI extracts skills and competencies automatically
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="bento-card bento-card-success hover:scale-105 transition-transform duration-200">
                <CardHeader className="p-4 lg:p-6">
                  <div className="rounded-xl bg-success/10 p-2 w-fit mb-3">
                    <TrendingUp className="size-6 text-success" />
                  </div>
                  <CardTitle className="text-lg">Track Progress</CardTitle>
                  <CardDescription className="text-sm">
                    View your skills organized by category and confidence
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="bento-card bento-card-info hover:scale-105 transition-transform duration-200">
                <CardHeader className="p-4 lg:p-6">
                  <div className="rounded-xl bg-info/10 p-2 w-fit mb-3">
                    <Lock className="size-6 text-info" />
                  </div>
                  <CardTitle className="text-lg">Secure & Private</CardTitle>
                  <CardDescription className="text-sm">
                    Your data is encrypted and only accessible by you
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </div>

        <footer className="bg-background py-6 px-4 sm:px-6">
          <div className="container mx-auto max-w-7xl">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
              {/* Left: Copyright with auto-updating year */}
              <div className="order-2 sm:order-1">© {currentYear} SkillSync</div>

              {/* Center: CodeWithEugene Creation */}
              <div className="order-1 sm:order-2">
                A{" "}
                <a
                  href="https://codewitheugene.top/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline font-medium transition-colors"
                >
                  CodeWithEugene
                </a>{" "}
                Creation
              </div>

              {/* Right: Made for you */}
              <div className="order-3">Made for you.</div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}
