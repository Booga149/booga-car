"use client";
import React from 'react';
import Navbar from '@/components/Navbar';

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
      IconComponent: BarChart3,
      title: "Ù„ÙˆØ­Ø© ØªØ­ÙƒÙ… Ø§Ø­ØªØ±Ø§ÙÙŠØ©",
      desc: "Ø¥Ø¯Ø§Ø±Ø© Ù…ØªÙƒØ§Ù…Ù„Ø© Ù„Ù…Ù†ØªØ¬Ø§ØªÙƒØŒ Ù…Ø¨ÙŠØ¹Ø§ØªÙƒØŒ ÙˆØªÙ‚Ø§Ø±ÙŠØ± Ø£Ø¯Ø§Ø¡ Ù…ØªØ¬Ø±Ùƒ Ù„Ø­Ø¸Ø© Ø¨Ù„Ø­Ø¸Ø©."
    },
    {
      IconComponent: ShieldCheck,
      title: "ØªÙˆØ«ÙŠÙ‚ ÙˆÙ…ØµØ¯Ø§Ù‚ÙŠØ©",
      desc: "Ø§Ø­ØµÙ„ Ø¹Ù„Ù‰ Ø´Ø§Ø±Ø© 'ØªØ§Ø¬Ø± Ù…ÙˆØ«ÙˆÙ‚' Ù„Ø±ÙØ¹ Ù…Ø¨ÙŠØ¹Ø§ØªÙƒ ÙˆØ¨Ù†Ø§Ø¡ Ø«Ù‚Ø© Ù‚ÙˆÙŠØ© Ù…Ø¹ Ø¹Ù…Ù„Ø§Ø¦Ùƒ."
    },
    {
      IconComponent: Rocket,
      title: "Ø§Ù†ØªØ´Ø§Ø± ÙˆØ§Ø³Ø¹",
      desc: "Ø§Ø¹Ø±Ø¶ Ù‚Ø·Ø¹Ùƒ Ù„Ù…Ù„Ø§ÙŠÙŠÙ† Ø§Ù„Ø¨Ø§Ø­Ø«ÙŠÙ† Ø¹Ù† Ù‚Ø·Ø¹ Ø§Ù„ØºÙŠØ§Ø± ÙÙŠ Ø§Ù„Ù…Ù…Ù„ÙƒØ© ÙˆØ§Ù„Ø®Ù„ÙŠØ¬."
    },
    {
      IconComponent: Target,
      title: "Ø¹Ù…ÙˆÙ„Ø§Øª Ù…Ù†Ø§ÙØ³Ø©",
      desc: "Ù†Ø­Ù† Ù†Ù‡ØªÙ… Ø¨Ù†Ù…Ùˆ ØªØ¬Ø§Ø±ØªÙƒØŒ Ù„Ø°Ø§ Ù†ÙˆÙØ± Ù„Ùƒ Ø£ÙØ¶Ù„ Ù‡ÙŠÙƒÙ„ Ø¹Ù…ÙˆÙ„Ø§Øª ÙÙŠ Ø§Ù„Ø³ÙˆÙ‚."
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
            <Zap size={16} fill="var(--primary)" /> Ø¨ÙˆØ¬Ø§ Ù„Ù„Ø£Ø¹Ù…Ø§Ù„ - BOOGA FOR BUSINESS
          </div>
          
          <h1 style={{ 
            fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 950, lineHeight: 1.1,
            letterSpacing: '-2px', marginBottom: '1.5rem', color: 'var(--text-primary)'
          }}>
            Ø§Ù†Ù‚Ù„ ØªØ¬Ø§Ø±ØªÙƒ Ù„Ù…Ø³ØªÙˆÙ‰ <span style={{ color: 'var(--primary)', textShadow: '0 0 30px rgba(244, 63, 94, 0.3)' }}>Ø§Ù„Ø§Ø­ØªØ±Ø§Ù</span>
          </h1>
          
          <p style={{ 
            fontSize: '1.25rem', color: 'var(--text-secondary)', lineHeight: 1.8,
            maxWidth: '700px', margin: '0 auto 3rem', fontWeight: 600
          }}>
            Ø§Ù„Ù…Ù†ØµØ© Ø§Ù„Ø£ÙˆÙ„Ù‰ Ø§Ù„Ù…Ø®ØµØµØ© Ù„Ù…Ø³Ø§Ø¹Ø¯Ø© ØªØ¬Ø§Ø± Ù‚Ø·Ø¹ Ø§Ù„ØºÙŠØ§Ø± ÙÙŠ Ø§Ù„Ù†Ù…Ùˆ ÙˆØ§Ù„Ø§Ù†ØªØ´Ø§Ø± Ø§Ù„Ø±Ù‚Ù…ÙŠ. Ø§Ù†Ø¶Ù… Ù„Ø£ÙƒØ¨Ø± ØªØ¬Ù…Ø¹ Ù„Ù„Ù…Ø­ØªØ±ÙÙŠÙ† ÙÙŠ Ø§Ù„Ù…Ù…Ù„ÙƒØ©.
          </p>
          
          <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/become-dealer/form" style={{ 
              background: 'var(--primary)', color: 'white', padding: '1.2rem 2.8rem',
              borderRadius: '16px', fontWeight: 900, fontSize: '1.2rem', textDecoration: 'none',
              boxShadow: '0 10px 40px rgba(244, 63, 94, 0.4)', transition: 'all 0.3s ease',
              display: 'flex', alignItems: 'center', gap: '0.8rem'
            }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
              Ø§Ø¨Ø¯Ø£ Ø§Ù„Ø¢Ù† ÙƒØªØ§Ø¬Ø± <ChevronLeft size={24} />
            </Link>
            
            <a href="#benefits" style={{ 
              background: 'var(--surface)', color: 'var(--text-primary)', padding: '1.2rem 2.8rem',
              borderRadius: '16px', fontWeight: 800, fontSize: '1.2rem', textDecoration: 'none',
              border: '1px solid var(--border)', transition: 'all 0.3s ease'
            }} onMouseOver={e => e.currentTarget.style.background = 'var(--surface-hover)'} onMouseOut={e => e.currentTarget.style.background = 'var(--surface)'}>
              Ø§ÙƒØªØ´Ù Ø§Ù„Ù…Ø²Ø§ÙŠØ§
            </a>
          </div>
        </div>
        
        {/* Background Decorative Elements */}
        <div style={{ position: 'absolute', top: '10%', left: '-5%', width: '300px', height: '300px', background: 'var(--primary)', filter: 'blur(150px)', opacity: 0.1, pointerEvents: 'none' }}></div>
      </section>

      {/* Benefits Grid */}
      <section id="benefits" style={{ padding: '6rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
          <h2 style={{ fontSize: '2.8rem', fontWeight: 900, marginBottom: '1rem' }}>Ù„Ù…Ø§Ø°Ø§ ØªØ®ØªØ§Ø± Ø¨ÙˆØ¬Ø§ Ù„Ù„Ø£Ø¹Ù…Ø§Ù„ØŸ</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', fontWeight: 600 }}>Ù†Ù‚Ø¯Ù… Ù„Ùƒ Ø§Ù„Ø£Ø¯ÙˆØ§Øª Ø§Ù„Ù„Ø§Ø²Ù…Ø© Ù„Ù„Ø³ÙŠØ·Ø±Ø© Ø¹Ù„Ù‰ Ø³ÙˆÙ‚ Ù‚Ø·Ø¹ Ø§Ù„ØºÙŠØ§Ø± Ø§Ù„Ø±Ù‚Ù…ÙŠ.</p>
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
                <benefit.IconComponent size={32} />
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.2rem' }}>{benefit.title}</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontWeight: 500 }}>{benefit.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Showcase */}
      <section style={{ padding: '6rem 2rem', background: 'var(--surface)', position: 'relative' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '5rem', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '2.8rem', fontWeight: 950, marginBottom: '2rem', letterSpacing: '-1px' }}>Ø«Ù‚Ø© Ø§Ù„Ø¹Ù…ÙŠÙ„ Ù‡ÙŠ <span style={{ color: 'var(--primary)' }}>Ø±Ø£Ø³ Ù…Ø§Ù„Ùƒ</span></h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {[
                { title: "Ø´Ø§Ø±Ø© Ø§Ù„ØªÙˆØ«ÙŠÙ‚ Ø§Ù„Ø°Ù‡Ø¨ÙŠØ©", desc: "ØªØ¸Ù‡Ø± Ø¨Ø¬Ø§Ù†Ø¨ Ø§Ø³Ù… Ù…Ø­Ù„Ùƒ ÙÙŠ Ø§Ù„Ø¨Ø­Ø« Ù„ØªØ¹Ø·ÙŠ Ø§Ù„Ø¹Ù…ÙŠÙ„ Ø¶Ù…Ø§Ù† Ø§Ù„Ø¬ÙˆØ¯Ø©." },
                { title: "Ù†Ø¸Ø§Ù… Ø§Ù„ØªÙ‚ÙŠÙŠÙ… Ø§Ù„Ù…ÙˆØ«ÙˆÙ‚", desc: "Ø§Ø¬Ù…Ø¹ ØªÙ‚ÙŠÙŠÙ…Ø§Øª Ø¹Ù…Ù„Ø§Ø¦Ùƒ ÙˆØ§Ø¨Ù†Ù Ø³Ù…Ø¹Ø© ØªØ¬Ø§Ø±ÙŠØ© Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠØ© Ù‚ÙˆÙŠØ©." },
                { title: "Ø®ÙŠØ§Ø±Ø§Øª Ø¯ÙØ¹ Ù…ØªÙ†ÙˆØ¹Ø©", desc: "Ù†Ø¯Ø¹Ù… ÙˆÙ…Ø¯Ù‰ØŒ ÙÙŠØ²Ø§ØŒ ÙˆÙ…Ø§Ø³ØªØ±ÙƒØ§Ø±Ø¯ Ù„Ø¶Ù…Ø§Ù† Ø³Ù‡ÙˆÙ„Ø© Ø§Ù„Ø´Ø±Ø§Ø¡." }
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
              background: 'var(--surface)',
              borderRadius: '40px', padding: '1rem', border: '1px solid var(--border)',
              boxShadow: 'var(--card-shadow)'
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
                    <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>Ù…ØªØ¬Ø± Ù‚Ø·Ø¹ Ø§Ù„ØºÙŠØ§Ø± Ø§Ù„Ù…Ø¹ØªÙ…Ø¯</span>
                  </div>
                  <div style={{ marginTop: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Ø³Ø¬Ù„ Ø§Ù„Ø¢Ù† ÙˆØ§ÙØªØ­ ÙØ±Ø¹Ùƒ Ø§Ù„Ø±Ù‚Ù…ÙŠ Ø§Ù„Ø£ÙˆÙ„.</div>
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
            <div style={{ fontWeight: 800, color: 'var(--text-secondary)' }}>ØªØ§Ø¬Ø± Ù…Ø³Ø¬Ù„ ÙÙŠ Ø§Ù„Ù…Ù…Ù„ÙƒØ©</div>
          </div>
          <div>
            <div style={{ fontSize: '3.5rem', fontWeight: 950, color: 'var(--primary)' }}>100K</div>
            <div style={{ fontWeight: 800, color: 'var(--text-secondary)' }}>Ø²Ø§Ø¦Ø± Ø´Ù‡Ø±ÙŠ Ù†Ø´Ø·</div>
          </div>
          <div>
            <div style={{ fontSize: '3.5rem', fontWeight: 950, color: 'var(--primary)' }}>%98</div>
            <div style={{ fontWeight: 800, color: 'var(--text-secondary)' }}>Ø±Ø¶Ø§ Ø§Ù„ØªØ¬Ø§Ø±</div>
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
          <h2 style={{ fontSize: '3rem', fontWeight: 950, marginBottom: '1.5rem', letterSpacing: '-1px' }}>Ø¬Ø§Ù‡Ø² Ù„Ù„ØªÙˆØ³Ø¹ Ù…Ø¹Ù†Ø§ØŸ</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', marginBottom: '3rem', fontWeight: 600 }}>
            Ù„Ø§ ØªØ¶ÙŠØ¹ Ø§Ù„ÙˆÙ‚ØªØŒ Ø¢Ù„Ø§Ù Ø§Ù„Ø¹Ù…Ù„Ø§Ø¡ ÙŠØ¨Ø­Ø«ÙˆÙ† Ø¹Ù† Ù‚Ø·Ø¹Ùƒ Ø§Ù„Ø¢Ù†. Ø§Ù†Ø¶Ù… Ù„Ø¹Ø§Ø¦Ù„Ø© Ø¨ÙˆØ¬Ø§ ÙƒØ§Ø± Ù„Ù„Ø£Ø¹Ù…Ø§Ù„ Ø§Ù„ÙŠÙˆÙ….
          </p>
          <Link href="/become-dealer/form" style={{ 
            background: 'var(--primary)', color: 'white', padding: '1.5rem 4rem',
            borderRadius: '20px', fontWeight: 950, fontSize: '1.4rem', textDecoration: 'none',
            boxShadow: '0 15px 45px rgba(244, 63, 94, 0.4)', transition: 'all 0.3s ease',
            display: 'inline-flex', alignItems: 'center', gap: '1rem'
          }} onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'} onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}>
            Ø³Ø¬Ù„ ÙƒØªØ§Ø¬Ø± Ø§Ù„Ø¢Ù†
          </Link>
        </div>
      </section>

    </main>
  );
}
