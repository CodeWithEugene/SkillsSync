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

  return (
    <div className="min-h-screen">
      <header className="fixed top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl shadow-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <Sparkles className="size-6 text-primary" />
            <span className="text-xl font-bold">SkillSync</span>
          </Link>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Button variant="ghost" asChild>
              <Link href="/auth/login">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/register">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden px-6 pb-24 pt-40 md:pb-32 md:pt-48">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-background -z-10" />
        <div className="container mx-auto max-w-6xl">
          <div className="text-center">
            <h1 className="mb-6 text-balance text-4xl font-bold tracking-tight md:text-6xl">
              Transform Your Documents Into
              <span className="text-primary"> Valuable Skills</span>
            </h1>
            <p className="mx-auto mb-8 max-w-2xl text-balance text-lg text-muted-foreground md:text-xl">
              SkillSync uses AI to automatically extract and track skills from your coursework, projects, and documents.
              Build your professional profile effortlessly.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" asChild>
                <Link href="/auth/register">Get Started Free</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/auth/login">Sign In</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-24">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">How SkillSync Works</h2>
            <p className="mx-auto max-w-2xl text-balance text-muted-foreground">
              Simple, powerful, and intelligent skill tracking in three easy steps
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="bento-card bento-card-primary">
              <CardHeader>
                <div className="rounded-2xl bg-primary/10 p-3 w-fit">
                  <Upload className="size-8 text-primary" />
                </div>
                <CardTitle className="mt-4">Upload Documents</CardTitle>
                <CardDescription>Drop your coursework, projects, or any document</CardDescription>
              </CardHeader>
            </Card>

            <Card className="bento-card bento-card-accent">
              <CardHeader>
                <div className="rounded-2xl bg-accent/10 p-3 w-fit">
                  <Sparkles className="size-8 text-accent" />
                </div>
                <CardTitle className="mt-4">AI Analysis</CardTitle>
                <CardDescription>Our AI extracts skills and competencies automatically</CardDescription>
              </CardHeader>
            </Card>

            <Card className="bento-card bento-card-success">
              <CardHeader>
                <div className="rounded-2xl bg-success/10 p-3 w-fit">
                  <TrendingUp className="size-8 text-success" />
                </div>
                <CardTitle className="mt-4">Track Progress</CardTitle>
                <CardDescription>View your skills organized by category and confidence</CardDescription>
              </CardHeader>
            </Card>

            <Card className="bento-card bento-card-info">
              <CardHeader>
                <div className="rounded-2xl bg-info/10 p-3 w-fit">
                  <Lock className="size-8 text-info" />
                </div>
                <CardTitle className="mt-4">Secure & Private</CardTitle>
                <CardDescription>Your data is encrypted and only accessible by you</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t bg-muted/30 px-6 py-24">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">Ready to Track Your Skills?</h2>
          <p className="mb-8 text-balance text-lg text-muted-foreground">
            Join SkillSync today and let AI help you discover and showcase your abilities
          </p>
          <Button size="lg" asChild>
            <Link href="/auth/register">Create Your Free Account</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
