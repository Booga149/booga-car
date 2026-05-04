import { NextRequest, NextResponse } from 'next/server';
import { getCheckoutSession, isStripeConfigured } from '@/lib/stripe';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://booga-car.vercel.app';

/**
 * Stripe redirects here after payment completion
 * URL: /api/payment/callback?session_id=xxx&order_id=xxx
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get('session_id');
  const orderId = searchParams.get('order_id');
  const errorParam = searchParams.get('error');

  // Handle cancel/error redirects
  if (errorParam || (!sessionId && !orderId)) {
    return NextResponse.redirect(`${SITE_URL}/checkout?error=${errorParam || 'missing_data'}`);
  }

  const supabase = getSupabaseAdmin();

  try {
    // ─── Stripe Checkout Session Verification ───
    if (sessionId && isStripeConfigured()) {
      const session = await getCheckoutSession(sessionId);
      const stripeOrderId = session.metadata?.order_id || orderId;

      if (!stripeOrderId) {
        return NextResponse.redirect(`${SITE_URL}/checkout?error=missing_order`);
      }

      if (session.payment_status === 'paid') {
        // ✅ Payment successful
        const paymentIntent = session.payment_intent as any;
        const paymentId = typeof paymentIntent === 'string' ? paymentIntent : paymentIntent?.id;

        let updatePayload: any = {
          payment_status: 'paid',
          payment_id: paymentId || sessionId,
          status: 'تم التأكيد',
        };
        let { error: updateError } = await supabase.from('orders').update(updatePayload).eq('id', stripeOrderId);
        if (updateError && updateError.message && updateError.message.includes('payment_status')) {
          delete updatePayload.payment_status;
          delete updatePayload.payment_id;
          await supabase.from('orders').update(updatePayload).eq('id', stripeOrderId);
        }

        // Send confirmation email
        try {
          await fetch(`${SITE_URL}/api/email/order-confirmation`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId: stripeOrderId, paymentId }),
          });
        } catch {}

        // Notify admin
        try {
          await supabase.from('admin_notifications').insert({
            type: 'PAYMENT_SUCCESS',
            title: '💳 دفعة ناجحة عبر Stripe',
            message: `تم استلام دفعة بقيمة ${(session.amount_total! / 100).toFixed(2)} ر.س للطلب #${stripeOrderId.slice(0, 8)}`,
          });
        } catch {}

        // Redirect to checkout success (the existing checkout page handles success via orderId)
        return NextResponse.redirect(`${SITE_URL}/checkout?paid=true&order_id=${stripeOrderId}`);
      } else {
        // ❌ Payment not completed
        let failedPayload: any = { payment_status: 'failed' };
        let { error: fError } = await supabase.from('orders').update(failedPayload).eq('id', stripeOrderId);
        if (fError && fError.message && fError.message.includes('payment_status')) {
          delete failedPayload.payment_status;
        }

        return NextResponse.redirect(`${SITE_URL}/checkout?error=payment_failed&order_id=${stripeOrderId}`);
      }
    }

    // Fallback: No session ID, try orderId-based redirect
    if (orderId) {
      return NextResponse.redirect(`${SITE_URL}/checkout?error=payment_unknown&order_id=${orderId}`);
    }

    return NextResponse.redirect(`${SITE_URL}/checkout?error=callback_error`);
  } catch (error: any) {
    console.error('[Stripe Callback Error]', error);
    return NextResponse.redirect(`${SITE_URL}/checkout?error=callback_error`);
  }
}
