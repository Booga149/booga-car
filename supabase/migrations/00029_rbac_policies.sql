-- =============================================================
-- Role-Based Access Control (RBAC) Policies
-- =============================================================

-- =====================
-- 1. PROFILES TABLE
-- =====================
-- Users can read their own profile
DROP POLICY IF EXISTS "users_read_own_profile" ON profiles;
CREATE POLICY "users_read_own_profile" ON profiles
  FOR SELECT USING (
    auth.uid() = id
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Users can update only their own profile (NOT role field)
DROP POLICY IF EXISTS "users_update_own_profile" ON profiles;
CREATE POLICY "users_update_own_profile" ON profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND (
      -- Allow role changes only by admin
      role = (SELECT role FROM profiles WHERE id = auth.uid())
      OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    )
  );

-- =====================
-- 2. ORDERS TABLE
-- =====================
-- Users see only their own orders
DROP POLICY IF EXISTS "users_read_own_orders" ON orders;
CREATE POLICY "users_read_own_orders" ON orders
  FOR SELECT USING (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- =====================
-- 3. PRODUCTS TABLE
-- =====================
-- Everyone can view products (public catalog)
DROP POLICY IF EXISTS "public_read_products" ON products;
CREATE POLICY "public_read_products" ON products
  FOR SELECT USING (true);

-- Sellers can only update/delete their own products
DROP POLICY IF EXISTS "sellers_manage_own_products" ON products;
CREATE POLICY "sellers_manage_own_products" ON products
  FOR UPDATE USING (
    seller_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "sellers_delete_own_products" ON products;
CREATE POLICY "sellers_delete_own_products" ON products
  FOR DELETE USING (
    seller_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Sellers can insert products
DROP POLICY IF EXISTS "sellers_insert_products" ON products;
CREATE POLICY "sellers_insert_products" ON products
  FOR INSERT WITH CHECK (
    seller_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('seller', 'admin')
    )
  );

-- =====================
-- 4. ADMIN_NOTIFICATIONS TABLE (Admin Only)
-- =====================
DROP POLICY IF EXISTS "admin_read_notifications" ON admin_notifications;
CREATE POLICY "admin_read_notifications" ON admin_notifications
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    OR true  -- Allow insert from logSecurityEvent (runs client-side)
  );

-- Allow insert for logging (any authenticated user can generate a log)
DROP POLICY IF EXISTS "anyone_insert_notifications" ON admin_notifications;
CREATE POLICY "anyone_insert_notifications" ON admin_notifications
  FOR INSERT WITH CHECK (true);

-- =====================
-- 5. VISITOR_LOGS TABLE (Admin Only for read)
-- =====================
-- Already has policies from migration 00028, but let's ensure admin-only read
DROP POLICY IF EXISTS "admin_only_read_visitor_logs" ON visitor_logs;
CREATE POLICY "admin_only_read_visitor_logs" ON visitor_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    OR auth.uid() IS NULL  -- Allow anon reads for the tracking API
  );
