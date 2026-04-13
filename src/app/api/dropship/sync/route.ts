import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { createAliExpressSDK, calculateDropshipPrice } from '@/lib/aliexpress';

export async function POST(req: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin();
  const startTime = Date.now();
  let successCount = 0;
  let errorCount = 0;

  try {
    const sdk = await createAliExpressSDK(supabaseAdmin);
    if (!sdk) return NextResponse.json({ error: 'AliExpress not configured' }, { status: 400 });

    // Get all active dropship products
    const { data: products } = await supabaseAdmin
      .from('dropship_products')
      .select('*')
      .eq('provider', 'aliexpress')
      .eq('is_active', true)
      .eq('auto_sync_price', true);

    if (!products || products.length === 0) {
      return NextResponse.json({ message: 'No products to sync', synced: 0 });
    }

    for (const dp of products) {
      try {
        const details = await sdk.getProductDetails(dp.provider_product_id);
        if (!details) {
          // Product no longer available
          await supabaseAdmin.from('dropship_products').update({
            provider_stock_status: 'out_of_stock',
            sync_error: 'Product not found on AliExpress',
            last_synced_at: new Date().toISOString(),
          }).eq('id', dp.id);

          await supabaseAdmin.from('products').update({
            stock: 'غير متوفر',
          }).eq('id', dp.local_product_id);

          errorCount++;
          continue;
        }

        const updates: any = {
          provider_price: details.price,
          last_synced_at: new Date().toISOString(),
          sync_error: null,
        };

        // Update local price if auto-sync enabled
        if (dp.auto_sync_price && details.price !== dp.provider_price) {
          const newLocalPrice = calculateDropshipPrice(details.price, dp.provider_shipping_cost || 0, dp.markup_percent);
          updates.local_price = newLocalPrice;

          await supabaseAdmin.from('products').update({
            price: newLocalPrice,
          }).eq('id', dp.local_product_id);
        }

        // Update stock
        if (dp.auto_sync_stock) {
          const stockStatus = details.orders > 0 ? 'in_stock' : 'out_of_stock';
          updates.provider_stock_status = stockStatus;

          if (stockStatus === 'out_of_stock') {
            await supabaseAdmin.from('products').update({ stock: 'غير متوفر' }).eq('id', dp.local_product_id);
          }
        }

        await supabaseAdmin.from('dropship_products').update(updates).eq('id', dp.id);
        successCount++;

        // Small delay to avoid rate limiting
        await new Promise(r => setTimeout(r, 200));
      } catch (err: any) {
        errorCount++;
        await supabaseAdmin.from('dropship_products').update({
          sync_error: err.message,
          last_synced_at: new Date().toISOString(),
        }).eq('id', dp.id);
      }
    }

    const duration = Date.now() - startTime;

    await supabaseAdmin.from('dropship_sync_log').insert({
      action: 'price_sync',
      provider: 'aliexpress',
      status: errorCount === 0 ? 'success' : 'warning',
      affected_count: successCount,
      duration_ms: duration,
      details: { total: products.length, success: successCount, errors: errorCount },
    });

    return NextResponse.json({ synced: successCount, errors: errorCount, duration });
  } catch (error: any) {
    const supabaseAdmin2 = getSupabaseAdmin();
    await supabaseAdmin2.from('dropship_sync_log').insert({
      action: 'price_sync',
      provider: 'aliexpress',
      status: 'error',
      error_message: error.message,
      duration_ms: Date.now() - startTime,
    });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
