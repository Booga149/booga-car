-- Fix infinite recursion in profiles RLS policies
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/qwafrmrgzohcfppftqwz/sql

-- Step 1: Drop all existing policies on profiles
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Allow users to view own profile" ON profiles;
DROP POLICY IF EXISTS "Allow users to update own profile" ON profiles;
DROP POLICY IF EXISTS "Allow users to insert own profile" ON profiles;
DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Allow public read" ON profiles;
DROP POLICY IF EXISTS "profiles_select" ON profiles;
DROP POLICY IF EXISTS "profiles_insert" ON profiles;
DROP POLICY IF EXISTS "profiles_update" ON profiles;

-- Step 2: Create simple, non-recursive policies
-- SELECT: users can read their own profile
CREATE POLICY "profiles_select" ON profiles FOR SELECT
  USING (auth.uid() = id);

-- INSERT: users can create their own profile  
CREATE POLICY "profiles_insert" ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- UPDATE: users can update their own profile
CREATE POLICY "profiles_update" ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Step 3: Make sure the admin user has the admin role
UPDATE profiles SET role = 'admin' WHERE id = '2698d2e6-036f-47a9-9571-032625b1c733';

-- Step 4: Verify
SELECT id, full_name, role FROM profiles WHERE id = '2698d2e6-036f-47a9-9571-032625b1c733';
