import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { welcomeEmail } from '@/lib/emailTemplates';
import { sendEmail } from '@/lib/emailSender';

export const dynamic = 'force-dynamic';

/**
 * Send welcome email to new users
 * Server-side checks:
 * 1. userId must exist in profiles table
 * 2. User must have been created within last 10 minutes
 * 3. welcome_sent flag must be false (prevents duplicates)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, email, name } = body;

    if (!userId || !email) {
      return NextResponse.json({ error: 'userId and email required' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // 1. Check if user exists and get their real email from auth
    const { data: authUser, error: authErr } = await supabase.auth.admin.getUserById(userId);
    if (authErr || !authUser?.user) {
      return NextResponse.json({ error: 'User not found', sent: false }, { status: 404 });
    }

    const realEmail = authUser.user.email;
    if (!realEmail) {
      return NextResponse.json({ error: 'No email for user', sent: false }, { status: 400 });
    }

    // 2. Check if user was created recently (within last 10 minutes)
    const createdAt = new Date(authUser.user.created_at).getTime();
    const now = Date.now();
    if ((now - createdAt) > 600000) { // 10 minutes
      return NextResponse.json({ sent: false, reason: 'User not new (created more than 10 min ago)' });
    }

    // 3. Check if welcome email was already sent (via profiles table)
    const { data: profile } = await supabase
      .from('profiles')
      .select('welcome_sent')
      .eq('id', userId)
      .single();

    if (profile?.welcome_sent) {
      return NextResponse.json({ sent: false, reason: 'Welcome email already sent' });
    }

    // 4. Send the email to the REAL user email (from auth, not from client)
    const customerName = authUser.user.user_metadata?.full_name || name || realEmail.split('@')[0] || 'عميلنا العزيز';
    const emailContent = welcomeEmail({ customerName, customerEmail: realEmail });

    const result = await sendEmail({
      to: realEmail, // Use the verified email from Supabase Auth
      subject: emailContent.subject,
      html: emailContent.html,
    });

    // 5. Mark welcome_sent = true in profiles (prevent duplicates)
    if (result.sent) {
      await supabase
        .from('profiles')
        .update({ welcome_sent: true })
        .eq('id', userId);
    }

    // 6. Notify admin
    try {
      await supabase.from('admin_notifications').insert({
        type: 'NEW_USER',
        title: '👤 مستخدم جديد',
        message: result.sent
          ? `تسجيل جديد: ${customerName} (${realEmail}) — تم إرسال إيميل الترحيب ✅`
          : `تسجيل جديد: ${customerName} (${realEmail}) — فشل الإرسال: ${result.error}`,
      });
    } catch {}

    return NextResponse.json({
      sent: result.sent,
      to: realEmail,
      messageId: result.messageId,
      ...(result.error ? { error: result.error } : {}),
    });
  } catch (error: any) {
    console.error('[Welcome Email Error]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
