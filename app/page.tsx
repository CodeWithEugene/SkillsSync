import { Button } from "@/components/ui/button"
import { ArrowUpRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
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
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* ── Masthead ───────────────────────────────────────────────────── */}
      <header className="border-b border-border">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/logo.png" alt="SkillSync" width={120} height={120} className="h-7 w-auto" />
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="sm" asChild>
              <Link href="/auth/login">Sign in</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/auth/register" className="gap-1.5">
                Get started
                <ArrowUpRight className="size-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <main className="flex-1">
        <section className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12 pt-12 sm:pt-20 lg:pt-28 pb-16 sm:pb-24">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-end">
            <div className="lg:col-span-8 space-y-7">
              <p className="editorial-eyebrow">Issue 01 — A new contract for graduate skills</p>

              <h1 className="display-serif text-5xl sm:text-6xl lg:text-7xl xl:text-[5.5rem] leading-[0.92] tracking-tight">
                Turn coursework
                <br />
                into{" "}
                <span className="italic font-light text-primary">verifiable</span>
                <br className="hidden sm:block" />
                career evidence.
              </h1>

              <p className="text-base sm:text-lg text-muted-foreground max-w-xl leading-relaxed">
                SkillSync reads the documents you already produce — notes, assignments,
                projects — and benchmarks the skills inside them against the real-world
                requirements of the career you&rsquo;re aiming for. Built at JKUAT, made for
                the African graduate.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button size="lg" asChild>
                  <Link href="/auth/register" className="gap-2">
                    Start free
                    <ArrowUpRight className="size-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/auth/login">I have an account</Link>
                </Button>
              </div>
            </div>

            {/* Asymmetric stat column — paper-block aside */}
            <aside className="lg:col-span-4 lg:pl-8 lg:border-l lg:border-border space-y-8">
              {[
                { n: "1,500", label: "Students piloted at JKUAT", k: "01" },
                { n: "8,400", label: "Documents analysed", k: "02" },
                { n: "1,016", label: "Careers mapped via O*NET", k: "03" },
              ].map((s) => (
                <div key={s.k} className="space-y-1">
                  <p className="font-mono text-[10px] tracking-widest text-muted-foreground">
                    {s.k}
                  </p>
                  <p
                    className="display-serif text-5xl tabular-nums leading-none"
                    style={{ fontVariationSettings: '"opsz" 144, "SOFT" 25' }}
                  >
                    {s.n}
                  </p>
                  <p className="text-xs text-muted-foreground pt-1">{s.label}</p>
                </div>
              ))}
            </aside>
          </div>
        </section>

        {/* ── How it works — three numbered editorial blocks ───────────── */}
        <section className="border-t border-border">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12 py-16 sm:py-24">
            <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 mb-12 sm:mb-16">
              <div className="lg:col-span-4">
                <p className="editorial-eyebrow mb-3">Method</p>
                <h2 className="display-serif text-3xl sm:text-4xl leading-tight tracking-tight">
                  Three steps,
                  <br />
                  no guesswork.
                </h2>
              </div>
              <p className="lg:col-span-7 lg:col-start-6 text-base text-muted-foreground leading-relaxed">
                We don&rsquo;t score you against an AI&rsquo;s opinion of what your career
                needs. Required skills come from the U.S. Department of Labor&rsquo;s O*NET
                taxonomy — the same one universities and government agencies use.
              </p>
            </div>

            <div className="grid sm:grid-cols-3 gap-px bg-border border border-border">
              {[
                {
                  k: "01",
                  title: "Upload.",
                  body:
                    "Drop your notes, assignments, projects, or a transcript. Plain text, .doc, or .docx — no PDF gymnastics.",
                },
                {
                  k: "02",
                  title: "Extract.",
                  body:
                    "We pull the skills, technologies, and competencies you&rsquo;ve already demonstrated, with evidence quoted from the source.",
                },
                {
                  k: "03",
                  title: "Benchmark.",
                  body:
                    "Pick your target career — Software Developer, Data Scientist, Civil Engineer — and see what you have, what you lack, what to learn next.",
                },
              ].map((s) => (
                <div key={s.k} className="bg-background p-6 sm:p-8 space-y-3">
                  <p className="font-mono text-xs tracking-widest text-primary">{s.k}</p>
                  <h3 className="display-serif text-2xl sm:text-3xl leading-tight tracking-tight">
                    {s.title}
                  </h3>
                  <p
                    className="text-sm text-muted-foreground leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: s.body }}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Closing call — wide editorial pull ───────────────────────── */}
        <section className="border-t border-border bg-card">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12 py-16 sm:py-20 grid lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-3">
              <p className="editorial-eyebrow">For students • For institutions • SDG 4 / 8 / 9</p>
              <p className="display-serif text-3xl sm:text-4xl lg:text-5xl leading-[1.05] tracking-tight">
                Stop wondering if your degree is{" "}
                <span className="italic font-light text-primary">working</span>.
                Start measuring it.
              </p>
            </div>
            <div className="lg:col-span-4 lg:flex lg:justify-end">
              <Button size="lg" asChild>
                <Link href="/auth/register" className="gap-2">
                  Create your profile
                  <ArrowUpRight className="size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* ── Colophon ───────────────────────────────────────────────────── */}
      <footer className="border-t border-border">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <p className="font-mono tracking-wider">
            © {currentYear} SkillSync &nbsp;·&nbsp; JKUAT, Kenya
          </p>
          <p>
            A{" "}
            <a
              href="https://codewitheugene.top/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground underline decoration-border hover:decoration-primary underline-offset-4"
            >
              CodeWithEugene
            </a>{" "}
            project.
          </p>
        </div>
      </footer>
    </div>
  )
}
