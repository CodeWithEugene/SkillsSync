-- ============================================================
-- Migration 005: Career Intelligence
-- Run this in the Supabase SQL editor
-- ============================================================

-- 1. Add skill_type column to extracted_skills
--    Values: 'technical' | 'soft' | 'transferable'
ALTER TABLE public.extracted_skills
  ADD COLUMN IF NOT EXISTS skill_type TEXT DEFAULT 'technical';

-- 2. Add courses column to user_goals
--    Stores comma-separated or free-text list of current courses
ALTER TABLE public.user_goals
  ADD COLUMN IF NOT EXISTS courses TEXT;

-- 3. career_guidance table — stores AI-generated guidance reports
CREATE TABLE IF NOT EXISTS public.career_guidance (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  career_goal     TEXT NOT NULL,
  readiness_score INTEGER NOT NULL CHECK (readiness_score BETWEEN 0 AND 100),
  summary         TEXT NOT NULL,
  strengths       JSONB NOT NULL DEFAULT '[]',
  gaps            JSONB NOT NULL DEFAULT '[]',
  recommendations JSONB NOT NULL DEFAULT '[]',
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)   -- one live report per user, replaced on regeneration
);

ALTER TABLE public.career_guidance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own guidance"
  ON public.career_guidance FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own guidance"
  ON public.career_guidance FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own guidance"
  ON public.career_guidance FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own guidance"
  ON public.career_guidance FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- 4. skill_history table — snapshot per document analysis for timeline
CREATE TABLE IF NOT EXISTS public.skill_history (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_id  UUID REFERENCES public.documents(id) ON DELETE CASCADE,
  snapshot     JSONB NOT NULL DEFAULT '{}',  -- { technical: n, soft: n, total: n, topCategories: [] }
  recorded_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.skill_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own skill history"
  ON public.skill_history FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own skill history"
  ON public.skill_history FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 5. Add is_public flag to user_goals for shareable profiles
ALTER TABLE public.user_goals
  ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT FALSE;

-- Allow anyone (including anonymous) to read public profiles
-- The service-role key bypasses RLS, but we also expose a policy
-- so the anon key can be used if needed in the future.
CREATE POLICY "Public profiles are readable by anyone"
  ON public.user_goals FOR SELECT TO anon, authenticated
  USING (is_public = TRUE OR auth.uid() = user_id);
