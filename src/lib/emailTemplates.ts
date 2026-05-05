/**
 * Email Templates System
 * =======================
 * قوالب إيميل احترافية بالعربي لبوجا كار
 * مصممة Mobile-First و RTL
 */

const BRAND_COLOR = '#e11d48';
const BRAND_NAME = 'بوجا كار';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://booga-car.vercel.app';

function baseLayout(content: string, preheader?: string): string {
  return `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  ${preheader ? `<span style="display:none;font-size:1px;color:#fff;max-height:0;overflow:hidden;">${preheader}</span>` : ''}
</head>
<body style="margin:0;padding:0;background-color:#f4f4f7;font-family:'Segoe UI',Tahoma,Arial,sans-serif;direction:rtl;text-align:right;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:#f4f4f7;">
    <tr>
      <td align="center" style="padding:2rem 1rem;">
        <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,${BRAND_COLOR},#be123c);padding:2rem;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:900;letter-spacing:-0.5px;">
                BOOGA <span style="color:#fbbf24;">CAR</span>
              </h1>
              <p style="margin:0.5rem 0 0;color:rgba(255,255,255,0.8);font-size:12px;font-weight:600;">
                قطع غيار أصلية للمحترفين
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:2rem;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8f9fa;padding:1.5rem 2rem;border-top:1px solid #e9ecef;">
              <p style="margin:0 0 0.5rem;color:#6b7280;font-size:12px;text-align:center;">
                ${BRAND_NAME} — قطع غيار أصلية للسيارات في المملكة العربية السعودية
              </p>
              <p style="margin:0;text-align:center;">
                <a href="${SITE_URL}" style="color:${BRAND_COLOR};text-decoration:none;font-size:12px;font-weight:700;">الموقع</a>
                &nbsp;•&nbsp;
                <a href="${SITE_URL}/products" style="color:${BRAND_COLOR};text-decoration:none;font-size:12px;font-weight:700;">المنتجات</a>
                &nbsp;•&nbsp;
                <a href="${SITE_URL}/track-order" style="color:${BRAND_COLOR};text-decoration:none;font-size:12px;font-weight:700;">تتبع الطلب</a>
              </p>
              <p style="margin:0.8rem 0 0;color:#9ca3af;font-size:10px;text-align:center;">
                هذا الإيميل تم إرساله تلقائياً. لا ترد على هذه الرسالة.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export interface OrderEmailData {
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    image?: string;
  }>;
  subtotal: number;
  shipping: number;
  vat: number;
  total: number;
  paymentMethod: string;
  paymentStatus?: string;
  shippingAddress: string;
  trackingUrl?: string;
}

/**
 * 🎉 Order Confirmation Email
 */
export function orderConfirmationEmail(data: OrderEmailData): { subject: string; html: string } {
  const itemsHtml = data.items.map(item => `
    <tr>
      <td style="padding:0.8rem 0;border-bottom:1px solid #f0f0f0;">
        <div style="display:flex;align-items:center;gap:0.8rem;">
          ${item.image ? `<img src="${item.image}" alt="" width="50" height="50" style="border-radius:8px;object-fit:cover;" />` : ''}
          <div>
            <p style="margin:0;font-weight:700;color:#1f2937;font-size:14px;">${item.name}</p>
            <p style="margin:0.2rem 0 0;color:#6b7280;font-size:12px;">×${item.quantity}</p>
          </div>
        </div>
      </td>
      <td style="padding:0.8rem 0;border-bottom:1px solid #f0f0f0;text-align:left;font-weight:800;color:#1f2937;font-size:14px;">
        ${item.price.toLocaleString()} ر.س
      </td>
    </tr>
  `).join('');

  const content = `
    <div style="text-align:center;margin-bottom:2rem;">
      <div style="width:64px;height:64px;background:linear-gradient(135deg,#10b981,#059669);border-radius:50%;display:inline-flex;align-items:center;justify-content:center;margin-bottom:1rem;">
        <span style="font-size:28px;">✓</span>
      </div>
      <h2 style="margin:0;color:#1f2937;font-size:24px;font-weight:900;">
        تم تأكيد طلبك بنجاح! 🎉
      </h2>
      <p style="margin:0.5rem 0 0;color:#6b7280;font-size:14px;">
        مرحباً ${data.customerName}، شكراً لثقتك في بوجا كار
      </p>
    </div>

    <!-- Order Number -->
    <div style="background:#f8f9fa;border:1px dashed #d1d5db;border-radius:12px;padding:1rem 1.5rem;margin-bottom:1.5rem;text-align:center;">
      <p style="margin:0;color:#6b7280;font-size:12px;font-weight:600;">رقم الطلب</p>
      <p style="margin:0.3rem 0 0;color:#1f2937;font-size:18px;font-weight:900;font-family:monospace;letter-spacing:1px;">
        ${data.orderId.slice(0, 8).toUpperCase()}
      </p>
    </div>

    <!-- Items Table -->
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:1.5rem;">
      <tr>
        <td style="padding:0.5rem 0;border-bottom:2px solid #e5e7eb;font-weight:800;color:#6b7280;font-size:12px;">المنتج</td>
        <td style="padding:0.5rem 0;border-bottom:2px solid #e5e7eb;font-weight:800;color:#6b7280;font-size:12px;text-align:left;">السعر</td>
      </tr>
      ${itemsHtml}
    </table>

    <!-- Totals -->
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:1.5rem;">
      <tr>
        <td style="padding:0.4rem 0;color:#6b7280;font-size:14px;">المجموع الفرعي</td>
        <td style="padding:0.4rem 0;text-align:left;color:#1f2937;font-weight:700;font-size:14px;">${data.subtotal.toLocaleString()} ر.س</td>
      </tr>
      <tr>
        <td style="padding:0.4rem 0;color:#6b7280;font-size:14px;">الشحن</td>
        <td style="padding:0.4rem 0;text-align:left;color:${data.shipping === 0 ? '#10b981' : '#1f2937'};font-weight:700;font-size:14px;">${data.shipping === 0 ? 'مجاني' : data.shipping + ' ر.س'}</td>
      </tr>
      <tr>
        <td style="padding:0.4rem 0;color:#6b7280;font-size:14px;">ضريبة القيمة المضافة (15%)</td>
        <td style="padding:0.4rem 0;text-align:left;color:#1f2937;font-weight:700;font-size:14px;">${data.vat.toLocaleString()} ر.س</td>
      </tr>
      <tr>
        <td style="padding:0.8rem 0;border-top:2px solid #e5e7eb;color:#1f2937;font-size:18px;font-weight:900;">الإجمالي</td>
        <td style="padding:0.8rem 0;border-top:2px solid #e5e7eb;text-align:left;color:${BRAND_COLOR};font-size:18px;font-weight:900;">${data.total.toLocaleString()} ر.س</td>
      </tr>
    </table>

    <!-- Payment & Shipping Info -->
    <div style="display:flex;gap:1rem;margin-bottom:1.5rem;">
      <div style="flex:1;background:#f8f9fa;border-radius:12px;padding:1rem;">
        <p style="margin:0;font-size:11px;color:#6b7280;font-weight:700;">💳 طريقة الدفع</p>
        <p style="margin:0.3rem 0 0;font-size:14px;color:#1f2937;font-weight:800;">${data.paymentMethod}</p>
      </div>
      <div style="flex:1;background:#f8f9fa;border-radius:12px;padding:1rem;">
        <p style="margin:0;font-size:11px;color:#6b7280;font-weight:700;">📍 عنوان التوصيل</p>
        <p style="margin:0.3rem 0 0;font-size:14px;color:#1f2937;font-weight:800;">${data.shippingAddress}</p>
      </div>
    </div>

    <!-- CTA Button -->
    <div style="text-align:center;margin-top:1.5rem;">
      <a href="${SITE_URL}/track-order?id=${data.orderId}" style="display:inline-block;padding:1rem 2.5rem;background:${BRAND_COLOR};color:#ffffff;text-decoration:none;border-radius:12px;font-weight:900;font-size:16px;box-shadow:0 8px 20px rgba(225,29,72,0.3);">
        📦 تتبع طلبي الآن
      </a>
    </div>
  `;

  return {
    subject: `✅ تأكيد الطلب #${data.orderId.slice(0, 8).toUpperCase()} — بوجا كار`,
    html: baseLayout(content, `طلبك #${data.orderId.slice(0, 8)} تم بنجاح! شكراً ${data.customerName}`),
  };
}

