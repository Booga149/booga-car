"use client";
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { 
  BarChart3, 
  ShieldCheck, 
  Rocket, 
  Target, 
  CheckCircle2, 
  Users, 
  Zap,
  ChevronLeft
} from 'lucide-react';

export default function BecomeDealerPage() {
  const benefits = [
    {
      icon: <BarChart3 size={32} />,
      title: "لوحة تحكم احترافية",
      desc: "إدارة متكاملة لمنتجاتك، مبيعاتك، وتقارير أداء متجرك لحظة بلحظة."
    },
    {
      icon: <ShieldCheck size={32} />,
      title: "توثيق ومصداقية",
      desc: "احصل على شارة 'تاجر موثوق' لرفع مبيعاتك وبناء ثقة قوية مع عملائك."
    },
    {
      icon: <Rocket size={32} />,
      title: "انتشار واسع",
      desc: "اعرض قطعك لملايين الباحثين عن قطع الغيار في المملكة والخليج."
    },
    {
      icon: <Target size={32} />,
      title: "عمولات منافسة",
      desc: "نحن نهتم بنمو تجارتك، لذا نوفر لك أفضل هيكل عمولات في السوق."
    }
  ];

  return (
    <main style={{ minHeight: '100vh', background: 'var(--background)', color: 'var(--text-primary)' }}>
      <Navbar />
      
      {/* Hero Section */}
      <section style={{ 
        padding: '10rem 2rem 6rem',
        background: 'radial-gradient(circle at top right, rgba(244, 63, 94, 0.05), transparent 40%)',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ 
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            background: 'rgba(244, 63, 94, 0.1)', color: 'var(--primary)',
            padding: '0.5rem 1.2rem', borderRadius: '40px', fontSize: '0.9rem',
            fontWeight: 800, marginBottom: '2rem', border: '1px solid rgba(244, 63, 94, 0.2)'
          }}>
            <Zap size={16} fill="var(--primary)" /> بوجا للأعمال - BOOGA FOR BUSINESS
          </div>
          
          <h1 style={{ 
            fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 950, lineHeight: 1.1,
            letterSpacing: '-2px', marginBottom: '1.5rem', color: 'var(--text-primary)'
          }}>
            انقل تجارتك لمستوى <span style={{ color: 'var(--primary)', textShadow: '0 0 30px rgba(244, 63, 94, 0.3)' }}>الاحتراف</span>
          </h1>
          
          <p style={{ 
            fontSize: '1.25rem', color: 'var(--text-secondary)', lineHeight: 1.8,
            maxWidth: '700px', margin: '0 auto 3rem', fontWeight: 600
          }}>
            المنصة الأولى المخصصة لمساعدة تجار قطع الغيار في النمو والانتشار الرقمي. انضم لأكبر تجمع للمحترفين في المملكة.
          </p>
          
          <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/become-dealer/form" style={{ 
              background: 'var(--primary)', color: 'white', padding: '1.2rem 2.8rem',
              borderRadius: '16px', fontWeight: 900, fontSize: '1.2rem', textDecoration: 'none',
              boxShadow: '0 10px 40px rgba(244, 63, 94, 0.4)', transition: 'all 0.3s ease',
              display: 'flex', alignItems: 'center', gap: '0.8rem'
            }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
              ابدأ الآن كتاجر <ChevronLeft size={24} />
            </Link>
            
            <a href="#benefits" style={{ 
              background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)', padding: '1.2rem 2.8rem',
              borderRadius: '16px', fontWeight: 800, fontSize: '1.2rem', textDecoration: 'none',
              border: '1px solid var(--border)', transition: 'all 0.3s ease'
            }} onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'} onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}>
              اكتشف المزايا
            </a>
          </div>
        </div>
        
        {/* Background Decorative Elements */}
        <div style={{ position: 'absolute', top: '10%', left: '-5%', width: '300px', height: '300px', background: 'var(--primary)', filter: 'blur(150px)', opacity: 0.1, pointerEvents: 'none' }}></div>
      </section>

      {/* Benefits Grid */}
      <section id="benefits" style={{ padding: '6rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
          <h2 style={{ fontSize: '2.8rem', fontWeight: 900, marginBottom: '1rem' }}>لماذا تختار بوجا للأعمال؟</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', fontWeight: 600 }}>نقدم لك الأدوات اللازمة للسيطرة على سوق قطع الغيار الرقمي.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2.5rem' }}>
          {benefits.map((benefit, i) => (
            <div key={i} className="glass-panel" style={{ 
              padding: '3rem 2rem', borderRadius: '32px', background: 'var(--surface)',
              border: '1px solid var(--border)', transition: 'all 0.4s ease',
              display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center'
            }} onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.transform = 'translateY(-10px)'; }} onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
              <div style={{ 
                width: '70px', height: '70px', borderRadius: '20px', 
                background: 'rgba(244, 63, 94, 0.1)', color: 'var(--primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '2rem'
              }}>
                {benefit.icon}
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.2rem' }}>{benefit.title}</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontWeight: 500 }}>{benefit.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Showcase */}
      <section style={{ padding: '6rem 2rem', background: '#0a0a0a', position: 'relative' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '5rem', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '2.8rem', fontWeight: 950, marginBottom: '2rem', letterSpacing: '-1px' }}>ثقة العميل هي <span style={{ color: 'var(--primary)' }}>رأس مالك</span></h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {[
                { title: "شارة التوثيق الذهبية", desc: "تظهر بجانب اسم محلك في البحث لتعطي العميل ضمان الجودة." },
                { title: "نظام التقييم الموثوق", desc: "اجمع تقييمات عملائك وابنِ سمعة تجارية إلكترونية قوية." },
                { title: "خيارات دفع متنوعة", desc: "ندعم ومدى، فيزا، وماستركارد لضمان سهولة الشراء." }
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: '1.2rem' }}>
                  <CheckCircle2 size={24} color="var(--primary)" style={{ flexShrink: 0 }} />
                  <div>
                    <h4 style={{ fontWeight: 800, marginBottom: '0.4rem', fontSize: '1.15rem' }}>{item.title}</h4>
                    <p style={{ color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.95rem' }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div style={{ position: 'relative' }}>
            <div style={{ 
              background: 'linear-gradient(135deg, var(--surface) 0%, #111 100%)',
              borderRadius: '40px', padding: '1rem', border: '1px solid var(--border)',
              boxShadow: '0 40px 80px rgba(0,0,0,0.5)'
            }}>
              <div style={{ borderRadius: '30px', overflow: 'hidden', position: 'relative' }}>
                <img 
                   src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80" 
                   alt="Merchant Experience" 
                   style={{ width: '100%', height: 'auto', display: 'block' }}
                />
                <div style={{ 
                  position: 'absolute', bottom: '2rem', right: '2rem', left: '2rem',
                  background: 'rgba(0,0,0,0.8)', padding: '1.5rem', borderRadius: '20px',
                  backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10b981' }}></div>
                    <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>متجر قطع الغيار المعتمد</span>
                  </div>
                  <div style={{ marginTop: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>سجل الآن وافتح فرعك الرقمي الأول.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof / Stats */}
      <section style={{ padding: '6rem 2rem', textAlign: 'center', maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
          <div>
            <div style={{ fontSize: '3.5rem', fontWeight: 950, color: 'var(--primary)' }}>+500</div>
            <div style={{ fontWeight: 800, color: 'var(--text-secondary)' }}>تاجر مسجل في المملكة</div>
          </div>
          <div>
            <div style={{ fontSize: '3.5rem', fontWeight: 950, color: 'var(--primary)' }}>100K</div>
            <div style={{ fontWeight: 800, color: 'var(--text-secondary)' }}>زائر شهري نشط</div>
          </div>
          <div>
            <div style={{ fontSize: '3.5rem', fontWeight: 950, color: 'var(--primary)' }}>%98</div>
            <div style={{ fontWeight: 800, color: 'var(--text-secondary)' }}>رضا التجار</div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section style={{ 
        padding: '8rem 2rem', textAlign: 'center',
        background: 'linear-gradient(180deg, transparent, rgba(244, 63, 94, 0.05))'
      }}>
        <div className="glass-panel" style={{ 
          maxWidth: '800px', margin: '0 auto', padding: '5rem 3rem', borderRadius: '40px',
          border: '1px solid var(--border)', background: 'var(--surface)', position: 'relative', overflow: 'hidden'
        }}>
          <Users size={120} style={{ 
            position: 'absolute', top: '-20px', left: '-20px', opacity: 0.03, color: 'var(--primary)' 
          }} />
          <h2 style={{ fontSize: '3rem', fontWeight: 950, marginBottom: '1.5rem', letterSpacing: '-1px' }}>جاهز للتوسع معنا؟</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', marginBottom: '3rem', fontWeight: 600 }}>
            لا تضيع الوقت، آلاف العملاء يبحثون عن قطعك الآن. انضم لعائلة بوجا كار للأعمال اليوم.
          </p>
          <Link href="/become-dealer/form" style={{ 
            background: 'var(--primary)', color: 'white', padding: '1.5rem 4rem',
            borderRadius: '20px', fontWeight: 950, fontSize: '1.4rem', textDecoration: 'none',
            boxShadow: '0 15px 45px rgba(244, 63, 94, 0.4)', transition: 'all 0.3s ease',
            display: 'inline-flex', alignItems: 'center', gap: '1rem'
          }} onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'} onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}>
            سجل كتاجر الآن
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
