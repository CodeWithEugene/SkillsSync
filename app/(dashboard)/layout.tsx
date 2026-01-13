import type React from "react"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { requireAuth } from "@/lib/supabase-auth"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAuth()

  const firstName = user.user_metadata?.first_name || user.email?.split("@")[0] || "User"

  return (
    <DashboardShell user={user} firstName={firstName}>
      {children}
    </DashboardShell>
  )
}
