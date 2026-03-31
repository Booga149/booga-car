-- ============================================================
-- Booga Car - Database Optimizations & Triggers
-- ============================================================

-- 1. ADD INTEGER STOCK QUANTITY
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS stock_quantity INTEGER DEFAULT 10;

-- Prevent negative stock strictly at the database level!
ALTER TABLE public.products ADD CONSTRAINT chk_stock_non_negative CHECK (stock_quantity >= 0);

-- 2. CREATE FUNCTION & TRIGGER TO AUTO-DEDUCT STOCK
-- This guarantees the stock drops automatically without UI logic needing to calculate it
CREATE OR REPLACE FUNCTION deduct_stock_on_purchase()
RETURNS TRIGGER AS $$
BEGIN
  -- Deduct stock
  UPDATE public.products
  SET stock_quantity = stock_quantity - NEW.quantity
  WHERE id = NEW.product_id;

  -- Optional: If stock reaches 0, mark as 'غير متوفر'
  UPDATE public.products
  SET stock = 'غير متوفر'
  WHERE id = NEW.product_id AND stock_quantity <= 0;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if it exists to allow re-running safely
DROP TRIGGER IF EXISTS trg_deduct_stock ON public.order_items;

CREATE TRIGGER trg_deduct_stock
AFTER INSERT ON public.order_items
FOR EACH ROW
EXECUTE FUNCTION deduct_stock_on_purchase();

-- 3. ADD HIGH-PERFORMANCE INDEXES
-- Searching by condition, brand, and category will now avoid full table scans
CREATE INDEX IF NOT EXISTS idx_products_brand ON public.products (brand);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products (category);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON public.products (is_active);

-- Enable trigram extension for very fast text searching (LIKE '%...%') on product names
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS idx_products_name_trgm ON public.products USING GIN (name gin_trgm_ops);