/**
 * 🚚 Order Shipped Email
 */
export function orderShippedEmail(data: OrderEmailData & { trackingNumber?: string; carrier?: string }): { subject: string; html: string } {
  const content = `
    <div style="text-align:center;margin-bottom:2rem;">
      <div style="font-size:48px;margin-bottom:1rem;">🚚</div>
      <h2 style="margin:0;color:#1f2937;font-size:24px;font-weight:900;">
        تم شحن طلبك!
      </h2>
      <p style="margin:0.5rem 0 0;color:#6b7280;font-size:14px;">
        مرحباً ${data.customerName}، طلبك في الطريق إليك
      </p>
    </div>

    <div style="background:linear-gradient(135deg,#eff6ff,#dbeafe);border:1px solid #93c5fd;border-radius:12px;padding:1.5rem;margin-bottom:1.5rem;text-align:center;">
      ${data.trackingNumber ? `
        <p style="margin:0;color:#1e40af;font-size:12px;font-weight:700;">رقم التتبع</p>
        <p style="margin:0.3rem 0 0;color:#1e3a8a;font-size:20px;font-weight:900;font-family:monospace;">${data.trackingNumber}</p>
      ` : ''}
      ${data.carrier ? `
        <p style="margin:0.5rem 0 0;color:#1e40af;font-size:14px;font-weight:700;">شركة الشحن: ${data.carrier}</p>
      ` : ''}
    </div>

    <div style="background:#f8f9fa;border-radius:12px;padding:1.5rem;margin-bottom:1.5rem;">
      <p style="margin:0;color:#6b7280;font-size:12px;font-weight:700;">📍 التوصيل إلى</p>
      <p style="margin:0.3rem 0 0;color:#1f2937;font-size:16px;font-weight:800;">${data.shippingAddress}</p>
      <p style="margin:0.5rem 0 0;color:#6b7280;font-size:13px;">الوصول المتوقع: 2-5 أيام عمل</p>
    </div>

    <div style="text-align:center;margin-top:1.5rem;">
      <a href="${SITE_URL}/track-order?id=${data.orderId}" style="display:inline-block;padding:1rem 2.5rem;background:#2563eb;color:#ffffff;text-decoration:none;border-radius:12px;font-weight:900;font-size:16px;">
        تتبع الشحنة
      </a>
    </div>
  `;

  return {
    subject: `🚚 تم شحن طلبك #${data.orderId.slice(0, 8).toUpperCase()} — بوجا كار`,
    html: baseLayout(content, `طلبك في الطريق! رقم التتبع: ${data.trackingNumber || 'متاح قريباً'}`),
  };
}

