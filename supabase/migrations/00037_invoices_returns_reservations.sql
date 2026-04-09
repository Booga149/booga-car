-- ============================================================
-- Booga Car - Invoices, Returns & Stock Reservation System
-- Complete enterprise inventory management
-- ============================================================

-- ═══════════════════════════════════════
-- 1. INVOICE SEQUENCE (auto-incrementing numbers)
-- ═══════════════════════════════════════
CREATE SEQUENCE IF NOT EXISTS invoice_seq START WITH 1000;
CREATE SEQUENCE IF NOT EXISTS return_seq START WITH 1000;

-- ═══════════════════════════════════════
-- 2. INVOICES TABLE
-- ═══════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_number TEXT UNIQUE NOT NULL,
  seller_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  store_sale_id UUID REFERENCES public.store_sales(id) ON DELETE SET NULL,
  source TEXT NOT NULL CHECK (source IN ('online','store')),
  status TEXT NOT NULL DEFAULT 'مكتملة' CHECK (status IN ('مكتملة','ملغية','مرتجعة جزئياً','مرتجعة')),
  subtotal NUMERIC NOT NULL DEFAULT 0,
  discount NUMERIC NOT NULL DEFAULT 0,
  total NUMERIC NOT NULL DEFAULT 0,
  customer_name TEXT,
  customer_phone TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "seller_own_invoices" ON public.invoices FOR ALL USING (auth.uid() = seller_id);
CREATE POLICY "admin_invoices" ON public.invoices FOR SELECT USING (public.is_admin(auth.uid()));

CREATE INDEX IF NOT EXISTS idx_invoices_seller ON public.invoices (seller_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_invoices_number ON public.invoices (invoice_number);

-- ═══════════════════════════════════════
-- 3. INVOICE ITEMS
-- ═══════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.invoice_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC NOT NULL,
  total NUMERIC NOT NULL,
  returned_quantity INTEGER NOT NULL DEFAULT 0
);

ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "invoice_items_via_invoice" ON public.invoice_items
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.invoices WHERE id = invoice_id AND seller_id = auth.uid())
  );

-- ═══════════════════════════════════════
-- 4. RETURNS TABLE
-- ═══════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.returns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  return_number TEXT UNIQUE NOT NULL,
  invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE NOT NULL,
  seller_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  reason TEXT,
  total_refund NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'مكتمل' CHECK (status IN ('مكتمل','ملغي')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.returns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "seller_own_returns" ON public.returns FOR ALL USING (auth.uid() = seller_id);

-- ═══════════════════════════════════════
-- 5. RETURN ITEMS
-- ═══════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.return_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  return_id UUID REFERENCES public.returns(id) ON DELETE CASCADE NOT NULL,
  invoice_item_id UUID REFERENCES public.invoice_items(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC NOT NULL,
  total NUMERIC NOT NULL
);

ALTER TABLE public.return_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "return_items_via_return" ON public.return_items
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.returns WHERE id = return_id AND seller_id = auth.uid())
  );

-- ═══════════════════════════════════════
-- 6. STOCK RESERVATIONS
-- ═══════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.stock_reservations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','completed','expired')),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '15 minutes'),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.stock_reservations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_own_reservations" ON public.stock_reservations FOR ALL USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_reservations_product ON public.stock_reservations (product_id, status);
CREATE INDEX IF NOT EXISTS idx_reservations_expires ON public.stock_reservations (expires_at) WHERE status = 'active';

-- ═══════════════════════════════════════
-- 7. RESERVE STOCK FUNCTION
-- ═══════════════════════════════════════
CREATE OR REPLACE FUNCTION public.reserve_stock(p_product_id UUID, p_quantity INTEGER, p_user_id UUID)
RETURNS UUID AS $$
DECLARE
  current_qty INTEGER;
  reserved_qty INTEGER;
  available INTEGER;
  res_id UUID;
