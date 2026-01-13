"use client"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, LayoutDashboard, FileText, Lightbulb, User } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LogoutButton } from "@/components/auth/logout-button"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
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
      <SheetContent side="left" className="w-64">
        <nav className="flex flex-col gap-2">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Button
                key={item.href}
                variant={pathname === item.href ? "secondary" : "ghost"}
                className="justify-start"
                asChild
              >
                <Link href={item.href}>
                  <Icon className="mr-2 size-4" />
                  {item.label}
                </Link>
              </Button>
            )
          })}
          <div className="mt-4 border-t pt-4">
            <LogoutButton />
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  )
}
