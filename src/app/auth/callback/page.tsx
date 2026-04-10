"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function AuthCallbackPage() {
  const [status, setStatus] = useState('جاري تسجيل الدخول...');
  const [debugInfo, setDebugInfo] = useState('');

  useEffect(() => {
    const processAuth = async () => {
      try {
        const url = window.location.href;
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        
        setDebugInfo(`URL has code: ${!!code}, hash token: ${!!accessToken}`);
        
        if (code) {
          // PKCE: exchange code for session
          setStatus('جاري التحقق...');
          setDebugInfo(prev => prev + '\n→ Exchanging PKCE code...');
          
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          
          if (error) {
            setDebugInfo(prev => prev + `\n✗ Error: ${error.message}`);
            setStatus('خطأ: ' + error.message);
            
            // If code_verifier is missing, try getSession as fallback
            if (error.message.includes('code verifier') || error.message.includes('code_verifier')) {
              setDebugInfo(prev => prev + '\n→ Trying getSession fallback...');
              const { data: sessionData } = await supabase.auth.getSession();
              if (sessionData.session) {
                setStatus('تم تسجيل الدخول بنجاح! ✅');
                setTimeout(() => { window.location.href = '/'; }, 800);
                return;
              }
            }
            
            setTimeout(() => { window.location.href = '/'; }, 3000);
            return;
          }
          
          if (data.session) {
            setDebugInfo(prev => prev + '\n✓ Session established!');
            setStatus('تم تسجيل الدخول بنجاح! ✅');
            setTimeout(() => { window.location.href = '/'; }, 800);
            return;
          }
        }
        
        if (accessToken) {
          // Implicit flow tokens in hash
          const refreshToken = hashParams.get('refresh_token');
          if (refreshToken) {
            setDebugInfo(prev => prev + '\n→ Setting session from hash tokens...');
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            if (data.session && !error) {
              setStatus('تم تسجيل الدخول بنجاح! ✅');
              window.history.replaceState(null, '', '/auth/callback');
              setTimeout(() => { window.location.href = '/'; }, 800);
              return;
            }
          }
        }
        
        // No code or token - check if session already exists
        setDebugInfo(prev => prev + '\n→ Checking existing session...');
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setStatus('تم تسجيل الدخول بنجاح! ✅');
          setTimeout(() => { window.location.href = '/'; }, 800);
          return;
        }
        
        setDebugInfo(prev => prev + '\n✗ No session found');
        setStatus('لم يتم العثور على جلسة. جاري إعادة التوجيه...');
        setTimeout(() => { window.location.href = '/'; }, 3000);
        
      } catch (err: any) {
        setDebugInfo(prev => prev + `\n✗ Exception: ${err.message}`);
        setStatus('حدث خطأ غير متوقع');
        setTimeout(() => { window.location.href = '/'; }, 3000);
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
        maxWidth: '500px',
        width: '90%',
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
        {debugInfo && (
          <pre style={{
            marginTop: '1.5rem',
            padding: '1rem',
            background: '#f1f1f1',
            borderRadius: '10px',
            fontSize: '0.75rem',
            color: '#333',
            textAlign: 'left',
            direction: 'ltr',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all',
          }}>
            {debugInfo}
          </pre>
        )}
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}
