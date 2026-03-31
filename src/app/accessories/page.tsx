"use client";
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AccessoryGrid from '@/components/AccessoryGrid';
import WhatsAppHub from '@/components/WhatsAppHub';
import { ACCESSORY_DATA } from '@/lib/accessoryData';
import { Sparkles, Palette, Zap, Layout, ArrowDownCircle, ShieldCheck, Globe } from 'lucide-react';

export default function AccessoriesPage() {
  const [activeCategory, setActiveCategory] = useState('الجميع');
  
  const categories = ['الجميع', 'إضاءة محيطية', 'قمرة القيادة الذكية', 'راحة وحرفة', 'منكهات وجوهر'];
  
  const filteredProducts = activeCategory === 'الجميع' 
    ? ACCESSORY_DATA 
    : ACCESSORY_DATA.filter(p => p.category === activeCategory);

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--background)' }}>
      <Navbar />

      {/* ─── HI-END CINEMATIC HERO ─── */}
      <section style={{
        position: 'relative',
        height: '90vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        overflow: 'hidden',
        color: 'white',
        background: '#000'
      }}>
        {/* Visual Layer */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          backgroundImage: 'url("/luxury_car_interior_accessories_hero_1774816238501.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.7,
          zIndex: 0
        }} />
        
        {/* Dynamic Gradient Overlay */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          background: 'linear-gradient(to top, var(--background) 0%, transparent 60%, rgba(0,0,0,0.4) 100%)',
          zIndex: 1
        }} />

        {/* Hero Content */}
        <div style={{ position: 'relative', zIndex: 10, maxWidth: '900px', padding: '0 2rem' }}>
           <div style={{ 
              display: 'inline-flex', alignItems: 'center', gap: '0.8rem', 
              background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
              padding: '0.6rem 1.4rem', borderRadius: '40px', marginBottom: '2.5rem',
              backdropFilter: 'blur(12px)', fontSize: '0.85rem', fontWeight: 900, textTransform: 'uppercase',
              letterSpacing: '2px'
           }}>
              <Sparkles size={16} color="var(--primary)" /> استديو التزيين الهندسي
           </div>

           <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 950, marginBottom: '1.5rem', lineHeight: 1.1 }}>
             حوّل مقصورتك إلى <br/> <span style={{ color: 'var(--primary)', textShadow: '0 0 30px rgba(244, 63, 94, 0.4)' }}>تحفة فنية</span>
           </h1>
           
           <p style={{ fontSize: '1.25rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, marginBottom: '3.5rem', maxWidth: '700px', margin: '0 auto 3.5rem', fontWeight: 500 }}>
             نقدم لك أفخم الإكسسوارات العالمية المختارة بعناية لتناسب أرقى السيارات في المملكة. دقة في التفاصيل وفخامة في الملمس.
           </p>

           <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
              {[
                { label: 'ضمان التوافق', icon: <ShieldCheck size={18} /> },
                { label: 'شحن مبرد فاخر', icon: <Zap size={18} /> },
                { label: 'مستورد حصري', icon: <Globe size={18} /> },
              ].map((badge, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', fontWeight: 800 }}>
                   <span style={{ color: 'var(--primary)' }}>{badge.icon}</span> {badge.label}
                </div>
              ))}
           </div>
        </div>

        <ArrowDownCircle 
          size={40} 
          style={{ position: 'absolute', bottom: '3rem', left: '50%', transform: 'translateX(-50%)', opacity: 0.5, animation: 'bounce 2s infinite' }} 
        />
      </section>

      {/* ─── CATEGORY NAVIGATION ─── */}
      <section style={{
        padding: '3rem 2rem',
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        position: 'sticky', top: '70px', zIndex: 90,
        backdropFilter: 'blur(10px)',
        backgroundColor: 'rgba(var(--surface-rgb, 255, 255, 255), 0.9)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
           {categories.map(cat => (
             <button
               key={cat}
               onClick={() => setActiveCategory(cat)}
               style={{
                 padding: '0.8rem 1.8rem',
                 borderRadius: '16px',
                 border: '1px solid',
                 borderColor: activeCategory === cat ? 'var(--primary)' : 'var(--border)',
                 background: activeCategory === cat ? 'var(--primary)' : 'var(--background)',
                 color: activeCategory === cat ? 'white' : 'var(--text-primary)',
                 fontWeight: 800,
                 fontSize: '0.9rem',
                 cursor: 'pointer',
                 transition: '0.2s',
                 boxShadow: activeCategory === cat ? '0 8px 20px rgba(244, 63, 94, 0.3)' : 'none'
               }}
             >
               {cat}
             </button>
           ))}
        </div>
      </section>

      {/* ─── MAIN COLLECTION ─── */}
      <section style={{ padding: '5rem 2rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
            <div>
               <span style={{ color: 'var(--primary)', fontWeight: 900, textTransform: 'uppercase', fontSize: '0.85rem' }}>المجموعة الملكية</span>
               <h2 style={{ fontSize: '2.5rem', fontWeight: 950, color: 'var(--text-primary)', margin: '0.5rem 0 0' }}>{activeCategory}</h2>
            </div>
            <div style={{ color: 'var(--text-secondary)', fontWeight: 700, fontSize: '0.95rem' }}>
               إظهار {filteredProducts.length} قطعة مختارة
            </div>
         </div>

         <AccessoryGrid products={filteredProducts} />
      </section>

      {/* ─── CUSTOM DECOR BANNER ─── */}
      <section style={{ padding: '5rem 2rem', maxWidth: '1200px', margin: '2rem auto 8rem', width: '100%' }}>
         <div style={{
           background: 'linear-gradient(135deg, #111 0%, #000 100%)',
           borderRadius: '40px', padding: '4rem',
           display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '3rem',
           border: '1px solid rgba(255,255,255,0.05)',
           boxShadow: '0 30px 60px rgba(0,0,0,0.4)',
           position: 'relative', overflow: 'hidden'
         }}>
            <div style={{ flex: 1, minWidth: '350px', position: 'relative', zIndex: 10 }}>
               <h2 style={{ color: 'white', fontSize: '2.8rem', fontWeight: 950, marginBottom: '1.5rem', lineHeight: 1.2 }}>
                 تصميم داخلي <span style={{ color: 'var(--primary)' }}>حسب الطلب</span>
               </h2>
               <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1.2rem', lineHeight: 1.8, marginBottom: '3rem', maxWidth: '700px' }}>
                هل تبحث عن شكل محدد لمقصورة سيارتك؟ خبراؤنا المهندسون يساعدونك في اختيار طقم الإضاءة والتنجيد المناسب لنوع سيارتك بدقة متناهية.
             </p>
               <a href={ACCESSORY_DATA[0].description} style={{
                 background: 'var(--primary)', color: 'white', padding: '1rem 2.5rem',
                 borderRadius: '16px', fontWeight: 900, textDecoration: 'none',
                 boxShadow: '0 10px 25px rgba(244, 63, 94, 0.4)', display: 'inline-block'
               }}>احجز استشارة تزيين</a>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', position: 'relative', zIndex: 10 }}>
               {[
                 { title: 'محاكاة 3D', icon: <Layout size={20} /> },
                 { title: 'ألوان سدايا', icon: <Palette size={20} /> },
                 { title: 'تركيب احترافي', icon: <Zap size={20} /> },
                 { title: 'ضمان سنتين', icon: <ShieldCheck size={20} /> },
               ].map((item, i) => (
                 <div key={i} style={{ 
                   background: 'rgba(255,255,255,0.04)', padding: '1.5rem 2rem', 
                   borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)',
                   textAlign: 'center', color: 'white'
                 }}>
                    <div style={{ color: 'var(--primary)', marginBottom: '0.8rem', display: 'flex', justifyContent: 'center' }}>{item.icon}</div>
                    <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>{item.title}</div>
                 </div>
               ))}
            </div>
         </div>
      </section>

      <Footer />
      <WhatsAppHub />

      <style jsx>{`
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translate(-50%, 0); }
          40% { transform: translate(-50%, -10px); }
          60% { transform: translate(-50%, -5px); }
        }
      `}</style>
    </main>
  );
}
