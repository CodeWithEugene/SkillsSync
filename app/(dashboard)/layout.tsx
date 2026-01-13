import type React from "react"
import { requireAuth } from "@/lib/supabase-auth"
import { MobileNav } from "@/components/dashboard/mobile-nav"
import { LogoutButton } from "@/components/auth/logout-button"
import { ThemeToggle } from "@/components/theme-toggle"
import { LayoutDashboard, FileText, Lightbulb, User } from "lucide-react"
import Link from "next/link"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/documents", label: "Documents", icon: FileText },
  { href: "/skills", label: "Skills", icon: Lightbulb },
  { href: "/profile", label: "Profile", icon: User },
]

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAuth()

  const fullName = user.user_metadata?.full_name
  const displayName = fullName ? fullName.split(" ")[0] : user.email

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="hidden w-72 border-r border-border/50 bg-sidebar md:flex md:flex-col">
        {/* Sidebar Header with branding */}
        <div className="border-b border-border/50 p-6">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
              <Lightbulb className="size-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">SkillSync</h1>
              <p className="text-xs text-muted-foreground">AI-Powered Learning</p>
            </div>
          </div>
        </div>

        {/* User Info Card */}
        <div className="border-b border-border/50 p-4">
          <div className="rounded-2xl bg-gradient-to-br from-primary/10 via-accent/5 to-transparent p-4 backdrop-blur-sm border border-primary/20">
            <p className="text-sm font-medium">Welcome back,</p>
            <p className="text-lg font-bold text-primary">{displayName}</p>
            <p className="text-xs text-muted-foreground mt-1">{user.email}</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2 p-4 overflow-y-auto">
          <p className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Navigation</p>
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Link key={item.href} href={item.href} className="block group">
                <div className="flex items-center gap-3 rounded-2xl px-4 py-3 transition-all hover:bg-sidebar-accent hover:shadow-md hover:scale-[1.02] active:scale-[0.98]">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-sidebar-accent group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                    <Icon className="size-5" />
                  </div>
                  <span className="font-medium group-hover:text-primary transition-colors">{item.label}</span>
                </div>
              </Link>
            )
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="border-t border-border/50 p-4 space-y-3">
          <div className="flex items-center justify-between px-3">
            <span className="text-sm font-medium text-muted-foreground">Theme</span>
            <ThemeToggle />
          </div>
          <LogoutButton />
        </div>
      </aside>
      {/* </CHANGE> */}

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="flex items-center justify-between border-b bg-background p-4 md:hidden">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Lightbulb className="size-4" />
            </div>
            <h1 className="text-lg font-bold">SkillSync</h1>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <MobileNav />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">{children}</main>
      </div>
    </div>
  )
}
