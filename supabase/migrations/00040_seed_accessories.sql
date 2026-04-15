-- ============================================================
-- Booga Car - Seed Accessories into Products Table
-- These accessories were previously hardcoded (acc_01..acc_06)
-- Now they live in the database with real UUIDs for checkout.
-- ============================================================

INSERT INTO public.products (id, name, brand, category, price, old_price, condition, stock, shipping, rating, reviews_count, image_url, is_active, description, stock_quantity)
VALUES
  ('d1a00001-acc0-4000-8000-000000000001', 'طقم ألياف بصرية (Starlight) سقف النجوم', 'Booga Elite', 'إضاءة محيطية', 1200, 1500, 'جديد', 'متوفر', 'عادي', 5, 124, 'https://images.unsplash.com/photo-1594976388531-d1058494cdd8?w=500&q=80', true, 'حوّل سقف سيارتك إلى سماء من النجوم بـ 450 نقطة ضوئية وتقنية الألياف البصرية المتطورة.', 50),
  ('d1a00002-acc0-4000-8000-000000000002', 'شاشة تسلا 13.6 بوصة لنظام أندرويد', 'SmartLink', 'قمرة القيادة الذكية', 3400, 4000, 'جديد', 'متوفر', 'عادي', 4.8, 82, 'https://images.unsplash.com/photo-1542362567-b05e533c373a?w=500&q=80', true, 'شاشة عالية القفاوة مع دعم كامل لـ Apple CarPlay و Android Auto.', 30),
  ('d1a00003-acc0-4000-8000-000000000003', 'طقم عطرة العود الملكي الفاخر (ثلاث عبوات)', 'Oud Essence', 'منكهات وجوهر', 450, 600, 'جديد', 'متوفر', 'عادي', 5, 215, 'https://images.unsplash.com/photo-1616948648216-2184aa21c83c?w=500&q=80', true, 'زيوت عطرية أصلية مستوردة مصممة لتدوم طويلاً داخل مقصورات السيارات الفاخرة.', 100),
  ('d1a00004-acc0-4000-8000-000000000004', 'تلبيسة مقاعد جلد نابا إيطالي متكاملة', 'CRAFT Italia', 'راحة وحرفة', 2800, 3200, 'جديد', 'متوفر', 'عادي', 4.9, 56, 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=500&q=80', true, 'جلد طبيعي فائق النعومة متوفر بخمسة ألوان ملكية ليمنح سيارتك فخامة لا تضاهى.', 20),
  ('d1a00005-acc0-4000-8000-000000000005', 'كاميرا لوحة القيادة (Dashcam) أمامية وخلفية 4K', 'VisionSafe', 'قمرة القيادة الذكية', 1350, 1600, 'جديد', 'متوفر', 'عادي', 4.7, 142, 'https://images.unsplash.com/photo-1592398516104-a5e2270997f8?w=500&q=80', true, 'تسجيل مستمر بأعلى دقة مع حساسات صدمات ذكية لضمان توثيق كل لحظة.', 40),
  ('d1a00006-acc0-4000-8000-000000000006', 'نظام إضاءة داخلية ذكي بـ 64 لون (App Control)', 'NeonVibe', 'إضاءة محيطية', 850, 1100, 'جديد', 'متوفر', 'مجاني', 4.6, 310, 'https://images.unsplash.com/photo-15494976388531-d1058494cdd8?w=500&q=80', true, 'تمتع بتحكم كامل بألوان مقصورة سيارتك مع تطبيق هاتفك الذكي وتفاعل الألوان مع الموسيقى.', 60)
ON CONFLICT (id) DO NOTHING;

NOTIFY pgrst, 'reload schema';
SELECT 'Accessories seeded successfully!' AS result;
