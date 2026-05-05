/**
 * Thin wrapper around sonner so we have one place to tweak notification UX.
 * Usage:
 *   import { notify } from "@/lib/notify"
 *   notify.success("Document uploaded", "Skill extraction starting…")
 *   notify.error("Upload failed", err.message)
 */
import { toast } from "sonner"

type Opts = {
  description?: string
  duration?: number
}

export const notify = {
  success(title: string, opts?: Opts | string) {
    const o = typeof opts === "string" ? { description: opts } : opts
    return toast.success(title, o)
  },
  error(title: string, opts?: Opts | string) {
    const o = typeof opts === "string" ? { description: opts } : opts
    return toast.error(title, { duration: 6500, ...o })
  },
  warn(title: string, opts?: Opts | string) {
    const o = typeof opts === "string" ? { description: opts } : opts
    return toast.warning(title, o)
  },
  info(title: string, opts?: Opts | string) {
    const o = typeof opts === "string" ? { description: opts } : opts
    return toast(title, o)
  },
  /** Show a loading toast and return its id so you can update it on completion. */
  loading(title: string, description?: string) {
    return toast.loading(title, { description })
  },
  dismiss(id?: string | number) {
    if (id == null) toast.dismiss()
    else toast.dismiss(id)
  },
}
