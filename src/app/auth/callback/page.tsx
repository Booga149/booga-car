"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function AuthCallbackPage() {
  const [status, setStatus] = useState('جاري تسجيل الدخول...');

  useEffect(() => {
    // The Supabase client has detectSessionInUrl: true
    // When this page loads with ?code=xxx, the client automatically:
    // 1. Detects the code in the URL
    // 2. Retrieves the code_verifier from localStorage
    // 3. Calls exchangeCodeForSession
    // 4. Fires onAuthStateChange
    
    // We just need to listen for the auth state change
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setStatus('تم تسجيل الدخول بنجاح! ✅');
        // Use window.location.href for full page reload to update all components
        setTimeout(() => {
          window.location.href = '/';
        }, 500);
      }
      if (event === 'TOKEN_REFRESHED') {
        // Session refreshed, redirect
        setTimeout(() => {
          window.location.href = '/';
        }, 500);
      }
    });

    // Fallback: if no auth event fires within 8 seconds, try manual approach
    const fallbackTimer = setTimeout(async () => {
      // Try to get session manually
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setStatus('تم تسجيل الدخول بنجاح! ✅');
        window.location.href = '/';
      } else {
        // Try to exchange code manually from URL
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        if (code) {
          try {
            const { data, error } = await supabase.auth.exchangeCodeForSession(code);
            if (!error && data.session) {
              setStatus('تم تسجيل الدخول بنجاح! ✅');
              window.location.href = '/';
              return;
            }
          } catch (e) {
            console.error('Manual code exchange failed:', e);
          }
        }
        setStatus('حدث خطأ في تسجيل الدخول. جاري إعادة التوجيه...');
        setTimeout(() => { window.location.href = '/'; }, 2000);
      }
    }, 8000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(fallbackTimer);
    };
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
        <p style={{ color: '#666', fontSize: '0.9rem' }}>
          يرجى الانتظار
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}
