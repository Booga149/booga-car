-- ============================================================
-- Fix Auth & Registration Permissions
-- Ensures signup works end-to-end with proper RLS policies
-- ============================================================

-- 1. Ensure profiles table has correct RLS policies
-- Drop existing policies that might be too restrictive
DO $$
BEGIN
  -- Drop existing policies if they exist, then recreate
  DROP POLICY IF EXISTS "Public read profiles" ON public.profiles;
  DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
  DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
  DROP POLICY IF EXISTS "Service role can insert profiles" ON public.profiles;
  DROP POLICY IF EXISTS "Allow trigger to insert profiles" ON public.profiles;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- Recreate policies with correct permissions
CREATE POLICY "Public read profiles" ON public.profiles 
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles 
  FOR UPDATE USING (auth.uid() = id);

-- This is critical: the trigger runs as SECURITY DEFINER so it bypasses RLS
-- But authenticated users also need to be able to insert their own profile
CREATE POLICY "Users can insert own profile" ON public.profiles 
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 2. Make the handle_new_user trigger more robust
-- Handle cases where profile might already exist or data might be missing
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone, role)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', split_part(NEW.email, '@', 1)),
    NEW.phone,
    'user'
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    phone = COALESCE(EXCLUDED.phone, profiles.phone),
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Grant necessary permissions to anon and authenticated roles
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT INSERT, UPDATE ON public.profiles TO authenticated;
GRANT INSERT ON public.orders TO authenticated;
GRANT INSERT ON public.order_items TO authenticated;
GRANT INSERT ON public.admin_notifications TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.products TO authenticated;

-- 4. Ensure all sequences are accessible
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- 5. Make sure products table RLS is open for reading
DO $$
BEGIN
  DROP POLICY IF EXISTS "Public read products" ON public.products;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;
CREATE POLICY "Public read products" ON public.products FOR SELECT USING (true);

-- 6. Ensure car_makes and car_models are readable
DO $$
BEGIN
  DROP POLICY IF EXISTS "Public read makes" ON public.car_makes;
  DROP POLICY IF EXISTS "Public read models" ON public.car_models;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;
CREATE POLICY "Public read makes" ON public.car_makes FOR SELECT USING (true);
CREATE POLICY "Public read models" ON public.car_models FOR SELECT USING (true);
