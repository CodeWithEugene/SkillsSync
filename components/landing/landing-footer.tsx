import Link from "next/link"
import Image from "next/image"
import { Github, Linkedin, Twitter, ArrowRight } from "lucide-react"

const COLUMNS = [
  {
    title: "Product",
    links: [
      { label: "How It Works", href: "#how-it-works" },
      { label: "Outcomes", href: "#outcomes" },
      { label: "Services", href: "#services" },
      { label: "FAQ", href: "#faq" },
      { label: "Get Started", href: "/auth/register" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Contact", href: "mailto:hello@skillssync.xyz" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Documentation", href: "#" },
      { label: "Guides", href: "#" },
      { label: "Support", href: "mailto:hello@skillssync.xyz" },
      { label: "Status", href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "#" },
      { label: "Terms of Use", href: "#" },
      { label: "Cookie Policy", href: "#" },
    ],
  },
]

const SOCIALS = [
  { Icon: Twitter, href: "https://twitter.com", label: "Twitter" },
  { Icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" },
  { Icon: Github, href: "https://github.com", label: "GitHub" },
]

export function LandingFooter({ year }: { year: number }) {
  return (
    <footer className="relative mt-12 sm:mt-16 overflow-hidden bg-black text-white">
      {/* background image */}
      <Image
        src="/images/footer/footer.jpeg"
        alt=""
        fill
        sizes="100vw"
        className="absolute inset-0 object-cover"
      />
      {/* scrim — keeps text legible over the glow */}
      <div className="absolute inset-0 bg-black/55" />

      <div className="relative z-10 mx-auto max-w-[1440px] px-4 sm:px-8 lg:px-12 py-14 sm:py-20">
        <div className="grid gap-12 lg:gap-10 lg:grid-cols-12">
          {/* Brand + newsletter */}
          <div className="lg:col-span-4 space-y-6 text-center lg:text-left">
            <Image
              src="/logo.png"
              alt="SkillSync"
              width={595}
              height={118}
              className="h-8 w-auto max-w-[180px] object-contain object-center lg:object-left mx-auto lg:mx-0 brightness-0 invert"
            />
            <p className="text-sm text-white/60 max-w-xs mx-auto lg:mx-0 leading-relaxed">
              Turn coursework into verifiable career evidence. Built at JKUAT,
              made for the African graduate.
            </p>

            {/* Newsletter */}
            <div className="max-w-sm mx-auto lg:mx-0">
              <h3 className="text-sm font-jakarta font-bold mb-2.5">
                Stay In The Loop
              </h3>
              <form className="flex items-center gap-2">
                <label htmlFor="footer-email" className="sr-only">
                  Email address
                </label>
                <input
                  id="footer-email"
                  type="email"
                  placeholder="you@email.com"
                  className="flex-1 min-w-0 rounded-full border border-white/20 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-[#007AFF] transition-colors"
                />
                <button
                  type="submit"
                  aria-label="Subscribe"
                  className="inline-flex items-center justify-center size-[42px] shrink-0 rounded-full bg-[#007AFF] text-white hover:bg-[#0070e0] transition-colors"
                >
                  <ArrowRight className="size-5" />
                </button>
              </form>
            </div>
          </div>

          {/* Link columns */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-8 sm:gap-6 text-center sm:text-left">
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <h3 className="text-sm font-jakarta font-bold mb-4">{col.title}</h3>
                <ul className="space-y-3">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <Link
                        href={l.href}
                        className="text-sm text-white/60 hover:text-white transition-colors"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6 text-xs text-white/60 text-center sm:text-left">
          <p className="font-mono tracking-wider">
            © {year} SkillSync &nbsp;·&nbsp; All Rights Reserved
          </p>

          {/* Socials */}
          <div className="flex items-center gap-3 order-first sm:order-none">
            {SOCIALS.map(({ Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="inline-flex items-center justify-center size-9 rounded-full border border-white/20 text-white/60 hover:text-white hover:border-white/40 transition-colors"
              >
                <Icon className="size-4" />
              </a>
            ))}
          </div>

          <p>
            A{" "}
            <a
              href="https://codewitheugene.top/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white underline decoration-white/30 hover:decoration-white underline-offset-4"
            >
              CodeWithEugene
            </a>{" "}
            project.
          </p>
        </div>
      </div>
    </footer>
  )
}
