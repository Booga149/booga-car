-- ============================================================
-- Booga Car - Seller Location / Geolocation Feature
-- إضافة ميزة تحديد المواقع للبائعين والمشترين
-- ============================================================

-- 1. إضافة أعمدة الموقع لجدول profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS address_text TEXT;

-- 2. إضافة أعمدة موقع البائع للمنتجات (للتسريع)
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS seller_latitude DOUBLE PRECISION;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS seller_longitude DOUBLE PRECISION;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS seller_city TEXT;

-- 3. فهرس للبحث الجغرافي
CREATE INDEX IF NOT EXISTS idx_profiles_location ON public.profiles (latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_products_seller_location ON public.products (seller_latitude, seller_longitude) WHERE seller_latitude IS NOT NULL AND seller_longitude IS NOT NULL;

-- 4. دالة حساب المسافة بالكيلومتر (Haversine formula)
CREATE OR REPLACE FUNCTION public.calculate_distance(
  lat1 DOUBLE PRECISION,
  lon1 DOUBLE PRECISION,
  lat2 DOUBLE PRECISION,
  lon2 DOUBLE PRECISION
)
RETURNS DOUBLE PRECISION AS $$
DECLARE
  R CONSTANT DOUBLE PRECISION := 6371; -- نصف قطر الأرض بالكيلومتر
  dlat DOUBLE PRECISION;
  dlon DOUBLE PRECISION;
  a DOUBLE PRECISION;
  c DOUBLE PRECISION;
BEGIN
  IF lat1 IS NULL OR lon1 IS NULL OR lat2 IS NULL OR lon2 IS NULL THEN
    RETURN NULL;
  END IF;

  dlat := RADIANS(lat2 - lat1);
  dlon := RADIANS(lon2 - lon1);
  a := SIN(dlat/2) * SIN(dlat/2) + COS(RADIANS(lat1)) * COS(RADIANS(lat2)) * SIN(dlon/2) * SIN(dlon/2);
  c := 2 * ATAN2(SQRT(a), SQRT(1-a));
  RETURN R * c;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 5. دالة RPC للبائعين القريبين
CREATE OR REPLACE FUNCTION public.get_nearby_sellers(
  user_lat DOUBLE PRECISION,
  user_lon DOUBLE PRECISION,
  radius_km DOUBLE PRECISION DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  full_name TEXT,
  business_name TEXT,
  city TEXT,
  address_text TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  avatar_url TEXT,
  distance_km DOUBLE PRECISION,
  products_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.full_name,
    p.business_name,
    p.city,
    p.address_text,
    p.latitude,
    p.longitude,
    p.avatar_url,
    ROUND(public.calculate_distance(user_lat, user_lon, p.latitude, p.longitude)::NUMERIC, 1)::DOUBLE PRECISION AS distance_km,
    COUNT(pr.id) AS products_count
  FROM public.profiles p
  LEFT JOIN public.products pr ON pr.seller_id = p.id AND pr.is_active = true
  WHERE p.latitude IS NOT NULL
    AND p.longitude IS NOT NULL
    AND p.role IN ('seller', 'admin')
    AND public.calculate_distance(user_lat, user_lon, p.latitude, p.longitude) <= radius_km
  GROUP BY p.id, p.full_name, p.business_name, p.city, p.address_text, p.latitude, p.longitude, p.avatar_url
  ORDER BY distance_km ASC
  LIMIT 20;
END;
$$ LANGUAGE plpgsql STABLE;

-- 6. Trigger لتحديث موقع البائع في المنتجات تلقائياً
CREATE OR REPLACE FUNCTION public.sync_seller_location_to_product()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
    UPDATE public.products
    SET seller_latitude = NEW.latitude,
        seller_longitude = NEW.longitude,
        seller_city = NEW.city
    WHERE seller_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_seller_location_update ON public.profiles;
CREATE TRIGGER on_seller_location_update
  AFTER UPDATE OF latitude, longitude ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.sync_seller_location_to_product();

-- 7. بيانات تجريبية لمواقع بائعين (مدن سعودية)
-- الرياض
UPDATE public.profiles SET latitude = 24.7136, longitude = 46.6753, city = 'الرياض', address_text = 'حي العليا، الرياض'
WHERE role IN ('seller', 'admin') AND city IS NULL AND id = (SELECT id FROM public.profiles WHERE role IN ('seller', 'admin') LIMIT 1);
