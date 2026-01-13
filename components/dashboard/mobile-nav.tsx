"use client"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, LayoutDashboard, FileText, Lightbulb, User, Target } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LogoutButton } from "@/components/auth/logout-button"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/goals", label: "Goals", icon: Target },
  { href: "/documents", label: "Documents", icon: FileText },
  { href: "/skills", label: "Skills", icon: Lightbulb },
  { href: "/profile", label: "Profile", icon: User },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 p-6">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
              <Lightbulb className="size-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">SkillSync</h2>
              <p className="text-xs text-muted-foreground">AI-Powered Learning</p>
            </div>
          </div>
        </div>

        <nav className="flex flex-col gap-2 mb-6">
          <p className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Navigation</p>
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href} className="block">
                <div
                  className={cn(
                    "flex items-center gap-3 rounded-2xl px-4 py-3 transition-all",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "hover:bg-sidebar-accent hover:shadow-sm",
                  )}
                >
                  <div
                    className={cn(
                      "flex size-10 items-center justify-center rounded-xl transition-all",
                      isActive ? "bg-primary-foreground/20" : "bg-sidebar-accent",
                    )}
                  >
                    <Icon className="size-5" />
                  </div>
                  <span className="font-medium">{item.label}</span>
                </div>
              </Link>
            )
          })}
        </nav>

        <div className="border-t pt-4">
          <LogoutButton />
        </div>
      </SheetContent>
    </Sheet>
  )
}
