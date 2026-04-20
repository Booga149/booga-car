import { NextRequest, NextResponse } from 'next/server';
import { ENGINEER_SYSTEMS_PRODUCTS } from '@/lib/engineerData';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { roundPrice, calculateCommission, FREE_SHIPPING_THRESHOLD, STANDARD_SHIPPING_COST, applyCouponDiscount } from '@/lib/pricing';

export const dynamic = 'force-dynamic';

/**
 * ═══════════════════════════════════════════
 * Server-Side Price Validation API
 * ═══════════════════════════════════════════
 * 
 * This endpoint re-calculates the entire order from scratch
 * using database prices. NEVER trusts frontend prices.
 * 
 * POST /api/validate-order
 * Body: { items: [{ product_id, quantity }], coupon_code?: string }
 */

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items, coupon_code } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'لا توجد منتجات في الطلب' }, { status: 400 });
    }

    // Initialize Supabase with service role for server-side
    const supabase = getSupabaseAdmin();

    // 1. Fetch ALL product prices from database (NEVER trust frontend)
    const productIds = items.map((i: any) => i.product_id);
    const dbProductIds = productIds.filter((id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id));
    let selectFields = 'id, name, price, old_price, stock, stock_quantity, seller_id, category';
    let { data: products, error: productsError } = await supabase
      .from('products')
      .select(selectFields as any)
      .in('id', dbProductIds);

    // Schema fallback if stock_quantity wasn't added to live DB yet
    if (productsError && productsError.message && productsError.message.includes('stock_quantity')) {
      selectFields = 'id, name, price, old_price, stock, seller_id, category';
      const retry = await supabase.from('products').select(selectFields as any).in('id', dbProductIds);
      products = retry.data;
      productsError = retry.error;
    }

    if (productsError || !products) {
      console.error('[ValidateOrder] Supabase Error:', productsError);
      return NextResponse.json({ error: `فشل في جلب بيانات المنتجات السبب: ${productsError?.message || 'unknown'}` }, { status: 500 });
    }

    // 2. Validate stock & calculate line totals
    const orderItems = [];
    let subtotal = 0;

    for (const item of items) {
      const staticProduct = ENGINEER_SYSTEMS_PRODUCTS.find(p => p.id === item.product_id);
      const product = staticProduct ? { ...staticProduct, stock_quantity: 999, seller_id: null } : products.find((p: any) => p.id === item.product_id);
      
      if (!product) {
        return NextResponse.json({ 
          error: `المنتج غير موجود: ${item.product_id}` 
        }, { status: 400 });
      }

      if (product.stock === 'غير متوفر') {
        return NextResponse.json({ 
          error: `المنتج "${product.name}" غير متوفر حالياً`,
          out_of_stock: true,
          product_id: product.id
        }, { status: 400 });
      }

      // Check actual stock quantity
      const availableQty = product.stock_quantity ?? 0;
      const requestedQty = Math.max(1, Math.round(item.quantity));
      if (availableQty < requestedQty) {
        return NextResponse.json({ 
          error: availableQty === 0 
            ? `المنتج "${product.name}" نفد من المخزون` 
            : `المنتج "${product.name}" متبقي منه ${availableQty} قطع فقط، وأنت طلبت ${requestedQty}`,
          out_of_stock: availableQty === 0,
          available_quantity: availableQty,
          product_id: product.id
        }, { status: 400 });
      }

      const quantity = Math.max(1, Math.round(item.quantity));
      const unitPrice = roundPrice(Number(product.price));
      const lineTotal = roundPrice(unitPrice * quantity);
      const commission = calculateCommission(unitPrice);

      orderItems.push({
        product_id: product.id,
        product_name: product.name,
        quantity,
        unit_price: unitPrice,
        old_price: product.old_price ? roundPrice(Number(product.old_price)) : null,
        line_total: lineTotal,
        seller_id: product.seller_id,
        commission_rate: commission.rate,
        platform_fee: roundPrice(commission.fee * quantity),
        seller_net: roundPrice(commission.net * quantity),
      });

      subtotal = roundPrice(subtotal + lineTotal);
    }

    // 3. Calculate shipping
    const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
    const shippingCost = isFreeShipping ? 0 : STANDARD_SHIPPING_COST;

    // 4. Validate coupon (if provided)
    let couponDiscount = 0;
    let couponPercent = 0;
    let couponValid = false;

    if (coupon_code) {
      const { data: coupon } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', coupon_code.trim().toUpperCase())
        .eq('is_active', true)
        .single();

      if (coupon) {
        const notExpired = !coupon.expires_at || new Date(coupon.expires_at) > new Date();
        const notExhausted = !coupon.max_uses || coupon.current_uses < coupon.max_uses;
        const meetsMinimum = !coupon.min_order_amount || subtotal >= coupon.min_order_amount;

        if (notExpired && notExhausted && meetsMinimum) {
          const formattedItems = orderItems.map((i: any) => ({
            originalPrice: i.unit_price, quantity: i.quantity, productId: i.product_id, category: products.find((p:any) => p.id === i.product_id)?.category
          }));
          const couponResult = applyCouponDiscount(subtotal, shippingCost, coupon, formattedItems);
          couponDiscount = couponResult.couponDiscount;
          couponValid = true;
        }
      }
    }

    // 5. Calculate final total
    const totalBeforeDiscount = roundPrice(subtotal + shippingCost);
    const finalTotal = roundPrice(totalBeforeDiscount - couponDiscount);

    // 6. Return validated order
    return NextResponse.json({
      valid: true,
      order: {
        items: orderItems,
        subtotal,
        shipping_cost: shippingCost,
        is_free_shipping: isFreeShipping,
        coupon_code: couponValid ? coupon_code : null,
        coupon_percent: couponPercent,
        coupon_discount: couponDiscount,
        total_before_discount: totalBeforeDiscount,
        final_total: finalTotal,
        calculated_at: new Date().toISOString(),
      }
    });

  } catch (err: any) {
    console.error('Order validation error:', err);
    return NextResponse.json({ error: 'حدث خطأ في التحقق من الطلب' }, { status: 500 });
  }
}
