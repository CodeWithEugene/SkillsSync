import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { TrustedBy } from "@/components/landing/trusted-by"

export function Hero() {
  return (
    <section className="border-b border-border/60 flex flex-col justify-center lg:min-h-[calc(100svh-76px)] py-10 sm:py-12">
      <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-8 lg:px-12">
        <div className="w-full grid lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
          {/* ── Copy ─────────────────────────────────────────────── */}
          <div className="lg:col-span-6 xl:col-span-7 space-y-7 min-w-0 text-center lg:text-left">
            <h1 className="font-jakarta font-bold tracking-[-0.03em] leading-[1.02] text-[2.6rem] sm:text-6xl xl:text-[4.5rem]">
              Turn Your Coursework Into{" "}
              <span className="relative whitespace-nowrap text-lime">
                Career-Ready
              </span>{" "}
              Proof.
            </h1>

            <p className="text-base sm:text-lg text-landing-muted max-w-xl mx-auto lg:mx-0 leading-relaxed">
              SkillSync reads the notes, assignments and projects you already
              produce — then benchmarks the skills inside them against the
              real-world requirements of the career you&rsquo;re aiming for.
              Built at JKUAT, made for the African graduate.
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-5 pt-1">
              <Link href="/auth/register" className="pill pill-ink">
                Start Free
                <span className="inline-flex items-center justify-center size-6 rounded-full bg-white/20 text-white">
                  <ArrowUpRight className="size-4" />
                </span>
              </Link>
              <Link
                href="#how-it-works"
                className="text-sm font-semibold text-foreground underline underline-offset-4 decoration-border hover:decoration-foreground px-2"
              >
                See How It Works
              </Link>
            </div>
          </div>

          {/* ── Card cluster ─────────────────────────────────────── */}
          <div className="lg:col-span-6 xl:col-span-5 min-w-0 flex flex-col gap-4 sm:gap-5 h-full">
            <div className="grid grid-cols-5 gap-4 sm:gap-5">
              {/* Stat card */}
              <div className="col-span-3 rounded-[20px] rounded-tl-[80px] bg-[#0190fe] text-white p-6 sm:p-7 flex flex-col justify-end min-h-[200px]">
                <p className="font-jakarta font-bold text-5xl sm:text-6xl tracking-[-0.03em] tabular-nums">
                  230+
                </p>
                <p className="mt-3 text-sm text-white/70 leading-snug">
                  career paths benchmarked from the U.S. Department of Labor&rsquo;s
                  O*NET taxonomy.
                </p>
              </div>

              {/* Skill Growth card */}
              <div className="col-span-2 relative rounded-[20px] text-white p-5 flex items-start justify-between min-h-[200px] overflow-hidden">
                <img
                  src="/images/hero/skill-growth.jpeg"
                  alt=""
                  className="absolute inset-0 size-full object-cover"
                />
                <span className="font-jakarta font-bold text-lg leading-tight self-end relative z-10">
                  Skill
                  <br />
                  Growth
                </span>
              </div>
            </div>

            {/* Wide chart card — grows to align its bottom with the hero buttons */}
            <div className="flex-1 relative rounded-[20px] bg-ink text-ink-foreground p-6 sm:p-7 flex items-end justify-between gap-6 min-h-[150px]">
              <img
                src="/images/hero/skill-readiness-climb.jpeg"
                alt=""
                className="absolute inset-0 size-full object-cover rounded-[20px]"
              />
              <div className="space-y-3 min-w-0 relative z-10">
                <div className="flex items-center gap-3">
                  <span className="h-px w-8 bg-lime" />
                  <span className="text-xs font-semibold tracking-wide text-ink-muted">
                    Measure your growth
                  </span>
                </div>
                <p className="font-jakarta font-semibold text-xl sm:text-2xl leading-tight tracking-[-0.02em] text-ink-foreground">
                  See Your Skill Readiness Climb.
                </p>
              </div>
              <div className="flex items-end gap-2 shrink-0 relative z-10" aria-hidden>
                {[40, 64, 92].map((h, i) => (
                  <span
                    key={i}
                    className="w-5 sm:w-6 rounded-md bg-lime/90"
                    style={{ height: `${h}px` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 sm:mt-16">
        <TrustedBy />
      </div>
    </section>
  )
}
