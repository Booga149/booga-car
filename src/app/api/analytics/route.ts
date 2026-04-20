import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { session_id, event_type, payment_method, order_total, error_message, order_id, metadata } = body;

    if (!session_id || !event_type) {
      return NextResponse.json({ error: 'Missing required tracking fields' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    const { error } = await supabase.from('checkout_metrics').insert({
      session_id,
      event_type,
      payment_method: payment_method || null,
      order_total: order_total || null,
      error_message: error_message || null,
      order_id: order_id || null,
      metadata: metadata || {}
    });

    if (error) {
      console.error('[Analytics API] Failed to log event:', error);
      // We don't fail the request so it does not block frontend execution
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Analytics API Error]', error);
    return NextResponse.json({ error: 'Failed to process tracking event' }, { status: 500 });
  }
}
