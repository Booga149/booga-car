"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function AuthCallbackPage() {
  const [status, setStatus] = useState('جاري التحقق... يرجى الانتظار');

  useEffect(() => {
    let disposed = false;
    
    const goHome = (path = '/') => {
      if (!disposed) {
        disposed = true;
        window.location.replace(path);
      }
    };

    const processAuth = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            console.warn('Exchange code error:', error.message);
          }
        } else if (accessToken) {
            const { error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: hashParams.get('refresh_token') || '',
            });
            if (error) console.warn('Set session error:', error.message);
        }

        // Add a delay to allow Supabase to persist the session securely to browser storage
        setTimeout(async () => {
          if (disposed) return;
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            setStatus('تم تسجيل الدخول بنجاح! ✅');
            setTimeout(() => goHome('/'), 1000);
          } else {
            console.warn('No session found after exchange.');
            setStatus('فشل تسجيل الدخول، جاري التوجيه...');
            setTimeout(() => goHome('/'), 2000);
          }
        }, 1500);

      } catch (err) {
        console.error('Auth callback exception:', err);
        setStatus('حدث خطأ، جاري إعادة التوجيه...');
        setTimeout(() => goHome('/'), 2000);
      }
    };

    if (typeof window !== 'undefined') {
       processAuth();
    }

    return () => {
      disposed = true;
    };
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--background, #f8f9fa)',
      direction: 'rtl',
    }}>
      <div style={{
        textAlign: 'center',
        padding: '3rem',
        borderRadius: '24px',
        background: 'var(--surface, white)',
        boxShadow: '0 4px 30px rgba(0,0,0,0.08)',
        border: '1px solid var(--border, #e5e7eb)',
        maxWidth: '400px',
        width: '90%',
      }}>
        <div style={{
          width: '54px', height: '54px', margin: '0 auto 1.5rem',
          border: '4px solid var(--border, #e5e7eb)', borderTopColor: 'var(--primary, #2563eb)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <h2 style={{ fontSize: '1.4rem', color: 'var(--text-primary, #111)', fontWeight: 800, marginBottom: '0.8rem' }}>
          {status}
        </h2>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}
