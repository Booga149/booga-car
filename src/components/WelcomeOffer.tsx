"use client";
import React, { useState, useEffect } from 'react';
import { X, Gift, Sparkles, Copy, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

export default function WelcomeOffer() {
  const [isOpen, setIsOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const { addToast } = useToast();
  const DISCOUNT_CODE = 'SAUDI15';

  useEffect(() => {
    // Check if user has already seen the welcome offer
    const hasShown = localStorage.getItem('booga_welcome_shown');
    if (!hasShown) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 3500); // 3.5s delay for impact
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('booga_welcome_shown', 'true');
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

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1.5rem', background: 'rgba(10, 10, 10, 0.95)',
      animation: 'fadeIn 0.4s ease'
    }}>
      <div style={{
        background: 'var(--surface)',
        width: '100%', maxWidth: '520px',
        borderRadius: '40px', border: '1px solid var(--border)',
        boxShadow: '0 50px 100px rgba(0,0,0,0.5)',
        position: 'relative', overflow: 'hidden',
        animation: 'zoomIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
      }}>
        {/* Visual Header */}
        <div style={{ 
          height: '240px', position: 'relative', 
          background: 'linear-gradient(135deg, var(--primary) 0%, #064e3b 100%)', // Booga Red to Saudi Green
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white'
        }}>
           <div style={{ position: 'absolute', inset: 0, opacity: 0.1, backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
           
           <div style={{ 
              background: 'rgba(255,255,255,0.2)', padding: '1.5rem', borderRadius: '50%', marginBottom: '1.5rem',
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
           }}>
              <Gift size={64} style={{ animation: 'bounce 2s infinite' }} />
           </div>

           <div style={{ 
              display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '1rem', fontWeight: 900,
              background: 'rgba(0,0,0,0.2)', padding: '0.5rem 1.2rem', borderRadius: '40px'
           }}>
              <Sparkles size={16} color="#fbbf24" /> هدية ترحيبية من بوجا كار
           </div>
        </div>

        {/* Content */}
        <div style={{ padding: '3.5rem 2.5rem', textAlign: 'center' }}>
           <h2 style={{ fontSize: '2.2rem', fontWeight: 950, marginBottom: '1.2rem', color: 'var(--text-primary)', lineHeight: 1.2 }}>
              أهلاً بك في <br/> <span style={{ color: 'var(--primary)' }}>عالم الهندسة</span>
           </h2>
           
           <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', fontWeight: 600, lineHeight: 1.6, marginBottom: '2.5rem' }}>
              يسعدنا اختيارك لـ Booga Car. احصل على خصم <span style={{ fontWeight: 900, color: 'var(--text-primary)' }}>15%</span> على أول طلب لسيارتك اليوم!
           </p>

           <div style={{ 
              background: 'var(--background)', border: '2px dashed var(--border)', 
              padding: '1.2rem 2rem', borderRadius: '24px', position: 'relative',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2.5rem'
           }}>
              <div style={{ textAlign: 'right' }}>
                 <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.2rem' }}>كود الخصم الحصري</div>
                 <div style={{ fontSize: '1.8rem', fontWeight: 950, color: 'var(--text-primary)', letterSpacing: '2px' }}>{DISCOUNT_CODE}</div>
              </div>
              
              <button 
                onClick={handleCopy}
                style={{
                  background: isCopied ? '#10b981' : 'var(--primary)',
                  color: 'white', border: 'none', padding: '1rem 1.5rem', borderRadius: '16px',
                  fontWeight: 900, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.6rem',
                  transition: '0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  boxShadow: isCopied ? '0 10px 20px rgba(16, 185, 129, 0.3)' : '0 10px 20px rgba(244, 63, 94, 0.3)'
                }}
              >
                 {isCopied ? <CheckCircle2 size={20}/> : <Copy size={20}/>}
                 {isCopied ? 'تم النسخ!' : 'سجل الكود'}
              </button>
           </div>

           <button 
             onClick={handleClose}
             style={{ 
               background: 'transparent', border: 'none', color: 'var(--text-secondary)', 
               fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer', textDecoration: 'underline'
             }}
           >
              سأكتشف الموقع أولاً
           </button>
        </div>

        {/* Close Icon */}
        <button 
          onClick={handleClose}
          style={{ 
            position: 'absolute', top: '1.5rem', left: '1.5rem', 
            background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', 
            width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
        >
           <X size={20} />
        </button>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes zoomIn {
          from { opacity: 0; transform: scale(0.9) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
}
