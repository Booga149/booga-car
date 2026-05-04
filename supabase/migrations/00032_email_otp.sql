-- Email OTP verification table
CREATE TABLE IF NOT EXISTS public.email_otps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '5 minutes'),
  used BOOLEAN DEFAULT false,
  attempts INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_email_otps_email ON public.email_otps(email, used);

-- Auto-cleanup old OTPs (older than 1 hour)
CREATE OR REPLACE FUNCTION cleanup_expired_otps()
RETURNS void AS $$
BEGIN
  DELETE FROM public.email_otps WHERE expires_at < NOW() - INTERVAL '1 hour';
END;
$$ LANGUAGE plpgsql;

-- RLS: only server can access
ALTER TABLE public.email_otps ENABLE ROW LEVEL SECURITY;
-- No public policies = only service role can access
