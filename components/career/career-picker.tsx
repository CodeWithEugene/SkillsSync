"use client"

import { useEffect, useRef, useState } from "react"
import { Input } from "@/components/ui/input"
import { Loader2, Check, Search, X } from "lucide-react"

export type PickedCareer = { socCode: string; socTitle: string; description?: string | null }

interface CareerPickerProps {
  value: PickedCareer | null
  onChange: (next: PickedCareer | null) => void
  placeholder?: string
  autoFocus?: boolean
}

type Suggestion = { socCode: string; title: string; description: string | null }

const DEBOUNCE_MS = 250

export function CareerPicker({
  value,
  onChange,
  placeholder = "e.g. Software Developer, Data Scientist…",
  autoFocus,
}: CareerPickerProps) {
  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const requestIdRef = useRef(0)

  // Close suggestions when clicking outside
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!containerRef.current) return
      if (!containerRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onDocClick)
    return () => document.removeEventListener("mousedown", onDocClick)
  }, [])

  // Debounced search
  useEffect(() => {
    if (value) return // Already selected; don't search
    const trimmed = query.trim()
    if (trimmed.length < 2) {
      setSuggestions([])
      setLoading(false)
      return
    }
    const reqId = ++requestIdRef.current
    setLoading(true)
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/onet/careers?q=${encodeURIComponent(trimmed)}`)
        if (!res.ok) {
          if (reqId === requestIdRef.current) setSuggestions([])
          return
        }
        const data = await res.json()
        if (reqId !== requestIdRef.current) return
        setSuggestions(
          (data.careers ?? []).map((c: any) => ({
            socCode: c.socCode,
            title: c.title,
            description: c.description ?? null,
          })),
        )
      } catch {
        if (reqId === requestIdRef.current) setSuggestions([])
      } finally {
        if (reqId === requestIdRef.current) setLoading(false)
      }
    }, DEBOUNCE_MS)
    return () => clearTimeout(t)
  }, [query, value])

  function selectSuggestion(s: Suggestion) {
    onChange({ socCode: s.socCode, socTitle: s.title, description: s.description })
    setQuery("")
    setSuggestions([])
    setOpen(false)
  }

  function clearSelection() {
    onChange(null)
    setQuery("")
    setSuggestions([])
    setOpen(true)
  }

  // Selected state — show a chip-like card with the chosen occupation
  if (value) {
    return (
      <div className="flex items-start gap-2 rounded-xl border border-primary/20 bg-primary/5 p-3">
        <div className="rounded-lg bg-primary/10 p-1.5 mt-0.5 shrink-0">
          <Check className="size-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold leading-tight">{value.socTitle}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5 font-mono">{value.socCode}</p>
          {value.description && (
            <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">{value.description}</p>
          )}
        </div>
        <button
          type="button"
          onClick={clearSelection}
          aria-label="Change career"
          className="rounded-lg p-1.5 text-muted-foreground hover:bg-background/50 hover:text-destructive transition-colors shrink-0"
        >
          <X className="size-3.5" />
        </button>
      </div>
    )
  }

  // Search state — input + dropdown
  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="pl-9"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground animate-spin" />
        )}
      </div>

      {open && query.trim().length >= 2 && (
        <div className="absolute z-20 mt-1 w-full rounded-xl border bg-popover shadow-lg overflow-hidden">
          {suggestions.length === 0 && !loading ? (
            <div className="px-3 py-4 text-xs text-muted-foreground text-center">
              No careers match. Try a different keyword.
            </div>
          ) : (
            <ul className="max-h-72 overflow-y-auto scrollbar-primary">
              {suggestions.map((s) => (
                <li key={s.socCode}>
                  <button
                    type="button"
                    onClick={() => selectSuggestion(s)}
                    className="w-full text-left px-3 py-2 hover:bg-accent transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium truncate">{s.title}</span>
                      <span className="text-[10px] text-muted-foreground font-mono shrink-0">
                        {s.socCode}
                      </span>
                    </div>
                    {s.description && (
                      <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                        {s.description}
                      </p>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
