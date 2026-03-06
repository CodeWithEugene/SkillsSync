-- Pay-per-upload: one row per payment; consumed_at set when user uploads
CREATE TABLE IF NOT EXISTS public.upload_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reference TEXT NOT NULL UNIQUE,
  amount INTEGER NOT NULL DEFAULT 20,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  lipana_transaction_id TEXT,
  consumed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_upload_payments_user_status_consumed
  ON public.upload_payments (user_id, status)
  WHERE consumed_at IS NULL AND status = 'completed';

ALTER TABLE public.upload_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own upload_payments"
  ON public.upload_payments FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own upload_payments"
  ON public.upload_payments FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own upload_payments"
  ON public.upload_payments FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