BEGIN
  -- Lock product row
  SELECT stock_quantity INTO current_qty
  FROM public.products WHERE id = p_product_id FOR UPDATE;

  IF current_qty IS NULL THEN
    RAISE EXCEPTION 'المنتج غير موجود';
  END IF;

  -- Calculate already reserved quantity (active, not expired)
  SELECT COALESCE(SUM(quantity), 0) INTO reserved_qty
  FROM public.stock_reservations
  WHERE product_id = p_product_id AND status = 'active' AND expires_at > NOW();

  available := current_qty - reserved_qty;

  IF available < p_quantity THEN
    RAISE EXCEPTION 'الكمية المتاحة غير كافية: متبقي % قطع فقط', available;
  END IF;

  -- Create reservation
  INSERT INTO public.stock_reservations (product_id, user_id, quantity, expires_at)
  VALUES (p_product_id, p_user_id, p_quantity, NOW() + INTERVAL '15 minutes')
  RETURNING id INTO res_id;

  RETURN res_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ═══════════════════════════════════════
-- 8. COMPLETE RESERVATION (convert to sale)
-- ═══════════════════════════════════════
CREATE OR REPLACE FUNCTION public.complete_reservation(p_reservation_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.stock_reservations
  SET status = 'completed'
  WHERE id = p_reservation_id AND status = 'active';

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ═══════════════════════════════════════
-- 9. RELEASE EXPIRED RESERVATIONS (call periodically)
-- ═══════════════════════════════════════
CREATE OR REPLACE FUNCTION public.release_expired_reservations()
RETURNS INTEGER AS $$
DECLARE
  affected INTEGER;
BEGIN
  UPDATE public.stock_reservations
  SET status = 'expired'
  WHERE status = 'active' AND expires_at <= NOW();

  GET DIAGNOSTICS affected = ROW_COUNT;
  RETURN affected;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ═══════════════════════════════════════
-- 10. CREATE INVOICE FUNCTION
-- ═══════════════════════════════════════
CREATE OR REPLACE FUNCTION public.create_invoice(
  p_seller_id UUID,
  p_source TEXT,
  p_order_id UUID DEFAULT NULL,
  p_store_sale_id UUID DEFAULT NULL,
  p_subtotal NUMERIC DEFAULT 0,
  p_discount NUMERIC DEFAULT 0,
  p_total NUMERIC DEFAULT 0,
  p_customer_name TEXT DEFAULT NULL,
  p_customer_phone TEXT DEFAULT NULL
)
RETURNS TEXT AS $$
DECLARE
  v_invoice_number TEXT;
  v_prefix TEXT;
  v_seq INTEGER;
BEGIN
  v_seq := nextval('invoice_seq');
  v_prefix := CASE WHEN p_source = 'online' THEN 'INV' ELSE 'POS' END;
  v_invoice_number := v_prefix || '-' || LPAD(v_seq::TEXT, 6, '0');

  INSERT INTO public.invoices (
    invoice_number, seller_id, order_id, store_sale_id, source,
    subtotal, discount, total, customer_name, customer_phone
  ) VALUES (
    v_invoice_number, p_seller_id, p_order_id, p_store_sale_id, p_source,
    p_subtotal, p_discount, p_total, p_customer_name, p_customer_phone
  );

  RETURN v_invoice_number;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ═══════════════════════════════════════
-- 11. PROCESS RETURN FUNCTION
-- ═══════════════════════════════════════
CREATE OR REPLACE FUNCTION public.process_return(
  p_invoice_id UUID,
  p_seller_id UUID,
  p_reason TEXT DEFAULT NULL
)
RETURNS TEXT AS $$
DECLARE
  v_return_number TEXT;
  v_seq INTEGER;
BEGIN
  v_seq := nextval('return_seq');
  v_return_number := 'RET-' || LPAD(v_seq::TEXT, 6, '0');

  INSERT INTO public.returns (return_number, invoice_id, seller_id, reason)
  VALUES (v_return_number, p_invoice_id, p_seller_id, p_reason);

  RETURN v_return_number;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ═══════════════════════════════════════
-- DONE
-- ═══════════════════════════════════════
NOTIFY pgrst, 'reload schema';
SELECT 'Invoices, Returns & Reservation system installed!' AS result;
