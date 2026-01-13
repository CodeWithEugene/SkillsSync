"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { LogOut, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

export function LogoutButton() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    setIsLoading(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = "/auth/login"
  }

  return (
    <Button
      variant="ghost"
      onClick={handleLogout}
      disabled={isLoading}
      className="w-full justify-start rounded-2xl px-4 py-3 hover:bg-destructive/10 hover:text-destructive transition-all"
    >
      {isLoading ? <Loader2 className="mr-2 size-4 animate-spin" /> : <LogOut className="mr-2 size-4" />}
      {isLoading ? "Signing out..." : "Sign Out"}
    </Button>
    // </CHANGE>
  )
}
