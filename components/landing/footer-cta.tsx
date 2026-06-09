import Image from "next/image"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"

export function FooterCta() {
  return (
    <section className="px-4 sm:px-8 lg:px-12 pt-8 sm:pt-12">
      <div className="mx-auto max-w-[1440px]">
        <div className="relative overflow-hidden rounded-[28px] sm:rounded-[40px] bg-ink text-ink-foreground px-6 sm:px-12 lg:px-16 py-20 sm:py-28 min-h-[420px] sm:min-h-[520px] flex items-center">
          {/* background image */}
          <Image
            src="/images/cta/cta.jpeg"
            alt=""
            fill
            sizes="(min-width: 1440px) 1440px, 100vw"
            className="absolute inset-0 object-cover"
          />
          {/* dark scrim — keeps the left-side text legible */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/20" />

          <div className="relative z-10 w-full flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="max-w-3xl space-y-5">
              <h2 className="font-jakarta font-bold tracking-[-0.03em] leading-[1.02] text-4xl sm:text-5xl xl:text-[4rem]">
                Ready To <span className="text-[#0190fe]">Prove</span> What You&rsquo;ve <span className="text-[#0190fe]">Learned</span>?
              </h2>
              <p className="text-base sm:text-lg text-ink-foreground/70 leading-relaxed max-w-xl">
                Turn your coursework into a ranked, evidence-backed skill map in
                minutes. Upload what you&rsquo;ve already done, see exactly where
                you stand against your target career, and know precisely what to
                learn next.
              </p>
            </div>
            <Link href="/auth/register" className="pill pill-lime shrink-0">
              Get Started
              <span className="inline-flex items-center justify-center size-6 rounded-full bg-lime-foreground text-lime">
                <ArrowUpRight className="size-4" />
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
