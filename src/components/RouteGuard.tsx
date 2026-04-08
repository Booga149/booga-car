"use client";
import React from 'react';
import { useAuth, UserRole } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { ShieldAlert, Store, Home } from 'lucide-react';

interface RouteGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  fallbackPath?: string;
}

/**
 * ═══════════════════════════════════════
 * Role-Based Route Guard
 * ═══════════════════════════════════════
 * 
 * Usage:
 * <RouteGuard allowedRoles={['admin']}>
 *   <AdminPage />
 * </RouteGuard>
 */
export default function RouteGuard({ children, allowedRoles, fallbackPath = '/' }: RouteGuardProps) {
  const { user, role, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <div style={{
        height: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: 'var(--background, #fff)',
      }}>
        <div style={{
          width: '48px', height: '48px', borderRadius: '50%',
          border: '3px solid var(--border, #e5e7eb)',
          borderTopColor: '#e11d48',
          animation: 'spin 0.8s linear infinite',
        }} />
        <p style={{ marginTop: '1.5rem', color: 'var(--text-secondary, #6b7280)', fontWeight: 600 }}>
          جارٍ التحقق من الصلاحيات...
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{
        height: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: 'var(--background, #fff)', padding: '2rem',
      }}>
        <ShieldAlert size={64} color="#e11d48" style={{ marginBottom: '1.5rem', opacity: 0.7 }} />
        <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-primary, #111)', marginBottom: '0.5rem' }}>
          يجب تسجيل الدخول
        </h2>
        <p style={{ color: 'var(--text-secondary, #6b7280)', marginBottom: '2rem', textAlign: 'center' }}>
          يرجى تسجيل الدخول للوصول إلى هذه الصفحة
        </p>
        <button
          onClick={() => router.push('/')}
          style={{
            padding: '0.8rem 2rem', borderRadius: '12px', border: 'none',
            background: 'linear-gradient(135deg, #e11d48, #be123c)',
            color: '#fff', fontWeight: 800, fontSize: '1rem', cursor: 'pointer',
          }}
        >
          العودة للرئيسية
        </button>
      </div>
    );
  }

  if (!allowedRoles.includes(role)) {
    const icon = role === 'user' ? <Home size={64} /> : <Store size={64} />;
    const redirectPath = role === 'admin' ? '/admin' : role === 'seller' ? '/seller/dashboard' : '/';
    
    return (
      <div style={{
        height: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: 'var(--background, #fff)', padding: '2rem',
      }}>
        <ShieldAlert size={64} color="#f59e0b" style={{ marginBottom: '1.5rem' }} />
        <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-primary, #111)', marginBottom: '0.5rem' }}>
          ليس لديك صلاحية
        </h2>
        <p style={{ color: 'var(--text-secondary, #6b7280)', marginBottom: '0.5rem', textAlign: 'center' }}>
          حسابك من نوع <strong style={{ color: '#e11d48' }}>
            {role === 'user' ? 'مستخدم' : role === 'seller' ? 'تاجر' : 'أدمن'}
          </strong> ولا يملك صلاحية الوصول لهذه الصفحة.
        </p>
        <button
          onClick={() => router.push(redirectPath)}
          style={{
            marginTop: '1.5rem', padding: '0.8rem 2rem', borderRadius: '12px', border: 'none',
            background: 'linear-gradient(135deg, #e11d48, #be123c)',
            color: '#fff', fontWeight: 800, fontSize: '1rem', cursor: 'pointer',
          }}
        >
          الذهاب للوحة التحكم
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
