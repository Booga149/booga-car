import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createAliExpressSDK } from '@/lib/aliexpress';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  let updated = 0;

  try {
    const sdk = await createAliExpressSDK(supabaseAdmin);
    if (!sdk) return NextResponse.json({ error: 'AliExpress not configured' }, { status: 400 });

    // Get all active orders that need tracking updates
    const { data: orders } = await supabaseAdmin
      .from('dropship_orders')
      .select('*')
      .eq('provider', 'aliexpress')
      .not('provider_order_id', 'is', null)
      .not('provider_order_status', 'in', '("delivered","cancelled","error")');

    if (!orders || orders.length === 0) {
      return NextResponse.json({ message: 'No orders to track', updated: 0 });
    }

    for (const order of orders) {
      try {
        const status = await sdk.getOrderStatus(order.provider_order_id);

        const updates: any = {
          provider_order_status: status.status,
          last_checked_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        if (status.trackingNumber && status.trackingNumber !== order.tracking_number) {
          updates.tracking_number = status.trackingNumber;
          updates.shipping_carrier = status.carrier || order.shipping_carrier;
        }

        if (status.status === 'delivered' && !order.delivered_at) {
          updates.delivered_at = new Date().toISOString();
        }

        await supabaseAdmin.from('dropship_orders').update(updates).eq('id', order.id);

        // Update local order tracking if tracking number available
        if (updates.tracking_number && order.local_order_id) {
          await supabaseAdmin.from('orders').update({
            tracking_number: updates.tracking_number,
            status: status.status === 'delivered' ? 'تم التوصيل' : 'تم الشحن',
          }).eq('id', order.local_order_id);
        }

        updated++;
        await new Promise(r => setTimeout(r, 300));
      } catch (err: any) {
        console.error(`Tracking update failed for order ${order.id}:`, err.message);
      }
    }

    await supabaseAdmin.from('dropship_sync_log').insert({
      action: 'tracking_update',
      provider: 'aliexpress',
      status: 'success',
      affected_count: updated,
      duration_ms: Date.now() - startTime,
      details: { total: orders.length, updated },
    });

    return NextResponse.json({ updated, total: orders.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
