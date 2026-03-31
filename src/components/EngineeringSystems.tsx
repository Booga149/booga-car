"use client";
import React from 'react';
import { Zap, Shield, Cpu, Activity, ArrowLeft, Disc3 } from 'lucide-react';
import { useRouter } from 'next/navigation';

const SYSTEMS = [
  { 
    id: 'power', 
    name: 'القوة والأداء', 
    eng: 'Power & Engine', 
    icon: <Zap size={32} />, 
    categories: ['بواجي', 'فلاتر زيت', 'تيربو', 'كويلات'],
    color: '#f43f5e',
    desc: 'تحسين كفاءة المحرك وزيادة القدرة الحصانية.'
  },
  { 
    id: 'dynamics', 
    name: 'الديناميكا والتحكم', 
    eng: 'Suspension & Steering', 
    icon: <Disc3 size={32} />, 
    categories: ['مساعدات', 'مقصات', 'ميزان', 'عكوس'],
    color: '#3b82f6',
    desc: 'ثبات فائق للسائق وتجربة قيادة مريحة.'
  },
  { 
    id: 'safety', 
    name: 'الأمان والفرملة', 
    eng: 'Safety & Braking', 
    icon: <Shield size={32} />, 
    categories: ['فحمات', 'هوبات', 'ABS', 'زيوت فرامل'],
    color: '#10b981',
    desc: 'تكنولوجيا إيقاف متطورة لضمان سلامتك.'
  },
  { 
    id: 'connection', 
    name: 'الأنظمة الذكية', 
    eng: 'Electronics & Sensors', 
    icon: <Cpu size={32} />, 
    categories: ['حساسات', 'كمبيوترات', 'برمجة', 'إضاءة'],
    color: '#fbbf24',
    desc: 'الربط الكهربائي العصبي للمركبات الحديثة.'
  }
];

export default function EngineeringSystems() {
  const router = useRouter();

  const handleCategoryClick = (cat: string) => {
    router.push(`/products?search=${encodeURIComponent(cat)}`);
  };

  return (
    <section style={{ 
      padding: '8rem 2rem', 
      background: 'var(--background)',
      position: 'relative'
    }}>
      {/* Blueprint Grid Background */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'radial-gradient(var(--border) 1px, transparent 1px)',
        backgroundSize: '30px 30px',
        opacity: 0.1, pointerEvents: 'none'
      }} />

      <div style={{ maxWidth: '1400px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
        
        <div style={{ textAlign: 'left', marginBottom: '4rem', maxWidth: '800px' }}>
          <div style={{ color: 'var(--primary)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '3px', fontSize: '0.8rem', marginBottom: '1rem' }}>
             الهندسة الميكانيكية الدقيقة
          </div>
          <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)', fontWeight: 950, color: 'white', lineHeight: 1.1, marginBottom: '1.5rem' }}>
             حدد <span style={{ color: 'var(--primary)', WebkitTextStroke: '1px var(--primary)', WebkitTextFillColor: 'transparent' }}>النظام</span> الذي ترغب في ترقيته
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: 1.6, fontWeight: 600 }}>
             استكشف عالم الأجزاء المعقدة المصممة خصيصاً لتفوق سيارتك.
          </p>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '2rem' 
        }}>
          {SYSTEMS.map((system) => (
            <div 
              key={system.id}
              style={{
                background: 'rgba(15, 15, 15, 0.8)',
                borderRadius: '32px',
                padding: '2.5rem',
                border: '1px solid var(--border)',
                transition: '0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                position: 'relative',
                overflow: 'hidden',
                cursor: 'default'
              }}
              className="blueprint-card"
            >
              {/* Technical HUD Details */}
              <div style={{ 
                position: 'absolute', top: '1.5rem', right: '1.5rem', 
                fontSize: '0.65rem', fontWeight: 900, color: 'var(--text-secondary)',
                opacity: 0.4, letterSpacing: '2px', textTransform: 'uppercase'
              }}>
                [ {system.eng} ]
              </div>

              {/* Glowing Icon Container */}
              <div style={{ 
                color: system.color, marginBottom: '2.5rem',
                display: 'inline-flex', padding: '1.5rem',
                background: 'rgba(255,255,255,0.03)',
                borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)',
                boxShadow: `0 10px 30px rgba(0,0,0,0.5), 0 0 10px ${system.color}33`
              }}>
                {system.icon}
              </div>

              <h3 style={{ fontSize: '2rem', fontWeight: 950, marginBottom: '1.5rem', color: 'white', letterSpacing: '-0.5px' }}>
                {system.name}
              </h3>

              <p style={{ color: 'rgba(156, 163, 175, 0.8)', lineHeight: 1.6, marginBottom: '2.5rem', fontSize: '1.1rem', fontWeight: 600 }}>
                {system.desc}
              </p>

              {/* Blueprint Sub-categories HUD */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem', marginBottom: '3rem' }}>
                {system.categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => handleCategoryClick(cat)}
                    style={{
                      background: 'rgba(25, 25, 25, 0.8)',
                      border: '1px solid var(--border)',
                      padding: '0.6rem 1.4rem',
                      borderRadius: '16px',
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      color: 'var(--text-secondary)',
                      cursor: 'pointer',
                      transition: '0.3s'
                    }}
                    onMouseOver={e => {
                      e.currentTarget.style.borderColor = system.color;
                      e.currentTarget.style.color = 'white';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseOut={e => {
                      e.currentTarget.style.borderColor = 'var(--border)';
                      e.currentTarget.style.color = 'var(--text-secondary)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <button 
                onClick={() => router.push(`/products?categories=${encodeURIComponent(system.categories.join(','))}`)}
                style={{ 
                  background: 'none', border: 'none', color: system.color, 
                  fontWeight: 900, fontSize: '1.05rem', cursor: 'pointer', 
                  display: 'flex', alignItems: 'center', gap: '0.8rem',
                  padding: '0 0.5rem', borderLeft: `2px solid ${system.color}`
                }}
              >
                 استكشف النظام كاملاً <ArrowLeft size={18} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .blueprint-card:hover {
          transform: translateY(-15px) scale(1.02);
          border-color: var(--primary);
          background: rgba(244, 63, 94, 0.04);
          box-shadow: 0 50px 100px rgba(0,0,0,0.6);
        }
        .blueprint-card:before {
          content: "";
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle at center, rgba(244, 63, 94, 0.05) 0%, transparent 60%);
          opacity: 0;
          transition: 0.4s;
          pointer-events: none;
        }
        .blueprint-card:hover:before {
          opacity: 1;
        }
      `}</style>
    </section>
  );
}
