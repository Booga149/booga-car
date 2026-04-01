-- ============================================================
-- Booga Car - Product Uniqueness Fix
-- Constraint: (part_number, seller_id) is unique
-- Same part_number from DIFFERENT sellers = OK (allowed)
-- Same part_number from SAME seller = DUPLICATE (blocked)
-- Brand is NOT part of uniqueness — part number alone identifies the part
-- ============================================================

-- Drop old 3-column constraint
DROP INDEX IF EXISTS idx_products_unique_part_brand_seller;

-- Create new 2-column constraint: part_number + seller_id
-- NULLs are treated as distinct (so NULL part_number rows won't conflict)
CREATE UNIQUE INDEX idx_products_unique_part_seller
ON public.products (part_number, seller_id)
WHERE part_number IS NOT NULL AND part_number != '' AND part_number != 'N/A';

COMMENT ON INDEX idx_products_unique_part_seller 
IS 'Each seller can only list a given part number once. Different sellers can share the same part number.';
