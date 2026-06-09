"use client"

import { useEffect, useState } from "react"
import { ArrowLeft, ArrowRight, Quote } from "lucide-react"

const TESTIMONIALS = [
  {
    quote:
      "I had three years of assignments and no idea how to put them on a CV. SkillSync read them in minutes and showed me I was already 80% of the way to a data analyst role — and exactly which two skills to learn next. I got the interview.",
    name: "Aisha Mwangi",
    role: "BSc Statistics graduate, Nairobi",
  },
  {
    quote:
      "It stopped me guessing. Instead of an opinion, I got my own work measured against what the job actually requires. The evidence it quoted from my own projects is what I took into the interview room.",
    name: "Brian Kiptoo",
    role: "Computer Science finalist, JKUAT",
  },
  {
    quote:
      "As a careers office, we finally have an objective, O*NET-backed way to show students where they stand. It turns a vague degree into a concrete, defensible skill map.",
    name: "Dr. Otieno A.",
    role: "Career Services, partner university",
  },
]

export function Testimonial() {
  const [i, setI] = useState(0)
  const t = TESTIMONIALS[i]
  const go = (d: number) =>
    setI((p) => (p + d + TESTIMONIALS.length) % TESTIMONIALS.length)

  // Auto-advance every 2s; the [i] dependency resets the timer after manual nav too.
  useEffect(() => {
    const id = setInterval(() => {
      setI((p) => (p + 1) % TESTIMONIALS.length)
    }, 2000)
    return () => clearInterval(id)
  }, [i])

  return (
    <section className="border-b border-border/60">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-8 lg:px-12 py-16 sm:py-24">
        <div className="text-center">
          <Quote className="mx-auto size-9 sm:size-11 text-lime fill-lime" />
          <blockquote className="mt-6 flex items-center justify-center min-h-[260px] sm:min-h-[230px] xl:min-h-[210px] font-jakarta font-medium tracking-[-0.01em] text-2xl sm:text-3xl xl:text-[2.5rem] leading-[1.25]">
            <span>&ldquo;{t.quote}&rdquo;</span>
          </blockquote>
        </div>

        <div className="mt-10 flex flex-col items-center gap-6 text-center">
          <div>
            <p className="font-jakarta font-bold text-lg">{t.name}</p>
            <p className="text-sm text-landing-muted">{t.role}</p>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            <span className="font-mono text-sm font-semibold text-landing-muted tabular-nums">
              {String(i + 1).padStart(2, "0")}/{String(TESTIMONIALS.length).padStart(2, "0")}
            </span>
            <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Previous testimonial"
              onClick={() => go(-1)}
              className="inline-flex items-center justify-center size-12 rounded-full border border-border text-foreground hover:bg-[#0190fe] hover:text-white transition-colors"
            >
              <ArrowLeft className="size-5" />
            </button>
            <button
              type="button"
              aria-label="Next testimonial"
              onClick={() => go(1)}
              className="inline-flex items-center justify-center size-12 rounded-full bg-[#0190fe] text-white hover:bg-[#017fe0] transition-colors"
            >
              <ArrowRight className="size-5" />
            </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
