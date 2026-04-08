import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { createAliExpressSDK, calculateDropshipPrice } from '@/lib/aliexpress';

export async function POST(req: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin();
  const body = await req.json();
  const { productId, customName, customDescription, customCategory, customBrand, markupPercent } = body;

  if (!productId) return NextResponse.json({ error: 'Product ID required' }, { status: 400 });

  try {
    const sdk = await createAliExpressSDK(supabaseAdmin);
    if (!sdk) return NextResponse.json({ error: 'AliExpress not configured' }, { status: 400 });

    // Get product details
    const product = await sdk.getProductDetails(productId);
    if (!product) return NextResponse.json({ error: 'Product not found on AliExpress' }, { status: 404 });

    // Get shipping info
    let shippingCost = 0;
    try {
      const shipping = await sdk.getShippingInfo(productId);
      if (shipping.methods.length > 0) {
        shippingCost = shipping.methods[0].cost;
      }
    } catch { /* ignore shipping errors */ }

    // Get default markup
    const { data: config } = await supabaseAdmin
      .from('dropship_config')
      .select('default_markup_percent')
      .eq('provider', 'aliexpress')
      .single();

    const markup = markupPercent || config?.default_markup_percent || 30;
    const localPrice = calculateDropshipPrice(product.price, shippingCost, markup);

    // Check if already imported
    const { data: existing } = await supabaseAdmin
      .from('dropship_products')
      .select('id, local_product_id')
      .eq('provider_product_id', productId)
      .eq('provider', 'aliexpress')
      .single();

    if (existing) {
      return NextResponse.json({ error: 'This product is already imported', existingId: existing.local_product_id }, { status: 409 });
    }

    // Create local product
    const { data: localProduct, error: productError } = await supabaseAdmin
      .from('products')
      .insert({
        name: customName || product.title,
        description: customDescription || `Imported from AliExpress - ${product.title}`,
        price: localPrice,
        old_price: null,
        brand: customBrand || product.storeName || 'Imported',
        category: customCategory || 'قطع غيار',
        condition: 'جديد',
        stock: 'متوفر',
        image: product.imageUrl,
        images: product.images,
        rating: product.rating || 4.5,
        reviews: product.orders || 0,
        shipping: 'شحن مجاني',
        source: 'dropship',
      })
      .select()
      .single();

    if (productError) {
      return NextResponse.json({ error: `Failed to create product: ${productError.message}` }, { status: 500 });
    }

    // Create dropship link
    const { error: linkError } = await supabaseAdmin
      .from('dropship_products')
      .insert({
        local_product_id: localProduct.id,
        provider: 'aliexpress',
        provider_product_id: productId,
        provider_product_url: product.productUrl,
        provider_price: product.price,
        provider_currency: product.currency,
        provider_shipping_cost: shippingCost,
        local_price: localPrice,
        markup_percent: markup,
        provider_images: product.images,
        provider_variants: product.variants || [],
        provider_data: {
          title: product.title,
          storeName: product.storeName,
          storeUrl: product.storeUrl,
          rating: product.rating,
          orders: product.orders,
        },
        last_synced_at: new Date().toISOString(),
      });

    if (linkError) {
      // Clean up local product if link fails
      await supabaseAdmin.from('products').delete().eq('id', localProduct.id);
      return NextResponse.json({ error: `Failed to create link: ${linkError.message}` }, { status: 500 });
    }

    // Log import
    await supabaseAdmin.from('dropship_sync_log').insert({
      action: 'product_import',
      provider: 'aliexpress',
      status: 'success',
      details: { productId, localProductId: localProduct.id, localPrice, providerPrice: product.price },
    });

    return NextResponse.json({
      success: true,
      localProductId: localProduct.id,
      localPrice,
      providerPrice: product.price,
      markup,
    });
  } catch (error: any) {
    console.error('Import error:', error);

    const supabaseAdmin2 = getSupabaseAdmin();
    await supabaseAdmin2.from('dropship_sync_log').insert({
      action: 'product_import',
      provider: 'aliexpress',
      status: 'error',
      error_message: error.message,
      details: { productId },
    });

    return NextResponse.json({ error: error.message || 'Import failed' }, { status: 500 });
  }
}
