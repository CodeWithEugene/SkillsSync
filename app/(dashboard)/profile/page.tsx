import { requireAuth } from "@/lib/supabase-auth"
import { getUserGoal } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { ShareProfileToggle } from "@/components/profile/share-profile-toggle"
import { User, Mail, Calendar, CheckCircle, Share2 } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Profile",
}

export default async function ProfilePage() {
  const user = await requireAuth()
  const userGoal = await getUserGoal(user.id)

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="space-y-1 sm:space-y-2">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">Profile</h1>
        <p className="text-base sm:text-lg text-muted-foreground">Manage your account information</p>
      </div>

      <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
        <Card className="bento-card bento-card-primary">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-primary/10 p-2.5 sm:p-3">
                <User className="size-5 sm:size-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base sm:text-lg">Account Information</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Your basic account details</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            <div className="space-y-2">
              <Label htmlFor="user-id" className="text-xs sm:text-sm font-medium">
                User ID
              </Label>
              <Input id="user-id" value={user.id} readOnly className="bg-muted/50 rounded-xl text-xs sm:text-sm" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs sm:text-sm font-medium">
                Email
              </Label>
              <Input
                id="email"
                value={user.email || ""}
                readOnly
                className="bg-muted/50 rounded-xl text-xs sm:text-sm"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bento-card bento-card-accent">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-accent/10 p-2.5 sm:p-3">
                <CheckCircle className="size-5 sm:size-6 text-accent" />
              </div>
              <div>
                <CardTitle className="text-base sm:text-lg">Account Status</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Information about your account</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between rounded-xl bg-background/50 p-3">
              <div className="flex items-center gap-2">
                <Mail className="size-4 text-muted-foreground" />
                <span className="text-xs sm:text-sm font-medium">Email Verified</span>
              </div>
              <span className="text-xs sm:text-sm font-semibold text-foreground">
                {user.email_confirmed_at ? "Yes" : "No"}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-background/50 p-3">
              <div className="flex items-center gap-2">
                <Calendar className="size-4 text-muted-foreground" />
                <span className="text-xs sm:text-sm font-medium">Member Since</span>
              </div>
              <span className="text-xs sm:text-sm font-semibold text-foreground">
                {new Date(user.created_at).toLocaleDateString()}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Shareable profile */}
      <Card className="bento-card">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-primary/10 p-2.5 sm:p-3">
              <Share2 className="size-5 sm:size-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base sm:text-lg">Share Your Profile</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Share your skills and career readiness with recruiters or peers
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ShareProfileToggle
            userId={user.id}
            initialIsPublic={userGoal?.isPublic ?? false}
          />
        </CardContent>
      </Card>
    </div>
  )
}
