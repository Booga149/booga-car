import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { welcomeEmail } from '@/lib/emailTemplates';
import { sendEmail } from '@/lib/emailSender';

// This endpoint allows signup with auto-confirmation
// Uses the service role key to bypass email confirmation
export async function POST(request: Request) {
  try {
    const { email, password, full_name } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'البريد وكلمة المرور مطلوبان' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!serviceRoleKey) {
      return NextResponse.json(
        { error: 'Service role key not configured' }, 
        { status: 500 }
      );
    }

    // Use admin client with service role key
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // Create user with auto-confirm
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: full_name || email.split('@')[0] },
    });

    if (error) {
      // Handle "already registered" error
      if (error.message.includes('already') || error.message.includes('exists')) {
        return NextResponse.json(
          { error: 'هذا البريد مسجل مسبقاً. جرب تسجيل الدخول' }, 
          { status: 409 }
        );
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // ✅ Send welcome email directly here (server-side, guaranteed correct email)
    const customerName = full_name || email.split('@')[0] || 'عميلنا العزيز';
    try {
      const emailContent = welcomeEmail({ customerName, customerEmail: email });
      const emailResult = await sendEmail({
        to: email, // The actual new user's email — 100% correct
        subject: emailContent.subject,
        html: emailContent.html,
      });
      console.log(`[Signup] Welcome email to ${email}:`, emailResult.sent ? '✅ Sent' : `❌ ${emailResult.error}`);

      // Notify admin
      await supabaseAdmin.from('admin_notifications').insert({
        type: 'NEW_USER',
        title: '👤 مستخدم جديد',
        message: emailResult.sent
          ? `تسجيل جديد: ${customerName} (${email}) — تم إرسال إيميل الترحيب ✅`
          : `تسجيل جديد: ${customerName} (${email}) — فشل إرسال الترحيب: ${emailResult.error}`,
      });
    } catch (emailErr) {
      console.error('[Signup] Welcome email error:', emailErr);
    }

    return NextResponse.json({ 
      success: true, 
      message: 'تم إنشاء الحساب بنجاح! سجل دخول الآن',
      userId: data.user?.id 
    });

  } catch (err: any) {
    console.error('Signup error:', err);
    return NextResponse.json({ error: 'خطأ في إنشاء الحساب' }, { status: 500 });
  }
}
