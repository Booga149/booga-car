"use client";
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import ProductCard from '@/components/ProductCard';
import { useProducts } from '@/context/ProductsContext';
import {
  ShieldCheck, Zap, Globe, Award, ArrowUpRight
} from 'lucide-react';
import EngineeringSystems from '@/components/EngineeringSystems';
import KSATrustBar from '@/components/KSATrustBar';
import WhatsAppHub from '@/components/WhatsAppHub';
import WelcomeOffer from '@/components/WelcomeOffer';

export default function Home() {
  const { products } = useProducts();
  const [showWelcome, setShowWelcome] = useState(false);

  // User specifically requested the "Booga Car" Welcome appearance at 3s instead of 5s.
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcome(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <main style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      overflowX: 'hidden', 
      background: '#000',
      position: 'relative'
    }}>
      {/* Global Precision Grid */}
      <div style={{
        position: 'fixed', inset: 0,
        backgroundImage: 'radial-gradient(rgba(244, 63, 94, 0.05) 1px, transparent 1px)',
        backgroundSize: '80px 80px',
        zIndex: 0, pointerEvents: 'none'
      }} />

      <div style={{ position: 'relative', zIndex: 10 }}>
        <Navbar />
        {showWelcome && <WelcomeOffer />}
        <Hero />
        
        {/* ═══ SECTION 2: Interactive Engineering Discovery ═══ */}
        <EngineeringSystems />

        {/* ═══ SECTION 3: Featured Precision Parts ═══ */}
        <section style={{
          background: 'rgba(5, 5, 5, 0.95)',
          padding: '8rem 0',
          borderTop: '1px solid var(--border)',
          position: 'relative', zIndex: 10
        }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
            padding: '0 2rem 3rem',
            maxWidth: '1200px', margin: '0 auto', width: '100%',
          }}>
            <div>
              <span style={{ color: 'var(--primary)', fontWeight: 900, textTransform: 'uppercase', fontSize: '0.85rem' }}>المطابقة الرائجة</span>
              <h2 style={{ margin: '0.5rem 0 0', fontSize: '2.5rem', fontWeight: 950, color: 'white' }}>
                القطع الأكثر طلباً <span style={{ color: 'var(--primary)', WebkitTextStroke: '1px var(--primary)', WebkitTextFillColor: 'transparent' }}>عالمياً</span>
              </h2>
            </div>
            <a href="/products" style={{
              color: 'white', fontWeight: 800, fontSize: '1rem',
              textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.8rem',
              padding: '1rem 2rem', background: 'rgba(255,255,255,0.03)', borderRadius: '20px',
              border: '1px solid var(--border)', transition: '0.3s',
            }}>
              اكتشف الكتالوج الكامل <ArrowUpRight size={20} />
            </a>
          </div>

          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
            <div className="product-grid" style={{
               display: 'grid', 
               gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
               gap: '3rem'
            }}>
              {products.slice(0, 4).map((prod) => (
                <ProductCard
                  key={prod.id}
                  {...prod}
                  imagePlaceholderColor={prod.color || 'var(--border)'}
                />
              ))}
            </div>
          </div>
        </section>
        
        {/* ═══ SECTION 4: Professional Support & Delivery ═══ */}
        <section style={{
          padding: '8rem 2rem', maxWidth: '1400px', margin: '0 auto',
          width: '100%', position: 'relative', zIndex: 10
        }}>
          <div style={{
            background: 'linear-gradient(145deg, #0a0a0a, #000)',
            borderRadius: '60px', padding: '6rem',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
            flexWrap: 'wrap', gap: '5rem', border: '1px solid rgba(255,255,255,0.05)',
            boxShadow: '0 50px 100px rgba(0,0,0,0.8)'
          }}>
            <div style={{ flex: 1, minWidth: '400px' }}>
               <h2 style={{ color: 'white', fontSize: '3.5rem', fontWeight: 950, marginBottom: '2rem', lineHeight: 1.1 }}>
                 خبيرك الخاص في <br /> <span style={{ color: 'var(--primary)' }}>توافقية</span> القطع
               </h2>
               <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1.3rem', lineHeight: 1.8, marginBottom: '3.5rem', fontWeight: 500 }}>
                 سواء كنت تمتلك سيارة نادرة أو حديثة، فريقنا الهندسي متصل بشبكة توريد عالمية تضمن لك الحصول على القطع الصحيحة بالرقم التسلسلي الأصلي.
               </p>
               <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                  <a href="https://wa.me/966500000000" style={{
                     background: 'var(--primary)', color: 'white', padding: '1.2rem 3rem',
                     borderRadius: '20px', fontWeight: 900, textDecoration: 'none',
                     boxShadow: '0 15px 35px rgba(244, 63, 94, 0.4)', fontSize: '1.2rem',
                     transition: '0.3s'
                  }}>تحدث مع المهندس</a>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'rgba(255,255,255,0.8)', fontWeight: 800 }}>
                     <Award size={28} color="#FFD700" /> موثق من تجارة
                  </div>
               </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
               {[
                 { title: 'شحن قاري', icon: <Globe size={28} /> },
                 { title: 'دقة VIN', icon: <Zap size={28} /> },
                 { title: 'ضمان سنة', icon: <ShieldCheck size={28} /> },
                 { title: 'دعم مباشر', icon: <Zap size={28} /> },
               ].map((item, i) => (
                 <div key={i} style={{ 
                   background: 'rgba(255,255,255,0.02)', padding: '2.5rem', 
                   borderRadius: '32px', border: '1px solid rgba(255,255,255,0.05)',
                   textAlign: 'center', color: 'white', transition: '0.3s'
                 }}>
                    <div style={{ color: 'var(--primary)', marginBottom: '1.2rem', display: 'flex', justifyContent: 'center' }}>{item.icon}</div>
                    <div style={{ fontWeight: 900, fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>{item.title}</div>
                 </div>
               ))}
            </div>
          </div>
        </section>

        {/* ═══ SECTION 5: Trust & Market Stats ═══ */}
        <KSATrustBar />
        <section style={{
          background: '#000',
          padding: '6rem 2rem',
          borderTop: '1px solid rgba(255,255,255,0.05)'
        }}>
          <div style={{
            maxWidth: '1200px', margin: '0 auto',
            display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '4rem',
            textAlign: 'center',
          }}>
            {[
              { num: '+124,000', label: 'عملية مطابقة ناجحة' },
              { num: '0.04s', label: 'سرعة كشف رقم الهيكل' },
              { num: '100%', label: 'ضمان التوافق الهندسي' },
              { num: 'World', label: 'تغطية السوق العالمية' },
            ].map((stat, i) => (
              <div key={i} style={{ flex: 1, minWidth: '180px' }}>
                <div style={{ fontSize: '3.5rem', fontWeight: 950, color: 'white', marginBottom: '0.8rem', letterSpacing: '-2px' }}>
                  {stat.num}
                </div>
                <div style={{ color: 'var(--primary)', fontSize: '0.9rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '2px' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        <WhatsAppHub />
      </div>

      <style jsx>{`
        .product-grid {
          margin-bottom: 2rem;
        }
      `}</style>
    </main>
  );
}
