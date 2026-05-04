import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { otpEmail, welcomeEmail } from '@/lib/emailTemplates';
import { sendEmail } from '@/lib/emailSender';

export const dynamic = 'force-dynamic';

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

function generateOTP(): string {
  return Math.floor(1000 + Math.random() * 9000).toString(); // 4-digit code
}

/**
 * POST — Send OTP code to email
 */
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'بريد إلكتروني غير صالح' }, { status: 400 });
    }

    const supabase = getAdmin();
    const normalizedEmail = email.trim().toLowerCase();

    // Rate limit: max 3 OTPs per email in last 5 minutes
    const { data: recentOtps } = await supabase
      .from('email_otps')
      .select('id')
      .eq('email', normalizedEmail)
      .gte('created_at', new Date(Date.now() - 5 * 60 * 1000).toISOString());

    if (recentOtps && recentOtps.length >= 3) {
      return NextResponse.json(
        { error: 'تم إرسال عدة رموز. انتظر 5 دقائق وحاول مرة أخرى' },
        { status: 429 }
      );
    }

    // Generate OTP
    const code = generateOTP();

    // Store in DB
    await supabase.from('email_otps').insert({
      email: normalizedEmail,
      code,
      expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    });

    // Send email
    const emailContent = otpEmail({ code, email: normalizedEmail });
    const result = await sendEmail({
      to: normalizedEmail,
      subject: emailContent.subject,
      html: emailContent.html,
    });

    if (!result.sent) {
      console.error('[OTP Email] Failed:', result.error);
      return NextResponse.json(
        { error: 'فشل في إرسال الرمز. حاول مرة أخرى' },
        { status: 500 }
      );
    }

    console.log(`[OTP] Sent to ${normalizedEmail}`);
    return NextResponse.json({ sent: true });
  } catch (err: any) {
    console.error('[OTP Send Error]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * PUT — Verify OTP code and sign in/create user
 */
export async function PUT(req: NextRequest) {
  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json({ error: 'البريد والرمز مطلوبان' }, { status: 400 });
    }

    const supabase = getAdmin();
    const normalizedEmail = email.trim().toLowerCase();

    // Find valid OTP
    const { data: otpRecord, error: otpErr } = await supabase
      .from('email_otps')
      .select('*')
      .eq('email', normalizedEmail)
      .eq('code', code.trim())
      .eq('used', false)
      .gte('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (otpErr || !otpRecord) {
      // Increment attempts on the latest OTP for this email
      const { data: latestOtp } = await supabase
        .from('email_otps')
        .select('id, attempts')
        .eq('email', normalizedEmail)
        .eq('used', false)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (latestOtp) {
        await supabase
          .from('email_otps')
          .update({ attempts: (latestOtp.attempts || 0) + 1 })
          .eq('id', latestOtp.id);

        if ((latestOtp.attempts || 0) >= 4) {
          // Mark as used (burned) after too many attempts
          await supabase
            .from('email_otps')
            .update({ used: true })
            .eq('id', latestOtp.id);
          return NextResponse.json(
            { error: 'تم تجاوز عدد المحاولات. اطلب رمز جديد' },
            { status: 429 }
          );
        }
      }

      return NextResponse.json({ error: 'الرمز غير صحيح أو منتهي الصلاحية' }, { status: 400 });
    }

    // Mark OTP as used
    await supabase
      .from('email_otps')
      .update({ used: true })
      .eq('id', otpRecord.id);

    // Check if user exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(
      (u: any) => u.email?.toLowerCase() === normalizedEmail
    );

    let userId: string;
    let isNewUser = false;

    if (existingUser) {
      userId = existingUser.id;
    } else {
      // Create new user (auto-confirmed, random password)
      const randomPass = crypto.randomUUID();
      const { data: newUser, error: createErr } = await supabase.auth.admin.createUser({
        email: normalizedEmail,
        password: randomPass,
        email_confirm: true,
        user_metadata: { full_name: normalizedEmail.split('@')[0] },
      });

      if (createErr || !newUser?.user) {
        console.error('[OTP Verify] Create user error:', createErr);
        return NextResponse.json({ error: 'فشل في إنشاء الحساب' }, { status: 500 });
      }

      userId = newUser.user.id;
      isNewUser = true;

      // Send welcome email for new users
      try {
        const customerName = normalizedEmail.split('@')[0];
        const welcomeContent = welcomeEmail({ customerName, customerEmail: normalizedEmail });
        await sendEmail({
          to: normalizedEmail,
          subject: welcomeContent.subject,
          html: welcomeContent.html,
        });
        console.log(`[OTP] Welcome email sent to ${normalizedEmail}`);
      } catch {}

      // Notify admin
      try {
        await supabase.from('admin_notifications').insert({
          type: 'NEW_USER',
          title: '👤 مستخدم جديد',
          message: `تسجيل جديد عبر OTP: ${normalizedEmail} ✅`,
        });
      } catch {}
    }

    // Generate a magic link for the user to sign in
    const { data: linkData, error: linkErr } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: normalizedEmail,
    });

    if (linkErr || !linkData) {
      console.error('[OTP Verify] Generate link error:', linkErr);
      return NextResponse.json({ error: 'فشل في تسجيل الدخول' }, { status: 500 });
    }

    // Extract the token from the generated link
    const token_hash = linkData.properties?.hashed_token;

    return NextResponse.json({
      verified: true,
      isNewUser,
      userId,
      token_hash,
      email: normalizedEmail,
    });
  } catch (err: any) {
    console.error('[OTP Verify Error]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
