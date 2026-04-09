-- ============================================================
-- Booga Car - Inventory Management System
-- Handles: atomic stock decrement, auto-sync stock status,
--          low-stock alerts, and order rejection support
-- ============================================================

-- 1. Add rejection_reason to orders (for seller rejections)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'rejection_reason') THEN
    ALTER TABLE public.orders ADD COLUMN rejection_reason TEXT;
  END IF;
END $$;

-- 2. Backfill: Set stock_quantity = 10 for all products that are 'متوفر' but have 0 quantity
-- This prevents breaking existing products
UPDATE public.products
SET stock_quantity = 10
WHERE stock = 'متوفر' AND (stock_quantity IS NULL OR stock_quantity = 0);

-- 3. Create atomic stock decrement function
-- Returns true if successful, false if not enough stock
CREATE OR REPLACE FUNCTION public.decrement_stock(p_product_id UUID, p_quantity INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
  current_qty INTEGER;
BEGIN
  -- Lock the row to prevent race conditions
  SELECT stock_quantity INTO current_qty
  FROM public.products
  WHERE id = p_product_id
  FOR UPDATE;

  IF current_qty IS NULL THEN
    RETURN FALSE; -- Product not found
  END IF;

  IF current_qty < p_quantity THEN
    RETURN FALSE; -- Not enough stock
  END IF;

  -- Decrement stock
  UPDATE public.products
  SET stock_quantity = stock_quantity - p_quantity,
      updated_at = NOW()
  WHERE id = p_product_id;

  -- Auto-update stock status if quantity reaches 0
  UPDATE public.products
  SET stock = 'غير متوفر'
  WHERE id = p_product_id AND stock_quantity <= 0;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Create trigger to auto-sync stock status when stock_quantity changes
CREATE OR REPLACE FUNCTION public.sync_stock_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.stock_quantity <= 0 AND OLD.stock_quantity > 0 THEN
    NEW.stock := 'غير متوفر';
  ELSIF NEW.stock_quantity > 0 AND OLD.stock_quantity <= 0 THEN
    NEW.stock := 'متوفر';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_stock_status ON public.products;
CREATE TRIGGER trg_sync_stock_status
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  WHEN (OLD.stock_quantity IS DISTINCT FROM NEW.stock_quantity)
  EXECUTE FUNCTION public.sync_stock_status();

-- 5. Create low-stock notification function
-- Called after stock decrement to alert seller
CREATE OR REPLACE FUNCTION public.check_low_stock(p_product_id UUID)
RETURNS VOID AS $$
DECLARE
  v_qty INTEGER;
  v_name TEXT;
  v_seller_id UUID;
BEGIN
  SELECT stock_quantity, name, seller_id INTO v_qty, v_name, v_seller_id
  FROM public.products WHERE id = p_product_id;

  IF v_qty IS NOT NULL AND v_qty <= 3 AND v_qty > 0 AND v_seller_id IS NOT NULL THEN
    -- Send notification to seller
    INSERT INTO public.user_notifications (user_id, type, title, message, link)
    VALUES (
      v_seller_id,
      'low_stock',
      '⚠️ تنبيه مخزون منخفض!',
      'المنتج "' || v_name || '" متبقي منه ' || v_qty || ' قطع فقط. قم بتحديث المخزون.',
      '/seller/products'
    );
    -- Also notify admin
    INSERT INTO public.admin_notifications (type, title, message)
    VALUES (
      'LOW_STOCK',
      '📦 مخزون منخفض',
      'المنتج "' || v_name || '" متبقي منه ' || v_qty || ' قطع فقط.'
    );
  ELSIF v_qty IS NOT NULL AND v_qty = 0 THEN
    -- Out of stock notification
    INSERT INTO public.admin_notifications (type, title, message)
    VALUES (
      'OUT_OF_STOCK',
      '🚫 نفد المخزون!',
      'المنتج "' || v_name || '" نفد من المخزون بالكامل.'
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';

SELECT 'Inventory management system installed successfully!' AS result;
