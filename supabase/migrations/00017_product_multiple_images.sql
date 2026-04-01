-- ============================================================
-- Booga Car — Multiple Product Images Support
-- Adds an `images` JSON array column to store multiple image URLs per product
-- ============================================================

ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS images jsonb DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.products.images IS 
'Array of image URLs for this product. Stored as JSON array: ["url1", "url2", ...]';
