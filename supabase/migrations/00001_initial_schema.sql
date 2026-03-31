-- ============================================================
-- Booga Car - Complete Database Schema
-- Run this ENTIRE file in Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. PROFILES (بيانات المستخدمين)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  phone TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'seller')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 2. CAR_MAKES (ماركات السيارات)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.car_makes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.car_makes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read makes" ON public.car_makes FOR SELECT USING (true);
CREATE POLICY "Anyone can insert makes" ON public.car_makes FOR INSERT WITH CHECK (true);

-- ============================================================
-- 3. CAR_MODELS (موديلات السيارات)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.car_models (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  make_id UUID REFERENCES public.car_makes(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(make_id, name)
);

ALTER TABLE public.car_models ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read models" ON public.car_models FOR SELECT USING (true);
CREATE POLICY "Anyone can insert models" ON public.car_models FOR INSERT WITH CHECK (true);

-- ============================================================
-- 4. PRODUCTS (المنتجات / قطع الغيار)
--    Matches ProductsContext.tsx column expectations exactly
-- ============================================================
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  brand TEXT DEFAULT 'غير محدد',
  category TEXT DEFAULT 'أخرى',
  price NUMERIC NOT NULL,
  old_price NUMERIC,
  condition TEXT DEFAULT 'جديد' CHECK (condition IN ('جديد', 'مستعمل')),
  stock TEXT DEFAULT 'متوفر' CHECK (stock IN ('متوفر', 'غير متوفر')),
  shipping TEXT DEFAULT 'عادي' CHECK (shipping IN ('مجاني', 'عادي')),
  rating NUMERIC DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  seller_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  make_id UUID REFERENCES public.car_makes(id) ON DELETE SET NULL,
  model_id UUID REFERENCES public.car_models(id) ON DELETE SET NULL,
  part_number TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Anyone can insert products" ON public.products FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update products" ON public.products FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete products" ON public.products FOR DELETE USING (true);

-- ============================================================
-- 5. ORDERS (الطلبات)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  total NUMERIC NOT NULL DEFAULT 0,
  shipping_cost NUMERIC DEFAULT 0,
  shipping_address TEXT,
  city TEXT,
  phone TEXT,
  buyer_name TEXT,
  payment_method TEXT DEFAULT 'نقد',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read orders" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Anyone can insert orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update orders" ON public.orders FOR UPDATE USING (true);

-- ============================================================
-- 6. ORDER_ITEMS (عناصر الطلبات)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  product_image TEXT,
  price NUMERIC NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read order_items" ON public.order_items FOR SELECT USING (true);
CREATE POLICY "Anyone can insert order_items" ON public.order_items FOR INSERT WITH CHECK (true);

-- ============================================================
-- 7. ADMIN_NOTIFICATIONS (إشعارات المدير)
--    Used by: useAdminNotifications hook, admin/logs, admin/users
-- ============================================================
CREATE TABLE IF NOT EXISTS public.admin_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL DEFAULT 'GENERAL',
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read notifications" ON public.admin_notifications FOR SELECT USING (true);
CREATE POLICY "Anyone can insert notifications" ON public.admin_notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update notifications" ON public.admin_notifications FOR UPDATE USING (true);

-- Enable realtime for admin notifications
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_notifications;
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

-- ============================================================
-- SEED DATA: Car Makes & Models
-- ============================================================

-- شيري (Chery)
INSERT INTO public.car_makes (id, name) VALUES ('626b2904-85f0-490a-bfad-5a9b582209af', 'شيري (Chery)') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('626b2904-85f0-490a-bfad-5a9b582209af', 'Arrizo 5') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('626b2904-85f0-490a-bfad-5a9b582209af', 'Arrizo 6') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('626b2904-85f0-490a-bfad-5a9b582209af', 'Tiggo 3') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('626b2904-85f0-490a-bfad-5a9b582209af', 'Tiggo 7') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('626b2904-85f0-490a-bfad-5a9b582209af', 'Tiggo 8 Pro') ON CONFLICT DO NOTHING;

-- جيلي (Geely)
INSERT INTO public.car_makes (id, name) VALUES ('ef0340b4-a2e4-4765-8564-b1fda67305ac', 'جيلي (Geely)') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('ef0340b4-a2e4-4765-8564-b1fda67305ac', 'Coolray') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('ef0340b4-a2e4-4765-8564-b1fda67305ac', 'Okavango') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('ef0340b4-a2e4-4765-8564-b1fda67305ac', 'Azkarra') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('ef0340b4-a2e4-4765-8564-b1fda67305ac', 'Tugella') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('ef0340b4-a2e4-4765-8564-b1fda67305ac', 'Monjaro') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('ef0340b4-a2e4-4765-8564-b1fda67305ac', 'Emgrand') ON CONFLICT DO NOTHING;

-- ام جي (MG)
INSERT INTO public.car_makes (id, name) VALUES ('4d559d20-52b6-4544-885e-7b5241c1d442', 'ام جي (MG)') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('4d559d20-52b6-4544-885e-7b5241c1d442', 'MG 5') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('4d559d20-52b6-4544-885e-7b5241c1d442', 'MG 6') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('4d559d20-52b6-4544-885e-7b5241c1d442', 'MG GT') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('4d559d20-52b6-4544-885e-7b5241c1d442', 'MG ZS') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('4d559d20-52b6-4544-885e-7b5241c1d442', 'MG RX5') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('4d559d20-52b6-4544-885e-7b5241c1d442', 'MG HS') ON CONFLICT DO NOTHING;

-- كيا (Kia)
INSERT INTO public.car_makes (id, name) VALUES ('a314b878-a549-4c44-93bd-a330937bcd1f', 'كيا (Kia)') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('a314b878-a549-4c44-93bd-a330937bcd1f', 'Rio') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('a314b878-a549-4c44-93bd-a330937bcd1f', 'Pegas') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('a314b878-a549-4c44-93bd-a330937bcd1f', 'Cerato') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('a314b878-a549-4c44-93bd-a330937bcd1f', 'K5') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('a314b878-a549-4c44-93bd-a330937bcd1f', 'Cadenza') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('a314b878-a549-4c44-93bd-a330937bcd1f', 'Sportage') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('a314b878-a549-4c44-93bd-a330937bcd1f', 'Sorento') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('a314b878-a549-4c44-93bd-a330937bcd1f', 'Telluride') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('a314b878-a549-4c44-93bd-a330937bcd1f', 'Carnival') ON CONFLICT DO NOTHING;

-- هيونداي (Hyundai)
INSERT INTO public.car_makes (id, name) VALUES ('1e37e553-f622-42d9-8e9d-0034e78d4a0d', 'هيونداي (Hyundai)') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('1e37e553-f622-42d9-8e9d-0034e78d4a0d', 'Accent') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('1e37e553-f622-42d9-8e9d-0034e78d4a0d', 'Elantra') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('1e37e553-f622-42d9-8e9d-0034e78d4a0d', 'Sonata') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('1e37e553-f622-42d9-8e9d-0034e78d4a0d', 'Azera') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('1e37e553-f622-42d9-8e9d-0034e78d4a0d', 'Creta') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('1e37e553-f622-42d9-8e9d-0034e78d4a0d', 'Tucson') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('1e37e553-f622-42d9-8e9d-0034e78d4a0d', 'Santa Fe') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('1e37e553-f622-42d9-8e9d-0034e78d4a0d', 'Palisade') ON CONFLICT DO NOTHING;

-- نيسان (Nissan)
INSERT INTO public.car_makes (id, name) VALUES ('f7a8358f-ea57-43d5-9c2f-089be20a0fd9', 'نيسان (Nissan)') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('f7a8358f-ea57-43d5-9c2f-089be20a0fd9', 'Sunny') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('f7a8358f-ea57-43d5-9c2f-089be20a0fd9', 'Sentra') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('f7a8358f-ea57-43d5-9c2f-089be20a0fd9', 'Altima') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('f7a8358f-ea57-43d5-9c2f-089be20a0fd9', 'Maxima') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('f7a8358f-ea57-43d5-9c2f-089be20a0fd9', 'Kicks') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('f7a8358f-ea57-43d5-9c2f-089be20a0fd9', 'X-Trail') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('f7a8358f-ea57-43d5-9c2f-089be20a0fd9', 'Pathfinder') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('f7a8358f-ea57-43d5-9c2f-089be20a0fd9', 'Patrol') ON CONFLICT DO NOTHING;

-- هوندا (Honda)
INSERT INTO public.car_makes (id, name) VALUES ('5e7b6bf8-ccef-4032-bc3a-63f83b02238d', 'هوندا (Honda)') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('5e7b6bf8-ccef-4032-bc3a-63f83b02238d', 'City') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('5e7b6bf8-ccef-4032-bc3a-63f83b02238d', 'Civic') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('5e7b6bf8-ccef-4032-bc3a-63f83b02238d', 'Accord') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('5e7b6bf8-ccef-4032-bc3a-63f83b02238d', 'HR-V') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('5e7b6bf8-ccef-4032-bc3a-63f83b02238d', 'CR-V') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('5e7b6bf8-ccef-4032-bc3a-63f83b02238d', 'Pilot') ON CONFLICT DO NOTHING;

-- تويوتا (Toyota)
INSERT INTO public.car_makes (id, name) VALUES ('67f1cad0-3795-463f-adef-ee17d831b62b', 'تويوتا (Toyota)') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('67f1cad0-3795-463f-adef-ee17d831b62b', 'Yaris') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('67f1cad0-3795-463f-adef-ee17d831b62b', 'Corolla') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('67f1cad0-3795-463f-adef-ee17d831b62b', 'Camry') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('67f1cad0-3795-463f-adef-ee17d831b62b', 'Avalon') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('67f1cad0-3795-463f-adef-ee17d831b62b', 'Raize') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('67f1cad0-3795-463f-adef-ee17d831b62b', 'Corolla Cross') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('67f1cad0-3795-463f-adef-ee17d831b62b', 'RAV4') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('67f1cad0-3795-463f-adef-ee17d831b62b', 'Fortuner') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('67f1cad0-3795-463f-adef-ee17d831b62b', 'Prado') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('67f1cad0-3795-463f-adef-ee17d831b62b', 'Land Cruiser') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('67f1cad0-3795-463f-adef-ee17d831b62b', 'Hilux') ON CONFLICT DO NOTHING;

-- مازدا (Mazda)
INSERT INTO public.car_makes (id, name) VALUES ('3076f5ec-97c1-4876-8310-9b28c7ccc7d2', 'مازدا (Mazda)') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('3076f5ec-97c1-4876-8310-9b28c7ccc7d2', 'Mazda 3') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('3076f5ec-97c1-4876-8310-9b28c7ccc7d2', 'Mazda 6') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('3076f5ec-97c1-4876-8310-9b28c7ccc7d2', 'CX-30') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('3076f5ec-97c1-4876-8310-9b28c7ccc7d2', 'CX-5') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('3076f5ec-97c1-4876-8310-9b28c7ccc7d2', 'CX-9') ON CONFLICT DO NOTHING;

-- ميستوبيشي (Mitsubishi)
INSERT INTO public.car_makes (id, name) VALUES ('70bca9fc-c50f-4eaa-a6b7-26c38a099815', 'ميستوبيشي (Mitsubishi)') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('70bca9fc-c50f-4eaa-a6b7-26c38a099815', 'Attrage') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('70bca9fc-c50f-4eaa-a6b7-26c38a099815', 'Eclipse Cross') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('70bca9fc-c50f-4eaa-a6b7-26c38a099815', 'Outlander') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('70bca9fc-c50f-4eaa-a6b7-26c38a099815', 'Pajero') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('70bca9fc-c50f-4eaa-a6b7-26c38a099815', 'L200') ON CONFLICT DO NOTHING;

-- شيفروليه (Chevrolet)
INSERT INTO public.car_makes (id, name) VALUES ('e6a0ac94-805d-494d-9e6a-edde5e80b6c3', 'شيفروليه (Chevrolet)') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('e6a0ac94-805d-494d-9e6a-edde5e80b6c3', 'Spark') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('e6a0ac94-805d-494d-9e6a-edde5e80b6c3', 'Malibu') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('e6a0ac94-805d-494d-9e6a-edde5e80b6c3', 'Camaro') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('e6a0ac94-805d-494d-9e6a-edde5e80b6c3', 'Corvette') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('e6a0ac94-805d-494d-9e6a-edde5e80b6c3', 'Captiva') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('e6a0ac94-805d-494d-9e6a-edde5e80b6c3', 'Equinox') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('e6a0ac94-805d-494d-9e6a-edde5e80b6c3', 'Traverse') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('e6a0ac94-805d-494d-9e6a-edde5e80b6c3', 'Tahoe') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('e6a0ac94-805d-494d-9e6a-edde5e80b6c3', 'Suburban') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('e6a0ac94-805d-494d-9e6a-edde5e80b6c3', 'Silverado') ON CONFLICT DO NOTHING;

-- فورد (Ford)
INSERT INTO public.car_makes (id, name) VALUES ('83d991ab-876f-4050-b599-1ca51713919c', 'فورد (Ford)') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('83d991ab-876f-4050-b599-1ca51713919c', 'Taurus') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('83d991ab-876f-4050-b599-1ca51713919c', 'Mustang') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('83d991ab-876f-4050-b599-1ca51713919c', 'Escape') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('83d991ab-876f-4050-b599-1ca51713919c', 'Edge') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('83d991ab-876f-4050-b599-1ca51713919c', 'Explorer') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('83d991ab-876f-4050-b599-1ca51713919c', 'Expedition') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('83d991ab-876f-4050-b599-1ca51713919c', 'F-150') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('83d991ab-876f-4050-b599-1ca51713919c', 'Bronco') ON CONFLICT DO NOTHING;

-- جي ام سي (GMC)
INSERT INTO public.car_makes (id, name) VALUES ('e9aec77f-1230-4b50-a138-0d13dbabedef', 'جي ام سي (GMC)') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('e9aec77f-1230-4b50-a138-0d13dbabedef', 'Terrain') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('e9aec77f-1230-4b50-a138-0d13dbabedef', 'Acadia') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('e9aec77f-1230-4b50-a138-0d13dbabedef', 'Yukon') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('e9aec77f-1230-4b50-a138-0d13dbabedef', 'Yukon XL') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('e9aec77f-1230-4b50-a138-0d13dbabedef', 'Sierra') ON CONFLICT DO NOTHING;

-- دودج (Dodge)
INSERT INTO public.car_makes (id, name) VALUES ('5eafa32d-5caf-4d98-b3b9-3e1bc7dee48e', 'دودج (Dodge)') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('5eafa32d-5caf-4d98-b3b9-3e1bc7dee48e', 'Charger') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('5eafa32d-5caf-4d98-b3b9-3e1bc7dee48e', 'Challenger') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('5eafa32d-5caf-4d98-b3b9-3e1bc7dee48e', 'Durango') ON CONFLICT DO NOTHING;

-- جيب (Jeep)
INSERT INTO public.car_makes (id, name) VALUES ('6dc47287-96f5-46dd-b8ba-9c5f40ba95ca', 'جيب (Jeep)') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('6dc47287-96f5-46dd-b8ba-9c5f40ba95ca', 'Renegade') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('6dc47287-96f5-46dd-b8ba-9c5f40ba95ca', 'Compass') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('6dc47287-96f5-46dd-b8ba-9c5f40ba95ca', 'Cherokee') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('6dc47287-96f5-46dd-b8ba-9c5f40ba95ca', 'Grand Cherokee') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('6dc47287-96f5-46dd-b8ba-9c5f40ba95ca', 'Wrangler') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('6dc47287-96f5-46dd-b8ba-9c5f40ba95ca', 'Gladiator') ON CONFLICT DO NOTHING;

-- جينيسيس (Genesis)
INSERT INTO public.car_makes (id, name) VALUES ('ff8ede0a-8f44-4184-860a-244b67f041e8', 'جينيسيس (Genesis)') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('ff8ede0a-8f44-4184-860a-244b67f041e8', 'G70') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('ff8ede0a-8f44-4184-860a-244b67f041e8', 'G80') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('ff8ede0a-8f44-4184-860a-244b67f041e8', 'G90') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('ff8ede0a-8f44-4184-860a-244b67f041e8', 'GV70') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('ff8ede0a-8f44-4184-860a-244b67f041e8', 'GV80') ON CONFLICT DO NOTHING;

-- لكزس (Lexus)
INSERT INTO public.car_makes (id, name) VALUES ('ddc6a555-35b3-432b-a27c-e68d850017e6', 'لكزس (Lexus)') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('ddc6a555-35b3-432b-a27c-e68d850017e6', 'IS') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('ddc6a555-35b3-432b-a27c-e68d850017e6', 'ES') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('ddc6a555-35b3-432b-a27c-e68d850017e6', 'LS') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('ddc6a555-35b3-432b-a27c-e68d850017e6', 'NX') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('ddc6a555-35b3-432b-a27c-e68d850017e6', 'RX') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('ddc6a555-35b3-432b-a27c-e68d850017e6', 'GX') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('ddc6a555-35b3-432b-a27c-e68d850017e6', 'LX') ON CONFLICT DO NOTHING;

-- فولفو (Volvo)
INSERT INTO public.car_makes (id, name) VALUES ('3ac098dd-9b4f-487f-b091-10419349a5b0', 'فولفو (Volvo)') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('3ac098dd-9b4f-487f-b091-10419349a5b0', 'S60') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('3ac098dd-9b4f-487f-b091-10419349a5b0', 'S90') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('3ac098dd-9b4f-487f-b091-10419349a5b0', 'XC40') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('3ac098dd-9b4f-487f-b091-10419349a5b0', 'XC60') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('3ac098dd-9b4f-487f-b091-10419349a5b0', 'XC90') ON CONFLICT DO NOTHING;

-- كاديلاك (Cadillac)
INSERT INTO public.car_makes (id, name) VALUES ('2254efc8-3ac9-49c7-9505-623c42ae2b00', 'كاديلاك (Cadillac)') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('2254efc8-3ac9-49c7-9505-623c42ae2b00', 'CT4') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('2254efc8-3ac9-49c7-9505-623c42ae2b00', 'CT5') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('2254efc8-3ac9-49c7-9505-623c42ae2b00', 'XT4') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('2254efc8-3ac9-49c7-9505-623c42ae2b00', 'XT5') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('2254efc8-3ac9-49c7-9505-623c42ae2b00', 'XT6') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('2254efc8-3ac9-49c7-9505-623c42ae2b00', 'Escalade') ON CONFLICT DO NOTHING;

-- أودي (Audi)
INSERT INTO public.car_makes (id, name) VALUES ('0d0eab2e-f6c7-4589-9765-17fa918c5232', 'أودي (Audi)') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('0d0eab2e-f6c7-4589-9765-17fa918c5232', 'A3') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('0d0eab2e-f6c7-4589-9765-17fa918c5232', 'A4') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('0d0eab2e-f6c7-4589-9765-17fa918c5232', 'A6') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('0d0eab2e-f6c7-4589-9765-17fa918c5232', 'A8') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('0d0eab2e-f6c7-4589-9765-17fa918c5232', 'Q3') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('0d0eab2e-f6c7-4589-9765-17fa918c5232', 'Q5') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('0d0eab2e-f6c7-4589-9765-17fa918c5232', 'Q7') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('0d0eab2e-f6c7-4589-9765-17fa918c5232', 'Q8') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('0d0eab2e-f6c7-4589-9765-17fa918c5232', 'e-tron') ON CONFLICT DO NOTHING;

-- بي ام دبليو (BMW)
INSERT INTO public.car_makes (id, name) VALUES ('c9bf6248-694b-4daa-988e-75e613cc4f69', 'بي ام دبليو (BMW)') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('c9bf6248-694b-4daa-988e-75e613cc4f69', '1 Series') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('c9bf6248-694b-4daa-988e-75e613cc4f69', '2 Series') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('c9bf6248-694b-4daa-988e-75e613cc4f69', '3 Series') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('c9bf6248-694b-4daa-988e-75e613cc4f69', '4 Series') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('c9bf6248-694b-4daa-988e-75e613cc4f69', '5 Series') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('c9bf6248-694b-4daa-988e-75e613cc4f69', '7 Series') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('c9bf6248-694b-4daa-988e-75e613cc4f69', 'X1') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('c9bf6248-694b-4daa-988e-75e613cc4f69', 'X3') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('c9bf6248-694b-4daa-988e-75e613cc4f69', 'X5') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('c9bf6248-694b-4daa-988e-75e613cc4f69', 'X6') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('c9bf6248-694b-4daa-988e-75e613cc4f69', 'X7') ON CONFLICT DO NOTHING;

-- مرسيدس (Mercedes-Benz)
INSERT INTO public.car_makes (id, name) VALUES ('bb3b4290-c5ac-4c1a-b682-853ece07e5bd', 'مرسيدس (Mercedes-Benz)') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('bb3b4290-c5ac-4c1a-b682-853ece07e5bd', 'A-Class') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('bb3b4290-c5ac-4c1a-b682-853ece07e5bd', 'C-Class') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('bb3b4290-c5ac-4c1a-b682-853ece07e5bd', 'E-Class') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('bb3b4290-c5ac-4c1a-b682-853ece07e5bd', 'S-Class') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('bb3b4290-c5ac-4c1a-b682-853ece07e5bd', 'GLA') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('bb3b4290-c5ac-4c1a-b682-853ece07e5bd', 'GLC') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('bb3b4290-c5ac-4c1a-b682-853ece07e5bd', 'GLE') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('bb3b4290-c5ac-4c1a-b682-853ece07e5bd', 'GLS') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('bb3b4290-c5ac-4c1a-b682-853ece07e5bd', 'G-Class') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('bb3b4290-c5ac-4c1a-b682-853ece07e5bd', 'AMG GT') ON CONFLICT DO NOTHING;

-- بورش (Porsche)
INSERT INTO public.car_makes (id, name) VALUES ('2f8bee7d-eee3-4f53-bd71-b3889e71f496', 'بورش (Porsche)') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('2f8bee7d-eee3-4f53-bd71-b3889e71f496', 'Macan') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('2f8bee7d-eee3-4f53-bd71-b3889e71f496', 'Cayenne') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('2f8bee7d-eee3-4f53-bd71-b3889e71f496', 'Panamera') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('2f8bee7d-eee3-4f53-bd71-b3889e71f496', 'Taycan') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('2f8bee7d-eee3-4f53-bd71-b3889e71f496', '911') ON CONFLICT DO NOTHING;

-- لاند روفر (Land Rover)
INSERT INTO public.car_makes (id, name) VALUES ('4c04eeb7-b60c-4099-8b8e-a10a8858ee39', 'لاند روفر (Land Rover)') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('4c04eeb7-b60c-4099-8b8e-a10a8858ee39', 'Evoque') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('4c04eeb7-b60c-4099-8b8e-a10a8858ee39', 'Velar') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('4c04eeb7-b60c-4099-8b8e-a10a8858ee39', 'Discovery') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('4c04eeb7-b60c-4099-8b8e-a10a8858ee39', 'Range Rover Sport') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('4c04eeb7-b60c-4099-8b8e-a10a8858ee39', 'Range Rover') ON CONFLICT DO NOTHING;

-- مازيراتي (Maserati)
INSERT INTO public.car_makes (id, name) VALUES ('434a3c8a-1f58-4c3c-9e1c-04470932d77e', 'مازيراتي (Maserati)') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('434a3c8a-1f58-4c3c-9e1c-04470932d77e', 'Ghibli') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('434a3c8a-1f58-4c3c-9e1c-04470932d77e', 'Quattroporte') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('434a3c8a-1f58-4c3c-9e1c-04470932d77e', 'Levante') ON CONFLICT DO NOTHING;

-- بنتلي (Bentley)
INSERT INTO public.car_makes (id, name) VALUES ('91c801a8-b811-4aca-9554-3a2d2e65b4cb', 'بنتلي (Bentley)') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('91c801a8-b811-4aca-9554-3a2d2e65b4cb', 'Flying Spur') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('91c801a8-b811-4aca-9554-3a2d2e65b4cb', 'Continental GT') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('91c801a8-b811-4aca-9554-3a2d2e65b4cb', 'Bentayga') ON CONFLICT DO NOTHING;

-- لامبورجيني (Lamborghini)
INSERT INTO public.car_makes (id, name) VALUES ('869f2be2-98b1-4d5c-b1e3-edf9d6ff09e6', 'لامبورجيني (Lamborghini)') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('869f2be2-98b1-4d5c-b1e3-edf9d6ff09e6', 'Huracan') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('869f2be2-98b1-4d5c-b1e3-edf9d6ff09e6', 'Aventador') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('869f2be2-98b1-4d5c-b1e3-edf9d6ff09e6', 'Urus') ON CONFLICT DO NOTHING;

-- رولز رويس (Rolls-Royce)
INSERT INTO public.car_makes (id, name) VALUES ('f685a5a9-f637-45d6-bd7d-4af7f1c44209', 'رولز رويس (Rolls-Royce)') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('f685a5a9-f637-45d6-bd7d-4af7f1c44209', 'Ghost') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('f685a5a9-f637-45d6-bd7d-4af7f1c44209', 'Wraith') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('f685a5a9-f637-45d6-bd7d-4af7f1c44209', 'Dawn') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('f685a5a9-f637-45d6-bd7d-4af7f1c44209', 'Phantom') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('f685a5a9-f637-45d6-bd7d-4af7f1c44209', 'Cullinan') ON CONFLICT DO NOTHING;

-- فيراري (Ferrari)
INSERT INTO public.car_makes (id, name) VALUES ('d7e2b1f3-e1a7-46b7-8327-90a2341ecce7', 'فيراري (Ferrari)') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('d7e2b1f3-e1a7-46b7-8327-90a2341ecce7', 'Roma') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('d7e2b1f3-e1a7-46b7-8327-90a2341ecce7', 'Portofino') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('d7e2b1f3-e1a7-46b7-8327-90a2341ecce7', 'F8 Tributo') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('d7e2b1f3-e1a7-46b7-8327-90a2341ecce7', 'SF90 Stradale') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('d7e2b1f3-e1a7-46b7-8327-90a2341ecce7', '812 Superfast') ON CONFLICT DO NOTHING;
INSERT INTO public.car_models (make_id, name) VALUES ('d7e2b1f3-e1a7-46b7-8327-90a2341ecce7', 'Purosangue') ON CONFLICT DO NOTHING;

-- ============================================================
-- SEED DATA: Sample Products (قطع غيار مبدئية)
-- ============================================================
INSERT INTO public.products (name, brand, category, price, old_price, condition, stock, shipping, rating, reviews_count, image_url, is_active)
VALUES
  ('مساعدات رياضية أمامية تويوتا كامري 2020', 'KYB', 'نظام التعليق', 450, 550, 'جديد', 'متوفر', 'مجاني', 4.8, 124, 'https://images.unsplash.com/photo-1600705544778-594246ed8052?w=800&q=80', true),
  ('فحمات سيراميك أصلية هانكوك يارس 2018', 'Hankook', 'الفرامل', 180, 220, 'جديد', 'متوفر', 'عادي', 4.5, 56, 'https://images.unsplash.com/photo-1541892809703-a1afabbb457e?w=800&q=80', true),
  ('جنوط مرسيدس E-Class مقاس 19 أصلية وكالة', 'Mercedes', 'الجنوط والكفرات', 3200, 4500, 'مستعمل', 'متوفر', 'مجاني', 4.9, 8, 'https://images.unsplash.com/photo-1517524008696-ea28c22765bf?w=800&q=80', true),
  ('شمعة كيا كادينزا يمين 2017 اصلية', 'Kia', 'الأنوار والكشافات', 850, NULL, 'جديد', 'متوفر', 'مجاني', 4.2, 32, 'https://images.unsplash.com/photo-1549317661-bd32c8ce0be2?w=800&q=80', true)
ON CONFLICT DO NOTHING;
