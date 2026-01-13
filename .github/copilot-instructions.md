# Copilot Instructions for SkillSync-pp

## Project Overview
SkillSync-pp is a Next.js 14+ application using the App Router. It features a modular structure with clear separation between UI components, API routes, and business logic. The project integrates with Supabase for authentication and storage, and OpenAI for document analysis.

## Key Architectural Patterns
- **App Directory Structure**: Uses `/app` for routing, with nested folders for dashboard, documents, skills, onboarding, and authentication. Each feature has its own subdirectory and layout.
- **API Routes**: All backend logic is in `/app/api`. Endpoints are grouped by feature (e.g., `/api/documents/analyze/route.ts`).
- **Component Organization**: UI components are grouped by domain (e.g., `components/documents/`, `components/skills/`). Shared UI primitives are in `components/ui/`.
- **Lib Directory**: Contains core utilities (`lib/utils.ts`), database access (`lib/db.ts`), and third-party integrations (`lib/openai.ts`, `lib/supabase/`).
- **Scripts**: SQL migration scripts for database setup are in `/scripts`.

## Developer Workflows
- **Install dependencies**: `pnpm install`
- **Run development server**: `pnpm dev`
- **Build for production**: `pnpm build`
- **Run migrations**: Apply SQL scripts in `/scripts` manually to Supabase
- **Authentication**: Uses Supabase Auth; see `lib/supabase-auth.ts` and `/app/api/auth/`

## Project-Specific Conventions
- **TypeScript everywhere**: All code is TypeScript, including API routes and components.
- **File-based routing**: Route handlers are always named `route.ts`.
- **Feature isolation**: Each major feature (documents, skills, goals, onboarding) has its own folder in both `/app` and `/components`.
- **Theming**: Theme logic is in `components/theme-provider.tsx` and `components/theme-toggle.tsx`.
- **No global state management**: State is managed locally or via hooks; no Redux/MobX.

## Integration Points
- **Supabase**: Used for authentication and storage. See `lib/supabase/` and `lib/supabase-auth.ts`.
- **OpenAI**: Used for document analysis. See `lib/openai.ts` and `/app/api/documents/analyze/route.ts`.
- **Vercel**: Deployment is configured via `vercel.json`.

## Examples
- To add a new API route for a feature, create a new folder in `/app/api/<feature>/` and add a `route.ts` file.
- To add a new UI component for skills, place it in `components/skills/` and import as needed in `/app/(dashboard)/skills/page.tsx`.

## References
- `app/` — Routing and API endpoints
- `components/` — UI components by domain
- `lib/` — Utilities, database, and integrations
- `scripts/` — Database migration scripts

---
For questions about conventions or architecture, review this file and the folder structure before making changes.