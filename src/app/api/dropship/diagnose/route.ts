import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { createAliExpressSDK } from '@/lib/aliexpress';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin();
  const results: any[] = [];

  try {
    const sdk = await createAliExpressSDK(supabaseAdmin);
    if (!sdk) {
      return NextResponse.json({
        status: 'error',
        message: 'AliExpress غير مُعد. اذهب للإعدادات لربط حسابك.',
        results: [],
      });
    }

    // Test 1: Affiliate Product Query
    try {
      const r = await (sdk as any).apiCall('aliexpress.affiliate.product.query', {
        keywords: 'brake pads',
        target_currency: 'USD',
        target_language: 'EN',
        ship_to_country: 'SA',
        page_no: 1,
        page_size: 5,
      });
      results.push({
        method: 'aliexpress.affiliate.product.query',
        status: 'success',
        keys: Object.keys(r || {}),
        sample: JSON.stringify(r).substring(0, 500),
        hasProducts: JSON.stringify(r).includes('product_id'),
      });
    } catch (e: any) {
      results.push({
        method: 'aliexpress.affiliate.product.query',
        status: 'error',
        error: e.message,
        fix: 'تأكد إن تطبيقك في AliExpress Open Platform مفعّل عليه Affiliate API permissions.',
      });
    }

    // Test 2: DS Recommend Feed
    try {
      const r = await (sdk as any).apiCall('aliexpress.ds.recommend.feed.get', {
        feed_name: 'DS recommend',
        target_currency: 'USD',
        target_language: 'EN',
        ship_to_country: 'SA',
        page_no: 1,
        page_size: 5,
      });
      results.push({
        method: 'aliexpress.ds.recommend.feed.get',
        status: 'success',
        keys: Object.keys(r || {}),
        sample: JSON.stringify(r).substring(0, 500),
        hasProducts: JSON.stringify(r).includes('product_id'),
      });
    } catch (e: any) {
      results.push({
        method: 'aliexpress.ds.recommend.feed.get',
        status: 'error',
        error: e.message,
        fix: 'تأكد إن الـ feed_name صحيح. جرب "Bestseller" أو "New Arrivals" بدل "DS recommend".',
      });
    }

    // Test 3: Affiliate Hot Products
    try {
      const r = await (sdk as any).apiCall('aliexpress.affiliate.hotproduct.query', {
        keywords: 'car parts',
        target_currency: 'USD',
        target_language: 'EN',
        ship_to_country: 'SA',
        page_no: 1,
        page_size: 5,
      });
      results.push({
        method: 'aliexpress.affiliate.hotproduct.query',
        status: 'success',
        keys: Object.keys(r || {}),
        sample: JSON.stringify(r).substring(0, 500),
        hasProducts: JSON.stringify(r).includes('product_id'),
      });
    } catch (e: any) {
      results.push({
        method: 'aliexpress.affiliate.hotproduct.query',
        status: 'error',
        error: e.message,
        fix: 'تأكد إن تطبيقك مفعّل عليه Hot Products API permission.',
      });
    }

    // Test 4: DS Product Get (by known ID)
    try {
      const r = await (sdk as any).apiCall('aliexpress.ds.product.get', {
        product_id: '1005006419932918',
        target_currency: 'USD',
        target_language: 'EN',
        ship_to_country: 'SA',
      });
      results.push({
        method: 'aliexpress.ds.product.get',
        status: 'success',
        keys: Object.keys(r || {}),
        sample: JSON.stringify(r).substring(0, 300),
        hasProducts: JSON.stringify(r).includes('product_id') || JSON.stringify(r).includes('product_title'),
      });
    } catch (e: any) {
      results.push({
        method: 'aliexpress.ds.product.get',
        status: 'error',
        error: e.message,
        fix: 'تأكد من صلاحيات DS API في تطبيقك.',
      });
    }

    const working = results.filter(r => r.status === 'success' && r.hasProducts);

    return NextResponse.json({
      status: working.length > 0 ? 'partial' : 'failing',
      summary: {
        total: results.length,
        success: results.filter(r => r.status === 'success').length,
        withProducts: working.length,
        errors: results.filter(r => r.status === 'error').length,
      },
      recommendation: working.length === 0
        ? '🔴 لا يوجد API شغال. تحتاج تراجع إعدادات تطبيقك في AliExpress Open Platform وتتأكد من الصلاحيات.'
        : `🟢 ${working.length} من ${results.length} APIs شغالة. أفضل method: ${working[0].method}`,
      results,
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: error.message,
      results,
    }, { status: 500 });
  }
}
