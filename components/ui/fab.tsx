import * as React from "react"
import { cn } from "@/lib/utils"

export interface FabProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: "default" | "large"
}

const Fab = React.forwardRef<HTMLButtonElement, FabProps>(
  ({ className, size = "default", children, ...props }, ref) => {
    return (
      <button
        className={cn(
          "fixed bottom-6 right-6 z-50 inline-flex items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95 disabled:pointer-events-none disabled:opacity-50",
          size === "default" && "size-14",
          size === "large" && "size-16",
          className,
        )}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    )
  },
)
Fab.displayName = "Fab"

export { Fab }
