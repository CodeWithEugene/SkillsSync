import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

// Editorial badge — sharp corners, no pulses, mono numerals when wrapping a number.
const badgeVariants = cva(
  [
    'inline-flex items-center justify-center rounded-sm border px-2 py-0.5 text-[0.7rem] font-medium uppercase tracking-wider',
    'w-fit whitespace-nowrap shrink-0 gap-1 [&>svg]:size-3 [&>svg]:pointer-events-none',
    'focus-visible:ring-2 focus-visible:ring-ring/40 aria-invalid:border-destructive',
    'transition-colors',
  ].join(' '),
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90',
        secondary:
          'border-transparent bg-muted text-muted-foreground [a&]:hover:bg-muted/80',
        destructive:
          'border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/40',
        outline:
          'border-border text-foreground [a&]:hover:bg-muted',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<'span'> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'span'

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
