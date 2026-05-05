"use client"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  Menu,
  LayoutDashboard,
  FileText,
  Lightbulb,
  User,
  Target,
  Map,
  BarChart2,
  BookOpen,
  Briefcase,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { LogoutButton } from "@/components/auth/logout-button"
import { cn } from "@/lib/utils"

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

export function MobileNav() {
  const pathname = usePathname()

  const grouped = navItems.reduce<Record<string, NavItem[]>>((acc, it) => {
    if (!acc[it.group]) acc[it.group] = []
    acc[it.group].push(it)
    return acc
  }, {})

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 p-0 bg-sidebar border-sidebar-border">
        <div className="px-6 pt-6 pb-4 border-b border-sidebar-border">
          <Image
            src="/logo.png"
            alt="SkillSync"
            width={595}
            height={118}
            priority
            className="h-9 w-auto max-w-[200px] object-contain object-left"
          />
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-4 scrollbar-primary">
          {Object.entries(grouped).map(([group, items], gi) => (
            <div key={group} className={gi === 0 ? "" : "mt-5"}>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground/80 px-2 mb-1.5">
                {group}
              </p>
              <ul className="space-y-0.5">
                {items.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={cn(
                          "relative flex items-center gap-3 rounded-md px-2.5 py-2.5 text-sm transition-colors",
                          isActive
                            ? "bg-sidebar-accent text-foreground"
                            : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground",
                        )}
                      >
                        {isActive && (
                          <span
                            aria-hidden
                            className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r bg-primary"
                          />
                        )}
                        <Icon
                          className={cn(
                            "size-4 shrink-0",
                            isActive && "text-primary",
                          )}
                        />
                        <span className="font-medium">{item.label}</span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="border-t border-sidebar-border p-4">
          <LogoutButton />
        </div>
      </SheetContent>
    </Sheet>
  )
}
