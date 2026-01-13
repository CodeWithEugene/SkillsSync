import { requireAuth } from "@/lib/supabase-auth"
import { getDocuments, getExtractedSkills, getUserGoal } from "@/lib/db"
import { DocumentList } from "@/components/documents/document-list"
import { FileText, Lightbulb, CheckCircle, Clock, Target, GraduationCap } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const user = await requireAuth()

  const userGoal = await getUserGoal(user.id)
  if (!userGoal) {
    redirect("/onboarding")
  }

  const documents = await getDocuments(user.id)
  const skills = await getExtractedSkills(user.id)

  const completedDocs = documents.filter((doc) => doc.status === "COMPLETED").length
  const processingDocs = documents.filter((doc) => doc.status === "PROCESSING").length

  // Get unique skill categories
  const categories = new Set(skills.map((s) => s.category).filter(Boolean))

  const firstName = user.user_metadata?.first_name || user.email?.split("@")[0] || "there"

  return (
    <div className="flex h-full flex-col gap-6">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">Welcome back, {firstName}!</h1>
        <p className="text-lg text-muted-foreground">Here's your skill tracking overview.</p>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bento-card bento-card-info">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Documents</CardTitle>
              <div className="rounded-xl bg-info/10 p-2">
                <FileText className="size-5 text-info" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{documents.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Total uploaded</p>
          </CardContent>
        </Card>

        <Card className="bento-card bento-card-success">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Skills Found</CardTitle>
              <div className="rounded-xl bg-success/10 p-2">
                <Lightbulb className="size-5 text-success" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{skills.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Unique skills</p>
          </CardContent>
        </Card>

        <Card className="bento-card bento-card-warning">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <div className="rounded-xl bg-warning/10 p-2">
                <CheckCircle className="size-5 text-warning" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{completedDocs}</div>
            <p className="text-xs text-muted-foreground mt-1">Documents analyzed</p>
          </CardContent>
        </Card>

        <Card className="bento-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Processing</CardTitle>
              <div className="rounded-xl bg-muted p-2">
                <Clock className="size-5 text-muted-foreground" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{processingDocs}</div>
            <p className="text-xs text-muted-foreground mt-1">Currently analyzing</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex-1 grid gap-4 md:grid-cols-2 lg:grid-cols-3 min-h-0">
        {/* Large card spanning 2 columns */}
        <Card className="bento-card bento-card-primary md:col-span-2 overflow-hidden flex flex-col">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-primary/10 p-3">
                <Target className="size-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">Career Goal</CardTitle>
                <CardDescription>Your target career path</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-2xl font-bold text-foreground">{userGoal.careerGoal || "Not set"}</p>
            </div>
            {userGoal.skillGoal && (
              <div className="rounded-2xl bg-background/50 p-4">
                <p className="text-sm font-medium text-muted-foreground mb-1">Target Skills</p>
                <p className="text-base text-foreground">{userGoal.skillGoal}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bento-card bento-card-accent overflow-hidden flex flex-col">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-accent/10 p-3">
                <GraduationCap className="size-6 text-accent" />
              </div>
              <div>
                <CardTitle className="text-xl">Learning Journey</CardTitle>
                <CardDescription>Your study path</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {userGoal.currentStudy && (
              <div className="rounded-2xl bg-background/50 p-3">
                <p className="text-xs font-medium text-muted-foreground mb-1">Currently Learning</p>
                <p className="text-sm text-foreground">{userGoal.currentStudy}</p>
              </div>
            )}
            {userGoal.wantToStudy && (
              <div className="rounded-2xl bg-background/50 p-3">
                <p className="text-xs font-medium text-muted-foreground mb-1">Next Goals</p>
                <p className="text-sm text-foreground">{userGoal.wantToStudy}</p>
              </div>
            )}
            {userGoal.studyDuration && (
              <div className="rounded-2xl bg-background/50 p-3">
                <p className="text-xs font-medium text-muted-foreground mb-1">Timeline</p>
                <p className="text-sm text-foreground">{userGoal.studyDuration}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="bento-card max-h-80 flex flex-col overflow-hidden">
        <CardHeader>
          <CardTitle className="text-2xl">Recent Documents</CardTitle>
          <CardDescription>Your latest uploads</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto">
          <DocumentList documents={documents.slice(0, 5)} />
        </CardContent>
      </Card>
    </div>
  )
}
