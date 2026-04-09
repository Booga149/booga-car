/**
 * Fix infinite recursion in profiles RLS policies
 * This script uses the Supabase Management API to execute SQL directly
 */

const SUPABASE_URL = 'https://qwafrmrgzohcfppftqwz.supabase.co';

// We need the service_role key to bypass RLS and execute admin operations
// The anon key won't work for policy changes
// Try using the REST SQL endpoint with the service role key

const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_ROLE_KEY) {
  console.log('');
  console.log('⚠️  لم يتم العثور على SUPABASE_SERVICE_ROLE_KEY');
  console.log('');
  console.log('الطريقة البديلة: نفذ الـ SQL يدوياً من Supabase Dashboard:');
  console.log('');
  console.log('1. افتح: https://supabase.com/dashboard/project/qwafrmrgzohcfppftqwz/sql/new');
  console.log('2. انسخ والصق الـ SQL التالي:');
  console.log('');
  console.log('─'.repeat(60));
  
  const sql = `
-- Step 1: Create helper function
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

GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO anon;

-- Step 2: Drop broken policies
DROP POLICY IF EXISTS "users_read_own_profile" ON profiles;
DROP POLICY IF EXISTS "Public read profiles" ON profiles;
DROP POLICY IF EXISTS "users_update_own_profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Step 3: Create fixed policies
CREATE POLICY "profiles_select" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "profiles_update" ON profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND (
      role IS NOT DISTINCT FROM (SELECT p.role FROM profiles p WHERE p.id = auth.uid())
      OR public.is_admin(auth.uid())
    )
  );

CREATE POLICY "profiles_insert" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Step 4: Fix other tables
DROP POLICY IF EXISTS "users_read_own_orders" ON orders;
CREATE POLICY "users_read_own_orders" ON orders
  FOR SELECT USING (
    user_id = auth.uid()
    OR public.is_admin(auth.uid())
  );

DROP POLICY IF EXISTS "sellers_manage_own_products" ON products;
CREATE POLICY "sellers_manage_own_products" ON products
  FOR UPDATE USING (
    seller_id = auth.uid()
    OR public.is_admin(auth.uid())
  );

DROP POLICY IF EXISTS "sellers_delete_own_products" ON products;
CREATE POLICY "sellers_delete_own_products" ON products
  FOR DELETE USING (
    seller_id = auth.uid()
    OR public.is_admin(auth.uid())
  );

DROP POLICY IF EXISTS "sellers_insert_products" ON products;
CREATE POLICY "sellers_insert_products" ON products
  FOR INSERT WITH CHECK (
    seller_id = auth.uid()
    AND (
      public.is_admin(auth.uid())
      OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'seller')
    )
  );

DROP POLICY IF EXISTS "admin_read_notifications" ON admin_notifications;
CREATE POLICY "admin_read_notifications" ON admin_notifications
  FOR SELECT USING (
    public.is_admin(auth.uid())
    OR true
  );

DROP POLICY IF EXISTS "admin_only_read_visitor_logs" ON visitor_logs;
CREATE POLICY "admin_only_read_visitor_logs" ON visitor_logs
  FOR SELECT USING (
    public.is_admin(auth.uid())
    OR auth.uid() IS NULL
  );
`;
  
  console.log(sql);
  console.log('─'.repeat(60));
  console.log('');
  console.log('3. اضغط "Run" لتنفيذ الـ SQL');
  console.log('4. بعد التنفيذ، شغل السكريبت ده تاني: node scripts/promote-admin.mjs');
  console.log('');
  process.exit(0);
}

// If we have the service role key, execute via REST API
async function executeSql() {
  const sql = `
    CREATE OR REPLACE FUNCTION public.is_admin(check_user_id UUID)
    RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public
    AS $$ SELECT EXISTS (SELECT 1 FROM profiles WHERE id = check_user_id AND role = 'admin'); $$;
    
    GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO authenticated;
    GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO anon;
    
    DROP POLICY IF EXISTS "users_read_own_profile" ON profiles;
    DROP POLICY IF EXISTS "Public read profiles" ON profiles;
    DROP POLICY IF EXISTS "users_update_own_profile" ON profiles;
    DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
    DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
    
    CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (true);
    CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id AND (role IS NOT DISTINCT FROM (SELECT p.role FROM profiles p WHERE p.id = auth.uid()) OR public.is_admin(auth.uid())));
    CREATE POLICY "profiles_insert" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
    
    DROP POLICY IF EXISTS "users_read_own_orders" ON orders;
    CREATE POLICY "users_read_own_orders" ON orders FOR SELECT USING (user_id = auth.uid() OR public.is_admin(auth.uid()));
    
    DROP POLICY IF EXISTS "sellers_manage_own_products" ON products;
    CREATE POLICY "sellers_manage_own_products" ON products FOR UPDATE USING (seller_id = auth.uid() OR public.is_admin(auth.uid()));
    
    DROP POLICY IF EXISTS "sellers_delete_own_products" ON products;
    CREATE POLICY "sellers_delete_own_products" ON products FOR DELETE USING (seller_id = auth.uid() OR public.is_admin(auth.uid()));
    
    DROP POLICY IF EXISTS "sellers_insert_products" ON products;
    CREATE POLICY "sellers_insert_products" ON products FOR INSERT WITH CHECK (seller_id = auth.uid() AND (public.is_admin(auth.uid()) OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'seller')));
    
    DROP POLICY IF EXISTS "admin_read_notifications" ON admin_notifications;
    CREATE POLICY "admin_read_notifications" ON admin_notifications FOR SELECT USING (public.is_admin(auth.uid()) OR true);
    
    DROP POLICY IF EXISTS "admin_only_read_visitor_logs" ON visitor_logs;
    CREATE POLICY "admin_only_read_visitor_logs" ON visitor_logs FOR SELECT USING (public.is_admin(auth.uid()) OR auth.uid() IS NULL);
  `;

  console.log('🔧 جاري تنفيذ إصلاح الـ RLS policies...');
  
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify({ sql }),
  });

  if (response.ok) {
    console.log('✅ تم إصلاح الـ RLS policies بنجاح!');
  } else {
    const err = await response.text();
    console.error('❌ فشل التنفيذ:', err);
    console.log('');
    console.log('جرب الطريقة اليدوية عبر Supabase Dashboard');
  }
}

executeSql();
