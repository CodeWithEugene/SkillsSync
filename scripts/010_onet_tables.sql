-- 010: O*NET database tables (offline import of db_30_2_text.zip)
-- Populated by scripts/onet-import.mjs (idempotent: TRUNCATE then INSERT).
-- These are reference data shared across all users — no RLS, readable by anon.

CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Drop any prior O*NET tables. An earlier attempt left differently-shaped
-- empty tables behind (onet_occupations(code,...), onet_skills(id,...),
-- onet_occupation_skills(...)). Safe to drop because these are reference data,
-- fully repopulated by onet-import.mjs on every run.
DROP TABLE IF EXISTS public.onet_occupation_skills CASCADE;
DROP TABLE IF EXISTS public.onet_skills           CASCADE;
DROP TABLE IF EXISTS public.onet_content_model    CASCADE;
DROP TABLE IF EXISTS public.onet_occupations      CASCADE;

CREATE TABLE IF NOT EXISTS public.onet_occupations (
  soc_code     TEXT PRIMARY KEY,
  title        TEXT NOT NULL,
  description  TEXT
);

-- Trigram indexes for fuzzy career-goal search ("Software Engineer" → 15-1252.00)
CREATE INDEX IF NOT EXISTS idx_onet_occupations_title_trgm
  ON public.onet_occupations USING gin (title gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_onet_occupations_description_trgm
  ON public.onet_occupations USING gin (description gin_trgm_ops);

-- One row per (occupation, skill, scale).
-- Scale ID is 'IM' (Importance, 1.0–5.0) or 'LV' (Level, 1.0–7.0).
-- For gap analysis we filter scale_id = 'IM' AND data_value >= 3.0.
CREATE TABLE IF NOT EXISTS public.onet_skills (
  soc_code     TEXT NOT NULL REFERENCES public.onet_occupations(soc_code) ON DELETE CASCADE,
  element_id   TEXT NOT NULL,
  element_name TEXT NOT NULL,
  scale_id     TEXT NOT NULL,
  data_value   NUMERIC(4,2) NOT NULL,
  PRIMARY KEY (soc_code, element_id, scale_id)
);

CREATE INDEX IF NOT EXISTS idx_onet_skills_soc       ON public.onet_skills (soc_code);
CREATE INDEX IF NOT EXISTS idx_onet_skills_important ON public.onet_skills (soc_code, data_value)
  WHERE scale_id = 'IM';

-- Element ID → human-readable name + definition (so we can render skill descriptions).
CREATE TABLE IF NOT EXISTS public.onet_content_model (
  element_id   TEXT PRIMARY KEY,
  element_name TEXT NOT NULL,
  description  TEXT
);

-- Reference data: anyone (incl. anon Supabase clients) may read.
ALTER TABLE public.onet_occupations    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onet_skills         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onet_content_model  ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "onet_occupations readable by all"   ON public.onet_occupations;
DROP POLICY IF EXISTS "onet_skills readable by all"        ON public.onet_skills;
DROP POLICY IF EXISTS "onet_content_model readable by all" ON public.onet_content_model;

CREATE POLICY "onet_occupations readable by all"
  ON public.onet_occupations   FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "onet_skills readable by all"
  ON public.onet_skills        FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "onet_content_model readable by all"
  ON public.onet_content_model FOR SELECT TO anon, authenticated USING (true);
