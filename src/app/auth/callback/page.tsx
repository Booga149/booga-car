"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function AuthCallbackPage() {
  const [status, setStatus] = useState('جاري تسجيل الدخول...');

  useEffect(() => {
    let redirectTimer: NodeJS.Timeout;

    const processAuth = async () => {
      try {
        // Method 1: Exchange code from URL query params (PKCE flow)
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        
        if (code) {
          setStatus('جاري التحقق...');
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          if (!error && data.session) {
            setStatus('تم تسجيل الدخول بنجاح! ✅');
            window.location.replace('/');
            return;
          }
        }

        // Method 2: Token in hash fragment (implicit flow)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        
        if (accessToken && refreshToken) {
          setStatus('جاري التحقق...');
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (!error && data.session) {
            setStatus('تم تسجيل الدخول بنجاح! ✅');
            window.location.replace('/');
            return;
          }
        }

        // Method 3: Supabase might have auto-detected the session
        // Wait a moment for Supabase to process
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setStatus('تم تسجيل الدخول بنجاح! ✅');
          window.location.replace('/');
          return;
        }

        // Method 4: Listen for auth state change (Supabase processes hash automatically)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          if (event === 'SIGNED_IN' && session) {
            setStatus('تم تسجيل الدخول بنجاح! ✅');
            window.location.replace('/');
          }
        });

        // Fallback: If nothing works after 5 seconds, redirect anyway
        // The user might already be logged in (session stored in cookies)
        redirectTimer = setTimeout(() => {
          subscription.unsubscribe();
          setStatus('جاري إعادة التوجيه...');
          window.location.replace('/');
        }, 5000);

      } catch (err) {
        console.error('Auth callback error:', err);
        setStatus('جاري إعادة التوجيه...');
        window.location.replace('/');
      }
    };

    processAuth();

    return () => {
      if (redirectTimer) clearTimeout(redirectTimer);
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
          width: '48px', height: '48px', margin: '0 auto 1.5rem',
          border: '4px solid var(--border, #e5e7eb)', borderTopColor: 'var(--primary, #e11d48)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <h2 style={{ fontSize: '1.3rem', color: 'var(--text-primary, #111)', fontWeight: 800, marginBottom: '0.5rem' }}>
          {status}
        </h2>
        <p style={{ color: 'var(--text-secondary, #666)', fontSize: '0.9rem', margin: 0 }}>يرجى الانتظار</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}
