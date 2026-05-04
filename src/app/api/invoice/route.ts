import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get('id');

  if (!orderId) {
    return NextResponse.json({ error: 'معرف الطلب مطلوب' }, { status: 400 });
  }

  try {
    const supabase = getSupabaseAdmin();

    const { data: order, error } = await supabase
      .from('orders')
      .select('*, order_items(*, product:products(name, sku))')
      .eq('id', orderId)
      .single();

    if (error || !order) {
      return NextResponse.json({ error: 'الطلب غير موجود' }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (err: any) {
    console.error('[Invoice API Error]', err);
    return NextResponse.json({ error: 'حدث خطأ أثناء تحميل الفاتورة' }, { status: 500 });
  }
}
