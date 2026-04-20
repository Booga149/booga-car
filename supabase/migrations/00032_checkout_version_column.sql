-- add cro_version column to log which A/B variant the customer converted through
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS cro_version TEXT DEFAULT 'v1';
