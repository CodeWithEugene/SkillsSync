# SkillSync – Copilot Instructions

## Project Overview
SkillSync is a **Next.js 16 App Router** application that lets users upload academic/professional documents, extract skills via AI, and track career goals. Stack: React 19, TypeScript (strict), Tailwind CSS 4, Supabase (auth + Postgres + storage), DeepSeek AI (via OpenAI-compatible SDK).

## Architecture

### Route Groups & Auth Flow
- `app/(dashboard)/` – protected pages (dashboard, documents, skills, goals, profile). The group layout (`app/(dashboard)/layout.tsx`) calls `requireAuth()` which redirects to `/auth/login` if unauthenticated.
- `app/auth/` – public auth pages (login, register, reset-password, update-password, check-email).
- `app/onboarding/` – post-registration step; users are routed here after OAuth callback if `onboarding_completed = false`.
- Auth callback at `app/auth/callback/route.ts` exchanges the code, checks `getUserGoal().onboardingCompleted`, and routes to `/dashboard` or `/onboarding`.

### Supabase Client Pattern
Three distinct clients – use the correct one for context:
| File | Use when |
|------|----------|
| `lib/supabase/server.ts` | Server Components, Route Handlers, Server Actions |
| `lib/supabase/client.ts` | Client Components (`"use client"`) – singleton pattern |
| `lib/supabase/proxy.ts` | Middleware only (`proxy.ts` at root) |

Session refresh runs in `proxy.ts` (root middleware equivalent); it also enforces redirect-to-login for protected path prefixes.

### Database Access Layer (`lib/db.ts`)
All Supabase queries go through typed wrapper functions in `lib/db.ts`. DB column names use `snake_case`; TypeScript types use `camelCase`. Every DB function uses an explicit mapping helper (e.g. `mapDocumentFromDb`, `mapSkillFromDb`). **Always add a mapping helper when introducing a new table.**

Core types: `Document`, `ExtractedSkill`, `UserGoal`.

### AI Integration (`lib/openai.ts`)
The `openai` client points to **DeepSeek** (`https://api.deepseek.com`) using the model `deepseek-chat`, not OpenAI. The `OPENAI_API_KEY` env var holds the DeepSeek key. PDF files are explicitly rejected at analysis time; only plain-text documents are supported. Content is capped at **15,000 characters** before sending to the model.

Document lifecycle: upload → Supabase Storage (`coursework` bucket) → `documents` row (`PROCESSING`) → fire-and-forget `POST /api/documents/analyze` → row updated to `COMPLETED` or `FAILED` + skills inserted.

## Key Conventions

### `@/` Alias
`@/*` maps to the workspace root. Use `@/lib/...`, `@/components/...`, `@/app/...` throughout – never relative `../../` imports.

### TypeScript Build
`typescript.ignoreBuildErrors: true` in `next.config.mjs` – builds succeed even with type errors. Fix type issues but don't rely on CI catching them.

### UI Components
- Primitives live in `components/ui/` (shadcn/ui pattern over Radix UI).
- Forms use **react-hook-form** + **zod** (`lib/validations.ts`). Password validation is shared between Zod schemas and a standalone `lib/password-validation.ts` used server-side in API routes.
- Icons: **lucide-react** only.

### Protected Route Check
```ts
// Server Component or layout
const user = await requireAuth() // redirects if unauthed; returns User
```
Never call `supabase.auth.getUser()` directly in page components – use `requireAuth()` or `getCurrentUser()` from `lib/supabase-auth.ts`.

## Developer Workflow

```bash
pnpm dev        # local dev server
pnpm build      # production build (TS errors do NOT block)
pnpm lint       # eslint
```

**Package manager: pnpm** (see `pnpm-lock.yaml`). Use `pnpm add` not `npm install`.

## Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
OPENAI_API_KEY          # DeepSeek key
OPENAI_BASE_URL         # defaults to https://api.deepseek.com
NEXT_PUBLIC_APP_URL     # used in upload route to self-call /api/documents/analyze
```

## Database Schema
SQL migration scripts are in `scripts/` (run manually in Supabase SQL editor – no migration runner). RLS is enabled on all tables; policies enforce `auth.uid() = user_id`. New tables must follow the same RLS pattern.

Tables: `documents`, `extracted_skills`, `user_goals` (see `scripts/001_create_tables.sql`, `003_create_user_goals.sql`).
