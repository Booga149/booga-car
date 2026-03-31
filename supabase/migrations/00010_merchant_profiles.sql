-- Add business columns to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS business_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS cr_number TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS city TEXT;

-- Index for searching merchants by business name
CREATE INDEX IF NOT EXISTS profiles_business_name_idx ON public.profiles (business_name);
