import React from 'react';
import Navbar from '@/components/Navbar';

import { FileText } from 'lucide-react';

export default function TermsPage() {
  const sectionStyle: React.CSSProperties = { marginBottom: '3.5rem' };
  const h2Style: React.CSSProperties = { fontSize: '1.6rem', fontWeight: 900, marginBottom: '1.2rem', color: 'var(--text-primary)', borderBottom: '1px solid var(--border)', paddingBottom: '0.8rem' };
  const pStyle: React.CSSProperties = { color: 'var(--text-secondary)', lineHeight: 2, fontWeight: 500, fontSize: '1.05rem', marginBottom: '1rem' };

  return (
    <main style={{ minHeight: '100vh', background: 'var(--background)' }}>
      <Navbar />
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '10rem 2rem 4rem' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 950, color: 'var(--text-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          الشروط والأحكام <FileText size={40} color="var(--primary)" />
        </h1>
        <p style={{ ...pStyle, marginBottom: '4rem' }}>
          آخر تحديث: أبريل 2026 — باستخدامك لمنصة Booga Car فإنك توافق على الالتزام بالشروط والأحكام التالية. يرجى قراءتها بعناية.
        </p>

        <div style={sectionStyle}>
          <h2 style={h2Style}>1. تعريفات عامة</h2>
          <p style={pStyle}>
            <strong>&quot;المنصة&quot;</strong> تعني موقع Booga Car الإلكتروني وتطبيقاته. <strong>&quot;المستخدم&quot;</strong> يعني أي شخص يتصفح أو يستخدم المنصة سواء كمشتري أو بائع. <strong>&quot;التاجر&quot;</strong> يعني البائع المعتمد الذي يعرض منتجاته على المنصة. <strong>&quot;المنتجات&quot;</strong> تعني قطع غيار السيارات والإكسسوارات والمواد المعروضة.
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>2. شروط الاستخدام</h2>
          <p style={pStyle}>يجب أن يكون عمرك 18 عاماً أو أكثر لاستخدام المنصة. أنت مسؤول عن الحفاظ على سرية بيانات حسابك. يُحظر استخدام المنصة لأي أغراض غير مشروعة. نحتفظ بحق تعليق أو إلغاء أي حساب يخالف هذه الشروط دون إشعار مسبق.</p>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>3. المنتجات والأسعار</h2>
          <p style={pStyle}>جميع الأسعار بالريال السعودي وتشمل ضريبة القيمة المضافة (15%). نبذل قصارى جهدنا لضمان دقة المعلومات والأسعار، لكن قد تحدث أخطاء. نحتفظ بحق تصحيح أي خطأ في التسعير. صور المنتجات للمرجعية فقط وقد تختلف قليلاً عن المنتج الفعلي.</p>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>4. الطلبات والدفع</h2>
          <p style={pStyle}>تأكيد الطلب يعتبر عقداً ملزماً بين المشتري والبائع عبر المنصة. نقبل الدفع الإلكتروني والدفع عند الاستلام. قد يتم رفض أو إلغاء أي طلب لأسباب تتعلق بالتوفر أو التسعير أو الأمان. عند الإلغاء، يتم إرجاع المبلغ بنفس طريقة الدفع خلال 5-14 يوم عمل.</p>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>5. مسؤولية التوافق</h2>
          <p style={pStyle}>المشتري مسؤول عن التأكد من توافق القطعة مع سيارته قبل الشراء. نوفر أدوات بحث بالـ VIN والماركة/الموديل للمساعدة. في حالة عدم التوافق، يمكن استرجاع القطعة وفقاً لسياسة الاسترجاع المعتمدة.</p>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>6. الشحن والتوصيل</h2>
          <p style={pStyle}>تلتزم المنصة بالمدد الزمنية المعلنة لكل منطقة. التأخير بسبب ظروف خارجة عن السيطرة (أحوال جوية، إجازات رسمية) لا يعتبر إخلالاً بالعقد. المستلم مسؤول عن فحص الشحنة عند الاستلام والإبلاغ عن أي تلف خلال 48 ساعة.</p>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>7. حقوق الملكية الفكرية</h2>
          <p style={pStyle}>جميع المحتويات على المنصة (النصوص، الصور، التصاميم، الشعارات) محمية بقوانين الملكية الفكرية. يُحظر نسخ أو إعادة استخدام أي محتوى دون إذن كتابي مسبق من إدارة Booga Car.</p>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>8. القانون المعمول به</h2>
          <p style={pStyle}>تخضع هذه الشروط والأحكام لأنظمة المملكة العربية السعودية. أي نزاع ينشأ عن استخدام المنصة يتم حله وفقاً للأنظمة المعمول بها في المملكة وتحت اختصاص المحاكم السعودية المختصة.</p>
        </div>

        <div style={{ textAlign: 'center', paddingTop: '2rem', borderTop: '1px dashed var(--border)' }}>
          <p style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>لأي استفسار حول الشروط والأحكام:</p>
          <a href="/contact" style={{ color: 'var(--primary)', fontWeight: 900, fontSize: '1.1rem', textDecoration: 'none' }}>تواصل معنا</a>
        </div>
      </div>
    </main>
  );
}
