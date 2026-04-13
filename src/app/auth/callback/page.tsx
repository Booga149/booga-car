"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function AuthCallbackPage() {
  const [status, setStatus] = useState('جاري التحقق... يرجى الانتظار');

  useEffect(() => {
    let disposed = false;
    
    // 1) ABSOLUTE SAFETY FALLBACK:
    // If the page gets stuck for whatever reason (e.g. Supabase auth lock deadlocks),
    // force a redirect after 5 seconds so the user is never trapped.
    const safetyTimer = setTimeout(() => {
      if (!disposed) {
        window.location.replace('/');
      }
    }, 5000);

    const goHome = (path = '/') => {
      if (!disposed) {
        disposed = true;
        clearTimeout(safetyTimer);
        window.location.replace(path);
      }
    };

    const processAuth = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        
        // Supabase `detectSessionInUrl` might be running simultaneously, 
        // causing `navigator.locks` to deadlock if we `await` infinitely.
        // We use Promise.race to timeout after 2 seconds to overcome the deadlock.
        const withTimeout = (promise: Promise<any>) => {
          return Promise.race([
            promise,
            new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 2000))
          ]);
        };
        
        if (code) {
          await withTimeout(supabase.auth.exchangeCodeForSession(code)).catch(e => console.warn('Supabase exchange:', e.message));
        } else if (accessToken) {
          await withTimeout(supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: hashParams.get('refresh_token') || '',
          })).catch(e => console.warn('Supabase setSession:', e.message));
        }

        // Add a delay to allow Supabase to persist the session securely to browser storage
        setTimeout(async () => {
          if (disposed) return;
          try {
            const { data: { session } } = await withTimeout(supabase.auth.getSession());
            if (session) {
              setStatus('تم تسجيل الدخول بنجاح! ✅');
              setTimeout(() => goHome('/'), 500);
            } else {
               // Next fallback: see if `onAuthStateChange` got it. If no session, go home anyway.
               setStatus('لم نتمكن من جلب الجلسة، جاري التوجيه...');
               setTimeout(() => goHome('/'), 1000);
            }
          } catch(e) {
            goHome('/');
          }
        }, 800);

      } catch (err) {
        console.error('Auth callback exception:', err);
        setStatus('حدث خطأ، جاري إعادة التوجيه...');
        setTimeout(() => goHome('/'), 1000);
      }
    };

    if (typeof window !== 'undefined') {
       processAuth();
       
       // Subscription fallback in case the lock resolves and emits an event
       const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
         if (session && (event === 'SIGNED_IN' || event === 'INITIAL_SESSION')) {
           setStatus('تم الدخول، سيتم التوجيه... ✅');
           setTimeout(() => goHome('/'), 500);
         }
       });
       
       return () => {
         disposed = true;
         clearTimeout(safetyTimer);
         authListener?.subscription?.unsubscribe();
       };
    }

    return () => {
      disposed = true;
      clearTimeout(safetyTimer);
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
