import type React from "react"
import { requireAuth } from "@/lib/supabase-auth"
import { Button } from "@/components/ui/button"
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
    <div className="flex min-h-screen">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 border-r bg-muted/30 md:block">
        <div className="flex h-full flex-col">
          <div className="border-b p-6">
            <h1 className="text-2xl font-bold text-primary">SkillSync</h1>
            <p className="text-sm text-muted-foreground">{displayName}</p>
          </div>
          <nav className="flex-1 space-y-1 p-4">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Button key={item.href} variant="ghost" className="w-full justify-start" asChild>
                  <Link href={item.href}>
                    <Icon className="mr-2 size-4" />
                    {item.label}
                  </Link>
                </Button>
              )
            })}
          </nav>
          <div className="border-t p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Theme</span>
              <ThemeToggle />
            </div>
            <LogoutButton />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1">
        {/* Mobile Header */}
        <header className="flex items-center justify-between border-b bg-background p-4 md:hidden">
          <h1 className="text-xl font-bold text-primary">SkillSync</h1>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <MobileNav />
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6 md:p-8">{children}</main>
      </div>
    </div>
  )
}
