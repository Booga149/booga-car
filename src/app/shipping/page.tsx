import React from 'react';
import Navbar from '@/components/Navbar';

import { Truck, MapPin, Package, Shield, Zap, CheckCircle2, AlertTriangle } from 'lucide-react';

const SHIPPING_ZONES = [
  { zone: 'المنطقة الوسطى', cities: 'الرياض، القصيم، حائل', time: '1-2 يوم عمل', cost: '35 ر.س' },
  { zone: 'المنطقة الغربية', cities: 'جدة، مكة، المدينة، الطائف', time: '2-3 أيام عمل', cost: '35 ر.س' },
  { zone: 'المنطقة الشرقية', cities: 'الدمام، الخبر، الظهران، الأحساء', time: '2-3 أيام عمل', cost: '35 ر.س' },
  { zone: 'المنطقة الجنوبية', cities: 'أبها، خميس مشيط، جازان، نجران', time: '3-5 أيام عمل', cost: '35 ر.س' },
  { zone: 'المنطقة الشمالية', cities: 'تبوك، عرعر، سكاكا', time: '3-7 أيام عمل', cost: '35 ر.س' },
];

export default function ShippingPage() {
  return (
    <main style={{ minHeight: '100vh', background: 'var(--background)' }}>
      <Navbar />

      {/* Hero */}
      <section style={{ padding: '10rem 2rem 4rem', textAlign: 'center', background: 'linear-gradient(180deg, rgba(244,63,94,0.06) 0%, transparent 60%)' }}>
        <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', fontWeight: 950, color: 'var(--text-primary)', marginBottom: '1rem' }}>
          الشحن <span style={{ color: 'var(--primary)' }}>والتوصيل</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', fontWeight: 500, maxWidth: '700px', margin: '0 auto' }}>
          نوصّل قطع الغيار لكل مناطق المملكة — مع خيارات شحن سريع وتغليف احترافي يحمي القطع أثناء النقل.
        </p>
      </section>

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 2rem 6rem' }}>
        {/* Key Features */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '4rem' }}>
          {[
            { icon: <Truck size={28} />, title: 'شحن لكل المملكة', desc: 'نغطي +30 مدينة' },
            { icon: <Zap size={28} />, title: 'شحن سريع', desc: 'يوم واحد للمدن الرئيسية' },
            { icon: <Package size={28} />, title: 'تغليف مقاوم للصدمات', desc: 'حماية القطع الحساسة' },
            { icon: <Shield size={28} />, title: 'شحن مجاني', desc: 'للطلبات فوق 500 ر.س' },
          ].map((f, i) => (
            <div key={i} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '24px', padding: '2rem', textAlign: 'center' }}>
              <div style={{ color: 'var(--primary)', marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>{f.icon}</div>
              <h3 style={{ fontWeight: 900, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>{f.title}</h3>
              <p style={{ color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.9rem' }}>{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Shipping Zones Table */}
        <h2 style={{ fontSize: '2rem', fontWeight: 950, color: 'var(--text-primary)', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <MapPin size={28} color="var(--primary)" /> مناطق التوصيل والمدد الزمنية
        </h2>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '24px', overflow: 'hidden', marginBottom: '4rem' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
            <thead>
              <tr style={{ background: 'var(--background)' }}>
                <th style={{ padding: '1.2rem 1.5rem', fontWeight: 800, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>المنطقة</th>
                <th style={{ padding: '1.2rem 1.5rem', fontWeight: 800, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>المدن الرئيسية</th>
                <th style={{ padding: '1.2rem 1.5rem', fontWeight: 800, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>مدة التوصيل</th>
                <th style={{ padding: '1.2rem 1.5rem', fontWeight: 800, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>رسوم الشحن</th>
              </tr>
            </thead>
            <tbody>
              {SHIPPING_ZONES.map((z, i) => (
                <tr key={i} style={{ borderTop: '1px solid var(--border)' }}>
                  <td style={{ padding: '1.2rem 1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>{z.zone}</td>
                  <td style={{ padding: '1.2rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{z.cities}</td>
                  <td style={{ padding: '1.2rem 1.5rem' }}>
                    <span style={{ background: 'rgba(244,63,94,0.1)', color: 'var(--primary)', padding: '0.3rem 0.8rem', borderRadius: '10px', fontWeight: 800, fontSize: '0.85rem' }}>{z.time}</span>
                  </td>
                  <td style={{ padding: '1.2rem 1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>{z.cost}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Policies */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '24px', padding: '2.5rem' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <CheckCircle2 size={22} color="var(--success)" /> ملاحظات هامة عند الاستلام
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1rem', color: 'var(--text-secondary)', fontWeight: 500, lineHeight: 1.8 }}>
              <li>• تحقق من سلامة التغليف الخارجي قبل التوقيع.</li>
              <li>• افتح الشحنة وتأكد من مطابقة القطعة للطلب فوراً.</li>
              <li>• صوّر المنتج في حال وجود أي تلف أو اختلاف.</li>
              <li>• لديك 14 يوماً للاسترجاع من تاريخ الاستلام.</li>
            </ul>
          </div>

          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '24px', padding: '2.5rem' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <AlertTriangle size={22} color="#f59e0b" /> القطع الثقيلة والكبيرة
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1rem', color: 'var(--text-secondary)', fontWeight: 500, lineHeight: 1.8 }}>
              <li>• القطع التي تزيد عن 30 كجم تخضع لرسوم شحن إضافية.</li>
              <li>• المحركات وناقل الحركة يتم شحنها عبر شركات نقل متخصصة.</li>
              <li>• يتم التنسيق معك لتحديد موعد التسليم المناسب.</li>
              <li>• التغليف يشمل حماية مضاعفة للقطع الحساسة.</li>
            </ul>
          </div>
        </div>
      </div>

    </main>
  );
}