/**
 * 💸 Payment Received Email
 */
export function paymentReceivedEmail(data: { customerName: string; amount: number; orderId: string; paymentMethod: string }): { subject: string; html: string } {
  const content = `
    <div style="text-align:center;margin-bottom:2rem;">
      <div style="font-size:48px;margin-bottom:1rem;">💳</div>
      <h2 style="margin:0;color:#1f2937;font-size:24px;font-weight:900;">
        تم استلام الدفعة بنجاح
      </h2>
    </div>

    <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:12px;padding:1.5rem;text-align:center;margin-bottom:1.5rem;">
      <p style="margin:0;color:#166534;font-size:32px;font-weight:900;">${data.amount.toLocaleString()} ر.س</p>
      <p style="margin:0.5rem 0 0;color:#15803d;font-size:14px;font-weight:700;">
        ✅ تم الدفع بنجاح عبر ${data.paymentMethod}
      </p>
    </div>

    <p style="color:#6b7280;font-size:14px;text-align:center;">
      مرحباً ${data.customerName}، تم تأكيد دفعتك وطلبك قيد التجهيز الآن.
    </p>
  `;

  return {
    subject: `💳 تأكيد الدفع — ${data.amount.toLocaleString()} ر.س — بوجا كار`,
    html: baseLayout(content, `تم استلام دفعتك بقيمة ${data.amount} ر.س`),
  };
}

