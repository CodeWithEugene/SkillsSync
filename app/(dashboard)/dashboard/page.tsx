import { requireAuth } from "@/lib/supabase-auth"
import { getDocuments, getExtractedSkills, getUserGoal } from "@/lib/db"
import { DocumentList } from "@/components/documents/document-list"
import { FileText, Lightbulb, CheckCircle, Clock } from "lucide-react"
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

  const firstName = user.user_metadata?.first_name || user.email?.split("@")[0] || "there"

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="space-y-1 sm:space-y-2">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">Welcome back, {firstName}!</h1>
        <p className="text-base sm:text-lg text-muted-foreground">Here's your skill tracking overview.</p>
      </div>

      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="bento-card bento-card-info hover:bg-primary hover:text-primary-foreground hover:scale-[1.02] transition-all duration-300 cursor-pointer group">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium group-hover:text-primary-foreground">Documents</CardTitle>
              <div className="rounded-xl bg-info/10 group-hover:bg-primary-foreground/20 p-2 transition-colors">
                <FileText className="size-5 text-info group-hover:text-primary-foreground" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold group-hover:text-primary-foreground">{documents.length}</div>
            <p className="text-xs text-muted-foreground group-hover:text-primary-foreground/80 mt-1">Total uploaded</p>
          </CardContent>
        </Card>

        <Card className="bento-card bento-card-success hover:bg-primary hover:text-primary-foreground hover:scale-[1.02] transition-all duration-300 cursor-pointer group">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium group-hover:text-primary-foreground">Skills Found</CardTitle>
              <div className="rounded-xl bg-success/10 group-hover:bg-primary-foreground/20 p-2 transition-colors">
                <Lightbulb className="size-5 text-success group-hover:text-primary-foreground" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold group-hover:text-primary-foreground">{skills.length}</div>
            <p className="text-xs text-muted-foreground group-hover:text-primary-foreground/80 mt-1">Unique skills</p>
          </CardContent>
        </Card>

        <Card className="bento-card bento-card-warning hover:bg-primary hover:text-primary-foreground hover:scale-[1.02] transition-all duration-300 cursor-pointer group">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium group-hover:text-primary-foreground">Completed</CardTitle>
              <div className="rounded-xl bg-warning/10 group-hover:bg-primary-foreground/20 p-2 transition-colors">
                <CheckCircle className="size-5 text-warning group-hover:text-primary-foreground" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold group-hover:text-primary-foreground">{completedDocs}</div>
            <p className="text-xs text-muted-foreground group-hover:text-primary-foreground/80 mt-1">
              Documents analyzed
            </p>
          </CardContent>
        </Card>

        <Card className="bento-card hover:bg-primary hover:text-primary-foreground hover:scale-[1.02] transition-all duration-300 cursor-pointer group">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium group-hover:text-primary-foreground">Processing</CardTitle>
              <div className="rounded-xl bg-muted group-hover:bg-primary-foreground/20 p-2 transition-colors">
                <Clock className="size-5 text-muted-foreground group-hover:text-primary-foreground" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold group-hover:text-primary-foreground">{processingDocs}</div>
            <p className="text-xs text-muted-foreground group-hover:text-primary-foreground/80 mt-1">
              Currently analyzing
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="bento-card max-h-60 sm:max-h-80 flex flex-col overflow-hidden">
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="text-xl sm:text-2xl">Recent Documents</CardTitle>
          <CardDescription className="text-sm">Your latest uploads</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto scrollbar-primary">
          <DocumentList documents={documents.slice(0, 5)} />
        </CardContent>
      </Card>
    </div>
  )
}
