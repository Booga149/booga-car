-- ============================================================
-- Booga Car - Product Uniqueness constraint
-- Ensures: 
-- 1. Same part number can exist for multiple brands (OK)
-- 2. Same seller cannot list SAME part number + SAME brand multiple times (DUPLICATE)
-- ============================================================

-- First, ensure part_number, brand, and seller_id are not null where possible
-- or handle NULLs in the index.
-- For safety, we'll allow NULLs but the unique index TREATS them as unique values.

DROP INDEX IF EXISTS idx_products_unique_part_brand_seller;

CREATE UNIQUE INDEX idx_products_unique_part_brand_seller 
ON public.products (part_number, brand, seller_id);

-- Optional: Add a comment
COMMENT ON INDEX idx_products_unique_part_brand_seller IS 'Ensures uniqueness of product listing based on Part Number, Brand, and Seller ID.';
