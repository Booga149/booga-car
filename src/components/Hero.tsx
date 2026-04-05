"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import { Search, Shield, Zap, Globe, ArrowDown } from 'lucide-react';
import SmartSearch from './SmartSearch';

export default function Hero() {
  const router = useRouter();
  
  return (
    <section style={{
      minHeight: '100vh',
      width: '100%',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#000',
    }}>

      {/* ─── Car Background Image ─── */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'url("https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=1920&q=80")',
        backgroundSize: 'cover',
        backgroundPosition: 'center 40%',
        zIndex: 0,
      }} />

      {/* ─── Dark Overlay ─── */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.5) 40%, rgba(0,0,0,0.8) 100%)',
        zIndex: 1,
      }} />

      {/* ─── Red Accent Glow ─── */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '40%',
        background: 'radial-gradient(ellipse at 50% 100%, rgba(225,29,72,0.15) 0%, transparent 70%)',
        zIndex: 2, pointerEvents: 'none',
      }} />

      {/* ─── Content ─── */}
      <div style={{ 
        position: 'relative', zIndex: 10, textAlign: 'center', 
        maxWidth: '1100px', width: '100%', padding: '0 2rem',
      }}>

        {/* ──── LUXURY LOGO ──── */}
        <div style={{ marginBottom: '3rem' }}>
          {/* Gear Icon */}
          <div style={{ 
            fontSize: '2.5rem', marginBottom: '1.5rem', 
            filter: 'drop-shadow(0 0 20px rgba(225,29,72,0.4))',
          }}>
            ⚙️
          </div>
          
          {/* BOOGA - Massive Bold */}
          <h1 style={{
            fontSize: 'clamp(4rem, 12vw, 9rem)',
            fontWeight: 950,
            color: '#ffffff',
            lineHeight: 0.85,
            letterSpacing: '0.15em',
            margin: 0,
            textShadow: '0 0 80px rgba(225,29,72,0.3)',
          }}>
            BOOGA
          </h1>
          
          {/* CAR - Gold Bold underneath */}
          <div style={{
            fontSize: 'clamp(1.2rem, 3vw, 2rem)',
            fontWeight: 700,
            color: '#D4AF37',
            letterSpacing: '1.2em',
            marginTop: '0.5rem',
            textTransform: 'uppercase',
            textShadow: '0 0 20px rgba(212,175,55,0.4)',
          }}>
            CAR
          </div>
          
          {/* Gold Line */}
          <div style={{
            width: '80px',
            height: '1.5px',
            background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)',
            margin: '1.2rem auto 0',
            boxShadow: '0 0 15px rgba(212,175,55,0.4)',
          }} />
        </div>

        {/* ──── Tagline ──── */}
        <p style={{
          fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)',
          color: 'rgba(255,255,255,0.6)',
          maxWidth: '600px',
          margin: '0 auto 4rem',
          lineHeight: 1.8,
          fontWeight: 500,
          letterSpacing: '0.5px',
        }}>
          أداء أقوى يبدأ بقطع <span style={{ color: '#fff', fontWeight: 800 }}>أصلية موثوقة</span>
        </p>

        {/* ──── Search Bar ──── */}
        <div style={{ 
          position: 'relative', maxWidth: '800px', margin: '0 auto',
          background: 'rgba(255,255,255,0.1)',
          padding: '0.4rem',
          borderRadius: '20px',
          border: '1px solid rgba(255,255,255,0.18)',
          boxShadow: '0 25px 60px rgba(0,0,0,0.4)',
          backdropFilter: 'blur(10px)',
        }}>
           <SmartSearch />
        </div>

        {/* ──── Category Cards ──── */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(4, 1fr)', 
          gap: '1rem',
          marginTop: '4rem',
          maxWidth: '800px',
          margin: '4rem auto 0',
        }}>
          {[
            { name: 'محركات', img: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&q=80', cat: 'المساعدات والمقصات' },
            { name: 'فرامل', img: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&q=80', cat: 'الفرامل والأقمشة' },
            { name: 'زيوت', img: 'https://images.unsplash.com/photo-1635784063803-6e7e33bf0696?w=400&q=80', cat: 'البواجي والفلاتر' },
            { name: 'كهرباء', img: 'https://images.unsplash.com/photo-1597852074816-d933c7d2b988?w=400&q=80', cat: 'الكهرباء والحساسات' },
          ].map((item, i) => (
            <div
              key={i}
              onClick={() => router.push(`/products?category=${encodeURIComponent(item.cat)}`)}
              className="cat-card"
              style={{
                position: 'relative',
                height: '120px',
                borderRadius: '16px',
                overflow: 'hidden',
                cursor: 'pointer',
                border: '1px solid rgba(255,255,255,0.08)',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              <img 
                src={item.img} 
                alt={item.name}
                style={{ 
                  width: '100%', height: '100%', objectFit: 'cover',
                  transition: 'transform 0.6s ease',
                }}
              />
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.7) 100%)',
                display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
                padding: '0.8rem',
              }}>
                <span style={{ 
                  color: '#fff', fontWeight: 800, fontSize: '0.95rem',
                  letterSpacing: '0.5px',
                }}>
                  {item.name}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* ──── Stats ──── */}
        <div style={{ 
          display: 'flex', justifyContent: 'center', gap: '5rem', 
          marginTop: '5rem',
        }}>
          {[
            { label: 'دقة المطابقة', val: '99.9%', icon: <Shield size={14}/> },
            { label: 'سرعة البحث', val: '0.04s', icon: <Zap size={14}/> },
            { label: 'تغطية عالمية', val: 'Global', icon: <Globe size={14}/> }
          ].map((stat, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ 
                display: 'flex', alignItems: 'center', gap: '0.4rem', 
                color: 'rgba(225,29,72,0.7)', fontSize: '0.7rem', fontWeight: 800, 
                textTransform: 'uppercase', marginBottom: '0.4rem', justifyContent: 'center',
                letterSpacing: '1px',
              }}>
                {stat.icon} {stat.label}
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#fff' }}>
                {stat.val}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ──── Scroll Indicator ──── */}
      <div style={{ 
        position: 'absolute', bottom: '2.5rem', zIndex: 10,
        display: 'flex', flexDirection: 'column', alignItems: 'center', 
        gap: '0.6rem', color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', fontWeight: 600,
        letterSpacing: '2px',
      }}>
        اكتشف المزيد
        <div style={{ animation: 'bounce 2s infinite' }}>
          <ArrowDown size={18} color="rgba(225,29,72,0.6)" />
        </div>
      </div>

      <style jsx>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); opacity: 0.4; }
          50% { transform: translateY(8px); opacity: 1; }
        }
        .cat-card:hover {
          transform: translateY(-4px) !important;
          border-color: rgba(225,29,72,0.3) !important;
          box-shadow: 0 10px 30px rgba(225,29,72,0.15) !important;
        }
        .cat-card:hover img {
          transform: scale(1.15) !important;
        }
        @media (max-width: 640px) {
          .cat-card { height: 90px !important; }
        }
      `}</style>
    </section>
  );
}
