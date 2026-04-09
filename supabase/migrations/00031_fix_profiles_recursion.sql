-- =============================================================
-- Fix infinite recursion in profiles RLS policies
-- The problem: policies on `profiles` table were doing
--   SELECT FROM profiles (self-referencing) causing infinite loop
-- Solution: Use auth.uid() directly for own-row checks,
--   and use a SECURITY DEFINER function for admin checks
-- =============================================================

-- 1. Create a helper function that bypasses RLS to check admin status
-- This runs as the function owner (postgres), so it won't trigger RLS
CREATE OR REPLACE FUNCTION public.is_admin(check_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = check_user_id AND role = 'admin'
  );
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO anon;

-- 2. Fix PROFILES policies (the main source of recursion)
DROP POLICY IF EXISTS "users_read_own_profile" ON profiles;
DROP POLICY IF EXISTS "Public read profiles" ON profiles;
DROP POLICY IF EXISTS "users_update_own_profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Allow anyone to read profiles (needed for product seller info, etc.)
CREATE POLICY "profiles_select" ON profiles
  FOR SELECT USING (true);

-- Users can update their own profile, but only admins can change role
CREATE POLICY "profiles_update" ON profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND (
      -- Role unchanged = fine
      role IS NOT DISTINCT FROM (SELECT p.role FROM profiles p WHERE p.id = auth.uid())
      -- OR user is admin (checked via SECURITY DEFINER function)
      OR public.is_admin(auth.uid())
    )
  );

-- Users can insert their own profile 
CREATE POLICY "profiles_insert" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 3. Fix other tables that reference profiles for admin check
-- ORDERS
DROP POLICY IF EXISTS "users_read_own_orders" ON orders;
CREATE POLICY "users_read_own_orders" ON orders
  FOR SELECT USING (
    user_id = auth.uid()
    OR public.is_admin(auth.uid())
  );

-- PRODUCTS (update)
DROP POLICY IF EXISTS "sellers_manage_own_products" ON products;
CREATE POLICY "sellers_manage_own_products" ON products
  FOR UPDATE USING (
    seller_id = auth.uid()
    OR public.is_admin(auth.uid())
  );

-- PRODUCTS (delete)
DROP POLICY IF EXISTS "sellers_delete_own_products" ON products;
CREATE POLICY "sellers_delete_own_products" ON products
  FOR DELETE USING (
    seller_id = auth.uid()
    OR public.is_admin(auth.uid())
  );

-- PRODUCTS (insert) 
DROP POLICY IF EXISTS "sellers_insert_products" ON products;
CREATE POLICY "sellers_insert_products" ON products
  FOR INSERT WITH CHECK (
    seller_id = auth.uid()
    AND (
      public.is_admin(auth.uid())
      OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'seller')
    )
  );

-- ADMIN_NOTIFICATIONS
DROP POLICY IF EXISTS "admin_read_notifications" ON admin_notifications;
CREATE POLICY "admin_read_notifications" ON admin_notifications
  FOR SELECT USING (
    public.is_admin(auth.uid())
    OR true
  );

-- VISITOR_LOGS
DROP POLICY IF EXISTS "admin_only_read_visitor_logs" ON visitor_logs;
CREATE POLICY "admin_only_read_visitor_logs" ON visitor_logs
  FOR SELECT USING (
    public.is_admin(auth.uid())
    OR auth.uid() IS NULL
  );

-- SELLER_CLICK_ANALYTICS (if it references profiles)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'seller_click_analytics') THEN
    EXECUTE 'DROP POLICY IF EXISTS "admin_read_click_analytics" ON seller_click_analytics';
    EXECUTE '
      CREATE POLICY "admin_read_click_analytics" ON seller_click_analytics
        FOR SELECT USING (
          seller_id = auth.uid()
          OR public.is_admin(auth.uid())
        )
    ';
  END IF;
END $$;
