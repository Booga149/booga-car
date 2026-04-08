"use client";
import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ShieldCheck } from 'lucide-react';

export default function AdminGodModeEnforcer() {
  const { role, loading } = useAuth();
  const isAdmin = role === 'admin';

  // No more god-mode class on body - unified design

  if (loading || !isAdmin) return null;

  return (
    <div
      id="admin-hud-badge"
      className="desktop-only"
      style={{
        position: 'fixed',
        bottom: '2rem',
        right: '2rem',
        zIndex: 999999,
        background: 'var(--surface)',
        backdropFilter: 'blur(12px)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        padding: '0.6rem 1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.8rem',
        boxShadow: 'var(--card-shadow)',
        cursor: 'default',
      }}
    >
      <div style={{
        width: '8px', height: '8px', borderRadius: '50%',
        background: 'var(--success)', boxShadow: '0 0 6px var(--success)',
      }} />
      <div>
        <div style={{
          color: 'var(--primary)', fontSize: '0.7rem',
          fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem',
        }}>
          <ShieldCheck size={12} /> مدير النظام
        </div>
        <div style={{ color: 'var(--text-tertiary)', fontSize: '0.68rem', fontWeight: 600 }}>
          صلاحيات كاملة
        </div>
      </div>
    </div>
  );
}
