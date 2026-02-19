import { requireAuth } from "@/lib/supabase-auth"
import { getExtractedSkills } from "@/lib/db"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Briefcase, AlertCircle, ArrowRight } from "lucide-react"
import CompareClient from "@/components/compare/compare-client"
import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Job Match" }

export default async function ComparePage() {
  const user = await requireAuth()
  const skills = await getExtractedSkills(user.id)
  const hasSkills = skills.length > 0

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="space-y-1 sm:space-y-2">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight flex items-center gap-3">
          <Briefcase className="size-7 text-primary" /> Job Match
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground">
          Paste a job description and see how well your skills match — instantly.
        </p>
      </div>

      {!hasSkills ? (
        <Card className="bento-card">
          <CardContent className="py-12 flex flex-col items-center gap-4 text-center">
            <div className="rounded-2xl bg-warning/10 p-4">
              <AlertCircle className="size-8 text-warning" />
            </div>
            <div className="space-y-1">
              <p className="text-base font-semibold">No skills yet</p>
              <p className="text-sm text-muted-foreground max-w-xs">
                Upload a CV, transcript, or portfolio to extract your skills before running a match.
              </p>
            </div>
            <Link href="/documents">
              <Button className="rounded-2xl gap-2">
                Upload Documents
                <ArrowRight className="size-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <CompareClient />
      )}
    </div>
  )
}