/**
 * 🎉 Welcome Email — New User Registration
 */
export function welcomeEmail(data: { customerName: string; customerEmail: string }): { subject: string; html: string } {
  const content = `
    <div style="text-align:center;margin-bottom:2rem;">
      <div style="font-size:56px;margin-bottom:1rem;">🎉</div>
      <h2 style="margin:0;color:#1f2937;font-size:26px;font-weight:900;">
        أهلاً بك في بوجا كار!
      </h2>
      <p style="margin:0.8rem 0 0;color:#6b7280;font-size:15px;line-height:1.8;">
        مرحباً <strong style="color:#1f2937;">${data.customerName}</strong>، نور حسابك عندنا! 🚗
      </p>
    </div>

    <!-- Features Grid -->
    <div style="margin-bottom:2rem;">
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td style="padding:0.8rem;width:50%;vertical-align:top;">
            <div style="background:#f8f9fa;border-radius:12px;padding:1.2rem;text-align:center;">
              <div style="font-size:28px;margin-bottom:0.5rem;">🔍</div>
              <h3 style="margin:0 0 0.3rem;font-size:14px;color:#1f2937;font-weight:800;">بحث ذكي</h3>
              <p style="margin:0;font-size:12px;color:#6b7280;">ابحث بالسيارة أو رقم القطعة</p>
            </div>
          </td>
          <td style="padding:0.8rem;width:50%;vertical-align:top;">
            <div style="background:#f8f9fa;border-radius:12px;padding:1.2rem;text-align:center;">
              <div style="font-size:28px;margin-bottom:0.5rem;">🚚</div>
              <h3 style="margin:0 0 0.3rem;font-size:14px;color:#1f2937;font-weight:800;">شحن سريع</h3>
              <p style="margin:0;font-size:12px;color:#6b7280;">توصيل لكل مناطق المملكة</p>
            </div>
          </td>
        </tr>
        <tr>
          <td style="padding:0.8rem;width:50%;vertical-align:top;">
            <div style="background:#f8f9fa;border-radius:12px;padding:1.2rem;text-align:center;">
              <div style="font-size:28px;margin-bottom:0.5rem;">✅</div>
              <h3 style="margin:0 0 0.3rem;font-size:14px;color:#1f2937;font-weight:800;">ضمان سنة</h3>
              <p style="margin:0;font-size:12px;color:#6b7280;">على جميع المنتجات الأصلية</p>
            </div>
          </td>
          <td style="padding:0.8rem;width:50%;vertical-align:top;">
            <div style="background:#f8f9fa;border-radius:12px;padding:1.2rem;text-align:center;">
              <div style="font-size:28px;margin-bottom:0.5rem;">💰</div>
              <h3 style="margin:0 0 0.3rem;font-size:14px;color:#1f2937;font-weight:800;">أسعار منافسة</h3>
              <p style="margin:0;font-size:12px;color:#6b7280;">أفضل أسعار في السوق</p>
            </div>
          </td>
        </tr>
      </table>
    </div>

    <!-- Separator -->
    <div style="border-top:1px solid #e5e7eb;margin:1.5rem 0;"></div>

    <!-- Tips -->
    <div style="background:linear-gradient(135deg,#fffbeb,#fef3c7);border:1px solid #fbbf24;border-radius:12px;padding:1.5rem;margin-bottom:1.5rem;">
      <h3 style="margin:0 0 0.8rem;font-size:16px;color:#92400e;font-weight:900;">💡 نصائح للبداية</h3>
      <ul style="margin:0;padding-right:1.2rem;color:#78350f;font-size:13px;line-height:2;">
        <li>أكمل بيانات ملفك الشخصي لتسريع عملية الشراء</li>
        <li>استخدم البحث بالسيارة للعثور على القطع المتوافقة</li>
        <li>أضف منتجاتك المفضلة للمفضلة لتتبع الأسعار</li>
        <li>تابعنا على واتساب لأحدث العروض والخصومات</li>
      </ul>
    </div>

    <!-- CTA Buttons -->
    <div style="text-align:center;margin-top:2rem;">
      <a href="${SITE_URL}/products" style="display:inline-block;padding:1rem 2.5rem;background:${BRAND_COLOR};color:#ffffff;text-decoration:none;border-radius:12px;font-weight:900;font-size:16px;box-shadow:0 8px 20px rgba(225,29,72,0.3);margin-bottom:1rem;">
        🛒 ابدأ التسوق الآن
      </a>
      <br />
      <a href="${SITE_URL}/profile" style="display:inline-block;padding:0.8rem 2rem;background:#f3f4f6;color:#374151;text-decoration:none;border-radius:10px;font-weight:800;font-size:14px;margin-top:0.5rem;">
        أكمل ملفك الشخصي →
      </a>
    </div>
  `;

  return {
    subject: `🎉 أهلاً بك في بوجا كار — حسابك جاهز!`,
    html: baseLayout(content, `مرحباً ${data.customerName}! حسابك في بوجا كار جاهز. ابدأ التسوق الآن!`),
  };
}

