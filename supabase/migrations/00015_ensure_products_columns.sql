-- ============================================================
-- Booga Car - Ensure products table columns for bulk import
-- This migration fixes the "column not found" error by explicitly 
-- checking for and adding missing columns and indexes.
-- ============================================================

-- 1. Ensure 'part_number' column exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'part_number') THEN
    ALTER TABLE public.products ADD COLUMN part_number TEXT;
  END IF;
END $$;

-- 2. Ensure 'description' column exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'description') THEN
    ALTER TABLE public.products ADD COLUMN description TEXT;
  END IF;
END $$;

-- 3. Ensure 'stock_quantity' column exists (for tracking actual inventory numbers)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'stock_quantity') THEN
    ALTER TABLE public.products ADD COLUMN stock_quantity INTEGER DEFAULT 0;
  END IF;
END $$;

-- 4. Re-create the unique index to support the .upsert() logic
-- This index prevents duplicate listings by the same seller for the same brand/part number
DROP INDEX IF EXISTS idx_products_unique_part_brand_seller;

CREATE UNIQUE INDEX idx_products_unique_part_brand_seller 
ON public.products (part_number, brand, seller_id);

-- 4. Reload PostgREST schema cache (Supabase specific notification)
NOTIFY pgrst, 'reload schema';

SELECT 'Database columns and uniqueness constraints updated successfully!' AS result;
