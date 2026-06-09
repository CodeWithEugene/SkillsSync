import { getCurrentUser } from "@/lib/supabase-auth"
import { redirect } from "next/navigation"
import { LandingNav } from "@/components/landing/landing-nav"
import { Hero } from "@/components/landing/hero"
import { ServicesIntro } from "@/components/landing/services-intro"
import { CaseStudies } from "@/components/landing/case-studies"
import { Testimonial } from "@/components/landing/testimonial"
import { Faq } from "@/components/landing/faq"
import { ServicesGrid } from "@/components/landing/services-grid"
import { FooterCta } from "@/components/landing/footer-cta"
import { LandingFooter } from "@/components/landing/landing-footer"

export default async function HomePage() {
  const user = await getCurrentUser()
  if (user) {
    redirect("/dashboard")
  }

  const currentYear = new Date().getFullYear()

  return (
    <div className="font-jakarta min-h-screen flex flex-col bg-background text-foreground">
      <LandingNav />
      <main className="flex-1">
        <Hero />
        <ServicesIntro />
        <CaseStudies />
        <Testimonial />
        <Faq />
        <ServicesGrid />
        <FooterCta />
      </main>
      <LandingFooter year={currentYear} />
    </div>
  )
}
