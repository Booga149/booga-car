-- ============================================================
-- Booga Car - Stock Audit, Restore & Waitlist System
-- Comprehensive inventory hardening
-- ============================================================

-- ═══════════════════════════════════════
-- 1. STOCK MOVEMENTS AUDIT LOG
-- ═══════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.stock_movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  seller_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  change_type TEXT NOT NULL CHECK (change_type IN ('sale_online','sale_store','manual_adjust','order_cancel','restock','emergency_stop','emergency_start')),
  old_quantity INTEGER NOT NULL DEFAULT 0,
  new_quantity INTEGER NOT NULL DEFAULT 0,
  change_amount INTEGER NOT NULL DEFAULT 0,
  reason TEXT,
  reference_id TEXT, -- order_id or store_sale_id
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "seller_own_movements" ON public.stock_movements
  FOR SELECT USING (auth.uid() = seller_id);

CREATE POLICY "insert_movements" ON public.stock_movements
  FOR INSERT WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "admin_movements" ON public.stock_movements
  FOR SELECT USING (public.is_admin(auth.uid()));

CREATE INDEX IF NOT EXISTS idx_stock_movements_product ON public.stock_movements (product_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_stock_movements_seller ON public.stock_movements (seller_id, created_at DESC);

-- ═══════════════════════════════════════
-- 2. UPDATED decrement_stock WITH AUDIT LOG
-- ═══════════════════════════════════════
CREATE OR REPLACE FUNCTION public.decrement_stock(p_product_id UUID, p_quantity INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
  current_qty INTEGER;
  v_seller_id UUID;
BEGIN
  -- Lock the row to prevent race conditions
  SELECT stock_quantity, seller_id INTO current_qty, v_seller_id
  FROM public.products
  WHERE id = p_product_id
  FOR UPDATE;

  IF current_qty IS NULL THEN
    RETURN FALSE;
  END IF;

  IF current_qty < p_quantity THEN
    RETURN FALSE;
  END IF;

  -- Decrement stock
  UPDATE public.products
  SET stock_quantity = stock_quantity - p_quantity,
      updated_at = NOW()
  WHERE id = p_product_id;

  -- Auto-update stock status
  UPDATE public.products
  SET stock = 'غير متوفر'
  WHERE id = p_product_id AND stock_quantity <= 0;

  -- Log the movement
  INSERT INTO public.stock_movements (product_id, seller_id, change_type, old_quantity, new_quantity, change_amount, reason)
  VALUES (p_product_id, v_seller_id, 'sale_online', current_qty, current_qty - p_quantity, -p_quantity, 'بيع من الموقع');

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ═══════════════════════════════════════
-- 3. RESTORE STOCK FUNCTION (for order cancellation)
-- ═══════════════════════════════════════
CREATE OR REPLACE FUNCTION public.restore_stock(p_product_id UUID, p_quantity INTEGER, p_reason TEXT DEFAULT 'إلغاء طلب')
RETURNS BOOLEAN AS $$
DECLARE
  current_qty INTEGER;
  v_seller_id UUID;
BEGIN
  SELECT stock_quantity, seller_id INTO current_qty, v_seller_id
  FROM public.products
  WHERE id = p_product_id
  FOR UPDATE;

  IF current_qty IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Restore stock
  UPDATE public.products
  SET stock_quantity = stock_quantity + p_quantity,
      stock = 'متوفر',
      updated_at = NOW()
  WHERE id = p_product_id;

  -- Log the movement
  INSERT INTO public.stock_movements (product_id, seller_id, change_type, old_quantity, new_quantity, change_amount, reason)
  VALUES (p_product_id, v_seller_id, 'order_cancel', current_qty, current_qty + p_quantity, p_quantity, p_reason);

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ═══════════════════════════════════════
-- 4. LOG MANUAL STOCK ADJUSTMENTS
-- ═══════════════════════════════════════
CREATE OR REPLACE FUNCTION public.log_stock_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log if stock_quantity actually changed and it wasn't from our RPC functions
  IF OLD.stock_quantity IS DISTINCT FROM NEW.stock_quantity THEN
    INSERT INTO public.stock_movements (product_id, seller_id, change_type, old_quantity, new_quantity, change_amount, reason)
    VALUES (
      NEW.id,
      NEW.seller_id,
      CASE
        WHEN NEW.stock_quantity > OLD.stock_quantity THEN 'restock'
        ELSE 'manual_adjust'
      END,
      OLD.stock_quantity,
      NEW.stock_quantity,
      NEW.stock_quantity - OLD.stock_quantity,
      CASE
        WHEN NEW.stock_quantity > OLD.stock_quantity THEN 'إعادة تعبئة المخزون'
        WHEN NEW.stock_quantity = 0 THEN 'تصفير المخزون'
        ELSE 'تعديل يدوي'
      END
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger first to avoid conflicts
DROP TRIGGER IF EXISTS trg_log_stock_change ON public.products;
CREATE TRIGGER trg_log_stock_change
  AFTER UPDATE ON public.products
  FOR EACH ROW
  WHEN (OLD.stock_quantity IS DISTINCT FROM NEW.stock_quantity)
  EXECUTE FUNCTION public.log_stock_change();

-- ═══════════════════════════════════════
-- 5. STOCK WAITLIST (Notify me when available)
-- ═══════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.stock_waitlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  email TEXT,
  notified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, user_id)
);

ALTER TABLE public.stock_waitlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_own_waitlist" ON public.stock_waitlist
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "admin_waitlist" ON public.stock_waitlist
  FOR SELECT USING (public.is_admin(auth.uid()));

-- ═══════════════════════════════════════
-- 6. EMERGENCY BULK OPERATIONS
-- ═══════════════════════════════════════
CREATE OR REPLACE FUNCTION public.emergency_stop_all(p_seller_id UUID)
RETURNS INTEGER AS $$
DECLARE
  affected INTEGER;
BEGIN
  UPDATE public.products
  SET stock = 'غير متوفر', stock_quantity = 0, updated_at = NOW()
  WHERE seller_id = p_seller_id AND stock_quantity > 0;

  GET DIAGNOSTICS affected = ROW_COUNT;
  RETURN affected;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.emergency_reactivate_all(p_seller_id UUID, p_default_qty INTEGER DEFAULT 10)
RETURNS INTEGER AS $$
DECLARE
  affected INTEGER;
BEGIN
  UPDATE public.products
  SET stock = 'متوفر', stock_quantity = p_default_qty, updated_at = NOW()
  WHERE seller_id = p_seller_id AND stock_quantity = 0;

  GET DIAGNOSTICS affected = ROW_COUNT;
  RETURN affected;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ═══════════════════════════════════════
-- DONE
-- ═══════════════════════════════════════
NOTIFY pgrst, 'reload schema';
SELECT 'Stock audit & hardening system installed!' AS result;
