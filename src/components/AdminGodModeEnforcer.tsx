"use client";
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';
import { Crosshair } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function AdminGodModeEnforcer() {
  const { user, loading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    if (!user?.email) {
      setIsAdmin(false);
      return;
    }

    // Fastest check: by email prefix
    const adminByEmail =
      user.email.startsWith('mrmrx2824') ||
      user.email.startsWith('admin');

    if (adminByEmail) {
      setIsAdmin(true);
      return;
    }

    // Fallback: check role column in profiles table
    supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        if (data?.role === 'admin' || data?.role === 'superadmin') {
          setIsAdmin(true);
        }
      });
  }, [user, loading]);

  // Toggle the 'god-mode' class on <body> ONLY on /admin pages
  const isOnAdminPage = pathname?.startsWith('/admin');

  useEffect(() => {
    if (isAdmin && isOnAdminPage) {
      document.body.classList.add('god-mode');
    } else {
      document.body.classList.remove('god-mode');
    }
    return () => {
      document.body.classList.remove('god-mode');
    };
  }, [isAdmin, isOnAdminPage]);

  // Nothing to render until auth resolves and user IS admin
  if (loading || !isAdmin) return null;

  return (
    <div
      id="admin-hud-badge"
      style={{
        position: 'fixed',
        bottom: '2rem',
        right: '2rem',
        zIndex: 999999,
        background: 'rgba(5, 5, 10, 0.92)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(76,201,240,0.35)',
        borderRadius: '16px',
        padding: '0.8rem 1.2rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        boxShadow: '0 10px 30px rgba(0,0,0,0.8), inset 0 0 15px rgba(76,201,240,0.08)',
        animation: 'slideUpAdmin 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) both',
        cursor: 'default',
      }}
    >
      {/* Live red dot */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            background: '#f43f5e',
            boxShadow: '0 0 10px #f43f5e',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: '-5px',
            borderRadius: '50%',
            border: '1px solid #f43f5e',
            opacity: 0.5,
            animation: 'adminPing 2s cubic-bezier(0,0,0.2,1) infinite',
          }}
        />
      </div>

      <div>
        <div
          style={{
            color: '#4cc9f0',
            fontSize: '0.72rem',
            fontWeight: 900,
            textTransform: 'uppercase',
            letterSpacing: '2px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            marginBottom: '3px',
          }}
        >
          <Crosshair size={11} /> بروتوكول القيادة المتقدم
        </div>
        <div style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 700 }}>
          تتصفح بصلاحيات{' '}
          <span style={{ color: '#f43f5e', fontWeight: 900 }}>مدير النظام</span>
        </div>
      </div>
    </div>
  );
}
