-- ============================================================
-- Booga Car - Store Sales (Physical POS)
-- Track sales made at the physical store (not through website)
-- ============================================================

-- 1. Create store_sales table
CREATE TABLE IF NOT EXISTS public.store_sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC NOT NULL,
  total NUMERIC NOT NULL,
  customer_name TEXT,
  customer_phone TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.store_sales ENABLE ROW LEVEL SECURITY;

-- Seller can only see their own sales
CREATE POLICY "seller_own_store_sales" ON public.store_sales
  FOR ALL USING (auth.uid() = seller_id);

-- Admin can see all
CREATE POLICY "admin_store_sales" ON public.store_sales
  FOR SELECT USING (public.is_admin(auth.uid()));

-- Allow insert for authenticated users
CREATE POLICY "insert_store_sales" ON public.store_sales
  FOR INSERT WITH CHECK (auth.uid() = seller_id);

-- 2. Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_store_sales_seller ON public.store_sales (seller_id, created_at DESC);

-- 3. Notify PostgREST
NOTIFY pgrst, 'reload schema';

SELECT 'Store sales POS system installed!' AS result;
