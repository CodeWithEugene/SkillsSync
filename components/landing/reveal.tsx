"use client"

import { useEffect, useRef, useState } from "react"

type Phase = "below" | "in" | "above"

/**
 * Wraps a section and gives it a reversible 3-D scroll effect on desktop:
 * the section tilts away (rotateX) + lifts + fades while it's outside the
 * viewport, and settles flat as it scrolls into the central band. Scrolling
 * back up reverses the animation. Disabled on mobile and for users who
 * prefer reduced motion (the content simply stays flat and visible).
 */
export function Reveal({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  // Default visible so SSR / no-JS / mobile render normally.
  const [phase, setPhase] = useState<Phase>("in")
  const [active, setActive] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const desktop = window.matchMedia("(min-width: 1024px)")
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)")
    if (!desktop.matches || reduce.matches) return

    setActive(true)

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setPhase("in")
        } else {
          setPhase(entry.boundingClientRect.top > 0 ? "below" : "above")
        }
      },
      { threshold: 0, rootMargin: "-12% 0px -12% 0px" },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const transform =
    !active || phase === "in"
      ? "none"
      : phase === "below"
        ? "perspective(1200px) rotateX(7deg) translateY(60px) scale(0.96)"
        : "perspective(1200px) rotateX(-7deg) translateY(-60px) scale(0.96)"

  return (
    <div
      ref={ref}
      style={{
        transform,
        opacity: active && phase !== "in" ? 0 : 1,
        transition: active
          ? "transform 700ms cubic-bezier(0.22,1,0.36,1), opacity 700ms ease"
          : undefined,
        transformOrigin: "center",
      }}
    >
      {children}
    </div>
  )
}
