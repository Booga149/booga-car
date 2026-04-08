import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createAliExpressSDK } from '@/lib/aliexpress';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { orderId } = body;

  try {
    const sdk = await createAliExpressSDK(supabaseAdmin);
    if (!sdk) return NextResponse.json({ error: 'AliExpress not configured' }, { status: 400 });

    // Get local order details
    const { data: order } = await supabaseAdmin
      .from('orders')
      .select('*, items:order_items(*, product:products(*))')
      .eq('id', orderId)
      .single();

    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    // Find dropship products in this order
    const productIds = order.items?.map((i: any) => i.product_id).filter(Boolean) || [];
    const { data: dropshipProducts } = await supabaseAdmin
      .from('dropship_products')
      .select('*')
      .in('local_product_id', productIds)
      .eq('is_active', true);

    if (!dropshipProducts || dropshipProducts.length === 0) {
      return NextResponse.json({ message: 'No dropship products in this order', fulfilled: 0 });
    }

    const results = [];

    for (const dp of dropshipProducts) {
      const orderItem = order.items?.find((i: any) => i.product_id === dp.local_product_id);
      if (!orderItem) continue;

      try {
        // Create order on AliExpress
        const aeOrder = await sdk.createOrder({
          productId: dp.provider_product_id,
          quantity: orderItem.quantity || 1,
          shippingAddress: {
            name: order.customer_name || order.name || '',
            phone: order.phone || '',
            address: order.address || '',
            city: order.city || '',
            province: order.province || order.city || '',
            country: 'SA',
            zip: order.zip || '',
          },
        });

        // Save fulfillment record
        const profit = (dp.local_price * (orderItem.quantity || 1)) - aeOrder.totalCost;

        await supabaseAdmin.from('dropship_orders').insert({
          local_order_id: orderId,
          provider: 'aliexpress',
          provider_order_id: aeOrder.orderId,
          provider_order_status: aeOrder.orderStatus,
          provider_cost: aeOrder.totalCost,
          local_sale_price: dp.local_price * (orderItem.quantity || 1),
          profit,
          customer_name: order.customer_name || order.name,
          customer_address: {
            city: order.city,
            address: order.address,
            phone: order.phone,
          },
          auto_ordered: true,
          fulfilled_at: new Date().toISOString(),
        });

        results.push({ productId: dp.provider_product_id, aeOrderId: aeOrder.orderId, status: 'success' });

        await supabaseAdmin.from('dropship_sync_log').insert({
          action: 'order_fulfill',
          provider: 'aliexpress',
          status: 'success',
          details: { localOrderId: orderId, aeOrderId: aeOrder.orderId, cost: aeOrder.totalCost, profit },
        });
      } catch (err: any) {
        results.push({ productId: dp.provider_product_id, status: 'error', error: err.message });

        await supabaseAdmin.from('dropship_orders').insert({
          local_order_id: orderId,
          provider: 'aliexpress',
          provider_order_status: 'error',
          error_message: err.message,
          auto_ordered: true,
          provider_cost: 0,
          local_sale_price: dp.local_price,
          profit: 0,
        });

        await supabaseAdmin.from('dropship_sync_log').insert({
          action: 'order_fulfill',
          provider: 'aliexpress',
          status: 'error',
          error_message: err.message,
          details: { localOrderId: orderId, productId: dp.provider_product_id },
        });
      }
    }

    return NextResponse.json({ results, fulfilled: results.filter(r => r.status === 'success').length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
