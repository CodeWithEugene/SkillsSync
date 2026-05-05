import { requireAuth } from "@/lib/supabase-auth"
import { getUserGoal } from "@/lib/db"
import { ShareProfileToggle } from "@/components/profile/share-profile-toggle"
import { PageHeader } from "@/components/ui/page-header"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Profile" }

export default async function ProfilePage() {
  const user = await requireAuth()
  const userGoal = await getUserGoal(user.id)

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="09 — Profile"
        title={
          <>
            Your <span className="italic font-light text-primary">account</span>.
          </>
        }
        description="Identity, verification, and what you make public to the world."
      />

      {/* Editorial colophon — definition list */}
      <div className="grid gap-px bg-border border border-border md:grid-cols-2 stagger-rise">
        <div className="bg-card p-5 sm:p-6 space-y-4">
          <p className="editorial-eyebrow">Identity</p>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground mb-1">
                Email
              </dt>
              <dd className="font-medium break-all">{user.email}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground mb-1">
                User ID
              </dt>
              <dd className="font-mono text-[11px] text-muted-foreground break-all">
                {user.id}
              </dd>
            </div>
          </dl>
        </div>

        <div className="bg-card p-5 sm:p-6 space-y-4">
          <p className="editorial-eyebrow">Account status</p>
          <dl className="space-y-3 text-sm">
            <div className="flex items-baseline justify-between gap-2">
              <dt className="text-muted-foreground">Email verified</dt>
              <dd className="font-mono uppercase tracking-widest text-[11px]">
                {user.email_confirmed_at ? "Yes" : "No"}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-2">
              <dt className="text-muted-foreground">Member since</dt>
              <dd className="font-mono tabular text-[11px]">
                {new Date(user.created_at).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Public profile toggle */}
      <section className="space-y-4">
        <div>
          <p className="editorial-eyebrow mb-2">Distribution</p>
          <h2 className="display-serif text-2xl sm:text-3xl tracking-tight">
            Share your profile
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Toggle public access for recruiters or peers — your skills and readiness only.
          </p>
        </div>
        <ShareProfileToggle
          userId={user.id}
          initialIsPublic={userGoal?.isPublic ?? false}
        />
      </section>
    </div>
  )
}
