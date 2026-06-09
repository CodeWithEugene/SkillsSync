"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Minus, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

const FAQS = [
  {
    q: "How does SkillSync know what skills I have?",
    a: "You upload the documents you already produce — notes, assignments, projects, a transcript. SkillSync reads them and extracts the skills, technologies and competencies you've demonstrated, quoting the exact evidence from your own work so nothing is invented.",
  },
  {
    q: "Where do the 'required skills' come from?",
    a: "From the U.S. Department of Labor's O*NET taxonomy — the same occupational database universities and government agencies rely on. You're measured against real labor-market requirements, not an AI's guess about your field.",
  },
  {
    q: "What file types can I upload?",
    a: "Plain text, .doc and .docx work out of the box — no PDF gymnastics required. Drop in coursework, lab reports, project write-ups or a transcript and SkillSync handles the rest.",
  },
  {
    q: "How long does an analysis take?",
    a: "Most documents are read and benchmarked in under a minute. You get a ranked skill map showing what you already have, what you're missing for your target career, and what to learn next.",
  },
  {
    q: "Is my data private?",
    a: "Your documents are yours. They're used only to generate your own skill analysis, and you stay in control of what you upload and keep.",
  },
  {
    q: "Which careers can I target?",
    a: "Any occupation in the O*NET taxonomy — from software developer and data scientist to civil engineer and beyond. Pick a target role and SkillSync benchmarks your coursework against its real-world skill requirements.",
  },
]

export function Faq() {
  const [open, setOpen] = useState(0)

  return (
    <section id="faq" className="relative overflow-hidden py-12 sm:py-20">
      {/* background image — sits behind the card */}
      <Image
        src="/images/faq/faq-bg.jpeg"
        alt=""
        fill
        sizes="100vw"
        className="absolute inset-0 object-cover"
      />

      <div className="relative z-10 mx-auto max-w-[1440px] px-4 sm:px-8 lg:px-12">
        <div className="rounded-[24px] sm:rounded-[32px] bg-card border border-border/60 px-5 sm:px-10 lg:px-14 py-12 sm:py-16">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
            {/* Left */}
            <div className="lg:max-w-sm text-center lg:text-left">
              <h2 className="font-jakarta font-bold tracking-[-0.03em] leading-[1.05] text-3xl sm:text-4xl xl:text-5xl">
                SkillSync <span className="text-[#0190fe]">FAQs</span>
              </h2>
              <p className="mt-5 text-sm sm:text-base text-landing-muted leading-relaxed">
                Everything you need to know about turning your coursework into
                verifiable, career-ready evidence. Still curious? We&rsquo;re happy
                to help.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-5">
                <Link href="/auth/register" className="pill pill-outline !py-3 !px-6 text-sm">
                  More Questions
                </Link>
                <Link
                  href="mailto:hello@skillssync.xyz"
                  className="text-sm font-semibold text-foreground underline underline-offset-4 decoration-border hover:decoration-foreground"
                >
                  Contact Us
                </Link>
              </div>

              <div className="mt-10 relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-black">
                <Image
                  src="/images/faq/faq.jpeg"
                  alt="Frequently asked questions"
                  fill
                  sizes="(min-width: 1024px) 384px, 100vw"
                  className="object-cover"
                />
              </div>
            </div>

            {/* Right — accordion */}
            <div>
              {FAQS.map((item, idx) => {
                const isOpen = open === idx
                return (
                  <div key={item.q} className="border-b border-border first:border-t">
                    <button
                      type="button"
                      onClick={() => setOpen(isOpen ? -1 : idx)}
                      aria-expanded={isOpen}
                      className="w-full flex items-start justify-between gap-6 py-5 text-left"
                    >
                      <span className="font-jakarta font-semibold text-base sm:text-lg leading-snug">
                        {item.q}
                      </span>
                      <span className="shrink-0 mt-0.5 text-foreground">
                        {isOpen ? <Minus className="size-5" /> : <Plus className="size-5" />}
                      </span>
                    </button>
                    <div
                      className={cn(
                        "grid transition-all duration-300 ease-out",
                        isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                      )}
                    >
                      <div className="overflow-hidden">
                        <p className="pb-6 pr-8 text-sm text-landing-muted leading-relaxed">
                          {item.a}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
