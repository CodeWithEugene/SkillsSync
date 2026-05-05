import * as React from "react"
import { cn } from "@/lib/utils"

interface PageHeaderProps {
  /** A small mono eyebrow (e.g. "01 / Dashboard") that sits above the title. */
  eyebrow?: React.ReactNode
  /** The page title — large display serif. */
  title: React.ReactNode
  /** Optional sub-text under the title, body type. */
  description?: React.ReactNode
  /** Right-side actions (buttons, controls). */
  actions?: React.ReactNode
  className?: string
}

/**
 * Editorial page header — eyebrow + display serif + asymmetric ink/hairline rule.
 * Used at the top of every dashboard page so the system feels like a periodical
 * rather than a generic SaaS list view.
 */
export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <header className={cn("space-y-2", className)}>
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div className="flex-1 min-w-0 space-y-2">
          {eyebrow && (
            <p className="editorial-eyebrow">{eyebrow}</p>
          )}
          <h1 className="display-serif text-3xl sm:text-4xl md:text-5xl leading-[0.95] tracking-tight text-foreground">
            {title}
          </h1>
        </div>
        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </div>
      {description && (
        <p className="text-sm sm:text-base text-muted-foreground max-w-2xl pt-1">
          {description}
        </p>
      )}
      <div className="editorial-rule" />
    </header>
  )
}
