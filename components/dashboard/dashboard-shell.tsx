"use client"

import type React from "react"
import { useState } from "react"
import { MobileNav } from "@/components/dashboard/mobile-nav"
import { LogoutButton } from "@/components/auth/logout-button"
import { ThemeToggle } from "@/components/theme-toggle"
import { LayoutDashboard, FileText, Lightbulb, User, ChevronLeft, ChevronRight, Target } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/goals", label: "Goals", icon: Target },
  { href: "/documents", label: "Documents", icon: FileText },
  { href: "/skills", label: "Skills", icon: Lightbulb },
  { href: "/profile", label: "Profile", icon: User },
]

interface DashboardShellProps {
  children: React.ReactNode
  user: any
  firstName: string
}

export function DashboardShell({ children, user, firstName }: DashboardShellProps) {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()

  return (
    <div className="flex min-h-screen bg-background">
      <aside
        className={`hidden md:flex md:flex-col border-r bg-sidebar transition-all duration-300 ease-in-out sticky top-0 h-screen ${collapsed ? "w-20" : "w-64"
          }`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between border-b p-4 h-16">
          <div className="flex items-center gap-2">
            {!collapsed && (
              <Image
                src="/logo.png"
                alt="SkillSync Logo"
                width={160}
                height={160}
                className="rounded-lg"
              />
            )}
            {collapsed && (
              <Image
                src="/logo.png"
                alt="SkillSync Logo"
                width={160}
                height={160}
                className="rounded-lg"
              />
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={() => setCollapsed(!collapsed)} className="size-8 shrink-0">
            {collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all hover:bg-sidebar-accent group ${isActive ? "bg-primary text-primary-foreground" : ""
                    } ${collapsed ? "justify-center" : ""}`}
                >
                  <Icon className={`size-5 ${isActive ? "" : "group-hover:text-primary"}`} />
                  {!collapsed && <span className="font-medium">{item.label}</span>}
                </div>
              </Link>
            )
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="border-t p-3 space-y-2">
          {!collapsed && (
            <>
              <div className="flex items-center justify-between px-3 py-2">
                <span className="text-sm text-muted-foreground">Theme</span>
                <ThemeToggle />
              </div>
              <LogoutButton />
            </>
          )}
          {collapsed && (
            <div className="flex flex-col gap-2 items-center">
              <ThemeToggle />
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        {/* Mobile Header */}
        <header className="flex items-center justify-between border-b bg-background p-4 md:hidden h-16">
          <div className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="SkillSync Logo"
              width={160}
              height={160}
              className="rounded-lg"
            />
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <MobileNav />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
