-- 011: Bind a user's career goal to a real O*NET occupation.
-- soc_code is the canonical SOC-O*NET code (e.g. '15-1252.00').
-- soc_title is denormalised from onet_occupations.title at the time of selection,
-- so the goal page still renders something sensible if O*NET is re-imported and
-- a code happens to disappear (rare, but cheap insurance).

ALTER TABLE public.user_goals
  ADD COLUMN IF NOT EXISTS soc_code  TEXT,
  ADD COLUMN IF NOT EXISTS soc_title TEXT;

-- Soft FK: if the referenced O*NET occupation goes away on re-import,
-- null out the binding rather than blocking the user_goals row.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'user_goals_soc_code_fkey' AND table_name = 'user_goals'
  ) THEN
    ALTER TABLE public.user_goals
      ADD CONSTRAINT user_goals_soc_code_fkey
      FOREIGN KEY (soc_code) REFERENCES public.onet_occupations(soc_code)
      ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_user_goals_soc_code ON public.user_goals (soc_code);
