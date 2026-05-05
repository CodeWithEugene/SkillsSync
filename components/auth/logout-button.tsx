"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { LogOut, Loader2 } from "lucide-react"
import { useState } from "react"
import { notify } from "@/lib/notify"

export function LogoutButton() {
  const [isLoading, setIsLoading] = useState(false)

  const handleLogout = async () => {
    setIsLoading(true)
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      notify.info("Signed out", "See you soon.")
      window.location.href = "/auth/login"
    } catch (err) {
      notify.error(
        "Couldn't sign out",
        err instanceof Error ? err.message : "Try again.",
      )
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant="ghost"
      onClick={handleLogout}
      disabled={isLoading}
      className="w-full justify-start rounded-md px-3 py-2 hover:bg-destructive/10 hover:text-destructive"
    >
      {isLoading ? <Loader2 className="mr-2 size-4 animate-spin" /> : <LogOut className="mr-2 size-4" />}
      {isLoading ? "Signing out…" : "Sign out"}
    </Button>
  )
}
