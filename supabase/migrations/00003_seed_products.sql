-- ============================================================
-- Booga Car - Comprehensive Product Seed Data
-- Run in Supabase SQL Editor
-- Adds 60+ realistic products across all major car makes
-- ============================================================

-- تويوتا
INSERT INTO public.products (name, brand, category, price, old_price, condition, stock, shipping, rating, reviews_count, image_url, is_active) VALUES
('فلتر زيت تويوتا كامري 2018-2024 أصلي', 'Toyota', 'البواجي والفلاتر', 45, 65, 'جديد', 'متوفر', 'عادي', 4.7, 89, 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=600&q=80', true),
('شمعة أمامية تويوتا كورولا 2020 LED يمين', 'Toyota', 'الشمعات والإضاءة', 950, 1200, 'جديد', 'متوفر', 'مجاني', 4.8, 45, 'https://images.unsplash.com/photo-1549317661-bd32c8ce0be2?w=600&q=80', true),
('صدام أمامي تويوتا RAV4 2021 أصلي وكالة', 'Toyota', 'الصدامات والواجهة', 1800, 2400, 'جديد', 'متوفر', 'مجاني', 4.6, 23, 'https://images.unsplash.com/photo-1600705544778-594246ed8052?w=600&q=80', true),
('رديتر تبريد تويوتا هايلكس 2019 نحاس أصلي', 'Toyota', 'نظام التكييف والتبريد', 680, 850, 'جديد', 'متوفر', 'مجاني', 4.5, 37, 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=600&q=80', true),
('ديسكات فرامل تويوتا لاندكروزر أمامية', 'Toyota', 'الفرامل والأقمشة', 320, 420, 'جديد', 'متوفر', 'عادي', 4.9, 112, 'https://images.unsplash.com/photo-1541892809703-a1afabbb457e?w=600&q=80', true),
('كمبروسر مكيف تويوتا كامري 2016-2020', 'Toyota', 'نظام التكييف والتبريد', 1200, 1600, 'جديد', 'متوفر', 'مجاني', 4.4, 28, 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=600&q=80', true)
ON CONFLICT DO NOTHING;

-- هيونداي
INSERT INTO public.products (name, brand, category, price, old_price, condition, stock, shipping, rating, reviews_count, image_url, is_active) VALUES
('مساعدات أمامية هيونداي توسان 2020 KYB', 'Hyundai', 'المساعدات والمقصات', 550, 700, 'جديد', 'متوفر', 'مجاني', 4.8, 67, 'https://images.unsplash.com/photo-1600705544778-594246ed8052?w=600&q=80', true),
('شمعة خلفية هيونداي النترا 2019 يسار LED', 'Hyundai', 'الشمعات والإضاءة', 750, 950, 'جديد', 'متوفر', 'مجاني', 4.5, 34, 'https://images.unsplash.com/photo-1549317661-bd32c8ce0be2?w=600&q=80', true),
('فحمات سيراميك هيونداي سوناتا أمامية', 'Hyundai', 'الفرامل والأقمشة', 180, 240, 'جديد', 'متوفر', 'عادي', 4.7, 92, 'https://images.unsplash.com/photo-1541892809703-a1afabbb457e?w=600&q=80', true),
('باب أمامي هيونداي أكسنت 2018 يمين', 'Hyundai', 'الأبواب والرفرف', 1400, 1800, 'مستعمل', 'متوفر', 'مجاني', 4.3, 15, 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=600&q=80', true),
('دينمو هيونداي سانتافي 2020 أصلي', 'Hyundai', 'الكهرباء والحساسات', 850, 1100, 'جديد', 'متوفر', 'مجاني', 4.6, 41, 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=600&q=80', true)
ON CONFLICT DO NOTHING;

-- كيا
INSERT INTO public.products (name, brand, category, price, old_price, condition, stock, shipping, rating, reviews_count, image_url, is_active) VALUES
('بطارية كيا سبورتاج 2021 فارتا 70 أمبير', 'Kia', 'البطاريات وملحقاتها', 380, 480, 'جديد', 'متوفر', 'مجاني', 4.9, 156, 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=600&q=80', true),
('شكمان كيا سيراتو 2019 ستانلس كامل', 'Kia', 'الشكمان', 1100, 1400, 'جديد', 'متوفر', 'مجاني', 4.4, 29, 'https://images.unsplash.com/photo-1600705544778-594246ed8052?w=600&q=80', true),
('طرمبة بنزين كيا K5 2022 أصلية', 'Kia', 'نظام الوقود', 420, 550, 'جديد', 'متوفر', 'عادي', 4.6, 38, 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=600&q=80', true),
('مقص أمامي كيا سورنتو 2020 يمين', 'Kia', 'المساعدات والمقصات', 350, 450, 'جديد', 'متوفر', 'عادي', 4.7, 53, 'https://images.unsplash.com/photo-1541892809703-a1afabbb457e?w=600&q=80', true)
ON CONFLICT DO NOTHING;

-- نيسان
INSERT INTO public.products (name, brand, category, price, old_price, condition, stock, shipping, rating, reviews_count, image_url, is_active) VALUES
('جنوط نيسان باترول 2022 مقاس 20 أصلية', 'Nissan', 'الجنوط والكفرات', 4500, 5800, 'جديد', 'متوفر', 'مجاني', 4.9, 18, 'https://images.unsplash.com/photo-1517524008696-ea28c22765bf?w=600&q=80', true),
('فلتر هواء نيسان ألتيما 2020 أصلي', 'Nissan', 'البواجي والفلاتر', 65, 90, 'جديد', 'متوفر', 'عادي', 4.5, 73, 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=600&q=80', true),
('مروحة رديتر نيسان صني 2018 كهربائية', 'Nissan', 'نظام التكييف والتبريد', 280, 380, 'جديد', 'متوفر', 'عادي', 4.3, 44, 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=600&q=80', true),
('حساس أكسجين نيسان اكس تريل 2021', 'Nissan', 'الكهرباء والحساسات', 220, 300, 'جديد', 'متوفر', 'عادي', 4.4, 31, 'https://images.unsplash.com/photo-1549317661-bd32c8ce0be2?w=600&q=80', true)
ON CONFLICT DO NOTHING;

-- هوندا
INSERT INTO public.products (name, brand, category, price, old_price, condition, stock, shipping, rating, reviews_count, image_url, is_active) VALUES
('شمعات بواجي هوندا سيفيك 2020 NGK إيريديوم', 'Honda', 'البواجي والفلاتر', 120, 160, 'جديد', 'متوفر', 'عادي', 4.8, 198, 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=600&q=80', true),
('صدام خلفي هوندا أكورد 2019 أصلي', 'Honda', 'الصدامات والواجهة', 1600, 2100, 'جديد', 'متوفر', 'مجاني', 4.5, 22, 'https://images.unsplash.com/photo-1600705544778-594246ed8052?w=600&q=80', true),
('طقم سيور هوندا CR-V 2020 كامل', 'Honda', 'البواجي والفلاتر', 350, 480, 'جديد', 'متوفر', 'عادي', 4.7, 56, 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=600&q=80', true),
('مرايا جانبية هوندا سيتي 2021 كهربائية يمين', 'Honda', 'الأبواب والرفرف', 380, 500, 'جديد', 'متوفر', 'عادي', 4.4, 27, 'https://images.unsplash.com/photo-1549317661-bd32c8ce0be2?w=600&q=80', true)
ON CONFLICT DO NOTHING;

-- شيفروليه
INSERT INTO public.products (name, brand, category, price, old_price, condition, stock, shipping, rating, reviews_count, image_url, is_active) VALUES
('شمعة أمامية شيفروليه تاهو 2021 LED أصلية', 'Chevrolet', 'الشمعات والإضاءة', 2200, 2800, 'جديد', 'متوفر', 'مجاني', 4.8, 19, 'https://images.unsplash.com/photo-1549317661-bd32c8ce0be2?w=600&q=80', true),
('فحمات فرامل شيفروليه سلفرادو خلفية', 'Chevrolet', 'الفرامل والأقمشة', 220, 300, 'جديد', 'متوفر', 'عادي', 4.6, 64, 'https://images.unsplash.com/photo-1541892809703-a1afabbb457e?w=600&q=80', true),
('كمبيوتر سيارة شيفروليه ماليبو 2020 ECU', 'Chevrolet', 'الكهرباء والحساسات', 2800, 3500, 'جديد', 'متوفر', 'مجاني', 4.3, 11, 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=600&q=80', true)
ON CONFLICT DO NOTHING;

-- فورد
INSERT INTO public.products (name, brand, category, price, old_price, condition, stock, shipping, rating, reviews_count, image_url, is_active) VALUES
('شبك أمامي فورد اكسبلورر 2021 كروم', 'Ford', 'الصدامات والواجهة', 950, 1200, 'جديد', 'متوفر', 'مجاني', 4.7, 33, 'https://images.unsplash.com/photo-1600705544778-594246ed8052?w=600&q=80', true),
('مساعدات فورد F-150 2020 بيلشتاين', 'Ford', 'المساعدات والمقصات', 780, 980, 'جديد', 'متوفر', 'مجاني', 4.9, 47, 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=600&q=80', true),
('رديتر فورد تورس 2019 ألمنيوم', 'Ford', 'نظام التكييف والتبريد', 580, 750, 'جديد', 'متوفر', 'مجاني', 4.5, 29, 'https://images.unsplash.com/photo-1541892809703-a1afabbb457e?w=600&q=80', true)
ON CONFLICT DO NOTHING;

-- مرسيدس
INSERT INTO public.products (name, brand, category, price, old_price, condition, stock, shipping, rating, reviews_count, image_url, is_active) VALUES
('جنوط مرسيدس E-Class مقاس 19 AMG أصلية', 'Mercedes', 'الجنوط والكفرات', 5500, 7200, 'جديد', 'متوفر', 'مجاني', 4.9, 14, 'https://images.unsplash.com/photo-1517524008696-ea28c22765bf?w=600&q=80', true),
('شمعة خلفية مرسيدس C-Class 2020 LED', 'Mercedes', 'الشمعات والإضاءة', 1800, 2300, 'جديد', 'متوفر', 'مجاني', 4.7, 21, 'https://images.unsplash.com/photo-1549317661-bd32c8ce0be2?w=600&q=80', true),
('مقاعد جلد مرسيدس S-Class 2019 بيج كاملة', 'Mercedes', 'الديكور الداخلي والمقاعد', 8500, 12000, 'مستعمل', 'متوفر', 'مجاني', 4.8, 7, 'https://images.unsplash.com/photo-1600705544778-594246ed8052?w=600&q=80', true)
ON CONFLICT DO NOTHING;

-- بي ام دبليو
INSERT INTO public.products (name, brand, category, price, old_price, condition, stock, shipping, rating, reviews_count, image_url, is_active) VALUES
('شمعة أمامية BMW 5 Series 2020 ليزر أصلية', 'BMW', 'الشمعات والإضاءة', 4500, 6000, 'جديد', 'متوفر', 'مجاني', 4.9, 12, 'https://images.unsplash.com/photo-1549317661-bd32c8ce0be2?w=600&q=80', true),
('فحمات سيراميك BMW X5 2021 أمامية Brembo', 'BMW', 'الفرامل والأقمشة', 650, 850, 'جديد', 'متوفر', 'مجاني', 4.8, 38, 'https://images.unsplash.com/photo-1541892809703-a1afabbb457e?w=600&q=80', true),
('دركسون BMW 3 Series 2019 M Sport أصلي', 'BMW', 'الدركسون وملحقاته', 2200, 2800, 'جديد', 'متوفر', 'مجاني', 4.7, 16, 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=600&q=80', true)
ON CONFLICT DO NOTHING;

-- لكزس
INSERT INTO public.products (name, brand, category, price, old_price, condition, stock, shipping, rating, reviews_count, image_url, is_active) VALUES
('شبك أمامي لكزس RX 2021 F-Sport', 'Lexus', 'الصدامات والواجهة', 1600, 2100, 'جديد', 'متوفر', 'مجاني', 4.8, 24, 'https://images.unsplash.com/photo-1600705544778-594246ed8052?w=600&q=80', true),
('مساعدات لكزس ES 2020 خلفية أصلية', 'Lexus', 'المساعدات والمقصات', 900, 1200, 'جديد', 'متوفر', 'مجاني', 4.6, 19, 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=600&q=80', true)
ON CONFLICT DO NOTHING;

-- جيب
INSERT INTO public.products (name, brand, category, price, old_price, condition, stock, shipping, rating, reviews_count, image_url, is_active) VALUES
('صدام أمامي جيب رانجلر 2021 ستيل', 'Jeep', 'الصدامات والواجهة', 2800, 3500, 'جديد', 'متوفر', 'مجاني', 4.9, 31, 'https://images.unsplash.com/photo-1600705544778-594246ed8052?w=600&q=80', true),
('كفر جيب قراند شيروكي 2020 مقاس 18', 'Jeep', 'الجنوط والكفرات', 450, 600, 'جديد', 'متوفر', 'عادي', 4.5, 42, 'https://images.unsplash.com/photo-1517524008696-ea28c22765bf?w=600&q=80', true)
ON CONFLICT DO NOTHING;

-- ام جي
INSERT INTO public.products (name, brand, category, price, old_price, condition, stock, shipping, rating, reviews_count, image_url, is_active) VALUES
('فلتر مكيف MG ZS 2022 كربون أصلي', 'MG', 'نظام التكييف والتبريد', 85, 120, 'جديد', 'متوفر', 'عادي', 4.6, 87, 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=600&q=80', true),
('شمعة أمامية MG 5 2021 LED يسار', 'MG', 'الشمعات والإضاءة', 650, 850, 'جديد', 'متوفر', 'مجاني', 4.4, 35, 'https://images.unsplash.com/photo-1549317661-bd32c8ce0be2?w=600&q=80', true),
('فحمات فرامل MG HS 2022 أمامية', 'MG', 'الفرامل والأقمشة', 160, 220, 'جديد', 'متوفر', 'عادي', 4.7, 68, 'https://images.unsplash.com/photo-1541892809703-a1afabbb457e?w=600&q=80', true)
ON CONFLICT DO NOTHING;

-- جيلي
INSERT INTO public.products (name, brand, category, price, old_price, condition, stock, shipping, rating, reviews_count, image_url, is_active) VALUES
('بطارية جيلي كولراي 2022 أصلية', 'Geely', 'البطاريات وملحقاتها', 350, 450, 'جديد', 'متوفر', 'مجاني', 4.5, 43, 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=600&q=80', true),
('مساعدات جيلي امجراند 2021 أمامية', 'Geely', 'المساعدات والمقصات', 420, 550, 'جديد', 'متوفر', 'عادي', 4.4, 26, 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=600&q=80', true)
ON CONFLICT DO NOTHING;

-- شيري
INSERT INTO public.products (name, brand, category, price, old_price, condition, stock, shipping, rating, reviews_count, image_url, is_active) VALUES
('شمعة أمامية شيري تيجو 7 برو LED', 'Chery', 'الشمعات والإضاءة', 780, 1000, 'جديد', 'متوفر', 'مجاني', 4.6, 22, 'https://images.unsplash.com/photo-1549317661-bd32c8ce0be2?w=600&q=80', true),
('فلتر زيت شيري اريزو 5 أصلي', 'Chery', 'البواجي والفلاتر', 35, 50, 'جديد', 'متوفر', 'عادي', 4.5, 114, 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=600&q=80', true)
ON CONFLICT DO NOTHING;

-- بورش
INSERT INTO public.products (name, brand, category, price, old_price, condition, stock, shipping, rating, reviews_count, image_url, is_active) VALUES
('فحمات سيراميك بورش كايين 2021 أمامية', 'Porsche', 'الفرامل والأقمشة', 2800, 3500, 'جديد', 'متوفر', 'مجاني', 4.9, 9, 'https://images.unsplash.com/photo-1541892809703-a1afabbb457e?w=600&q=80', true),
('جنوط بورش ماكان 2020 مقاس 21 تيربو', 'Porsche', 'الجنوط والكفرات', 8500, 11000, 'جديد', 'متوفر', 'مجاني', 4.9, 6, 'https://images.unsplash.com/photo-1517524008696-ea28c22765bf?w=600&q=80', true)
ON CONFLICT DO NOTHING;

-- لاند روفر
INSERT INTO public.products (name, brand, category, price, old_price, condition, stock, shipping, rating, reviews_count, image_url, is_active) VALUES
('شبك أمامي رينج روفر سبورت 2021 أسود', 'Land Rover', 'الصدامات والواجهة', 3200, 4200, 'جديد', 'متوفر', 'مجاني', 4.8, 11, 'https://images.unsplash.com/photo-1600705544778-594246ed8052?w=600&q=80', true),
('مساعدات هوائية رينج روفر 2020 خلفية', 'Land Rover', 'المساعدات والمقصات', 3500, 4500, 'جديد', 'متوفر', 'مجاني', 4.7, 8, 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=600&q=80', true)
ON CONFLICT DO NOTHING;

-- GMC
INSERT INTO public.products (name, brand, category, price, old_price, condition, stock, shipping, rating, reviews_count, image_url, is_active) VALUES
('شمعة أمامية GMC يوكن 2021 LED أصلية', 'GMC', 'الشمعات والإضاءة', 2500, 3200, 'جديد', 'متوفر', 'مجاني', 4.8, 17, 'https://images.unsplash.com/photo-1549317661-bd32c8ce0be2?w=600&q=80', true),
('فحمات فرامل GMC سييرا 2020 أمامية', 'GMC', 'الفرامل والأقمشة', 280, 380, 'جديد', 'متوفر', 'عادي', 4.6, 39, 'https://images.unsplash.com/photo-1541892809703-a1afabbb457e?w=600&q=80', true)
ON CONFLICT DO NOTHING;

-- مازدا
INSERT INTO public.products (name, brand, category, price, old_price, condition, stock, shipping, rating, reviews_count, image_url, is_active) VALUES
('فلتر هواء مازدا CX-5 2021 أصلي', 'Mazda', 'البواجي والفلاتر', 55, 80, 'جديد', 'متوفر', 'عادي', 4.6, 62, 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=600&q=80', true),
('ديسكات فرامل مازدا 3 2020 أمامية', 'Mazda', 'الفرامل والأقمشة', 250, 340, 'جديد', 'متوفر', 'عادي', 4.7, 45, 'https://images.unsplash.com/photo-1541892809703-a1afabbb457e?w=600&q=80', true)
ON CONFLICT DO NOTHING;

-- ميتسوبيشي
INSERT INTO public.products (name, brand, category, price, old_price, condition, stock, shipping, rating, reviews_count, image_url, is_active) VALUES
('طرمبة مياه ميتسوبيشي باجيرو 2019 أصلية', 'Mitsubishi', 'نظام التكييف والتبريد', 380, 500, 'جديد', 'متوفر', 'عادي', 4.5, 27, 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=600&q=80', true),
('شكمان ميتسوبيشي L200 2020 ستانلس', 'Mitsubishi', 'الشكمان', 950, 1200, 'جديد', 'متوفر', 'مجاني', 4.4, 18, 'https://images.unsplash.com/photo-1600705544778-594246ed8052?w=600&q=80', true)
ON CONFLICT DO NOTHING;

-- دودج
INSERT INTO public.products (name, brand, category, price, old_price, condition, stock, shipping, rating, reviews_count, image_url, is_active) VALUES
('شمعة أمامية دودج تشارجر 2020 LED هيلكات', 'Dodge', 'الشمعات والإضاءة', 1800, 2400, 'جديد', 'متوفر', 'مجاني', 4.9, 25, 'https://images.unsplash.com/photo-1549317661-bd32c8ce0be2?w=600&q=80', true),
('فحمات بريمبو دودج تشالنجر 2021 أمامية', 'Dodge', 'الفرامل والأقمشة', 580, 750, 'جديد', 'متوفر', 'مجاني', 4.8, 33, 'https://images.unsplash.com/photo-1541892809703-a1afabbb457e?w=600&q=80', true)
ON CONFLICT DO NOTHING;

-- أودي
INSERT INTO public.products (name, brand, category, price, old_price, condition, stock, shipping, rating, reviews_count, image_url, is_active) VALUES
('جنوط أودي Q7 2021 مقاس 20 S-Line', 'Audi', 'الجنوط والكفرات', 6200, 8000, 'جديد', 'متوفر', 'مجاني', 4.8, 10, 'https://images.unsplash.com/photo-1517524008696-ea28c22765bf?w=600&q=80', true),
('شمعة أمامية أودي A6 2020 ماتريكس LED', 'Audi', 'الشمعات والإضاءة', 3800, 5000, 'جديد', 'متوفر', 'مجاني', 4.9, 8, 'https://images.unsplash.com/photo-1549317661-bd32c8ce0be2?w=600&q=80', true)
ON CONFLICT DO NOTHING;

-- جينيسيس
INSERT INTO public.products (name, brand, category, price, old_price, condition, stock, shipping, rating, reviews_count, image_url, is_active) VALUES
('شمعة خلفية جينيسيس G80 2021 LED', 'Genesis', 'الشمعات والإضاءة', 1400, 1800, 'جديد', 'متوفر', 'مجاني', 4.7, 13, 'https://images.unsplash.com/photo-1549317661-bd32c8ce0be2?w=600&q=80', true),
('فحمات فرامل جينيسيس GV70 2022 أمامية', 'Genesis', 'الفرامل والأقمشة', 450, 600, 'جديد', 'متوفر', 'مجاني', 4.6, 21, 'https://images.unsplash.com/photo-1541892809703-a1afabbb457e?w=600&q=80', true)
ON CONFLICT DO NOTHING;

-- فولفو
INSERT INTO public.products (name, brand, category, price, old_price, condition, stock, shipping, rating, reviews_count, image_url, is_active) VALUES
('مساعدات فولفو XC90 2020 أمامية', 'Volvo', 'المساعدات والمقصات', 1100, 1400, 'جديد', 'متوفر', 'مجاني', 4.7, 15, 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=600&q=80', true)
ON CONFLICT DO NOTHING;

-- كاديلاك
INSERT INTO public.products (name, brand, category, price, old_price, condition, stock, shipping, rating, reviews_count, image_url, is_active) VALUES
('شمعة أمامية كاديلاك اسكاليد 2021 LED', 'Cadillac', 'الشمعات والإضاءة', 3200, 4200, 'جديد', 'متوفر', 'مجاني', 4.9, 11, 'https://images.unsplash.com/photo-1549317661-bd32c8ce0be2?w=600&q=80', true),
('فحمات فرامل كاديلاك XT5 2020 أمامية', 'Cadillac', 'الفرامل والأقمشة', 380, 500, 'جديد', 'متوفر', 'عادي', 4.5, 24, 'https://images.unsplash.com/photo-1541892809703-a1afabbb457e?w=600&q=80', true)
ON CONFLICT DO NOTHING;

SELECT 'تم إضافة 60+ منتج بنجاح!' AS result;
