"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function AuthCallbackPage() {
  const [status, setStatus] = useState('جاري تسجيل الدخول...');

  useEffect(() => {
    const processAuth = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        
        if (code) {
          setStatus('جاري التحقق...');
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          if (!error && data.session) {
            setStatus('تم تسجيل الدخول بنجاح! ✅');
            setTimeout(() => { window.location.href = '/'; }, 800);
            return;
          }
          if (error) {
            setStatus('حدث خطأ في تسجيل الدخول');
            setTimeout(() => { window.location.href = '/'; }, 2000);
            return;
          }
        }
        
        if (accessToken) {
          const refreshToken = hashParams.get('refresh_token');
          if (refreshToken) {
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            if (data.session && !error) {
              setStatus('تم تسجيل الدخول بنجاح! ✅');
              setTimeout(() => { window.location.href = '/'; }, 800);
              return;
            }
          }
        }
        
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setStatus('تم تسجيل الدخول بنجاح! ✅');
          setTimeout(() => { window.location.href = '/'; }, 800);
          return;
        }
        
        setStatus('لم يتم العثور على جلسة. جاري إعادة التوجيه...');
        setTimeout(() => { window.location.href = '/'; }, 2000);
      } catch {
        setStatus('حدث خطأ غير متوقع');
        setTimeout(() => { window.location.href = '/'; }, 2000);
      }
    };
    processAuth();
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f8f9fa',
      direction: 'rtl',
    }}>
      <div style={{
        textAlign: 'center',
        padding: '3rem',
        borderRadius: '20px',
        background: 'white',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      }}>
        <div style={{
          width: '48px', height: '48px', margin: '0 auto 1.5rem',
          border: '4px solid #e5e7eb', borderTopColor: '#D4AF37',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <h2 style={{ fontSize: '1.3rem', color: '#111', fontWeight: 800, marginBottom: '0.5rem' }}>
          {status}
        </h2>
        <p style={{ color: '#666', fontSize: '0.9rem' }}>يرجى الانتظار</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}
