import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

/**
 * One-time migration endpoint to seed accessories into the products table.
 * Visit /api/seed-accessories once, then delete this file.
 */
export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const accessories = [
      {
        id: 'd1a00001-acc0-4000-8000-000000000001',
        name: 'طقم ألياف بصرية (Starlight) سقف النجوم',
        brand: 'Booga Elite',
        category: 'إضاءة محيطية',
        price: 1200,
        old_price: 1500,
        condition: 'جديد',
        stock: 'متوفر',
        shipping: 'عادي',
        rating: 5,
        reviews_count: 124,
        image_url: 'https://images.unsplash.com/photo-1594976388531-d1058494cdd8?w=500&q=80',
        is_active: true,
        description: 'حوّل سقف سيارتك إلى سماء من النجوم بـ 450 نقطة ضوئية وتقنية الألياف البصرية المتطورة.',
        stock_quantity: 50,
      },
      {
        id: 'd1a00002-acc0-4000-8000-000000000002',
        name: 'شاشة تسلا 13.6 بوصة لنظام أندرويد',
        brand: 'SmartLink',
        category: 'قمرة القيادة الذكية',
        price: 3400,
        old_price: 4000,
        condition: 'جديد',
        stock: 'متوفر',
        shipping: 'عادي',
        rating: 4.8,
        reviews_count: 82,
        image_url: 'https://images.unsplash.com/photo-1542362567-b05e533c373a?w=500&q=80',
        is_active: true,
        description: 'شاشة عالية القفاوة مع دعم كامل لـ Apple CarPlay و Android Auto.',
        stock_quantity: 30,
      },
      {
        id: 'd1a00003-acc0-4000-8000-000000000003',
        name: 'طقم عطرة العود الملكي الفاخر (ثلاث عبوات)',
        brand: 'Oud Essence',
        category: 'منكهات وجوهر',
        price: 450,
        old_price: 600,
        condition: 'جديد',
        stock: 'متوفر',
        shipping: 'عادي',
        rating: 5,
        reviews_count: 215,
        image_url: 'https://images.unsplash.com/photo-1616948648216-2184aa21c83c?w=500&q=80',
        is_active: true,
        description: 'زيوت عطرية أصلية مستوردة مصممة لتدوم طويلاً داخل مقصورات السيارات الفاخرة.',
        stock_quantity: 100,
      },
      {
        id: 'd1a00004-acc0-4000-8000-000000000004',
        name: 'تلبيسة مقاعد جلد نابا إيطالي متكاملة',
        brand: 'CRAFT Italia',
        category: 'راحة وحرفة',
        price: 2800,
        old_price: 3200,
        condition: 'جديد',
        stock: 'متوفر',
        shipping: 'عادي',
        rating: 4.9,
        reviews_count: 56,
        image_url: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=500&q=80',
        is_active: true,
        description: 'جلد طبيعي فائق النعومة متوفر بخمسة ألوان ملكية ليمنح سيارتك فخامة لا تضاهى.',
        stock_quantity: 20,
      },
      {
        id: 'd1a00005-acc0-4000-8000-000000000005',
        name: 'كاميرا لوحة القيادة (Dashcam) أمامية وخلفية 4K',
        brand: 'VisionSafe',
        category: 'قمرة القيادة الذكية',
        price: 1350,
        old_price: 1600,
        condition: 'جديد',
        stock: 'متوفر',
        shipping: 'عادي',
        rating: 4.7,
        reviews_count: 142,
        image_url: 'https://images.unsplash.com/photo-1592398516104-a5e2270997f8?w=500&q=80',
        is_active: true,
        description: 'تسجيل مستمر بأعلى دقة مع حساسات صدمات ذكية لضمان توثيق كل لحظة.',
        stock_quantity: 40,
      },
      {
        id: 'd1a00006-acc0-4000-8000-000000000006',
        name: 'نظام إضاءة داخلية ذكي بـ 64 لون (App Control)',
        brand: 'NeonVibe',
        category: 'إضاءة محيطية',
        price: 850,
        old_price: 1100,
        condition: 'جديد',
        stock: 'متوفر',
        shipping: 'مجاني',
        rating: 4.6,
        reviews_count: 310,
        image_url: 'https://images.unsplash.com/photo-15494976388531-d1058494cdd8?w=500&q=80',
        is_active: true,
        description: 'تمتع بتحكم كامل بألوان مقصورة سيارتك مع تطبيق هاتفك الذكي وتفاعل الألوان مع الموسيقى.',
        stock_quantity: 60,
      },
    ];

    const { data, error } = await supabase
      .from('products')
      .upsert(accessories, { onConflict: 'id' });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'تم إضافة 6 إكسسوارات إلى قاعدة البيانات بنجاح!',
      ids: accessories.map(a => a.id)
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
