import { NextRequest, NextResponse } from 'next/server';
import { MoyasarClient } from '@/lib/moyasar';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://booga-car.vercel.app';

/**
 * Moyasar redirects here after payment completion (3D Secure, etc.)
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get('order_id');
  const paymentId = searchParams.get('id');
  const status = searchParams.get('status');

  if (!orderId) {
    return NextResponse.redirect(`${SITE_URL}/checkout?error=missing_order`);
  }

  const supabase = getSupabaseAdmin();

  try {
    // If Moyasar payment ID exists, verify with API
    if (paymentId) {
      const moyasar = new MoyasarClient();
      if (moyasar.isConfigured()) {
        const payment = await moyasar.getPayment(paymentId);

        if (payment.status === 'paid') {
          // ✅ Payment successful
          let updatePayload: any = {
            payment_status: 'paid',
            payment_id: paymentId,
            status: 'تم التأكيد',
          };
          let { error: updateError } = await supabase.from('orders').update(updatePayload).eq('id', orderId);
          if (updateError && updateError.message && updateError.message.includes('payment_status')) {
            delete updatePayload.payment_status;
            delete updatePayload.payment_id;
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
              type: 'PAYMENT_SUCCESS',
              title: '💳 دفعة ناجحة',
              message: `تم استلام دفعة بقيمة ${(payment.amount / 100).toFixed(2)} ر.س للطلب #${orderId.slice(0, 8)}`,
            });
          } catch {}

          return NextResponse.redirect(`${SITE_URL}/checkout/success?id=${orderId}&paid=true`);
        } else {
          // ❌ Payment failed
          let failedPayload: any = { payment_status: 'failed' };
          let { error: fError } = await supabase.from('orders').update(failedPayload).eq('id', orderId);
          if (fError && fError.message && fError.message.includes('payment_status')) {
            // Remove the key, do nothing basically but it won't crash
            delete failedPayload.payment_status;
          }

          return NextResponse.redirect(`${SITE_URL}/checkout?error=payment_failed&order_id=${orderId}`);
        }
      }
    }

    // Fallback: redirect based on status param
    if (status === 'paid') {
      let fPay: any = {
        payment_status: 'paid',
        status: 'تم التأكيد',
      };
      let { error: fErr } = await supabase.from('orders').update(fPay).eq('id', orderId);
      if (fErr && fErr.message && fErr.message.includes('payment_status')) {
        delete fPay.payment_status;
        await supabase.from('orders').update(fPay).eq('id', orderId);
      }

      return NextResponse.redirect(`${SITE_URL}/checkout/success?id=${orderId}`);
    }

    return NextResponse.redirect(`${SITE_URL}/checkout?error=payment_unknown&order_id=${orderId}`);
  } catch (error: any) {
    console.error('[Payment Callback Error]', error);
    return NextResponse.redirect(`${SITE_URL}/checkout?error=callback_error`);
  }
}
