import Link from "next/link"
import { ArrowUpRight, Upload, ScanText, Target } from "lucide-react"

const STEPS = [
  {
    k: "01",
    icon: Upload,
    title: "Upload",
    body:
      "Drop your notes, assignments, projects or a transcript. Plain text, .doc or .docx — no PDF gymnastics.",
  },
  {
    k: "02",
    icon: ScanText,
    title: "Extract",
    body:
      "We pull the skills, technologies and competencies you've already demonstrated, with evidence quoted from the source.",
  },
  {
    k: "03",
    icon: Target,
    title: "Benchmark",
    body:
      "Pick your target career and see what you have, what you lack, and exactly what to learn next.",
  },
]

export function ServicesGrid() {
  return (
    <section id="services" className="border-t border-border/60">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-8 lg:px-12 py-16 sm:py-24">
        <div className="flex flex-col lg:flex-row lg:items-end gap-6 sm:gap-10 mb-10 sm:mb-14">
          <h2 className="flex-1 font-jakarta font-bold tracking-[-0.03em] leading-[1.06] text-3xl sm:text-4xl xl:text-5xl">
            The <span className="text-[#0190fe]">Skill Map</span> That Turns Your Degree Into <span className="text-[#0190fe]">Interviews</span> &amp; <span className="text-[#0190fe]">Offers</span>.
          </h2>
          <p className="lg:flex-1 lg:max-w-xs text-sm sm:text-base text-landing-muted leading-relaxed">
            Three steps take you from a folder of coursework to a ranked,
            evidence-backed view of where you stand against your target career.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-5 sm:gap-6">
          {STEPS.map((s) => {
            const Icon = s.icon
            return (
              <article
                key={s.k}
                className="group rounded-[20px] bg-[#007AFF] text-white p-7 sm:p-8 flex flex-col min-h-[260px] transition-colors duration-300 hover:bg-black"
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center justify-center size-12 rounded-full bg-white/15 text-white">
                    <Icon className="size-6" strokeWidth={2} />
                  </span>
                  <span className="font-mono text-sm font-semibold text-white/70 tabular-nums">
                    {s.k}
                  </span>
                </div>
                <h3 className="mt-7 font-jakarta font-bold text-2xl tracking-[-0.02em]">
                  {s.title}
                </h3>
                <p className="mt-3 text-sm text-white/80 leading-relaxed flex-1">
                  {s.body}
                </p>
              </article>
            )
          })}
        </div>

        <div className="mt-10 sm:mt-14 flex justify-center">
          <Link href="/auth/register" className="pill pill-ink">
            See More
            <ArrowUpRight className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
