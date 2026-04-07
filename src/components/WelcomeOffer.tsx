"use client";
import React, { useState, useEffect, useRef } from 'react';
import { X, Gift, Sparkles, Copy, CheckCircle2, Crown, Star, Zap, ShieldCheck } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

export default function WelcomeOffer() {
  const [isOpen, setIsOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [countdown, setCountdown] = useState({ h: 2, m: 59, s: 59 });
  const { addToast } = useToast();
  const DISCOUNT_CODE = 'SAUDI15';

  useEffect(() => {
    const hasShown = localStorage.getItem('booga_welcome_shown');
    const isMobile = window.innerWidth <= 768;
    if (!hasShown && !isMobile) {
      const timer = setTimeout(() => {
        setIsOpen(true);
        // Reveal animation after modal appears
        setTimeout(() => setIsRevealed(true), 600);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, []);

  // Countdown timer
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev.s > 0) return { ...prev, s: prev.s - 1 };
        if (prev.m > 0) return { ...prev, m: prev.m - 1, s: 59 };
        if (prev.h > 0) return { h: prev.h - 1, m: 59, s: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  const handleClose = () => {
    setIsRevealed(false);
    setTimeout(() => {
      setIsOpen(false);
      localStorage.setItem('booga_welcome_shown', 'true');
    }, 400);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(DISCOUNT_CODE);
    setIsCopied(true);
    addToast("تم نسخ الكود! استمتع بخصم 15%", "success");
    setTimeout(() => {
      setIsCopied(false);
      handleClose();
    }, 2000);
  };

  if (!isOpen) return null;

  const padNum = (n: number) => n.toString().padStart(2, '0');

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      zIndex: 2000000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
      padding: '1.5rem', 
      background: 'rgba(0, 0, 0, 0.92)',
      backdropFilter: 'blur(20px)',
      animation: 'offerOverlayIn 0.4s ease',
      overflowY: 'auto',
    }}>
      <div style={{
        width: '100%', maxWidth: '560px',
        margin: 'clamp(2rem, 10vw, 6rem) auto 2rem',
        borderRadius: '36px', 
        border: '1px solid rgba(255,215,0,0.15)',
        boxShadow: '0 50px 100px rgba(0,0,0,0.7), 0 0 80px rgba(255,215,0,0.05)',
        position: 'relative', overflow: 'hidden',
        background: '#050508',
        animation: 'offerCardIn 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        transform: isRevealed ? 'scale(1)' : 'scale(0.95)',
        opacity: isRevealed ? 1 : 0,
        transition: 'transform 0.4s ease, opacity 0.4s ease',
      }}>
        
        {/* === HEADER: Cinematic Gold Background === */}
        <div style={{ 
          height: 'clamp(160px, 35vw, 240px)', position: 'relative', overflow: 'hidden',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        }}>
          {/* Base gradient */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(160deg, #1a1000 0%, #0d0800 30%, #151005 60%, #000 100%)',
          }} />
          
          {/* Golden light beam */}
          <div style={{
            position: 'absolute', top: '-100px', left: '50%', transform: 'translateX(-50%)',
            width: '300px', height: '500px',
            background: 'linear-gradient(180deg, rgba(255,215,0,0.15) 0%, rgba(255,165,0,0.05) 50%, transparent 100%)',
            filter: 'blur(40px)',
            animation: 'offerBeamPulse 4s ease-in-out infinite',
          }} />
          
          {/* Radial glow */}
          <div style={{
            position: 'absolute',
            width: '250px', height: '250px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,215,0,0.12) 0%, transparent 70%)',
            animation: 'offerGlowPulse 3s ease-in-out infinite',
          }} />
          
          {/* Grid pattern */}
          <div style={{
            position: 'absolute', inset: 0, opacity: 0.03,
            backgroundImage: 'radial-gradient(rgba(255,215,0,0.5) 1px, transparent 1px)',
            backgroundSize: '30px 30px',
          }} />

          {/* Animated particles */}
          {[...Array(8)].map((_, i) => (
            <div key={i} style={{
              position: 'absolute',
              width: `${2 + Math.random() * 4}px`,
              height: `${2 + Math.random() * 4}px`,
              borderRadius: '50%',
              background: `rgba(255, ${190 + Math.random() * 65}, 0, ${0.3 + Math.random() * 0.5})`,
              left: `${10 + Math.random() * 80}%`,
              top: `${10 + Math.random() * 80}%`,
              animation: `offerParticle ${4 + Math.random() * 6}s ease-in-out ${Math.random() * 2}s infinite`,
            }} />
          ))}
          
          {/* Crown icon with glow ring */}
          <div style={{
            position: 'relative', zIndex: 10,
            marginBottom: '1.2rem',
          }}>
            {/* Outer glow ring */}
            <div style={{
              position: 'absolute', inset: '-20px',
              borderRadius: '50%',
              border: '2px solid rgba(255,215,0,0.1)',
              animation: 'offerRingPulse 2s ease-in-out infinite',
            }} />
            <div style={{
              position: 'absolute', inset: '-35px',
              borderRadius: '50%',
              border: '1px solid rgba(255,215,0,0.05)',
              animation: 'offerRingPulse 2s ease-in-out 0.3s infinite',
            }} />
            <div style={{
              background: 'linear-gradient(135deg, rgba(255,215,0,0.2), rgba(255,165,0,0.1))',
              padding: '1.5rem', borderRadius: '50%',
              border: '1px solid rgba(255,215,0,0.15)',
              boxShadow: '0 10px 40px rgba(255,215,0,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Gift size={52} color="#FFD700" style={{ 
                filter: 'drop-shadow(0 0 10px rgba(255,215,0,0.4))',
                animation: 'offerGiftBounce 2.5s ease-in-out infinite' 
              }} />
            </div>
          </div>
           
          {/* Badge */}
          <div style={{ 
            position: 'relative', zIndex: 10,
            display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', fontWeight: 900,
            background: 'linear-gradient(135deg, rgba(255,215,0,0.15), rgba(255,165,0,0.08))',
            padding: '0.5rem 1.4rem', borderRadius: '40px',
            border: '1px solid rgba(255,215,0,0.2)',
            color: '#FFD700',
            backdropFilter: 'blur(10px)',
          }}>
            <Sparkles size={14} /> عرض ترحيبي حصري
          </div>
          
          {/* Countdown Timer */}
          <div style={{
            position: 'absolute', bottom: '12px',
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            zIndex: 10,
          }}>
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem', fontWeight: 700 }}>ينتهي خلال</span>
            <div style={{ display: 'flex', gap: '0.3rem' }}>
              {[padNum(countdown.h), padNum(countdown.m), padNum(countdown.s)].map((val, i) => (
                <React.Fragment key={i}>
                  <div style={{
                    background: 'rgba(255,215,0,0.08)',
                    border: '1px solid rgba(255,215,0,0.12)',
                    borderRadius: '8px', padding: '0.3rem 0.5rem',
                    color: '#FFD700', fontSize: '0.85rem', fontWeight: 900,
                    fontFamily: 'monospace', minWidth: '32px', textAlign: 'center',
                  }}>{val}</div>
                  {i < 2 && <span style={{ color: 'rgba(255,215,0,0.4)', fontWeight: 900, fontSize: '0.85rem' }}>:</span>}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* === CONTENT === */}
        <div style={{ padding: 'clamp(1.5rem, 4vw, 2.5rem) clamp(1.2rem, 4vw, 2.5rem) clamp(1rem, 3vw, 2rem)', textAlign: 'center' }}>
          <h2 style={{ 
            fontSize: 'clamp(1.3rem, 4vw, 2rem)', fontWeight: 950, marginBottom: '0.8rem', 
            color: 'white', lineHeight: 1.2 
          }}>
            مرحباً بك في{' '}
            <span style={{ 
              background: 'linear-gradient(135deg, #FFD700, #FFA500)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>بوجا كار</span>
          </h2>
           
          <p style={{ 
            color: 'rgba(255,255,255,0.45)', fontSize: '1rem', fontWeight: 600, 
            lineHeight: 1.6, marginBottom: '2rem' 
          }}>
            يسعدنا اختيارك لنا. احصل على خصم{' '}
            <span style={{ 
              fontWeight: 900, color: '#FFD700',
              textShadow: '0 0 10px rgba(255,215,0,0.3)',
            }}>15%</span>{' '}
            على أول طلب لسيارتك اليوم!
          </p>

          {/* Discount Code Card */}
          <div style={{ 
            background: 'rgba(255,215,0,0.03)', 
            border: '2px dashed rgba(255,215,0,0.15)',
            padding: '1.5rem 2rem', borderRadius: '20px', position: 'relative',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
            marginBottom: '1.5rem', overflow: 'hidden',
          }}>
            {/* Background shimmer */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(90deg, transparent, rgba(255,215,0,0.04), transparent)',
              animation: 'offerShimmer 3s ease infinite',
            }} />
            
            <div style={{ textAlign: 'right', position: 'relative', zIndex: 1 }}>
              <div style={{ 
                fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', fontWeight: 800, 
                textTransform: 'uppercase', marginBottom: '0.3rem', letterSpacing: '1px',
              }}>كود الخصم الحصري</div>
              <div style={{ 
                fontSize: '1.8rem', fontWeight: 950, 
                background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '3px',
                filter: 'drop-shadow(0 0 8px rgba(255,215,0,0.2))',
              }}>{DISCOUNT_CODE}</div>
            </div>
             
            <button 
              onClick={handleCopy}
              style={{
                background: isCopied 
                  ? 'linear-gradient(135deg, #10b981, #059669)' 
                  : 'linear-gradient(135deg, #FFD700, #FFA500)',
                color: isCopied ? 'white' : '#000', 
                border: 'none', padding: '1rem 1.5rem', borderRadius: '16px',
                fontWeight: 900, fontSize: '0.95rem', cursor: 'pointer', 
                display: 'flex', alignItems: 'center', gap: '0.6rem',
                transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                boxShadow: isCopied 
                  ? '0 10px 30px rgba(16, 185, 129, 0.3)' 
                  : '0 10px 30px rgba(255, 215, 0, 0.2)',
                position: 'relative', zIndex: 1,
              }}
              onMouseOver={e => {
                if (!isCopied) {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 14px 35px rgba(255, 215, 0, 0.35)';
                }
              }}
              onMouseOut={e => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = isCopied 
                  ? '0 10px 30px rgba(16, 185, 129, 0.3)' 
                  : '0 10px 30px rgba(255, 215, 0, 0.2)';
              }}
            >
              {isCopied ? <CheckCircle2 size={20}/> : <Copy size={20}/>}
              {isCopied ? 'تم النسخ!' : 'انسخ الكود'}
            </button>
          </div>

          {/* Trust features */}
          <div style={{
            display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '1.5rem',
            flexWrap: 'wrap',
          }}>
            {[
              { icon: <ShieldCheck size={14} />, text: 'ضمان أصلي' },
              { icon: <Zap size={14} />, text: 'شحن سريع' },
              { icon: <Star size={14} />, text: 'تقييم 4.9★' },
            ].map((item, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                color: 'rgba(255,255,255,0.35)', fontSize: '0.75rem', fontWeight: 700,
              }}>
                <span style={{ color: 'rgba(255,215,0,0.5)' }}>{item.icon}</span>
                {item.text}
              </div>
            ))}
          </div>
           
          <button 
            onClick={handleClose}
            style={{ 
              background: 'transparent', border: 'none', 
              color: 'rgba(255,255,255,0.3)', 
              fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
              transition: 'color 0.2s',
            }}
            onMouseOver={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
            onMouseOut={e => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}
          >
            سأكتشف الموقع أولاً
          </button>
        </div>

        {/* Close Icon */}
        <button 
          onClick={handleClose}
          style={{ 
            position: 'absolute', top: '1.2rem', left: '1.2rem', 
            background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)', 
            border: '1px solid rgba(255,255,255,0.08)', 
            width: '38px', height: '38px', borderRadius: '50%', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s', backdropFilter: 'blur(10px)',
            zIndex: 20,
          }}
          onMouseOver={e => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.12)';
            e.currentTarget.style.color = 'white';
          }}
          onMouseOut={e => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
            e.currentTarget.style.color = 'rgba(255,255,255,0.5)';
          }}
        >
          <X size={18} />
        </button>
      </div>

      <style jsx>{`
        @keyframes offerOverlayIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes offerCardIn {
          from { opacity: 0; transform: scale(0.88) translateY(30px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes offerGiftBounce {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          25% { transform: translateY(-8px) rotate(-5deg); }
          75% { transform: translateY(-4px) rotate(5deg); }
        }
        @keyframes offerBeamPulse {
          0%, 100% { opacity: 0.5; transform: translateX(-50%) scaleY(1); }
          50% { opacity: 1; transform: translateX(-50%) scaleY(1.1); }
        }
        @keyframes offerGlowPulse {
          0%, 100% { transform: scale(0.9); opacity: 0.6; }
          50% { transform: scale(1.15); opacity: 1; }
        }
        @keyframes offerRingPulse {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.08); opacity: 1; }
        }
        @keyframes offerParticle {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.2; }
          33% { transform: translateY(-20px) translateX(10px); opacity: 0.8; }
          66% { transform: translateY(-40px) translateX(-5px); opacity: 0.4; }
        }
        @keyframes offerShimmer {
          0% { transform: translateX(-100%); }
          50%, 100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
