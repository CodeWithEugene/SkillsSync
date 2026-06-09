"use client"

import { Play, Plus, X } from "lucide-react"
import { useState, useEffect, useCallback } from "react"

const YT_ID = "NbTDpeZw97I"
const YT_THUMB = `https://img.youtube.com/vi/${YT_ID}/maxresdefault.jpg`

export function ServicesIntro() {
  const [open, setOpen] = useState(false)

  const close = useCallback(() => setOpen(false), [])

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") close() }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [open, close])

  return (
    <>
      <section id="how-it-works" className="border-b border-border/60">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-8 lg:px-12 py-14 sm:py-20">
          {/* ── Header ─────────────────────────────────── */}
          <div className="grid lg:grid-cols-12 gap-6 lg:gap-10 mb-10 sm:mb-14">
            <h2 className="lg:col-span-7 font-jakarta font-bold tracking-[-0.03em] leading-[1.05] text-3xl sm:text-5xl xl:text-[3.5rem]">
              Built On <span className="text-[#0190fe]">Real Labor-Market Data</span>, Not An <span className="text-[#0190fe]">AI&rsquo;s Opinion</span>.
            </h2>
            <p className="lg:col-span-4 lg:col-start-9 self-start text-base sm:text-[1.05rem] text-landing-muted leading-relaxed">
              We benchmark the skills in your coursework against the U.S. Department
              of Labor&rsquo;s O*NET taxonomy — the same database universities and
              agencies trust — so your results reflect real hiring requirements,
              not guesswork.
            </p>
          </div>

          {/* ── Two cards ───────────────────────────────── */}
          <div className="grid lg:grid-cols-12 gap-5 sm:gap-6 items-stretch">
            {/* Left — dark stat card */}
            <div className="lg:col-span-4 relative overflow-hidden rounded-[30px] bg-ink text-ink-foreground p-8 sm:p-9 flex flex-col min-h-[340px] sm:min-h-[382px]">
              <img
                src="/images/service-intro/students-skills-bg.jpeg"
                alt=""
                className="absolute inset-0 size-full object-cover"
              />
              <div
                aria-hidden
                className="absolute inset-0 pointer-events-none opacity-60 z-10"
                style={{
                  background:
                    "radial-gradient(120% 90% at 85% 15%, rgba(255,255,255,0.12), transparent 55%)",
                }}
              />
              <div className="relative z-20 mt-auto flex items-center justify-between gap-4">
                <div className="flex items-center shrink-0">
                  <div className="flex items-center">
                    {[0, 1, 2, 3].map((i) => (
                      <img
                        key={i}
                        src={`/images/avatars/student-${i}.jpeg`}
                        alt=""
                        className="size-8 sm:size-10 rounded-full ring-2 ring-black/30 object-cover -ml-2 first:ml-0"
                      />
                    ))}
                  </div>
                  <Plus className="size-5 sm:size-6 ml-2 text-white/80" strokeWidth={2.5} />
                </div>

                <div className="flex flex-col items-end">
                  <div className="flex items-start leading-none">
                    <span className="font-jakarta font-bold tracking-[-0.03em] tabular-nums text-3xl sm:text-4xl xl:text-[3rem] text-white">
                      1,000
                    </span>
                    <span className="font-jakarta font-bold text-2xl sm:text-3xl text-lime ml-1">
                      +
                    </span>
                  </div>
                  <p className="mt-1 text-xs sm:text-sm text-white/70 max-w-[180px] text-right">
                    Skills extracted from real student work
                  </p>
                </div>
              </div>
            </div>

            {/* Right — video placeholder */}
            <div className="lg:col-span-8 relative rounded-[30px] bg-[#c7c8ca] dark:bg-[#26262b] min-h-[300px] sm:min-h-[382px] flex items-center justify-center px-8 group cursor-pointer w-full">
              {/* Image clipped to rounded corners */}
              <div className="absolute inset-0 overflow-hidden rounded-[30px]">
                <img
                  src={YT_THUMB}
                  alt=""
                  className="absolute inset-0 size-full object-cover"
                />
                <div className="absolute inset-0 bg-black/25 dark:bg-black/45" />
              </div>

              {/* Full-card click target */}
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="absolute inset-0 z-10"
                aria-label="Play video: How SkillSync works"
              />

              {/* Play button — lime circle inside a white ring, overflowing the corner */}
              <button
                type="button"
                onClick={() => setOpen(true)}
                aria-label="Watch how SkillSync works"
                className="group absolute -bottom-5 right-6 sm:bottom-6 sm:right-0 sm:translate-x-1/3 rounded-full bg-background p-2.5 sm:p-3 shadow-lg z-20"
              >
                <span className="flex items-center justify-center size-16 sm:size-24 rounded-full bg-lime text-lime-foreground transition-transform group-hover:scale-105">
                  <Play className="size-6 sm:size-8 fill-current ml-0.5" />
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Overlay / modal ─────────────────────────────── */}
      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-label="Video"
        >
          <div
            className="relative w-full max-w-4xl aspect-video rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <iframe
              src={`https://www.youtube.com/embed/${YT_ID}?autoplay=1&rel=0`}
              title="How SkillSync works"
              allow="autoplay; encrypted-media"
              allowFullScreen
              className="size-full"
            />
            <button
              type="button"
              onClick={close}
              className="absolute top-3 right-3 size-9 flex items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
              aria-label="Close video"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
