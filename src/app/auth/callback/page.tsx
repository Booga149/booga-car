"use client";
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // The Supabase client-side library will automatically detect
        // the auth tokens in the URL hash or the PKCE code in the query params
        // and exchange them for a session using the stored code_verifier
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error.message);
        }

        if (session) {
          console.log('✅ Session established successfully');
        }

        // Redirect to home
        router.replace('/');
      } catch (err) {
        console.error('Auth callback exception:', err);
        router.replace('/');
      }
    };

    handleCallback();
  }, [router]);

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
          جاري تسجيل الدخول...
        </h2>
        <p style={{ color: '#666', fontSize: '0.9rem' }}>
          يتم التحقق من حسابك
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}
