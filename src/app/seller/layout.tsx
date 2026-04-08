"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { logSecurityEvent } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { ShieldAlert, LayoutDashboard } from 'lucide-react';

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading, isSeller } = useAuth();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.replace('/');
      return;
    }

    if (isSeller) {
      setAuthorized(true);
    } else {
      setAuthorized(false);
      logSecurityEvent(supabase, {
        type: 'SECURITY_ALERT',
        title: '⚠️ محاولة دخول لوحة التاجر بدون صلاحية!',
        account: user?.email || 'مجهول'
      }).catch(() => {});
    }
    setLoading(false);
  }, [authLoading, user, isSeller, router]);

  if (loading || authLoading) return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--background)' }}>
      <LayoutDashboard size={48} color="var(--primary)" style={{ animation: 'pulse 2s infinite' }} />
      <h2 style={{ marginTop: '1.5rem', color: 'var(--primary)', fontSize: '1rem', fontWeight: 700 }}>جارٍ التحقق من صلاحيات التاجر...</h2>
      <style>{`@keyframes pulse { 0%,100% { opacity: 0.4; transform: scale(0.95); } 50% { opacity: 1; transform: scale(1.05); } }`}</style>
    </div>
  );

  if (!authorized) return (
    <div style={{ padding: '5rem', textAlign: 'center', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--background)' }}>
      <ShieldAlert size={64} color="var(--error)" style={{ marginBottom: '1.5rem' }} />
      <h1 style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: '2rem', marginBottom: '0.5rem' }}>غير مصرح بالدخول</h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: '2rem', maxWidth: '400px' }}>
        هذه الصفحة متاحة فقط للتجار المعتمدين. يمكنك التقدم كتاجر من خلال صفحة "كن تاجراً".
      </p>
      <div style={{ display: 'flex', gap: '0.8rem' }}>
        <a href="/become-dealer" style={{ padding: '0.8rem 2rem', background: 'var(--primary)', color: '#fff', textDecoration: 'none', borderRadius: '12px', fontWeight: 700 }}>
          تقدم كتاجر
        </a>
        <a href="/" style={{ padding: '0.8rem 2rem', background: 'transparent', color: 'var(--primary)', border: '1px solid var(--border)', textDecoration: 'none', borderRadius: '12px', fontWeight: 700 }}>
          العودة للرئيسية
        </a>
      </div>
    </div>
  );

  return <>{children}</>;
}
