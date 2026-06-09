import Image from "next/image"

// "Trusted by" logo strip — real university logos (transparent PNGs in /public/logos),
// scrolling infinitely to the left and bleeding to the right margin.
const PARTNERS = [
  { name: "JKUAT", src: "/logos/jkuat.png", w: 743, h: 201 },
  { name: "Strathmore University", src: "/logos/strathmore.png", w: 474, h: 174 },
  { name: "University of Nairobi", src: "/logos/uon.png", w: 242, h: 294 },
  { name: "Moi University", src: "/logos/moi.png", w: 319, h: 312 },
  { name: "USIU-Africa", src: "/logos/usiu.png", w: 193, h: 140 },
]

function Logo({ p }: { p: (typeof PARTNERS)[number] }) {
  return (
    <span
      aria-hidden
      className="shrink-0 px-7 sm:px-9 inline-flex items-center justify-center"
    >
      <span className="inline-flex items-center justify-center">
        <Image
          src={p.src}
          alt={p.name}
          width={p.w}
          height={p.h}
          className="h-9 sm:h-11 w-auto max-w-[150px] object-contain dark:brightness-0 dark:invert"
        />
      </span>
    </span>
  )
}

export function TrustedBy() {
  return (
    <div className="relative z-10">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-8 lg:px-12 flex flex-col sm:flex-row sm:items-center gap-6">
        <p className="shrink-0 max-w-[150px] text-sm font-semibold text-foreground leading-relaxed">
          Trusted By Graduates From Leading Universities
        </p>

        {/* Marquee — bleeds past the right padding to the margin, fades at the far right */}
        <div
          className="marquee-pause relative flex-1 overflow-hidden -mr-4 sm:-mr-8 lg:-mr-12"
          style={{
            maskImage:
              "linear-gradient(to right, transparent 0, #000 4%, #000 92%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to right, transparent 0, #000 4%, #000 92%, transparent 100%)",
          }}
        >
          <div className="flex w-max items-center animate-marquee">
            {/* Four copies: each half of the track (two copies) is wider than the
                viewport, so there's never an empty gap on the right. -50% loops it. */}
            {[...PARTNERS, ...PARTNERS, ...PARTNERS, ...PARTNERS].map((p, i) => (
              <Logo key={`${p.name}-${i}`} p={p} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
