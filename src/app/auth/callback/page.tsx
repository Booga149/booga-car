"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState('جاري تسجيل الدخول...');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code');
        
        if (code) {
          // PKCE flow: exchange the code for a session
          // The code_verifier is stored in localStorage by the Supabase client
          setStatus('جاري التحقق من حسابك...');
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          
          if (error) {
            console.error('Code exchange error:', error.message);
            setStatus('حدث خطأ في تسجيل الدخول');
            setTimeout(() => router.replace('/'), 2000);
            return;
          }
          
          if (data.session) {
            console.log('✅ Session established via code exchange');
            setStatus('تم تسجيل الدخول بنجاح! ✅');
            setTimeout(() => {
              window.location.href = '/';
            }, 500);
            return;
          }
        }

        // Fallback: check for hash-based tokens (implicit flow)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        
        if (accessToken) {
          setStatus('جاري تأكيد الجلسة...');
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            setStatus('تم تسجيل الدخول بنجاح! ✅');
            setTimeout(() => {
              window.location.href = '/';
            }, 500);
            return;
          }
        }

        // No code or token found
        console.log('No auth params found, redirecting...');
        router.replace('/');
      } catch (err) {
        console.error('Auth callback exception:', err);
        setStatus('حدث خطأ، جاري إعادة التوجيه...');
        setTimeout(() => router.replace('/'), 2000);
      }
    };

    handleCallback();
  }, [router, searchParams]);

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

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>جاري التحميل...</p>
      </div>
    }>
      <CallbackHandler />
    </Suspense>
  );
}
