import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export async function getCurrentUser() {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase.auth.getUser()

    // If user doesn't exist, sign out and return null
    if (error && error.message.includes("user_not_found")) {
      await supabase.auth.signOut()
      return null
    }

    return data.user
  } catch (error) {
    // Clear invalid session
    await supabase.auth.signOut()
    return null
  }
}

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/auth/login")
  }
  return user
}
