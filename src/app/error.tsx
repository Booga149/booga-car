"use client";

import { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { AlertTriangle } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error securely to our own database error logger.
    const logErrorToDB = async () => {
      try {
        await fetch('/api/log-error', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            errorName: error.name || 'UnknownError',
            errorMessage: error.message || String(error),
            url: window.location.href,
            userId: localStorage.getItem('supabase.auth.token') ? 'مسجل الدخول' : 'زائر',
          })
        });
      } catch (err) {
        console.error("Failed to log system error to DB:", err);
      }
    };
    logErrorToDB();
  }, [error]);

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--background)' }}>
      <Navbar />
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem' }}>
        <div className="glass-panel" style={{ 
          textAlign: 'center', padding: '4rem 2rem', maxWidth: '600px', width: '100%', 
          borderRadius: '24px', border: '1px solid var(--border)', 
          background: 'var(--surface)', boxShadow: 'var(--card-shadow)'
        }}>
          <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
            <AlertTriangle size={64} color="#f43f5e" />
          </div>
          <h1 style={{ color: 'var(--text-primary)', marginBottom: '1rem', fontSize: '2.5rem', fontWeight: 900 }}>
            عذراً، حدث خطأ فني مفاجئ
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '2rem', lineHeight: 1.6 }}>
            واجه النظام مشكلة أثناء معالجة طلبك. تم إرسال تقرير فوري للإدارة الفنية لحل هذه المشكلة بأسرع وقت. نعتذر عن هذا الإزعاج!
          </p>
          <button 
            onClick={() => reset()}
            style={{ 
              padding: '1.2rem 2.5rem', background: 'var(--primary)', color: 'white', 
              border: 'none', borderRadius: '14px', fontSize: '1.1rem', fontWeight: 900, 
              cursor: 'pointer', boxShadow: '0 8px 25px rgba(244, 63, 94, 0.3)', transition: 'all 0.3s'
            }}
            onMouseOver={e => e.currentTarget.style.transform = 'translateY(-3px)'}
            onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            حاول مرة أخرى
          </button>
        </div>
      </div>
    </main>
  );
}
