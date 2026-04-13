import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { orderConfirmationEmail, OrderEmailData } from '@/lib/emailTemplates';

export const dynamic = 'force-dynamic';

/**
 * Send order confirmation email
 * Supports: Resend API (recommended for production)
 * 
 * SETUP:
 * 1. Sign up at https://resend.com (free: 100 emails/day)
 * 2. Verify your domain or use onboarding@resend.dev for testing
 * 3. Add RESEND_API_KEY to Vercel environment variables
 * 4. (Optional) Add SENDER_EMAIL (e.g., orders@booga-car.com)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, paymentId } = body;

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID required' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // Fetch order details
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderErr || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Fetch order items
    const { data: items } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId);

    // Fetch user email
    let customerEmail = '';
    let customerName = '';
    let customerPhone = '';

    if (order.user_id) {
      // Get from auth.users
      const { data: authUser } = await supabase.auth.admin.getUserById(order.user_id);
      customerEmail = authUser?.user?.email || '';
      customerPhone = authUser?.user?.phone || '';

      // Get name from profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, phone')
        .eq('id', order.user_id)
        .single();
      
      customerName = profile?.full_name || '';
      if (!customerPhone) customerPhone = profile?.phone || '';
    }

    if (!customerEmail) {
      console.warn('[Email] No customer email found for order', orderId);
      return NextResponse.json({ 
        sent: false, 
        reason: 'No customer email on file',
      });
    }

    // Build email data
    const emailData: OrderEmailData = {
      orderId,
      customerName: customerName || 'عميلنا العزيز',
      customerEmail,
      customerPhone,
      items: (items || []).map((item: any) => ({
        name: item.product_name,
        quantity: item.quantity,
        price: Number(item.price) * item.quantity,
        image: item.product_image,
      })),
      subtotal: Number(order.total) / 1.15, // Reverse VAT
      shipping: 0,
      vat: Number(order.total) - Number(order.total) / 1.15,
      total: Number(order.total),
      paymentMethod: order.payment_method || 'الدفع عند الاستلام',
      paymentStatus: order.payment_status,
      shippingAddress: order.shipping_address || '',
    };

    const emailContent = orderConfirmationEmail(emailData);

    // ─── SEND via Resend ───
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    const SENDER_EMAIL = process.env.SENDER_EMAIL || 'onboarding@resend.dev';

    if (RESEND_API_KEY) {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: `بوجا كار <${SENDER_EMAIL}>`,
          to: [customerEmail],
          subject: emailContent.subject,
          html: emailContent.html,
        }),
      });

      const result = await res.json();

      if (res.ok) {
        // Log success
        try {
          await supabase.from('admin_notifications').insert({
            type: 'EMAIL_SENT',
            title: '📧 إيميل تأكيد',
            message: `تم إرسال إيميل تأكيد الطلب #${orderId.slice(0, 8)} إلى ${customerEmail}`,
          });
        } catch {}

        return NextResponse.json({ sent: true, emailId: result.id });
      } else {
        console.error('[Resend Error]', result);
        return NextResponse.json({ sent: false, error: result.message }, { status: 500 });
      }
    }

    // ─── No email provider configured ───
    // Log that email would have been sent
    try {
      await supabase.from('admin_notifications').insert({
        type: 'EMAIL_QUEUED',
        title: '📧 إيميل معلّق',
        message: `تأكيد الطلب #${orderId.slice(0, 8)} لم يُرسل — مطلوب إعداد RESEND_API_KEY. العميل: ${customerEmail}`,
      });
    } catch {}

    return NextResponse.json({ 
      sent: false, 
      reason: 'Email provider not configured. Add RESEND_API_KEY to environment.',
      wouldSendTo: customerEmail,
      subject: emailContent.subject,
    });

  } catch (error: any) {
    console.error('[Email Error]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
