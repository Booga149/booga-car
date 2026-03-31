-- Add description column to products table
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS description TEXT;

-- Index for searching descriptions (optional but helpful)
CREATE INDEX IF NOT EXISTS products_description_idx ON public.products USING gin(to_tsvector('arabic', COALESCE(description, '')));
