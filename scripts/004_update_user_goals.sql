-- Update user_goals table structure for new onboarding questions
ALTER TABLE public.user_goals 
DROP COLUMN IF EXISTS current_study,
DROP COLUMN IF EXISTS want_to_study,
DROP COLUMN IF EXISTS study_duration,
DROP COLUMN IF EXISTS skill_goal;

ALTER TABLE public.user_goals
ADD COLUMN IF NOT EXISTS career_goal TEXT,
ADD COLUMN IF NOT EXISTS education_level TEXT,
ADD COLUMN IF NOT EXISTS current_study TEXT,
ADD COLUMN IF NOT EXISTS study_year TEXT,
ADD COLUMN IF NOT EXISTS top_priority TEXT;
