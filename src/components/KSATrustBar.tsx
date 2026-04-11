"use client";
import React from 'react';
import { ShieldCheck, CreditCard, Smartphone, CheckCircle2, Award } from 'lucide-react';

export default function KSATrustBar() {
  return (
    <section className="ksa-trust-section" style={{
      background: 'var(--surface)',
      borderBottom: '1px solid var(--border)',
      padding: '1.5rem 0',
      overflow: 'hidden'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '2rem',
        padding: '0 2rem'
      }}>
        {/* Trusted by Govt Sections */}
        <div className="trust-badges" style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', opacity: 0.9 }}>
             <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '0.5rem', borderRadius: '10px' }}>
                <ShieldCheck size={20} color="#10b981" />
             </div>
             <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 700 }}>موثق في</div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 900 }}>منصة معروف</div>
             </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', opacity: 0.9 }}>
             <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '0.5rem', borderRadius: '10px' }}>
                <Award size={20} color="#3b82f6" />
             </div>
             <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 700 }}>سجل تجاري</div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 900 }}>1010XXXXXX</div>
             </div>
          </div>
        </div>

        {/* Payment Methods (The Saudi Flex) */}
        <div className="payment-methods" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', background: 'rgba(0,0,0,0.02)', padding: '0.8rem 1.5rem', borderRadius: '20px', border: '1px solid var(--border)' }}>
           <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 800 }}>طرق الدفع الآمنة:</span>
           <div style={{ display: 'flex', gap: '1.2rem', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 900, color: '#3b82f6', fontSize: '0.9rem' }}>
                 mada <span style={{ color: 'var(--primary)' }}>●</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                 <Smartphone size={16} /> Apple Pay
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 800, color: '#8ac926', fontSize: '0.9rem' }}>
                 stc pay
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 800, color: '#4cc9f0', fontSize: '0.9rem' }}>
                 Tabby
              </div>
           </div>
        </div>

        {/* Global Stock Status */}
        <div className="stock-status" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
           <div style={{ position: 'relative' }}>
              <div style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '50%' }} />
              <div style={{ position: 'absolute', top: 0, left: 0, width: '8px', height: '8px', background: '#10b981', borderRadius: '50%', animation: 'ping 1.5s infinite' }} />
           </div>
           <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>شحن جوي سريع من المستودعات العالمية متوفر</span>
        </div>
      </div>

      <style jsx>{`
        @keyframes ping {
          75%, 100% { transform: scale(3); opacity: 0; }
        }
      `}</style>
    </section>
  );
}
