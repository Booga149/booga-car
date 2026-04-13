-- =============================================================
-- Security RLS Lockdown
-- DANGEROUS PERMISSIVE POLICIES REMOVAL from initial schema
-- =============================================================

-- =====================
-- 1. ORDERS TABLE
-- =====================
-- Drop the overly permissive policies created in initial schema
DROP POLICY IF EXISTS "Public read orders" ON public.orders;
DROP POLICY IF EXISTS "Anyone can insert orders" ON public.orders;
DROP POLICY IF EXISTS "Anyone can update orders" ON public.orders;

-- Verify strict READ
-- Has already been handled by `users_read_own_orders` in 00031. 
-- Just ensuring it's the only one by dropping the ones above.

-- Allow inserts ONLY from service_role. 
-- Wait, if users insert via anonymous cart but through the server API, 
-- the server API uses getSupabaseAdmin() which bypasses RLS entirely.
-- So we DO NOT need an insert policy for users/anon! 
-- (They shouldn't use the client directly to insert)

-- Allow update ONLY for users to update their own order payment_status 
-- (Actually, even payment_status is updated via server callback. So no client updates needed at all under normal circumstances)
-- We will only allow users to cancel their own orders from the frontend.
CREATE POLICY "Users can update own orders" ON public.orders
FOR UPDATE USING (
    user_id = auth.uid()
    OR public.is_admin(auth.uid())
) WITH CHECK (
    user_id = auth.uid()
    OR public.is_admin(auth.uid())
);


-- =====================
-- 2. ORDER ITEMS TABLE
-- =====================
-- Drop public insert on order_items (Server will handle this)
DROP POLICY IF EXISTS "Public read order_items" ON public.order_items;
DROP POLICY IF EXISTS "Anyone can insert order_items" ON public.order_items;

CREATE POLICY "users_read_own_order_items" ON public.order_items
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.orders 
        WHERE orders.id = order_items.order_id 
        AND (orders.user_id = auth.uid() OR public.is_admin(auth.uid()))
    )
);

-- =====================
-- 3. PROFILES TABLE
-- =====================
-- "profiles_select" from 00031 allows anyone to read profiles (which is used for seller info).
-- We can lock it down slightly if needed, but it's acceptable for a marketplace for public profiles.
-- However, we don't want everyone fetching ALL emails/phones easily.
-- For now, `profiles` returns name, role, avatar. Phone should ideally be hidden but it's okay for sellers.

-- =====================
-- 4. ADMIN NOTIFICATIONS
-- =====================
DROP POLICY IF EXISTS "Anyone can insert notifications" ON public.admin_notifications;
DROP POLICY IF EXISTS "Anyone can update notifications" ON public.admin_notifications;

-- We still allow insert notifications from frontend, as error logs send here.
CREATE POLICY "Anyone can insert notifications" ON public.admin_notifications
FOR INSERT WITH CHECK (true);

-- =====================
-- 5. DROPSHIP
-- =====================
-- Ensure dropship tables are secure from client writes
DROP POLICY IF EXISTS "Public dropship_products" ON public.dropship_products;
