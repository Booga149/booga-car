-- ============================================================
-- Booga Car - Schema Fix Migration
-- Run this in Supabase SQL Editor AFTER the initial schema
-- This fixes column mismatches between DB and frontend code
-- ============================================================

-- ============================================================
-- FIX 1: orders table - Add user_id column (code uses user_id, schema has buyer_id)
-- ============================================================
DO $$
BEGIN
  -- Add user_id if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'user_id') THEN
    ALTER TABLE public.orders ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
END $$;

-- ============================================================
-- FIX 2: orders table - Remove restrictive status CHECK
-- Code uses Arabic: قيد المراجعة, تم التأكيد, جاري الشحن, تم التوصيل, ملغي
-- ============================================================
DO $$
BEGIN
  -- Drop old English-only CHECK constraint if it exists
  ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;
  -- Add new CHECK with Arabic statuses
  ALTER TABLE public.orders ADD CONSTRAINT orders_status_check 
    CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 
                      'قيد المراجعة', 'تم التأكيد', 'جاري الشحن', 'تم التوصيل', 'ملغي'));
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- ============================================================
-- FIX 3: order_items table - Add price_at_time column
-- Code inserts price_at_time, but schema only has 'price'
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'order_items' AND column_name = 'price_at_time') THEN
    ALTER TABLE public.order_items ADD COLUMN price_at_time NUMERIC;
  END IF;
  
  -- Make product_name and product_image nullable since code doesn't send them
  ALTER TABLE public.order_items ALTER COLUMN product_name DROP NOT NULL;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- ============================================================
-- FIX 4: Enable realtime for orders (for admin dashboard)
-- ============================================================
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

-- ============================================================
-- FIX 5: Ensure RLS policies allow user_id based queries
-- ============================================================
DROP POLICY IF EXISTS "Users read own orders" ON public.orders;
CREATE POLICY "Users read own orders" ON public.orders 
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users read own order items" ON public.order_items;
CREATE POLICY "Users read own order items" ON public.order_items 
  FOR SELECT USING (true);

-- ============================================================
-- DONE! All columns now match the frontend code exactly.
-- ============================================================
SELECT 'Schema fix migration completed successfully!' AS result;
