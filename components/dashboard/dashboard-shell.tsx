"use client"

import type React from "react"
import { useState } from "react"
import { MobileNav } from "@/components/dashboard/mobile-nav"
import { LogoutButton } from "@/components/auth/logout-button"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  LayoutDashboard,
  FileText,
  Lightbulb,
  User,
  ChevronLeft,
  ChevronRight,
  Target,
  Map,
  BarChart2,
  BookOpen,
  Briefcase,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"

type NavItem = { href: string; label: string; icon: typeof LayoutDashboard; group: string }

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, group: "Today" },
  { href: "/roadmap", label: "Roadmap", icon: Map, group: "Today" },
  { href: "/goals", label: "Goals", icon: Target, group: "Today" },

  { href: "/documents", label: "Documents", icon: FileText, group: "Library" },
  { href: "/skills", label: "Skills", icon: Lightbulb, group: "Library" },
  { href: "/courses", label: "Courses", icon: BookOpen, group: "Library" },

  { href: "/insights", label: "Insights", icon: BarChart2, group: "Analysis" },
  { href: "/compare", label: "Job Match", icon: Briefcase, group: "Analysis" },

  { href: "/profile", label: "Profile", icon: User, group: "Account" },
]

interface DashboardShellProps {
  children: React.ReactNode
  user: any
  firstName: string
}

export function DashboardShell({ children, user: _user, firstName: _firstName }: DashboardShellProps) {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()

  const groupedNav = navItems.reduce<Record<string, NavItem[]>>((acc, it) => {
    if (!acc[it.group]) acc[it.group] = []
    acc[it.group].push(it)
    return acc
  }, {})

  return (
    <div className="flex min-h-screen bg-background">
      <aside
        className={`hidden md:flex md:flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-300 ease-out sticky top-0 h-screen ${
          collapsed ? "w-[72px]" : "w-[244px]"
        }`}
      >
        <div className="flex items-center justify-between border-b border-sidebar-border px-4 h-16">
          <Link href="/dashboard" className="flex items-center min-w-0 flex-1">
            {collapsed ? (
              <Image src="/favicon.svg" alt="SkillSync" width={32} height={32} className="shrink-0" />
            ) : (
              <Image
                src="/logo.png"
                alt="SkillSync"
                width={595}
                height={118}
                priority
                className="h-9 w-auto max-w-[210px] object-contain object-left"
              />
            )}
          </Link>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="shrink-0"
          >
            {collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
          </Button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 scrollbar-primary">
          {Object.entries(groupedNav).map(([group, items], gi) => (
            <div key={group} className={gi === 0 ? "" : "mt-6"}>
              {!collapsed && (
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground/80 px-2 mb-2">
                  {group}
                </p>
              )}
              <ul className="space-y-0.5">
                {items.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`relative flex items-center gap-3 rounded-md px-2.5 py-2 text-sm transition-colors ${
                          isActive
                            ? "bg-sidebar-accent text-foreground"
                            : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
                        } ${collapsed ? "justify-center px-2" : ""}`}
                      >
                        {isActive && (
                          <span
                            aria-hidden
                            className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r bg-primary"
                          />
                        )}
                        <Icon className={`size-4 shrink-0 ${isActive ? "text-primary" : ""}`} />
                        {!collapsed && <span className="font-medium">{item.label}</span>}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="border-t border-sidebar-border p-3 space-y-1">
          {!collapsed ? (
            <>
              <div className="flex items-center justify-between px-2 py-1">
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  Theme
                </span>
                <ThemeToggle />
              </div>
              <LogoutButton />
            </>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <ThemeToggle />
            </div>
          )}
        </div>
      </aside>

      <div className="flex flex-1 flex-col min-w-0">
        <header className="flex items-center justify-between border-b border-border bg-background px-5 h-14 md:hidden">
          <Link href="/dashboard" className="flex items-center">
            <Image src="/logo.png" alt="SkillSync" width={595} height={118} priority className="h-9 w-auto max-w-[200px] object-contain object-left" />
          </Link>
          <div className="flex items-center gap-1.5">
            <ThemeToggle />
            <MobileNav />
          </div>
        </header>

        <main className="flex-1 px-5 sm:px-8 lg:px-10 py-6 sm:py-10 max-w-screen-2xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
