import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { roundPrice, calculateCommission, FREE_SHIPPING_THRESHOLD, STANDARD_SHIPPING_COST, applyCouponDiscount } from '@/lib/pricing';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items, coupon_code, shippingDetails, paymentMethod, userId } = body;

    // 1. Basic body validation
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'سلة المشتريات فارغة' }, { status: 400 });
    }
    if (!shippingDetails || !shippingDetails.name || !shippingDetails.phone || !shippingDetails.address) {
      return NextResponse.json({ error: 'بيانات التوصيل غير مكتملة' }, { status: 400 });
    }
    if (!paymentMethod) {
      return NextResponse.json({ error: 'طريقة الدفع غير محددة' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // 2. Fetch ALL product prices from database (NEVER trust frontend)
    const productIds = items.map((i: any) => i.product_id || i.id);
    let selectFields = 'id, name, price, old_price, stock, stock_quantity, seller_id, image_url, category';
    let { data: products, error: productsError } = await supabase
      .from('products')
      .select(selectFields)
      .in('id', productIds);

    if (productsError && productsError.message && productsError.message.includes('stock_quantity')) {
      selectFields = 'id, name, price, old_price, stock, seller_id, image_url';
      const retry = await supabase.from('products').select(selectFields).in('id', productIds);
      products = retry.data;
      productsError = retry.error;
    }

    if (productsError || !products || products.length === 0) {
      console.error('[CreateOrder] Supabase Error:', productsError);
      return NextResponse.json({ error: 'فشل في جلب بيانات المنتجات أو المنتجات غير موجودة' }, { status: 500 });
    }

    // 3. Validate stock & calculate line totals securely
    const orderItemsToInsert = [];
    let subtotal = 0;

    for (const item of items) {
      const dbProduct = products.find((p: any) => p.id === (item.product_id || item.id));
      
      if (!dbProduct) {
        return NextResponse.json({ error: `المنتج غير موجود: ${item.name}` }, { status: 400 });
      }

      if (dbProduct.stock === 'غير متوفر') {
        return NextResponse.json({ error: `المنتج "${dbProduct.name}" غير متوفر حالياً` }, { status: 400 });
      }

      const availableQty = dbProduct.stock_quantity ?? 0;
      const requestedQty = Math.max(1, Math.round(item.quantity));
      if (availableQty < requestedQty && availableQty !== null) {
        return NextResponse.json({ error: `كمية المنتج "${dbProduct.name}" غير كافية في المخزون` }, { status: 400 });
      }

      const quantity = requestedQty;
      const unitPrice = roundPrice(Number(dbProduct.price));
      const lineTotal = roundPrice(unitPrice * quantity);
      
      // Calculate split commission
      const commission = calculateCommission(unitPrice);

      orderItemsToInsert.push({
        product_id: dbProduct.id,
        product_name: dbProduct.name,
        product_image: dbProduct.image_url || null,
        quantity,
        price: unitPrice, // Save exact unit price 
        price_at_time: unitPrice, 
        seller_id: dbProduct.seller_id,
        commission_rate: commission.rate,
        platform_fee: roundPrice(commission.fee * quantity),
        seller_net: roundPrice(commission.net * quantity),
      });

      subtotal = roundPrice(subtotal + lineTotal);
    }

    // 4. Calculate shipping securely
    const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
    const shippingCost = isFreeShipping ? 0 : STANDARD_SHIPPING_COST;

    // 5. Validate coupon (if provided) securely
    let couponDiscount = 0;
    
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
          const formattedItems = orderItemsToInsert.map((i: any) => ({
            originalPrice: i.price, quantity: i.quantity, productId: i.product_id, category: products.find((p:any) => p.id === i.product_id)?.category
          }));
          const couponResult = applyCouponDiscount(subtotal, shippingCost, coupon, formattedItems);
          couponDiscount = couponResult.couponDiscount;
          
          // Increment coupon uses
          try { await supabase.rpc('increment_coupon_usage', { coupon_code_param: coupon.code }); } catch {}
        }
      }
    }

    // 6. Final secured total computation
    const totalBeforeDiscount = roundPrice(subtotal + shippingCost);
    const finalCalculatedTotal = roundPrice(totalBeforeDiscount - couponDiscount);

    // 7. Secure Insertion (via Admin Client, bypassing broken/unsafe RLS)
    let insertPayload: any = {
      user_id: userId || null,
      total: finalCalculatedTotal,
      shipping_cost: shippingCost,
      status: 'قيد المراجعة',
      shipping_address: `${shippingDetails.city} - ${shippingDetails.address}`,
      city: shippingDetails.city,
      phone: shippingDetails.phone,
      buyer_name: shippingDetails.name,
      payment_method: paymentMethod,
      payment_status: 'pending'
    };

    let { data: newOrder, error: orderError } = await supabase
      .from('orders')
      .insert(insertPayload)
      .select()
      .single();

    // Fallback if the user hasn't run the migration for payment_status yet
    if (orderError && orderError.message && orderError.message.includes('payment_status')) {
      delete insertPayload.payment_status;
      const retry = await supabase.from('orders').insert(insertPayload).select().single();
      newOrder = retry.data;
      orderError = retry.error;
    }

    if (orderError || !newOrder) {
      throw new Error(orderError?.message || "Failed to create secure order");
    }

    // 8. Insert Order Items
    const itemsWithOrderId = orderItemsToInsert.map(i => ({ ...i, order_id: newOrder.id }));
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(itemsWithOrderId);

    if (itemsError) {
      console.error("Order items insertion error:", itemsError);
    }

    // 8b. Decrement Stock and Complete Reservations
    try {
      for (const item of orderItemsToInsert) {
        try { await supabase.rpc('decrement_stock', { p_product_id: item.product_id, p_quantity: item.quantity }); } catch {}
        try { await supabase.rpc('check_low_stock', { p_product_id: item.product_id }); } catch {}
      }
    } catch(e) {}

    // 8c. Create Invoice (non-blocking)
    try {
      if (orderItemsToInsert.length > 0 && orderItemsToInsert[0].seller_id) {
        const { data: invNumber } = await supabase.rpc('create_invoice', {
          p_seller_id: orderItemsToInsert[0].seller_id,
          p_source: 'online',
          p_order_id: newOrder.id,
          p_subtotal: totalBeforeDiscount,
          p_discount: couponDiscount,
          p_total: finalCalculatedTotal,
          p_customer_name: shippingDetails.name,
          p_customer_phone: shippingDetails.phone,
        });

        if (invNumber) {
          const { data: inv } = await supabase.from('invoices').select('id').eq('invoice_number', invNumber).single();
          if (inv) {
            const invoiceItems = orderItemsToInsert.map(item => ({
              invoice_id: inv.id,
              product_id: item.product_id,
              product_name: item.product_name,
              quantity: item.quantity,
              unit_price: item.price,
              total: roundPrice(item.price * item.quantity),
            }));
            await supabase.from('invoice_items').insert(invoiceItems);
          }
        }
      }
    } catch(e) {}

    // 8d. Add Audit Log & Notifications (non-blocking)
    try {
      await supabase.from('admin_notifications').insert({
        type: 'NEW_ORDER',
        title: 'طلب جديد (Secure API)',
        message: `طلب بقيمة ${finalCalculatedTotal} ر.س تم استلامه من ${shippingDetails.name}.`
      });
      
      if (userId) {
        await supabase.from('user_notifications').insert({
          user_id: userId,
          type: 'order_update',
          title: 'تم استلام طلبك بنجاح! 🎉',
          message: `طلبك بقيمة ${finalCalculatedTotal} ر.س قيد المراجعة.`,
          link: `/track-order?id=${newOrder.id}`
        });
      }
    } catch(e) {}

    // 9. Process Payment (Internally fetch our existing payment API)
    // To avoid circular fetch limits inside Vercel, we can simulate the fetch output directly 
    // OR we just send absolute URL. For safety, we use absolute URL or directly process here.
    const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    try {
      const payRes = await fetch(`${SITE_URL}/api/payment/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: newOrder.id,
          amount: finalCalculatedTotal,
          paymentMethod: paymentMethod,
          customerName: shippingDetails.name,
          customerPhone: shippingDetails.phone
        }),
      });
      const payResult = await payRes.json();
      
      return NextResponse.json({
        success: true,
        orderId: newOrder.id,
        finalTotal: finalCalculatedTotal,
        paymentResult: payResult
      });
    } catch (payErr: any) {
      console.warn("Payment generation failed:", payErr);
      return NextResponse.json({
        success: true,
        orderId: newOrder.id,
        finalTotal: finalCalculatedTotal,
        paymentResult: { error: 'فشل في الاتصال ببوابة الدفع', success: false }
      });
    }

  } catch (error: any) {
    console.error('[Secure Order Creation Error]', error);
    return NextResponse.json({ error: error.message || 'حدث خطأ غير متوقع أثناء معالجة الطلب' }, { status: 500 });
  }
}
