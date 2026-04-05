import React from 'react';
import Navbar from '@/components/Navbar';

import { Shield, CheckCircle2, AlertTriangle, Wrench, Ban } from 'lucide-react';

export default function WarrantyPage() {
  return (
    <main style={{ minHeight: '100vh', background: 'var(--background)' }}>
      <Navbar />
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '10rem 2rem 4rem' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 950, color: 'var(--text-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          سياسة الضمان <Shield size={40} color="var(--primary)" />
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', fontWeight: 500, lineHeight: 1.8, marginBottom: '4rem' }}>
          نلتزم بتوفير ضمان شامل على جميع القطع المباعة عبر المنصة لضمان جودة المنتجات وراحة بال عملائنا.
        </p>

        {/* Warranty Types */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '4rem' }}>
          <div style={{ background: 'var(--surface)', border: '2px solid var(--success)', borderRadius: '24px', padding: '2.5rem', textAlign: 'center' }}>
            <CheckCircle2 size={40} color="var(--success)" style={{ marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.5rem', fontWeight: 950, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>القطع الأصلية (OEM)</h3>
            <div style={{ fontSize: '3rem', fontWeight: 950, color: 'var(--success)', lineHeight: 1 }}>12</div>
            <div style={{ color: 'var(--text-secondary)', fontWeight: 700, fontSize: '1.1rem' }}>شهر ضمان</div>
            <p style={{ color: 'var(--text-secondary)', marginTop: '1rem', fontWeight: 500, lineHeight: 1.7 }}>ضمان شامل ضد عيوب التصنيع والمواد الخام</p>
          </div>

          <div style={{ background: 'var(--surface)', border: '2px solid var(--primary)', borderRadius: '24px', padding: '2.5rem', textAlign: 'center' }}>
            <Shield size={40} color="var(--primary)" style={{ marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.5rem', fontWeight: 950, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>القطع البديلة (Aftermarket)</h3>
            <div style={{ fontSize: '3rem', fontWeight: 950, color: 'var(--primary)', lineHeight: 1 }}>6</div>
            <div style={{ color: 'var(--text-secondary)', fontWeight: 700, fontSize: '1.1rem' }}>أشهر ضمان</div>
            <p style={{ color: 'var(--text-secondary)', marginTop: '1rem', fontWeight: 500, lineHeight: 1.7 }}>ضمان ضد عيوب التصنيع فقط</p>
          </div>
        </div>

        {/* What's Covered */}
        <section style={{ marginBottom: '3.5rem' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 950, color: 'var(--text-primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <CheckCircle2 size={24} color="var(--success)" /> ما يغطيه الضمان
          </h2>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '20px', padding: '2rem' }}>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1.2rem', color: 'var(--text-secondary)', fontWeight: 500, lineHeight: 1.8, fontSize: '1.05rem' }}>
              <li style={{ display: 'flex', gap: '0.8rem' }}><CheckCircle2 size={20} color="var(--success)" style={{ flexShrink: 0, marginTop: '4px' }} /> عيوب التصنيع والمواد الخام التي تؤثر على أداء القطعة.</li>
              <li style={{ display: 'flex', gap: '0.8rem' }}><CheckCircle2 size={20} color="var(--success)" style={{ flexShrink: 0, marginTop: '4px' }} /> تلف مبكر غير طبيعي خلال فترة الضمان (بشرط التركيب الصحيح).</li>
              <li style={{ display: 'flex', gap: '0.8rem' }}><CheckCircle2 size={20} color="var(--success)" style={{ flexShrink: 0, marginTop: '4px' }} /> عدم مطابقة المواصفات المعلنة على صفحة المنتج.</li>
              <li style={{ display: 'flex', gap: '0.8rem' }}><CheckCircle2 size={20} color="var(--success)" style={{ flexShrink: 0, marginTop: '4px' }} /> استبدال مجاني أو استرداد كامل المبلغ حسب التوفر.</li>
            </ul>
          </div>
        </section>

        {/* What's NOT Covered */}
        <section style={{ marginBottom: '3.5rem' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 950, color: 'var(--text-primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <Ban size={24} color="var(--primary)" /> ما لا يغطيه الضمان
          </h2>
          <div style={{ background: 'linear-gradient(145deg, rgba(244,63,94,0.05), transparent)', border: '1px solid rgba(244,63,94,0.2)', borderRadius: '20px', padding: '2rem' }}>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1.2rem', color: 'var(--text-secondary)', fontWeight: 500, lineHeight: 1.8, fontSize: '1.05rem' }}>
              <li style={{ display: 'flex', gap: '0.8rem' }}><AlertTriangle size={20} color="#f59e0b" style={{ flexShrink: 0, marginTop: '4px' }} /> التلف الناتج عن التركيب الخاطئ أو غير المتخصص.</li>
              <li style={{ display: 'flex', gap: '0.8rem' }}><AlertTriangle size={20} color="#f59e0b" style={{ flexShrink: 0, marginTop: '4px' }} /> الاستهلاك الطبيعي والتآكل بسبب الاستخدام العادي.</li>
              <li style={{ display: 'flex', gap: '0.8rem' }}><AlertTriangle size={20} color="#f59e0b" style={{ flexShrink: 0, marginTop: '4px' }} /> التعديلات أو الإصلاحات غير المعتمدة على القطعة.</li>
              <li style={{ display: 'flex', gap: '0.8rem' }}><AlertTriangle size={20} color="#f59e0b" style={{ flexShrink: 0, marginTop: '4px' }} /> استخدام القطعة في سيارة غير متوافقة مع المواصفات.</li>
              <li style={{ display: 'flex', gap: '0.8rem' }}><AlertTriangle size={20} color="#f59e0b" style={{ flexShrink: 0, marginTop: '4px' }} /> الحوادث والأضرار الخارجية (اصطدام، غمر بالمياه).</li>
              <li style={{ display: 'flex', gap: '0.8rem' }}><AlertTriangle size={20} color="#f59e0b" style={{ flexShrink: 0, marginTop: '4px' }} /> تكاليف العمالة والتركيب لا تُغطى في أي حالة.</li>
            </ul>
          </div>
        </section>

        {/* How to claim */}
        <section style={{ marginBottom: '3.5rem' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 950, color: 'var(--text-primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <Wrench size={24} color="var(--primary)" /> كيف تطلب الضمان؟
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {[
              { step: '1', title: 'تواصل معنا', desc: 'أرسل رسالة عبر صفحة "تواصل معنا" أو واتساب مع ذكر رقم الطلب ووصف المشكلة.' },
              { step: '2', title: 'أرسل الصور', desc: 'صوّر القطعة المعيبة من عدة زوايا وأرسلها لفريقنا لتقييم الحالة.' },
              { step: '3', title: 'الفحص والقرار', desc: 'فريقنا الفني يراجع الطلب خلال 2-3 أيام عمل ويبلغك بالقرار.' },
              { step: '4', title: 'الاستبدال أو الاسترداد', desc: 'في حال قبول المطالبة، يتم إرسال قطعة بديلة أو استرداد المبلغ خلال 5-7 أيام عمل.' },
            ].map((s, i) => (
              <div key={i} style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                <div style={{
                  width: '48px', height: '48px', borderRadius: '50%',
                  background: 'var(--primary)', color: 'white', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', fontWeight: 950,
                  fontSize: '1.2rem', flexShrink: 0
                }}>{s.step}</div>
                <div>
                  <h4 style={{ fontWeight: 900, color: 'var(--text-primary)', marginBottom: '0.3rem', fontSize: '1.1rem' }}>{s.title}</h4>
                  <p style={{ color: 'var(--text-secondary)', fontWeight: 500, lineHeight: 1.7 }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div style={{ textAlign: 'center', paddingTop: '2rem', borderTop: '1px dashed var(--border)' }}>
          <p style={{ color: 'var(--text-secondary)', fontWeight: 500, marginBottom: '1rem' }}>لمزيد من المعلومات أو للتقدم بمطالبة ضمان:</p>
          <a href="/contact" style={{ color: 'var(--primary)', fontWeight: 900, fontSize: '1.1rem', textDecoration: 'none' }}>تواصل مع فريق الدعم</a>
        </div>
      </div>
    </main>
  );
}
