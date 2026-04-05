import React from 'react';
import Navbar from '@/components/Navbar';

import { Lock } from 'lucide-react';

export default function PrivacyPage() {
  const sectionStyle: React.CSSProperties = { marginBottom: '3.5rem' };
  const h2Style: React.CSSProperties = { fontSize: '1.6rem', fontWeight: 900, marginBottom: '1.2rem', color: 'var(--text-primary)', borderBottom: '1px solid var(--border)', paddingBottom: '0.8rem' };
  const pStyle: React.CSSProperties = { color: 'var(--text-secondary)', lineHeight: 2, fontWeight: 500, fontSize: '1.05rem', marginBottom: '1rem' };

  return (
    <main style={{ minHeight: '100vh', background: 'var(--background)' }}>
      <Navbar />
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '10rem 2rem 4rem' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 950, color: 'var(--text-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          سياسة الخصوصية <Lock size={40} color="var(--primary)" />
        </h1>
        <p style={{ ...pStyle, marginBottom: '4rem' }}>
          آخر تحديث: أبريل 2026 — نحن في Booga Car نلتزم بحماية خصوصيتك وبياناتك الشخصية وفقاً لنظام حماية البيانات الشخصية في المملكة العربية السعودية.
        </p>

        <div style={sectionStyle}>
          <h2 style={h2Style}>1. البيانات التي نجمعها</h2>
          <p style={pStyle}><strong>بيانات الحساب:</strong> الاسم، البريد الإلكتروني، رقم الجوال عند التسجيل.</p>
          <p style={pStyle}><strong>بيانات الطلب:</strong> عنوان الشحن، تفاصيل الدفع، سجل الطلبات لإتمام عمليات الشراء.</p>
          <p style={pStyle}><strong>بيانات التصفح:</strong> عنوان IP، نوع المتصفح، الصفحات المزارة — لتحسين تجربة المستخدم وأمان المنصة.</p>
          <p style={pStyle}><strong>بيانات الموقع الجغرافي:</strong> بإذنك فقط — لعرض البائعين والمتاجر القريبة منك.</p>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>2. كيف نستخدم بياناتك</h2>
          <p style={pStyle}>نستخدم بياناتك حصرياً للأغراض التالية:</p>
          <ul style={{ color: 'var(--text-secondary)', lineHeight: 2.2, fontWeight: 500, fontSize: '1.05rem', paddingRight: '1.5rem' }}>
            <li>معالجة وتنفيذ طلبات الشراء والشحن.</li>
            <li>التواصل معك بخصوص طلباتك وحالة الشحن.</li>
            <li>تحسين خدماتنا وتجربة التصفح على المنصة.</li>
            <li>إرسال إشعارات بالعروض والخصومات (بإذنك فقط).</li>
            <li>حماية المنصة من الاحتيال والاستخدام غير المشروع.</li>
          </ul>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>3. مشاركة البيانات مع أطراف ثالثة</h2>
          <p style={pStyle}><strong>لا نبيع بياناتك الشخصية أبداً.</strong> قد نشاركها فقط مع:</p>
          <ul style={{ color: 'var(--text-secondary)', lineHeight: 2.2, fontWeight: 500, fontSize: '1.05rem', paddingRight: '1.5rem' }}>
            <li><strong>شركات الشحن:</strong> لتوصيل طلبك (الاسم، العنوان، الجوال فقط).</li>
            <li><strong>بوابات الدفع:</strong> لمعالجة المدفوعات بشكل آمن ومشفر.</li>
            <li><strong>الجهات الحكومية:</strong> عند وجود طلب رسمي وفقاً للأنظمة المعمول بها.</li>
          </ul>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>4. حماية البيانات</h2>
          <p style={pStyle}>نطبق أعلى معايير الأمان لحماية بياناتك:</p>
          <ul style={{ color: 'var(--text-secondary)', lineHeight: 2.2, fontWeight: 500, fontSize: '1.05rem', paddingRight: '1.5rem' }}>
            <li>تشفير SSL/TLS لجميع الاتصالات بالموقع.</li>
            <li>تشفير كلمات المرور بخوارزميات متقدمة (bcrypt).</li>
            <li>عدم تخزين بيانات البطاقات الائتمانية على خوادمنا.</li>
            <li>مراقبة أمنية دورية وفحوصات اختراق منتظمة.</li>
          </ul>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>5. ملفات الارتباط (Cookies)</h2>
          <p style={pStyle}>نستخدم ملفات الارتباط لتحسين تجربتك: تذكّر تسجيل الدخول، حفظ سلة المشتريات، وتحليل أداء الموقع. يمكنك التحكم في إعدادات ملفات الارتباط من متصفحك في أي وقت.</p>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>6. حقوقك</h2>
          <p style={pStyle}>لديك الحق في:</p>
          <ul style={{ color: 'var(--text-secondary)', lineHeight: 2.2, fontWeight: 500, fontSize: '1.05rem', paddingRight: '1.5rem' }}>
            <li>الوصول إلى بياناتك الشخصية المخزنة لدينا.</li>
            <li>طلب تصحيح أو تحديث بياناتك.</li>
            <li>طلب حذف حسابك وبياناتك نهائياً.</li>
            <li>إلغاء الاشتراك من الرسائل التسويقية في أي وقت.</li>
          </ul>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>7. التعديلات على السياسة</h2>
          <p style={pStyle}>نحتفظ بالحق في تعديل سياسة الخصوصية في أي وقت. سيتم إشعارك بأي تغييرات جوهرية عبر البريد الإلكتروني أو إشعار على المنصة. استمرارك في استخدام المنصة بعد التعديل يعتبر موافقة على السياسة المحدّثة.</p>
        </div>

        <div style={{ textAlign: 'center', paddingTop: '2rem', borderTop: '1px dashed var(--border)' }}>
          <p style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>لأي استفسار حول خصوصية بياناتك:</p>
          <a href="/contact" style={{ color: 'var(--primary)', fontWeight: 900, fontSize: '1.1rem', textDecoration: 'none' }}>تواصل معنا</a>
        </div>
      </div>
    </main>
  );
}
