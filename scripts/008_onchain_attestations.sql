-- Store last on-chain attestation per user for "Recorded on Base" UX
CREATE TABLE IF NOT EXISTS public.onchain_attestations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tx_hash TEXT NOT NULL,
  profile_hash TEXT NOT NULL,
  chain_id INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

ALTER TABLE public.onchain_attestations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own onchain attestations"
  ON public.onchain_attestations FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own onchain attestations"
  ON public.onchain_attestations FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own onchain attestations"
  ON public.onchain_attestations FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
