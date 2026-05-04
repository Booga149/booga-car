import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { welcomeEmail } from '@/lib/emailTemplates';
import { sendEmail } from '@/lib/emailSender';

export const dynamic = 'force-dynamic';

/**
 * Send welcome email to new users
 * Called after successful registration
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, email, name } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    const customerName = name || email.split('@')[0] || 'عميلنا العزيز';
    const emailContent = welcomeEmail({ customerName, customerEmail: email });

    // Send via Brevo
    const result = await sendEmail({
      to: email,
      subject: emailContent.subject,
      html: emailContent.html,
    });

    // Notify admin about new user
    try {
      const supabase = getSupabaseAdmin();
      await supabase.from('admin_notifications').insert({
        type: 'NEW_USER',
        title: '👤 مستخدم جديد',
        message: result.sent
          ? `تم تسجيل مستخدم جديد: ${customerName} (${email}) — تم إرسال إيميل الترحيب ✅`
          : `تسجيل جديد: ${customerName} (${email}) — إيميل الترحيب لم يُرسل (${result.error})`,
      });
    } catch {}

    if (result.sent) {
      return NextResponse.json({ sent: true, messageId: result.messageId });
    }

    return NextResponse.json({
      sent: false,
      reason: result.error || 'Email not sent',
    });
  } catch (error: any) {
    console.error('[Welcome Email Error]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
