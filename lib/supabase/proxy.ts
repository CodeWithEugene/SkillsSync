import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
        },
      },
    },
  )

  let user = null
  try {
    const { data, error } = await supabase.auth.getUser()

    // If the user doesn't exist (e.g., deleted from database), sign out and clear cookies
    if (error && error.message.includes("user_not_found")) {
      await supabase.auth.signOut()
      user = null
    } else {
      user = data.user
    }
  } catch (error) {
    // Clear invalid session
    await supabase.auth.signOut()
    user = null
  }

  // Redirect to login if accessing protected routes without authentication
  if (
    (request.nextUrl.pathname.startsWith("/dashboard") ||
      request.nextUrl.pathname.startsWith("/documents") ||
      request.nextUrl.pathname.startsWith("/skills") ||
      request.nextUrl.pathname.startsWith("/profile") ||
      request.nextUrl.pathname.startsWith("/onboarding") ||
      request.nextUrl.pathname.startsWith("/roadmap") ||
      request.nextUrl.pathname.startsWith("/insights") ||
      request.nextUrl.pathname.startsWith("/courses") ||
      request.nextUrl.pathname.startsWith("/compare")) &&
    !user
  ) {
    const url = request.nextUrl.clone()
    url.pathname = "/auth/login"
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
