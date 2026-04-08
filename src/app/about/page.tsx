"use client";
import React from 'react';
import Navbar from '@/components/Navbar';

import { Shield, Truck, Award, Users, MapPin, Zap, Target, Star, Globe } from 'lucide-react';
import Link from 'next/link';

const STATS = [
  { label: 'قطعة غيار متوفرة', value: '+50,000', icon: <Zap size={28} /> },
  { label: 'تاجر ومورد معتمد', value: '+200', icon: <Users size={28} /> },
  { label: 'مدينة نغطيها بالشحن', value: '30+', icon: <MapPin size={28} /> },
  { label: 'نسبة رضا العملاء', value: '98%', icon: <Star size={28} /> },
];

const VALUES = [
  { title: 'الجودة أولاً', desc: 'نتعامل فقط مع قطع غيار أصلية ومعتمدة من أكبر الماركات العالمية لضمان سلامة سيارتك وعمرها الافتراضي.', icon: <Shield size={32} /> },
  { title: 'توصيل سريع', desc: 'شبكة لوجستية متكاملة تغطي جميع مناطق المملكة مع خيارات شحن سريع وتتبع مباشر حتى باب منزلك.', icon: <Truck size={32} /> },
  { title: 'أسعار تنافسية', desc: 'نتفاوض مباشرة مع المصنّعين والموردين لنوفر لك أفضل الأسعار دون أي وسطاء أو تكاليف مخفية.', icon: <Award size={32} /> },
  { title: 'دعم فني متخصص', desc: 'فريقنا من المهندسين المتخصصين جاهز لمساعدتك في اختيار القطعة المناسبة والتأكد من توافقها مع سيارتك.', icon: <Target size={32} /> },
];

