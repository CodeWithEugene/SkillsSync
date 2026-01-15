-- Run this SQL in your Supabase SQL Editor (https://supabase.com/dashboard)
-- Navigate to: SQL Editor > New query > Paste and Run

-- Create the otp_tokens table to store OTP codes
CREATE TABLE IF NOT EXISTS otp_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create an index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_otp_tokens_email ON otp_tokens(email);

-- Enable Row Level Security (RLS)
ALTER TABLE otp_tokens ENABLE ROW LEVEL SECURITY;

-- Create policy to allow the service role to manage OTP tokens
-- This allows the server-side API to insert, select, and delete tokens
CREATE POLICY "Service role can manage otp_tokens" ON otp_tokens
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Optional: Create a function to automatically clean up expired OTPs
-- This can be called periodically via Supabase scheduled functions or manually
CREATE OR REPLACE FUNCTION cleanup_expired_otps()
RETURNS void AS $$
BEGIN
  DELETE FROM otp_tokens WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
