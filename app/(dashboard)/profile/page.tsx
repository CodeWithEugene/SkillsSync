import { requireAuth } from "@/lib/supabase-auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { User, Mail, Calendar, CheckCircle } from "lucide-react"

export default async function ProfilePage() {
  const user = await requireAuth()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Profile</h1>
        <p className="text-lg text-muted-foreground">Manage your account information</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bento-card bento-card-primary">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-primary/10 p-3">
                <User className="size-6 text-primary" />
              </div>
              <div>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>Your basic account details</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="user-id" className="text-sm font-medium">
                User ID
              </Label>
              <Input id="user-id" value={user.id} readOnly className="bg-muted/50 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <Input id="email" value={user.email || ""} readOnly className="bg-muted/50 rounded-xl" />
            </div>
          </CardContent>
        </Card>

        <Card className="bento-card bento-card-accent">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-accent/10 p-3">
                <CheckCircle className="size-6 text-accent" />
              </div>
              <div>
                <CardTitle>Account Status</CardTitle>
                <CardDescription>Information about your account</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-xl bg-background/50 p-3">
              <div className="flex items-center gap-2">
                <Mail className="size-4 text-muted-foreground" />
                <span className="text-sm font-medium">Email Verified</span>
              </div>
              <span className="text-sm font-semibold text-foreground">{user.email_confirmed_at ? "Yes" : "No"}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-background/50 p-3">
              <div className="flex items-center gap-2">
                <Calendar className="size-4 text-muted-foreground" />
                <span className="text-sm font-medium">Member Since</span>
              </div>
              <span className="text-sm font-semibold text-foreground">
                {new Date(user.created_at).toLocaleDateString()}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
