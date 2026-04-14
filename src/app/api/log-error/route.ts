import { NextResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { errorName, errorMessage, url, userId } = body;

    // We use admin_notifications table to log errors so the dashboard can pick them up dynamically
    const { error } = await supabase.from('admin_notifications').insert([{
      type: 'SYSTEM_ERROR',
      title: `⚠️ خطأ تقني في النظام: ${errorName}`,
      message: `المسار: ${url} | التفاصيل: ${errorMessage} | المستخدم: ${userId || 'زائر'}`,
      is_read: false
    }]);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
