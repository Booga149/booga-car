"use client";
import React, { useState } from 'react';
import { Zap, Shield, Cpu, Disc3, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

const SYSTEMS = [
  { 
    id: 'power', 
    name: 'القوة والأداء', 
    eng: 'Power & Engine', 
    icon: <Zap size={28} />, 
    categories: ['بواجي', 'فلاتر زيت', 'تيربو', 'كويلات'],
    color: '#e11d48',
    glow: 'rgba(225,29,72,0.08)',
    desc: 'تحسين كفاءة المحرك وزيادة القدرة الحصانية.'
  },
  { 
    id: 'dynamics', 
    name: 'الديناميكا والتحكم', 
    eng: 'Suspension & Steering', 
    icon: <Disc3 size={28} />, 
    categories: ['مساعدات', 'مقصات', 'ميزان', 'عكوس'],
    color: '#3b82f6',
    glow: 'rgba(59,130,246,0.08)',
    desc: 'ثبات فائق وتجربة قيادة مريحة.'
  },
  { 
    id: 'safety', 
    name: 'الأمان والفرملة', 
    eng: 'Safety & Braking', 
    icon: <Shield size={28} />, 
    categories: ['فحمات', 'هوبات', 'ABS', 'زيوت فرامل'],
    color: '#10b981',
    glow: 'rgba(16,185,129,0.08)',
    desc: 'تكنولوجيا إيقاف متطورة لسلامتك.'
  },
  { 
    id: 'connection', 
    name: 'الأنظمة الذكية', 
    eng: 'Electronics & Sensors', 
    icon: <Cpu size={28} />, 
    categories: ['حساسات', 'كمبيوترات', 'برمجة', 'إضاءة'],
    color: '#eab308',
    glow: 'rgba(234,179,8,0.06)',
    desc: 'الربط الكهربائي العصبي للمركبات الحديثة.'
  }
];

export default function EngineeringSystems() {
  const router = useRouter();
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const handleCategoryClick = (cat: string) => {
    router.push(`/products?search=${encodeURIComponent(cat)}`);
  };

  return (
    <section style={{ 
      padding: '8rem 2rem', 
      background: 'var(--surface-hover)',
      position: 'relative',
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
        
        {/* Section Header */}
        <div style={{ textAlign: 'left', marginBottom: '5rem', maxWidth: '800px' }}>
          <div style={{ 
            color: '#e11d48', fontWeight: 900, textTransform: 'uppercase', 
            letterSpacing: '4px', fontSize: '0.75rem', marginBottom: '1.2rem',
            opacity: 0.8,
          }}>
             الهندسة الميكانيكية الدقيقة
          </div>
          <h2 style={{ 
            fontSize: 'clamp(2rem, 4vw, 3.2rem)', fontWeight: 950, 
            color: 'var(--text-primary)', lineHeight: 1.1, marginBottom: '1.5rem' 
          }}>
             حدد <span style={{ color: '#e11d48' }}>النظام</span> الذي ترغب في ترقيته
          </h2>
          <p style={{ 
            color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.7, fontWeight: 500 
          }}>
             استكشف عالم الأجزاء المعقدة المصممة خصيصاً لتفوق سيارتك.
          </p>
        </div>

        {/* Cards Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '1.5rem' 
        }}>
          {SYSTEMS.map((system) => {
            const isHovered = hoveredId === system.id;
            return (
              <div 
                key={system.id}
                onMouseEnter={() => setHoveredId(system.id)}
                onMouseLeave={() => setHoveredId(null)}
                style={{
                  background: 'var(--surface)',
                  borderRadius: '24px',
                  padding: '2.5rem',
                  border: `1px solid ${isHovered ? `${system.color}40` : 'var(--border)'}`,
                  transition: 'all 0.5s cubic-bezier(0.23, 1, 0.32, 1)',
                  position: 'relative',
                  overflow: 'hidden',
                  cursor: 'default',
                  transform: isHovered ? 'translateY(-12px)' : 'translateY(0)',
                  boxShadow: isHovered 
                    ? `0 30px 80px rgba(0,0,0,0.06), 0 0 40px ${system.glow}` 
                    : 'var(--card-shadow)',
                }}
              >
                {/* Muted Glow Background */}
                <div style={{
                  position: 'absolute', top: '-30%', right: '-30%',
                  width: '60%', height: '60%',
                  background: `radial-gradient(circle, ${system.color}${isHovered ? '12' : '06'}, transparent 70%)`,
                  transition: 'all 0.5s ease',
                  pointerEvents: 'none',
                }} />

                {/* Technical Label */}
                <div style={{ 
                  position: 'absolute', top: '1.5rem', right: '1.5rem', 
                  fontSize: '0.6rem', fontWeight: 800, color: 'rgba(0,0,0,0.15)',
                  letterSpacing: '2px', textTransform: 'uppercase'
                }}>
                  [ {system.eng} ]
                </div>

                {/* Icon with Glow */}
                <div style={{ 
                  color: system.color, marginBottom: '2rem',
                  display: 'inline-flex', padding: '1.2rem',
                  background: `${system.color}08`,
                  borderRadius: '18px', 
                  border: `1px solid ${system.color}15`,
                  boxShadow: isHovered ? `0 8px 25px ${system.color}20` : 'none',
                  transition: 'all 0.4s ease',
                }}>
                  {system.icon}
                </div>

                {/* Title */}
                <h3 style={{ 
                  fontSize: '1.6rem', fontWeight: 950, marginBottom: '1rem', 
                  color: 'var(--text-primary)', letterSpacing: '-0.3px' 
                }}>
                  {system.name}
                </h3>

                {/* Description - smaller, more transparent */}
                <p style={{ 
                  color: 'var(--text-secondary)', lineHeight: 1.7, 
                  marginBottom: '2rem', fontSize: '0.92rem', fontWeight: 500 
                }}>
                  {system.desc}
                </p>

                {/* Sub-categories */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', marginBottom: '2.5rem' }}>
                  {system.categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => handleCategoryClick(cat)}
                      style={{
                        background: 'rgba(0,0,0,0.03)',
                        border: '1px solid var(--border)',
                        padding: '0.5rem 1.2rem',
                        borderRadius: '12px',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseOver={e => {
                        e.currentTarget.style.borderColor = `${system.color}60`;
                        e.currentTarget.style.color = system.color;
                        e.currentTarget.style.background = `${system.color}10`;
                      }}
                      onMouseOut={e => {
                        e.currentTarget.style.borderColor = 'var(--border)';
                        e.currentTarget.style.color = 'var(--text-secondary)';
                        e.currentTarget.style.background = 'rgba(0,0,0,0.03)';
                      }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Explore Button - appears on hover */}
                <button 
                  onClick={() => router.push(`/products?multi_search=${encodeURIComponent(system.categories.join(','))}`)}
                  style={{ 
                    background: 'none', border: 'none', color: system.color, 
                    fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer', 
                    display: 'flex', alignItems: 'center', gap: '0.8rem',
                    padding: '0.5rem 0',
                    opacity: isHovered ? 1 : 0,
                    transform: isHovered ? 'translateX(0)' : 'translateX(10px)',
                    transition: 'all 0.4s ease',
                    letterSpacing: '0.3px',
                  }}
                >
                   استكشف النظام <ArrowLeft size={16} />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