/**
 * 🔐 OTP Verification Email
 */
export function otpEmail(data: { code: string; email: string }): { subject: string; html: string } {
  const content = `
    <div style="text-align:center;margin-bottom:2rem;">
      <div style="font-size:48px;margin-bottom:1rem;">🔐</div>
      <h2 style="margin:0;color:#1f2937;font-size:24px;font-weight:900;">
        رمز التحقق الخاص بك
      </h2>
      <p style="margin:0.8rem 0 0;color:#6b7280;font-size:14px;line-height:1.6;">
        أدخل الرمز التالي لتسجيل الدخول إلى حسابك في بوجا كار
      </p>
    </div>

    <!-- OTP Code Display -->
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:1.5rem;">
      <tr>
        <td align="center" style="padding:1.5rem 0;">
          <table role="presentation" cellpadding="0" cellspacing="8" style="margin:0 auto;">
            <tr>
              ${data.code.split('').map(digit => `
                <td style="width:60px;height:72px;background:${BRAND_COLOR};border-radius:12px;text-align:center;vertical-align:middle;">
                  <span style="font-size:36px;font-weight:900;color:#ffffff;font-family:'Courier New',monospace;line-height:72px;">${digit}</span>
                </td>
              `).join('')}
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <div style="background:#fffbeb;border:1px solid #fbbf24;border-radius:12px;padding:1rem 1.5rem;margin-bottom:1.5rem;">
      <p style="margin:0;color:#92400e;font-size:13px;font-weight:700;line-height:1.8;">
        ⏰ هذا الرمز صالح لمدة <strong>5 دقائق فقط</strong>
        <br/>
        🔒 لا تشارك هذا الرمز مع أي شخص
      </p>
    </div>

    <p style="color:#9ca3af;font-size:12px;text-align:center;margin-top:1.5rem;">
      إذا لم تطلب هذا الرمز، تجاهل هذه الرسالة.
    </p>
  `;

  return {
    subject: `🔐 رمز التحقق: ${data.code} — بوجا كار`,
    html: baseLayout(content, `رمز التحقق الخاص بك هو ${data.code}`),
  };
}
