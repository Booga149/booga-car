import { NextRequest, NextResponse } from 'next/server';
import { MoyasarClient, sarToHalalas, mapPaymentSource } from '@/lib/moyasar';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://booga-car.vercel.app';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, amount, paymentMethod, customerName, customerPhone } = body;

    if (!orderId || !amount || !paymentMethod) {
      return NextResponse.json({ error: 'بيانات الدفع ناقصة' }, { status: 400 });
    }

    const sourceType = mapPaymentSource(paymentMethod);

    // ─── COD: No payment processing needed ───
    if (sourceType === 'cod') {
      const supabase = getSupabaseAdmin();
      await supabase.from('orders').update({
        payment_method: 'الدفع عند الاستلام',
        payment_status: 'pending',
      }).eq('id', orderId);

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

    // ─── Tabby/Tamara: Redirect-based (placeholder for future integration) ───
    if (sourceType === 'tabby' || sourceType === 'tamara') {
      return NextResponse.json({
        success: true,
        method: sourceType,
        message: `سيتم تحويلك لإتمام الدفع عبر ${sourceType === 'tabby' ? 'تابي' : 'تمارا'}`,
        redirectUrl: null, // Will be set when Tabby/Tamara SDK integrated
        note: 'هذه الخدمة قيد التفعيل — يرجى اختيار طريقة دفع أخرى حالياً',
      });
    }

    // ─── Moyasar: Credit Card, Mada, STC Pay, Apple Pay ───
    const moyasar = new MoyasarClient();
    
    if (!moyasar.isConfigured()) {
      // Fallback: Save order as pending payment
      const supabase = getSupabaseAdmin();
      await supabase.from('orders').update({
        payment_method: paymentMethod,
        payment_status: 'pending_configuration',
      }).eq('id', orderId);

      // Still send confirmation email
      try {
        await fetch(`${SITE_URL}/api/email/order-confirmation`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId }),
        });
      } catch {}

      return NextResponse.json({
        success: true,
        method: sourceType,
        message: 'تم تسجيل الطلب — سيتم التواصل معك لإتمام الدفع',
        note: 'بوابة الدفع قيد الإعداد',
      });
    }

    // Create Moyasar payment
    const payment = await moyasar.createPayment({
      amount: sarToHalalas(amount),
      description: `طلب بوجا كار #${orderId.slice(0, 8)}`,
      callbackUrl: `${SITE_URL}/api/payment/callback?order_id=${orderId}`,
      source: {
        type: sourceType as any,
        ...(sourceType === 'stcpay' && customerPhone ? { mobile: customerPhone } : {}),
        ...(body.cardData || {}),
      },
      metadata: {
        order_id: orderId,
        customer_name: customerName || '',
        customer_phone: customerPhone || '',
      },
    });

    // Save payment reference
    const supabase = getSupabaseAdmin();
    await supabase.from('orders').update({
      payment_method: paymentMethod,
      payment_status: payment.status,
      payment_id: payment.id,
    }).eq('id', orderId);

    return NextResponse.json({
      success: true,
      method: sourceType,
      paymentId: payment.id,
      status: payment.status,
      redirectUrl: payment.source?.transaction_url || null,
    });
  } catch (error: any) {
    console.error('[Payment Error]', error);
    return NextResponse.json({
      error: error.message || 'فشل في معالجة الدفع',
    }, { status: 500 });
  }
}
