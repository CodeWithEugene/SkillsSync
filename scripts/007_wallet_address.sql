-- Add wallet_address to user_goals for linking Base wallet to Supabase user
ALTER TABLE public.user_goals
ADD COLUMN IF NOT EXISTS wallet_address TEXT;

-- Optional: index for looking up user by wallet (e.g. for SIWE-only flows)
CREATE INDEX IF NOT EXISTS idx_user_goals_wallet_address
  ON public.user_goals (wallet_address)
  WHERE wallet_address IS NOT NULL;
