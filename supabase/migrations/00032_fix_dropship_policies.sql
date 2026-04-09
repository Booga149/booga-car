-- Fix dropship RLS policies to use is_admin() function
-- instead of direct profiles query (which causes infinite recursion)

-- Drop old policies
DROP POLICY IF EXISTS "admin_dropship_config" ON dropship_config;
DROP POLICY IF EXISTS "admin_dropship_products" ON dropship_products;
DROP POLICY IF EXISTS "admin_dropship_orders" ON dropship_orders;
DROP POLICY IF EXISTS "admin_dropship_sync_log" ON dropship_sync_log;

-- Recreate with is_admin() function
CREATE POLICY "admin_dropship_config" ON dropship_config
  FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "admin_dropship_products" ON dropship_products
  FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "admin_dropship_orders" ON dropship_orders
  FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "admin_dropship_sync_log" ON dropship_sync_log
  FOR ALL USING (public.is_admin(auth.uid()));

-- Also allow insert on sync_log for API routes
DROP POLICY IF EXISTS "insert_dropship_sync_log" ON dropship_sync_log;
CREATE POLICY "insert_dropship_sync_log" ON dropship_sync_log
  FOR INSERT WITH CHECK (true);
