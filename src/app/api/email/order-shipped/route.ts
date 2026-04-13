import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { orderShippedEmail } from '@/lib/emailTemplates';

export const dynamic = 'force-dynamic';

/**
 * Send order shipped notification email
 * Called when admin updates order status to shipped
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, trackingNumber, carrier } = body;

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID required' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // Fetch order
    const { data: order } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Fetch items
    const { data: items } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId);

    // Get customer details
    let customerEmail = '';
    let customerName = 'عميلنا العزيز';

    if (order.user_id) {
      const { data: authUser } = await supabase.auth.admin.getUserById(order.user_id);
      customerEmail = authUser?.user?.email || '';
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', order.user_id)
        .single();
      customerName = profile?.full_name || customerName;
    }

    if (!customerEmail) {
      return NextResponse.json({ sent: false, reason: 'No email' });
    }

    const emailContent = orderShippedEmail({
      orderId,
      customerName,
      customerEmail,
      customerPhone: '',
      items: (items || []).map((i: any) => ({
        name: i.product_name,
        quantity: i.quantity,
        price: Number(i.price),
      })),
      subtotal: Number(order.total),
      shipping: 0,
      vat: 0,
      total: Number(order.total),
      paymentMethod: order.payment_method || '',
      shippingAddress: order.shipping_address || '',
      trackingNumber: trackingNumber || '',
      carrier: carrier || '',
    });

    // Send via Resend
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

      if (res.ok) {
        return NextResponse.json({ sent: true });
      }
    }

    return NextResponse.json({ sent: false, reason: 'No RESEND_API_KEY' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
