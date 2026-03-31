-- Add analytics columns to products table if they do not exist
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0;

-- Create an index to speed up sorting by views and likes
CREATE INDEX IF NOT EXISTS products_views_count_idx ON public.products(views_count DESC);
CREATE INDEX IF NOT EXISTS products_likes_count_idx ON public.products(likes_count DESC);
