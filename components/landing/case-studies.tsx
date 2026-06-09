"use client"

import { useEffect, useRef } from "react"
import Image from "next/image"

type Field = "Software Dev" | "Data Science" | "Engineering"

type CaseStudy = {
  field: Field
  program: string
  student: string
  target: string
  match: number
  image?: string
}

const CASES: CaseStudy[] = [
  {
    field: "Software Dev",
    program: "BSc Computer Science · 2024",
    student: "Brian K.",
    target: "Software Developer",
    match: 82,
    image: "/images/case-studies/software-development.jpg",
  },
  {
    field: "Data Science",
    program: "BSc Statistics · 2023",
    student: "Aisha M.",
    target: "Data Scientist",
    match: 76,
    image: "/images/case-studies/data-science.jpg",
  },
  {
    field: "Engineering",
    program: "BEng Civil · 2024",
    student: "Wanjiru N.",
    target: "Civil Engineer",
    match: 88,
    image: "/images/case-studies/civil-engineering.jpg",
  },
  {
    field: "Software Dev",
    program: "Diploma in IT · 2024",
    student: "Kofi A.",
    target: "Web Developer",
    match: 71,
    image: "/images/case-studies/web-development.jpg",
  },
]

export function CaseStudies() {
  const sectionRef = useRef<HTMLElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    const track = trackRef.current
    if (!section || !track) return

    // Respect users who prefer reduced motion.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    let frame = 0

    const update = () => {
      frame = 0
      const maxScroll = track.scrollWidth - track.clientWidth
      if (maxScroll <= 0) return

      const rect = section.getBoundingClientRect()
      const vh = window.innerHeight
      // Progress 0 as the section's top reaches the viewport bottom,
      // 1 as the section's bottom reaches the viewport top.
      const total = rect.height + vh
      const progress = Math.min(Math.max((vh - rect.top) / total, 0), 1)

      track.scrollLeft = progress * maxScroll
    }

    const onScroll = () => {
      if (frame) return
      frame = requestAnimationFrame(update)
    }

    update()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    return () => {
      if (frame) cancelAnimationFrame(frame)
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
    }
  }, [])

  return (
    <section ref={sectionRef} id="outcomes" className="bg-black text-ink-foreground">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-8 lg:px-12 py-16 sm:py-24">
        <h2 className="font-jakarta font-bold tracking-[-0.03em] leading-[1.08] text-center text-3xl sm:text-4xl xl:text-5xl max-w-4xl mx-auto">
          <span className="text-[#0190fe]">Real Coursework</span>, Turned Into <span className="text-[#0190fe]">Career Evidence</span>.
        </h2>

        {/* Horizontal row: circle CTA + project cards (bleeds to the right) */}
        <div className="mt-10 sm:mt-12 -mr-4 sm:-mr-8 lg:-mr-12">
          <div
            ref={trackRef}
            className="flex gap-5 sm:gap-6 overflow-x-auto pb-2 pr-4 sm:pr-8 lg:pr-12 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          >
            {/* Skill meter circle */}
            <div className="relative shrink-0 size-[300px] sm:size-[380px] lg:size-[420px] overflow-hidden rounded-full bg-[#c3c4c6]">
              <Image
                src="/images/case-studies/circle.jpg"
                alt="Skill readiness meter"
                fill
                sizes="(min-width: 1024px) 420px, (min-width: 640px) 380px, 300px"
                className="absolute inset-0 object-cover"
              />
            </div>

            {/* Project cards */}
            {CASES.map((c) => (
              <article
                key={c.student + c.target}
                className="group relative shrink-0 overflow-hidden rounded-[30px] w-[280px] sm:w-[360px] lg:w-[420px] h-[300px] sm:h-[380px] lg:h-[420px] bg-gradient-to-br from-[#e4e5e7] to-[#c3c4c6]"
              >
                {/* background image */}
                {c.image && (
                  <Image
                    src={c.image}
                    alt={`${c.student} — ${c.target}`}
                    fill
                    sizes="(min-width: 1024px) 420px, (min-width: 640px) 360px, 280px"
                    className="absolute inset-0 object-cover"
                  />
                )}

                {/* match chip */}
                <span className="absolute top-5 left-5 z-10 inline-flex items-center rounded-full bg-lime px-3 py-1 text-xs font-bold text-lime-foreground tabular-nums">
                  {c.match}% match
                </span>
                {/* program label */}
                <span className="absolute top-6 right-6 z-10 text-sm font-medium text-[#020609]/55 text-right max-w-[55%]">
                  {c.program}
                </span>

                {/* bottom scrim + title */}
                <div className="absolute inset-x-0 bottom-0 p-6 sm:p-7 pt-24 bg-gradient-to-t from-[#007AFF]/85 via-[#007AFF]/25 to-transparent">
                  <h3 className="font-jakarta font-semibold text-2xl sm:text-[1.7rem] text-black tracking-[-0.02em] leading-tight">
                    {c.student}
                  </h3>
                  <p className="mt-1 text-sm text-black/80">→ {c.target}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
