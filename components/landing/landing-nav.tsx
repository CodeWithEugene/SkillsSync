"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowUpRight, ChevronDown, Menu, X } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { cn } from "@/lib/utils"

type NavChild = { label: string; href: string; desc?: string }
type NavItem = { label: string; href?: string; children?: NavChild[] }

const NAV: NavItem[] = [
  {
    label: "Product",
    children: [
      { label: "How it works", href: "#how-it-works", desc: "Upload, extract, benchmark" },
      { label: "Outcomes", href: "#outcomes", desc: "Real coursework → careers" },
      { label: "Services", href: "#services", desc: "Your degree, mapped to roles" },
    ],
  },
  {
    label: "Use Cases",
    children: [
      { label: "For students", href: "/auth/register", desc: "Prove what you've learned" },
      { label: "For institutions", href: "#outcomes", desc: "Objective skill mapping" },
    ],
  },
  {
    label: "Resources",
    children: [
      { label: "FAQ", href: "#faq", desc: "Common questions" },
      { label: "Built on O*NET", href: "#how-it-works", desc: "U.S. Dept. of Labor taxonomy" },
    ],
  },
  { label: "Contact", href: "mailto:hello@skillssync.xyz" },
]

function Dropdown({ item }: { item: NavItem }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false)
    }
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("keydown", onKey)
    document.addEventListener("mousedown", onClick)
    return () => {
      document.removeEventListener("keydown", onKey)
      document.removeEventListener("mousedown", onClick)
    }
  }, [])

  const enter = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    setOpen(true)
  }
  const leave = () => {
    closeTimer.current = setTimeout(() => setOpen(false), 120)
  }

  return (
    <div ref={ref} className="relative" onMouseEnter={enter} onMouseLeave={leave}>
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-sm font-semibold text-foreground/90 hover:text-foreground transition-colors"
      >
        {item.label}
        <ChevronDown
          className={cn("size-4 transition-transform", open && "rotate-180")}
        />
      </button>

      <div
        role="menu"
        className={cn(
          "absolute left-1/2 -translate-x-1/2 top-full pt-3 w-64 transition-all duration-150 origin-top",
          open
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 -translate-y-1 pointer-events-none",
        )}
      >
        <div className="rounded-2xl border border-border bg-card shadow-xl p-2">
          {item.children?.map((c) => (
            <Link
              key={c.label}
              href={c.href}
              role="menuitem"
              onClick={() => setOpen(false)}
              className="block rounded-xl px-3 py-2.5 hover:bg-muted transition-colors"
            >
              <span className="block text-sm font-semibold text-foreground">{c.label}</span>
              {c.desc && (
                <span className="block text-xs text-landing-muted mt-0.5">{c.desc}</span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export function LandingNav() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-background">
      <nav className="mx-auto max-w-[1440px] px-4 sm:px-8 lg:px-12 h-16 sm:h-[76px] flex items-center justify-between gap-6">
        {/* Left: logo + nav */}
        <div className="flex items-center gap-10 xl:gap-14 min-w-0">
          <Link href="/" className="flex items-center shrink-0">
            <Image
              src="/logo.png"
              alt="SkillSync"
              width={595}
              height={118}
              priority
              className="h-7 sm:h-8 w-auto max-w-[150px] sm:max-w-[180px] object-contain object-left"
            />
          </Link>

          <div className="hidden lg:flex items-center gap-7 xl:gap-9">
            {NAV.map((item) =>
              item.children ? (
                <Dropdown key={item.label} item={item} />
              ) : (
                <Link
                  key={item.label}
                  href={item.href ?? "#"}
                  className="text-sm font-semibold text-foreground/90 hover:text-foreground transition-colors"
                >
                  {item.label}
                </Link>
              ),
            )}
          </div>
        </div>

        {/* Right: CTAs */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          <ThemeToggle />
          <Link
            href="/auth/register"
            className="hidden sm:inline-flex items-center rounded-full border border-[#007AFF] bg-[#007AFF] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#0070e0] hover:border-[#0070e0] transition-colors"
          >
            Get Started
          </Link>
          <Link
            href="/auth/login"
            aria-label="Sign in"
            className="hidden sm:inline-flex items-center justify-center size-[42px] rounded-full bg-[#0190fe] text-white hover:bg-[#017fe0] transition-colors"
          >
            <ArrowUpRight className="size-5" />
          </Link>
          <button
            type="button"
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
            className="lg:hidden inline-flex items-center justify-center size-10 rounded-full border border-border text-foreground"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu — slides in from the left */}
      {/* Backdrop */}
      <div
        onClick={() => setOpen(false)}
        aria-hidden
        className={cn(
          "lg:hidden fixed inset-0 z-[60] bg-black/50 transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
      />

      {/* Drawer */}
      <div
        className={cn(
          "lg:hidden fixed inset-y-0 left-0 z-[70] w-[82%] max-w-xs bg-background shadow-2xl flex flex-col transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between px-4 h-16 border-b border-border/60">
          <Link href="/" onClick={() => setOpen(false)} className="flex items-center shrink-0">
            <Image
              src="/logo.png"
              alt="SkillSync"
              width={595}
              height={118}
              className="h-7 w-auto max-w-[150px] object-contain object-left"
            />
          </Link>
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="inline-flex items-center justify-center size-10 rounded-full border border-border text-foreground"
          >
            <X className="size-5" />
          </button>
        </div>

        <ul className="px-4 py-4 flex flex-col gap-1 overflow-y-auto">
          {NAV.flatMap((item) =>
            item.children
              ? item.children.map((c) => ({ label: c.label, href: c.href }))
              : [{ label: item.label, href: item.href ?? "#" }],
          ).map((l) => (
            <li key={l.label + l.href}>
              <Link
                href={l.href}
                onClick={() => setOpen(false)}
                className="block py-2.5 text-sm font-semibold text-foreground"
              >
                {l.label}
              </Link>
            </li>
          ))}
          <li className="pt-2 flex flex-col gap-3">
            <Link
              href="/auth/register"
              onClick={() => setOpen(false)}
              className="text-center rounded-full border border-foreground/90 px-5 py-3 text-sm font-bold"
            >
              Get Started
            </Link>
            <Link
              href="/auth/login"
              onClick={() => setOpen(false)}
              className="text-center rounded-full bg-ink text-ink-foreground px-5 py-3 text-sm font-bold"
            >
              Sign In
            </Link>
          </li>
        </ul>
      </div>
    </header>
  )
}
