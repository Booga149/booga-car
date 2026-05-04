#!/usr/bin/env node
/**
 * 🚀 Booga Car — Setup External Services
 * ========================================
 * سكريبت إعداد الخدمات الخارجية
 * 
 * الاستخدام: node scripts/setup-services.mjs
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { createInterface } from 'readline';

const rl = createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise(resolve => rl.question(q, resolve));

const ENV_FILE = '.env.local';
const SITE_URL = 'https://booga-car.vercel.app';

console.log(`
╔══════════════════════════════════════════════════╗
║  🚗  Booga Car — إعداد الخدمات الخارجية         ║
╚══════════════════════════════════════════════════╝
`);

// Read existing .env.local
let envContent = '';
if (existsSync(ENV_FILE)) {
  envContent = readFileSync(ENV_FILE, 'utf-8');
}

function setEnvVar(content, key, value) {
  // Check if key exists (commented or not)
  const commentedRegex = new RegExp(`^#\\s*${key}=.*$`, 'm');
  const activeRegex = new RegExp(`^${key}=.*$`, 'm');
  
  if (activeRegex.test(content)) {
    return content.replace(activeRegex, `${key}="${value}"`);
  } else if (commentedRegex.test(content)) {
    return content.replace(commentedRegex, `${key}="${value}"`);
  } else {
    return content + `\n${key}="${value}"`;
  }
}

async function main() {
  let updated = envContent;
  let changes = [];

  // ═══════════════════════════════════════
  // 1. RESEND (Email)
  // ═══════════════════════════════════════
  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📧  الخطوة 1: إعداد الإيميلات (Resend)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. افتح: https://resend.com/signup
2. سجّل بإيميلك
3. من Dashboard → API Keys → أنشئ مفتاح جديد
4. انسخ الـ API Key (يبدأ بـ re_)
`);

  const resendKey = await ask('📋 الصق RESEND_API_KEY هنا (أو اضغط Enter لتخطي): ');
  if (resendKey.trim()) {
    updated = setEnvVar(updated, 'RESEND_API_KEY', resendKey.trim());
    changes.push('✅ RESEND_API_KEY');
    
    const senderEmail = await ask('📧 إيميل المُرسل (مثال: orders@booga-car.com) أو Enter للافتراضي: ');
    if (senderEmail.trim()) {
      updated = setEnvVar(updated, 'SENDER_EMAIL', senderEmail.trim());
      changes.push('✅ SENDER_EMAIL');
    }
  } else {
    console.log('   ⏩ تم تخطي Resend');
  }

  // ═══════════════════════════════════════
  // 2. STRIPE WEBHOOK
  // ═══════════════════════════════════════
  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔗  الخطوة 2: Stripe Webhook
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. افتح: https://dashboard.stripe.com/webhooks
2. اضغط "Add endpoint"
3. Endpoint URL: ${SITE_URL}/api/payment/webhook
4. اختر الأحداث:
   ✓ checkout.session.completed
   ✓ payment_intent.succeeded
   ✓ payment_intent.payment_failed
   ✓ charge.refunded
5. اضغط "Add endpoint" ثم انسخ "Signing secret"
`);

  const webhookSecret = await ask('📋 الصق STRIPE_WEBHOOK_SECRET هنا (أو Enter لتخطي): ');
  if (webhookSecret.trim()) {
    updated = setEnvVar(updated, 'STRIPE_WEBHOOK_SECRET', webhookSecret.trim());
    changes.push('✅ STRIPE_WEBHOOK_SECRET');
  } else {
    console.log('   ⏩ تم تخطي Stripe Webhook');
  }

  // ═══════════════════════════════════════
  // 3. GOOGLE ANALYTICS
  // ═══════════════════════════════════════
  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊  الخطوة 3: Google Analytics 4
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. افتح: https://analytics.google.com
2. Admin → Create Property
3. اسم العقار: Booga Car
4. المنطقة: Saudi Arabia
5. Create Web Stream → URL: ${SITE_URL}
6. انسخ Measurement ID (يبدأ بـ G-)
`);

  const gaId = await ask('📋 الصق NEXT_PUBLIC_GA_ID هنا (مثال: G-XXXXXXXXXX أو Enter لتخطي): ');
  if (gaId.trim()) {
    updated = setEnvVar(updated, 'NEXT_PUBLIC_GA_ID', gaId.trim());
    changes.push('✅ NEXT_PUBLIC_GA_ID');
  } else {
    console.log('   ⏩ تم تخطي Google Analytics');
  }

  // ═══════════════════════════════════════
  // 4. SUPABASE SERVICE ROLE KEY
  // ═══════════════════════════════════════
  const currentServiceKey = envContent.match(/SUPABASE_SERVICE_ROLE_KEY="(.*)"/)?.[1];
  if (!currentServiceKey) {
    console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔑  الخطوة 4: Supabase Service Role Key
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️  SUPABASE_SERVICE_ROLE_KEY فاضي! بدونه الإيميلات والـ Webhook مش هيشتغلوا.

1. افتح: https://supabase.com/dashboard → مشروعك
2. Settings → API → Service Role Key (secret)
3. انسخه هنا
`);

    const serviceKey = await ask('📋 الصق SUPABASE_SERVICE_ROLE_KEY هنا (أو Enter لتخطي): ');
    if (serviceKey.trim()) {
      updated = setEnvVar(updated, 'SUPABASE_SERVICE_ROLE_KEY', serviceKey.trim());
      changes.push('✅ SUPABASE_SERVICE_ROLE_KEY');
    }
  }

  // ═══════════════════════════════════════
  // SAVE
  // ═══════════════════════════════════════
  if (changes.length > 0) {
    writeFileSync(ENV_FILE, updated, 'utf-8');
    console.log(`
╔══════════════════════════════════════════════════╗
║  🎉  تم حفظ التغييرات في .env.local!            ║
╠══════════════════════════════════════════════════╣
${changes.map(c => `║  ${c.padEnd(47)}║`).join('\n')}
╚══════════════════════════════════════════════════╝

📌 الخطوة التالية:
   1. npm run dev     — لتشغيل المشروع محلياً
   2. أضف نفس المتغيرات في Vercel Dashboard:
      https://vercel.com → مشروعك → Settings → Environment Variables
`);
  } else {
    console.log(`
╔══════════════════════════════════════════════════╗
║  ℹ️  لم يتم إجراء أي تغييرات                    ║
║  يمكنك تشغيل السكريبت مرة أخرى في أي وقت       ║
╚══════════════════════════════════════════════════╝
`);
  }

  rl.close();
}

main().catch(err => {
  console.error('Error:', err);
  rl.close();
  process.exit(1);
});
