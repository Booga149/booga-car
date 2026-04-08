"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { logSecurityEvent } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { ShieldAlert, Crown, Fingerprint } from 'lucide-react';

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  const { user, role, loading: authLoading, isSeller, profile } = useAuth();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      // Not logged in → redirect to home
      router.replace('/');
      return;
    }

    if (isSeller) {
      setAuthorized(true);
    } else {
      setAuthorized(false);
      // Log unauthorized access attempt
      logSecurityEvent(supabase, {
        type: 'SECURITY_ALERT',
        title: '⚠️ محاولة دخول لوحة التاجر بدون صلاحية!',
        account: user?.email || 'مجهول'
      }).catch(() => {});
    }
    setLoading(false);
  }, [authLoading, user, isSeller, router]);

  // Loading state
  if (loading || authLoading) return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#050400' }}>
      <Crown size={64} color="#D4AF37" style={{ animation: 'pulse 2s infinite' }} />
      <h2 style={{ marginTop: '2rem', color: '#D4AF37', letterSpacing: '3px', textTransform: 'uppercase', fontSize: '0.9rem', fontWeight: 900 }}>جارٍ التحقق من صلاحيات التاجر</h2>
      <style>{`@keyframes pulse { 0%,100% { opacity: 0.3; transform: scale(0.9); } 50% { opacity: 1; transform: scale(1.1); } }`}</style>
    </div>
  );

  // Unauthorized
  if (!authorized) return (
    <div style={{ padding: '5rem', textAlign: 'center', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#050400', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(212,175,55,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,0.05) 1px, transparent 1px)', backgroundSize: '40px 40px', zIndex: 0 }} />
      <ShieldAlert size={80} color="#D4AF37" style={{ position: 'relative', zIndex: 1, marginBottom: '2rem', filter: 'drop-shadow(0 0 30px rgba(212,175,55,0.4))' }} />
      <h1 style={{ color: '#D4AF37', position: 'relative', zIndex: 1, fontWeight: 950, fontSize: '2.5rem', letterSpacing: '-1px', marginBottom: '1rem' }}>غير مصرح</h1>
      <p style={{ color: '#aaa', position: 'relative', zIndex: 1, fontSize: '1.1rem', marginBottom: '2.5rem', maxWidth: '500px' }}>
        هذه الصفحة متاحة فقط للتجار المعتمدين. يمكنك التقدم كتاجر من خلال صفحة "كن تاجراً".
      </p>
      <div style={{ display: 'flex', gap: '1rem', position: 'relative', zIndex: 1 }}>
        <a href="/become-dealer" style={{ padding: '1rem 2rem', background: 'linear-gradient(135deg, #D4AF37, #FFD700)', color: '#111', textDecoration: 'none', borderRadius: '12px', fontWeight: 900, transition: 'all 0.3s' }}>
          تقدم كتاجر
        </a>
        <a href="/" style={{ padding: '1rem 2rem', background: 'transparent', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.3)', textDecoration: 'none', borderRadius: '12px', fontWeight: 900, transition: 'all 0.3s' }}>
          العودة للرئيسية
        </a>
      </div>
    </div>
  );

  return <>{children}</>;
}
