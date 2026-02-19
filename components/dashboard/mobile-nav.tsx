"use client"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, LayoutDashboard, FileText, Lightbulb, User, Target, Map, BarChart2, BookOpen, Briefcase } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { LogoutButton } from "@/components/auth/logout-button"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/roadmap", label: "Roadmap", icon: Map },
  { href: "/goals", label: "Goals", icon: Target },
  { href: "/documents", label: "Documents", icon: FileText },
  { href: "/skills", label: "Skills", icon: Lightbulb },
  { href: "/insights", label: "Insights", icon: BarChart2 },
  { href: "/courses", label: "Courses", icon: BookOpen },
  { href: "/compare", label: "Job Match", icon: Briefcase },
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
            <Image
              src="/logo.png"
              alt="SkillSync Logo"
              width={192}
              height={192}
              className="rounded-2xl"
            />
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
