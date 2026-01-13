"use client"

import { useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

export function SessionCleanup() {
  useEffect(() => {
    const supabase = createClient()

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      // If there's an error with the session, sign out
      if (event === "SIGNED_OUT" || !session) {
        return
      }

      // Verify the session is valid
      try {
        const { error } = await supabase.auth.getUser()
        if (error && error.message.includes("user_not_found")) {
          // Clear invalid session
          await supabase.auth.signOut()
          window.location.href = "/auth/login"
        }
      } catch (error) {
        // Clear invalid session
        await supabase.auth.signOut()
        window.location.href = "/auth/login"
      }
    })

    // Also check immediately on mount
    const checkSession = async () => {
      try {
        const { error } = await supabase.auth.getUser()
        if (error && error.message.includes("user_not_found")) {
          await supabase.auth.signOut()
          // Only redirect if on a protected route
          if (
            window.location.pathname.startsWith("/dashboard") ||
            window.location.pathname.startsWith("/documents") ||
            window.location.pathname.startsWith("/skills") ||
            window.location.pathname.startsWith("/profile") ||
            window.location.pathname.startsWith("/onboarding")
          ) {
            window.location.href = "/auth/login"
          }
        }
      } catch (error) {
        // Silently handle - will be caught by auth state listener
      }
    }

    checkSession()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return null
}