export default function AboutPage() {
  return (
    <main style={{ minHeight: '100vh', background: 'var(--background)' }}>
      <Navbar />

      {/* Hero Section */}
      <section style={{
        position: 'relative', padding: '10rem 2rem 6rem', textAlign: 'center',
        background: 'linear-gradient(180deg, rgba(244,63,94,0.08) 0%, transparent 60%)',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'relative', zIndex: 10, maxWidth: '900px', margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.6rem',
            background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)',
            padding: '0.5rem 1.2rem', borderRadius: '30px', marginBottom: '2rem',
            fontSize: '0.85rem', fontWeight: 900, color: 'var(--primary)'
          }}>
            <Globe size={16} /> منصة سعودية معتمدة
          </div>
          <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 950, color: 'var(--text-primary)', lineHeight: 1.2, marginBottom: '1.5rem' }}>
            نحن <span style={{ color: 'var(--primary)' }}>Booga Car</span>
          </h1>
          <p style={{ fontSize: '1.3rem', color: 'var(--text-secondary)', lineHeight: 1.8, maxWidth: '700px', margin: '0 auto', fontWeight: 500 }}>
            منصة سعودية رائدة في مجال قطع غيار السيارات — نربط بين المشترين والموردين الموثقين في كل أنحاء المملكة بتقنية ذكية وتجربة شراء لا مثيل لها.
          </p>
        </div>
      </section>

      {/* Stats Bar */}
      <section style={{ maxWidth: '1200px', margin: '-3rem auto 0', padding: '0 2rem', position: 'relative', zIndex: 20 }}>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.5rem', background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: '32px', padding: '3rem 2rem', boxShadow: '0 20px 60px rgba(0,0,0,0.08)'
        }}>
          {STATS.map((s, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ color: 'var(--primary)', marginBottom: '0.8rem', display: 'flex', justifyContent: 'center' }}>{s.icon}</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 950, color: 'var(--text-primary)', lineHeight: 1 }}>{s.value}</div>
              <div style={{ color: 'var(--text-secondary)', fontWeight: 700, marginTop: '0.5rem', fontSize: '0.95rem' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Our Story */}
      <section style={{ maxWidth: '900px', margin: '0 auto', padding: '6rem 2rem 3rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2.5rem', fontWeight: 950, color: 'var(--text-primary)', marginBottom: '2rem' }}>
          قصتنا
        </h2>
        <div style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', lineHeight: 2, fontWeight: 500 }}>
          <p>
            بدأت فكرة <strong style={{ color: 'var(--text-primary)' }}>Booga Car</strong> من مشكلة حقيقية يواجهها كل صاحب سيارة في المملكة — صعوبة العثور على القطعة المناسبة بسعر عادل وضمان جودة. كان البحث عن قطعة غيار يعني التنقل بين محلات التشليح، الاتصال بعشرات الموردين، والتعامل مع أسعار غير شفافة.
          </p>
          <p style={{ marginTop: '1.5rem' }}>
            قررنا أن نغيّر هذا الواقع — فأنشأنا منصة تقنية متكاملة تجمع بين <strong style={{ color: 'var(--primary)' }}>الموردين الموثقين</strong> والمشترين في مكان واحد، مع أدوات بحث ذكية تضمن أن كل قطعة تتوافق مع سيارتك بدقة عالية.
          </p>
          <p style={{ marginTop: '1.5rem' }}>
            اليوم، <strong style={{ color: 'var(--text-primary)' }}>Booga Car</strong> تخدم آلاف العملاء في أكثر من 30 مدينة سعودية، وتوفر أكثر من 50,000 قطعة غيار من أفضل الماركات العالمية — مع ضمان الجودة وسرعة التوصيل.
          </p>
        </div>
      </section>

      {/* Values */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 2rem 6rem' }}>
        <h2 style={{ fontSize: '2.5rem', fontWeight: 950, color: 'var(--text-primary)', textAlign: 'center', marginBottom: '3rem' }}>
          لماذا <span style={{ color: 'var(--primary)' }}>Booga Car</span>؟
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
          {VALUES.map((v, i) => (
            <div key={i} style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: '28px', padding: '2.5rem', transition: 'all 0.3s',
              boxShadow: '0 4px 20px rgba(0,0,0,0.04)'
            }}
            onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.borderColor = 'var(--primary)'; }}
            onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
            >
              <div style={{ color: 'var(--primary)', marginBottom: '1.5rem' }}>{v.icon}</div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '1rem' }}>{v.title}</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontWeight: 500 }}>{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{
        maxWidth: '1000px', margin: '0 auto 6rem', padding: '0 2rem'
      }}>
        <div style={{
          background: 'var(--surface)',
          borderRadius: '40px', padding: '4rem', textAlign: 'center',
          border: '1px solid var(--border)',
          boxShadow: 'var(--card-shadow)'
        }}>
          <h2 style={{ color: 'var(--text-primary)', fontSize: '2.5rem', fontWeight: 950, marginBottom: '1rem' }}>
            جاهز تبدأ؟
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', marginBottom: '2.5rem', lineHeight: 1.8 }}>
            ابحث عن قطعتك الآن أو انضم كتاجر معتمد وابدأ البيع عبر أكبر منصة في المملكة.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
            <Link href="/products" style={{
              background: 'var(--primary)', color: 'white', padding: '1.2rem 2.5rem',
              borderRadius: '18px', fontWeight: 900, textDecoration: 'none', fontSize: '1.1rem',
              boxShadow: '0 10px 30px rgba(244,63,94,0.4)', transition: '0.3s'
            }}>تسوق الآن</Link>
            <Link href="/become-dealer" style={{
              background: 'transparent', color: 'white', padding: '1.2rem 2.5rem',
              borderRadius: '18px', fontWeight: 900, textDecoration: 'none', fontSize: '1.1rem',
              border: '2px solid rgba(255,255,255,0.2)', transition: '0.3s'
            }}>انضم كتاجر</Link>
          </div>
        </div>
      </section>

    </main>
  );
}
