import { NextRequest, NextResponse } from 'next/server';
import { isStripeConfigured, createCheckoutSession, mapPaymentMethod } from '@/lib/stripe';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://booga-car.vercel.app';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, amount, paymentMethod, customerName, customerPhone, items } = body;

    if (!orderId || !amount || !paymentMethod) {
      return NextResponse.json({ error: 'بيانات الدفع ناقصة' }, { status: 400 });
    }

    const methodType = mapPaymentMethod(paymentMethod);

    // ─── COD: No payment processing needed ───
    if (methodType === 'cod') {
      const supabase = getSupabaseAdmin();
      let cPay: any = {
        payment_method: 'الدفع عند الاستلام',
        payment_status: 'pending',
      };
      let { error: cErr } = await supabase.from('orders').update(cPay).eq('id', orderId);
      if (cErr && cErr.message && cErr.message.includes('payment_status')) {
        delete cPay.payment_status;
        await supabase.from('orders').update(cPay).eq('id', orderId);
      }

      // Send confirmation email
      try {
        await fetch(`${SITE_URL}/api/email/order-confirmation`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId }),
        });
      } catch {}

      return NextResponse.json({ 
        success: true, 
        method: 'cod',
        message: 'تم تأكيد الطلب — الدفع عند الاستلام',
      });
    }

    // ─── Tabby/Tamara: Route through Stripe until native integration ───
    // (Will work as regular card payment for now)

    // ─── Stripe: Credit Card, Mada, Apple Pay ───
    if (!isStripeConfigured()) {
      // Stripe NOT configured = Cannot process card payment
      return NextResponse.json({
        error: 'بوابة الدفع الإلكتروني غير متاحة حالياً — يرجى اختيار الدفع عند الاستلام أو المحاولة لاحقاً',
        note: 'STRIPE_SECRET_KEY not configured',
      }, { status: 503 });
    }

    // ─── Create Stripe Checkout Session ───
    // Prepare line items from cart
    const lineItems = items?.length > 0 
      ? items.map((item: any) => ({
          name: item.name || `منتج #${item.id?.slice(0, 6) || ''}`,
          quantity: item.quantity || 1,
          price: item.price || 0,
        }))
      : [{ name: `طلب Booga Car #${orderId.slice(0, 8)}`, quantity: 1, price: amount }];

    const session = await createCheckoutSession({
      orderId,
      amount,
      customerName: customerName || 'عميل',
      paymentMethod,
      lineItems,
      successUrl: `${SITE_URL}/api/payment/callback`,
      cancelUrl: `${SITE_URL}/checkout`,
    });

    // Save Stripe session ID to order
    const supabase = getSupabaseAdmin();
    let sPay: any = {
      payment_method: paymentMethod,
      payment_status: 'initiated',
      payment_id: session.sessionId,
    };
    let { error: sErr } = await supabase.from('orders').update(sPay).eq('id', orderId);
    if (sErr && sErr.message && sErr.message.includes('payment_status')) {
      delete sPay.payment_status;
      delete sPay.payment_id;
      await supabase.from('orders').update(sPay).eq('id', orderId);
    }

    return NextResponse.json({
      success: true,
      method: methodType,
      sessionId: session.sessionId,
      redirectUrl: session.url,
    });
  } catch (error: any) {
    console.error('[Payment Error]', error);
    return NextResponse.json({
      error: error.message || 'فشل في معالجة الدفع',
    }, { status: 500 });
  }
}
