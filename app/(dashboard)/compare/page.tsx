import { requireAuth } from "@/lib/supabase-auth"
import { getExtractedSkills } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { AlertCircle, ArrowUpRight } from "lucide-react"
import CompareClient from "@/components/compare/compare-client"
import Link from "next/link"
import { PageHeader } from "@/components/ui/page-header"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Job Match" }

export default async function ComparePage() {
  const user = await requireAuth()
  const skills = await getExtractedSkills(user.id)
  const hasSkills = skills.length > 0

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="08 — Job match"
        title={
          <>
            How well do you <span className="italic font-light text-primary">fit</span>?
          </>
        }
        description="Paste a job description. We score it against your extracted skills, instantly."
      />

      {!hasSkills ? (
        <div className="bento-card flex flex-col items-start gap-4 py-10">
          <AlertCircle className="size-6 text-warning" />
          <div className="space-y-1">
            <p className="display-serif text-2xl tracking-tight">No skills yet.</p>
            <p className="text-sm text-muted-foreground max-w-md">
              Upload a CV, transcript, or portfolio to extract your skills before running a match.
            </p>
          </div>
          <Button asChild>
            <Link href="/documents" className="gap-2">
              Upload documents
              <ArrowUpRight className="size-4" />
            </Link>
          </Button>
        </div>
      ) : (
        <CompareClient />
      )}
    </div>
  )
}
