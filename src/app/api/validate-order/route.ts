import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { roundPrice, calculateCommission, FREE_SHIPPING_THRESHOLD, STANDARD_SHIPPING_COST } from '@/lib/pricing';

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
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Fetch ALL product prices from database (NEVER trust frontend)
    const productIds = items.map((i: any) => i.product_id);
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, price, old_price, stock, seller_id')
      .in('id', productIds);

    if (productsError || !products) {
      return NextResponse.json({ error: 'فشل في جلب بيانات المنتجات' }, { status: 500 });
    }

    // 2. Validate stock & calculate line totals
    const orderItems = [];
    let subtotal = 0;

    for (const item of items) {
      const product = products.find((p: any) => p.id === item.product_id);
      
      if (!product) {
        return NextResponse.json({ 
          error: `المنتج غير موجود: ${item.product_id}` 
        }, { status: 400 });
      }

      if (product.stock === 'غير متوفر') {
        return NextResponse.json({ 
          error: `المنتج "${product.name}" غير متوفر حالياً` 
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
          couponPercent = coupon.discount_percent;
          couponValid = true;
        }
      }
    }

    // 5. Calculate final total
    const totalBeforeDiscount = roundPrice(subtotal + shippingCost);
    couponDiscount = couponValid ? roundPrice(totalBeforeDiscount * (couponPercent / 100)) : 0;
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
