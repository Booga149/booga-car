"use client";
import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { MessageCircle, X, Check, Headset, ShieldCheck } from 'lucide-react';
import { siteConfig } from '@/lib/siteConfig';

export default function WhatsAppHub() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  if (pathname?.startsWith('/checkout') || pathname?.startsWith('/cart')) {
    return null;
  }

  return (
    <div className="desktop-only" style={{ position: 'fixed', bottom: '2.5rem', right: '2.5rem', zIndex: 1000 }}>
      {/* Floating Bubble */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '64px', height: '64px', borderRadius: '50%',
          background: isOpen ? 'var(--surface)' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          color: isOpen ? 'var(--text-primary)' : 'white',
          border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 10px 30px rgba(16, 185, 129, 0.4)',
          transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)'
        }}
      >
        {isOpen ? <X size={28} /> : <MessageCircle size={32} />}
      </button>

      {/* Premium Support Card */}
      {isOpen && (
        <div style={{
          position: 'absolute', bottom: '80px', right: 0,
          width: '320px', background: 'var(--surface)',
          borderRadius: '24px', border: '1px solid var(--border)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
          overflow: 'hidden', padding: '1.5rem',
          animation: 'slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
             <div style={{ position: 'relative' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '18px', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900, fontSize: '1.4rem' }}>
                   A
                </div>
                <div style={{ position: 'absolute', bottom: -4, right: -4, width: '16px', height: '16px', background: '#10b981', border: '3px solid var(--surface)', borderRadius: '50%' }} />
             </div>
             <div>
                <div style={{ fontWeight: 900, color: 'var(--text-primary)', fontSize: '1.1rem' }}>المهندس أحمد</div>
                <div style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                   متصل الآن • خبير قطع غيار <ShieldCheck size={14} />
                </div>
             </div>
          </div>

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
            أهلاً بك في بوجا كار. أنا متخصص في مطابقة قطع الغيار برقم الهيكل، كيف يمكنني خدمتك اليوم؟
          </p>

          <a 
            href={siteConfig.contact.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem',
              background: '#10b981', color: 'white', textDecoration: 'none',
              padding: '1rem', borderRadius: '14px', fontWeight: 800,
              boxShadow: '0 8px 20px rgba(16, 185, 129, 0.2)',
              transition: '0.2s'
            }}
            onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            بدء المحادثة الفورية <MessageCircle size={20} />
          </a>

          <div style={{ marginTop: '1.2rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 600 }}>
             متوسط الرد: أقل من دقيقتين ⚡
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
