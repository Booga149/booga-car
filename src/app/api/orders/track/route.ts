import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { orderId } = await req.json();

    if (!orderId || typeof orderId !== 'string') {
      return NextResponse.json({ error: 'يرجى إدخال رقم الطلب' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // 1. Fetch Order securely via Service Role
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId.trim())
      .maybeSingle();

    if (orderError) {
      console.error('Track order DB error:', orderError);
      return NextResponse.json({ error: 'حدث خطأ في قاعدة البيانات' }, { status: 500 });
    }

    if (!order) {
      return NextResponse.json({ error: 'not_found' }, { status: 404 });
    }

    // 2. Fetch Order Items
    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', order.id);

    return NextResponse.json({
      success: true,
      order,
      items: itemsError ? [] : (items || [])
    });

  } catch (err: any) {
    console.error('Track Order API Error:', err);
    return NextResponse.json({ error: 'internal_error' }, { status: 500 });
  }
}
