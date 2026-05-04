import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { orderConfirmationEmail, OrderEmailData } from '@/lib/emailTemplates';
import { sendEmail } from '@/lib/emailSender';

export const dynamic = 'force-dynamic';

/**
 * Send order confirmation email
 * Supports: Brevo API (free: 300 emails/day, no custom domain needed)
 * 
 * SETUP:
 * 1. Sign up at https://brevo.com (free tier)
 * 2. Add BREVO_API_KEY to Vercel environment variables
 * 3. Add SENDER_EMAIL (your verified email)
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

    // ─── SEND via Brevo ───
    const result = await sendEmail({
      to: customerEmail,
      subject: emailContent.subject,
      html: emailContent.html,
    });

    if (result.sent) {
      // Log success
      try {
        await supabase.from('admin_notifications').insert({
          type: 'EMAIL_SENT',
          title: '📧 إيميل تأكيد',
          message: `تم إرسال إيميل تأكيد الطلب #${orderId.slice(0, 8)} إلى ${customerEmail}`,
        });
      } catch {}

      return NextResponse.json({ sent: true, messageId: result.messageId });
    } else {
      console.error('[Email Error]', result.error);
      
      // Log failure
      try {
        await supabase.from('admin_notifications').insert({
          type: 'EMAIL_QUEUED',
          title: '📧 إيميل معلّق',
          message: `تأكيد الطلب #${orderId.slice(0, 8)} لم يُرسل — ${result.error}. العميل: ${customerEmail}`,
        });
      } catch {}

      return NextResponse.json({ sent: false, error: result.error }, { status: 500 });
    }

  } catch (error: any) {
    console.error('[Email Error]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
