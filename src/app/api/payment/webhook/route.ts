import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://booga-car.vercel.app';

/**
 * Stripe Webhook Handler
 * ======================
 * يستقبل أحداث Stripe تلقائياً ويحدث حالة الطلب
 * 
 * SETUP:
 * 1. في Stripe Dashboard → Developers → Webhooks
 * 2. أضف Endpoint: https://your-domain.com/api/payment/webhook
 * 3. اختر Events: checkout.session.completed, payment_intent.succeeded, payment_intent.payment_failed
 * 4. انسخ Signing Secret وأضفه كـ STRIPE_WEBHOOK_SECRET في .env.local
 * 
 * For testing with Stripe CLI:
 *   stripe listen --forward-to localhost:3000/api/payment/webhook
 */
export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  // If no webhook secret configured, log and accept (dev mode)
  if (!webhookSecret) {
    console.warn('[Stripe Webhook] STRIPE_WEBHOOK_SECRET not configured — skipping signature verification');
    try {
      const event = JSON.parse(body) as Stripe.Event;
      await handleEvent(event);
      return NextResponse.json({ received: true, verified: false });
    } catch (err: any) {
      console.error('[Stripe Webhook] Parse error:', err.message);
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }
  }

  // Verify signature in production
  let event: Stripe.Event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error('[Stripe Webhook] Signature verification failed:', err.message);
    return NextResponse.json({ error: `Webhook signature verification failed: ${err.message}` }, { status: 400 });
  }

  // Process the event
  try {
    await handleEvent(event);
    return NextResponse.json({ received: true, verified: true });
  } catch (err: any) {
    console.error('[Stripe Webhook] Event handling error:', err.message);
    return NextResponse.json({ error: 'Event handling failed' }, { status: 500 });
  }
}

/**
 * Handle individual Stripe events
 */
async function handleEvent(event: Stripe.Event) {
  const supabase = getSupabaseAdmin();

  switch (event.type) {
    // ─── Checkout Session Completed ───
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.order_id;

      if (!orderId) {
        console.warn('[Webhook] checkout.session.completed — no order_id in metadata');
        return;
      }

      const paymentIntent = session.payment_intent as any;
      const paymentId = typeof paymentIntent === 'string' ? paymentIntent : paymentIntent?.id;

      if (session.payment_status === 'paid') {
        // ✅ Payment successful — update order
        const updatePayload: Record<string, string> = {
          status: 'تم التأكيد',
        };

        // Try to update with payment columns (they may not exist)
        try {
          await supabase.from('orders').update({
            ...updatePayload,
            payment_status: 'paid',
            payment_id: paymentId || session.id,
          }).eq('id', orderId);
        } catch {
          await supabase.from('orders').update(updatePayload).eq('id', orderId);
        }

        // Send confirmation email
        try {
          await fetch(`${SITE_URL}/api/email/order-confirmation`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId, paymentId }),
          });
        } catch {}

        // Notify admin
        try {
          await supabase.from('admin_notifications').insert({
            type: 'PAYMENT_WEBHOOK',
            title: '💳 Webhook: دفعة ناجحة',
            message: `تم استلام دفعة ${((session.amount_total || 0) / 100).toFixed(2)} ر.س للطلب #${orderId.slice(0, 8)} عبر Stripe Webhook`,
          });
        } catch {}

        console.log(`[Webhook] ✅ Order ${orderId.slice(0, 8)} marked as paid`);
      }
      break;
    }

    // ─── Payment Intent Succeeded ───
    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const orderId = paymentIntent.metadata?.order_id;

      if (!orderId) return;

      // Double-check order is updated (backup for checkout.session.completed)
      try {
        const { data: order } = await supabase
          .from('orders')
          .select('status')
          .eq('id', orderId)
          .single();

        // Only update if not already confirmed
        if (order && order.status !== 'تم التأكيد' && order.status !== 'جاري الشحن' && order.status !== 'تم التوصيل') {
          await supabase.from('orders').update({
            status: 'تم التأكيد',
          }).eq('id', orderId);

          // Try updating payment columns
          try {
            await supabase.from('orders').update({
              payment_status: 'paid',
              payment_id: paymentIntent.id,
            }).eq('id', orderId);
          } catch {}

          console.log(`[Webhook] ✅ Payment intent succeeded — Order ${orderId.slice(0, 8)} confirmed`);
        }
      } catch {}
      break;
    }

    // ─── Payment Intent Failed ───
    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const orderId = paymentIntent.metadata?.order_id;

      if (!orderId) return;

      try {
        await supabase.from('orders').update({
          payment_status: 'failed',
        }).eq('id', orderId);
      } catch {
        // payment_status column might not exist
      }

      // Notify admin
      try {
        await supabase.from('admin_notifications').insert({
          type: 'PAYMENT_FAILED',
          title: '❌ Webhook: دفعة فاشلة',
          message: `فشلت عملية الدفع للطلب #${orderId.slice(0, 8)}. السبب: ${paymentIntent.last_payment_error?.message || 'غير معروف'}`,
        });
      } catch {}

      console.log(`[Webhook] ❌ Payment failed for order ${orderId.slice(0, 8)}`);
      break;
    }

    // ─── Charge Refunded ───
    case 'charge.refunded': {
      const charge = event.data.object as Stripe.Charge;
      const paymentIntentId = charge.payment_intent as string;

      if (!paymentIntentId) return;

      // Find order by payment_id
      try {
        const { data: orders } = await supabase
          .from('orders')
          .select('id')
          .eq('payment_id', paymentIntentId)
          .limit(1);

        if (orders && orders.length > 0) {
          const orderId = orders[0].id;
          await supabase.from('orders').update({
            status: 'ملغي',
            payment_status: 'refunded',
          }).eq('id', orderId);

          // Notify admin
          await supabase.from('admin_notifications').insert({
            type: 'REFUND',
            title: '💸 Webhook: تم الاسترجاع',
            message: `تم استرجاع المبلغ ${((charge.amount_refunded || 0) / 100).toFixed(2)} ر.س للطلب #${orderId.slice(0, 8)}`,
          });
        }
      } catch {}
      break;
    }

    default:
      console.log(`[Webhook] Unhandled event type: ${event.type}`);
  }
}
