-- ============================================================
-- Booga Car - Secure Checkout RPC (PostgreSQL Function)
-- ============================================================
-- Prevent client-side manipulation of prices, discounts, and commissions!

CREATE OR REPLACE FUNCTION create_secure_order(
  p_user_id UUID,
  p_shipping_address TEXT,
  p_city TEXT,
  p_phone TEXT,
  p_buyer_name TEXT,
  p_payment_method TEXT,
  p_discount_code TEXT,
  p_cart_items JSONB -- Example: [{"product_id": "...", "quantity": 2}, ...]
) RETURNS UUID AS $$
DECLARE
  v_order_id UUID;
  v_total_price NUMERIC := 0;
  v_final_total NUMERIC := 0;
  v_shipping_cost NUMERIC := 35;
  v_item JSONB;
  
  -- Product loop vars
  v_pid UUID;
  v_qty INTEGER;
  v_p_price NUMERIC;
  v_p_name TEXT;
  v_p_image_url TEXT;
  v_p_seller_id UUID;
  v_p_stock INTEGER;
  
  -- Commission vars
  v_commission_rate NUMERIC := 0.10;
  v_platform_fee NUMERIC := 0;
  v_seller_net NUMERIC := 0;
BEGIN
  -- 1. Create the Order in 'pending' status
  INSERT INTO public.orders (
    buyer_id, buyer_name, shipping_address, city, phone, payment_method, status, total, shipping_cost
  ) VALUES (
    p_user_id, p_buyer_name, p_shipping_address, p_city, p_phone, p_payment_method, 'قيد المراجعة', 0, 0
  ) RETURNING id INTO v_order_id;

  -- 2. Loop through cart items JSON
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_cart_items)
  LOOP
    v_pid := (v_item->>'product_id')::UUID;
    v_qty := (v_item->>'quantity')::INTEGER;

    IF v_qty <= 0 THEN
      RAISE EXCEPTION 'الكمية غير صحيحة للمنتج';
    END IF;

    -- Fetch strictly trusted official data from DB
    SELECT price, name, image_url, seller_id, stock_quantity 
    INTO v_p_price, v_p_name, v_p_image_url, v_p_seller_id, v_p_stock
    FROM public.products
    WHERE id = v_pid;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Product % not found in database', v_pid;
    END IF;

    -- Extra safety check (though our trigger handles this too)
    IF v_p_stock < v_qty THEN
      RAISE EXCEPTION 'الكمية المطلوبة ( % ) غير متوفرة في المخزون للمنتج: %', v_qty, v_p_name;
    END IF;

    -- Calculate metrics for THIS specific item (prevent front-end spoofing)
    v_platform_fee := (v_p_price * v_qty) * v_commission_rate;
    v_seller_net   := (v_p_price * v_qty) - v_platform_fee;

    -- Accumulate running total (Subtotal)
    v_total_price := v_total_price + (v_p_price * v_qty);

    -- Insert secure order_item row
    INSERT INTO public.order_items (
      order_id, product_id, product_name, product_image, quantity, price, 
      seller_id, commission_rate, platform_fee, seller_net
    ) VALUES (
      v_order_id, v_pid, v_p_name, v_p_image_url, v_qty, v_p_price, 
      v_p_seller_id, v_commission_rate, v_platform_fee, v_seller_net
    );
  END LOOP;

  -- 3. Apply Business Rules securely on the Subtotal
  
  -- Shipping Logic (Free shipping over 500)
  IF v_total_price > 500 THEN
    v_shipping_cost := 0;
  END IF;

  -- Discount Logic
  v_final_total := v_total_price;
  IF p_discount_code = 'SAUDI15' THEN
    v_final_total := ROUND(v_total_price * 0.85); -- 15% discount
  END IF;

  -- Add shipping to the final total
  v_final_total := v_final_total + v_shipping_cost;

  -- 4. Finalize the Order Total
  UPDATE public.orders
  SET 
    total = v_final_total, 
    shipping_cost = v_shipping_cost
  WHERE id = v_order_id;

  -- 5. Send an admin notification (trigger safe)
  INSERT INTO public.admin_notifications (type, title, message)
  VALUES ('NEW_ORDER', 'طلب جديد', 'مبلغ الطلب: ' || v_final_total || ' ر.س من ' || p_buyer_name);

  -- 6. Return the secure order id back to client
  RETURN v_order_id;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
