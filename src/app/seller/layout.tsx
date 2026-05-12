"use client";
import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { logSecurityEvent } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import {
  ShieldAlert, LayoutDashboard, BarChart2, Package, ShoppingBag,
  Receipt, Settings, ChevronLeft, Bell, Search, Menu, X,
  Store, TrendingUp, RotateCcw, FileText, Upload, Zap, User
} from 'lucide-react';

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, loading: authLoading, isSeller } = useAuth();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.replace('/'); return; }
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
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#030200' }}>
      <div style={{ width: '60px', height: '60px', borderRadius: '18px', background: 'linear-gradient(135deg, #D4AF37, #FFD700)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', boxShadow: '0 0 40px rgba(212,175,55,0.3)', animation: 'pulse 1.5s ease-in-out infinite' }}>⚡</div>
      <p style={{ color: 'rgba(212,175,55,0.6)', fontWeight: 800, letterSpacing: '2px', fontSize: '0.85rem', marginTop: '1.5rem' }}>جاري التحقق من الصلاحيات...</p>
      <style>{`@keyframes pulse { 0%,100%{transform:scale(1);opacity:0.8} 50%{transform:scale(1.1);opacity:1} }`}</style>
    </div>
  );

  if (!authorized) return (
    <div style={{ padding: '5rem', textAlign: 'center', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#030200' }}>
      <ShieldAlert size={64} color="#f43f5e" style={{ marginBottom: '1.5rem' }} />
      <h1 style={{ color: '#fff', fontWeight: 800, fontSize: '2rem', marginBottom: '0.5rem' }}>غير مصرح بالدخول</h1>
      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '1rem', marginBottom: '2rem', maxWidth: '400px' }}>هذه الصفحة متاحة فقط للتجار المعتمدين.</p>
      <div style={{ display: 'flex', gap: '0.8rem' }}>
        <a href="/become-dealer" style={{ padding: '0.8rem 2rem', background: '#D4AF37', color: '#111', textDecoration: 'none', borderRadius: '12px', fontWeight: 700 }}>تقدم كتاجر</a>
        <a href="/" style={{ padding: '0.8rem 2rem', background: 'transparent', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.3)', textDecoration: 'none', borderRadius: '12px', fontWeight: 700 }}>الرئيسية</a>
      </div>
    </div>
  );

  const merchantName = profile?.business_name || profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'التاجر';
  const merchantInitial = (profile?.business_name?.charAt(0) || profile?.full_name?.charAt(0) || '؟').toUpperCase();

  const navItems = [
    { href: '/seller/dashboard', icon: <BarChart2 size={20} />, label: 'لوحة التحكم' },
    { href: '/seller/orders', icon: <ShoppingBag size={20} />, label: 'الطلبات' },
    { href: '/seller/products', icon: <Package size={20} />, label: 'منتجاتي' },
    { href: '/seller/stock', icon: <Store size={20} />, label: 'المخزون' },
    { href: '/seller/pos', icon: <Receipt size={20} />, label: 'نقطة البيع' },
    { href: '/seller/sales', icon: <TrendingUp size={20} />, label: 'تقرير البيعات' },
    { href: '/seller/invoices', icon: <FileText size={20} />, label: 'الفواتير' },
    { href: '/seller/returns', icon: <RotateCcw size={20} />, label: 'المرتجعات' },
    { href: '/seller/import', icon: <Upload size={20} />, label: 'رفع منتجات' },
    { href: '/seller/settings', icon: <Settings size={20} />, label: 'الإعدادات' },
  ];

  const c = {
    bg: '#030200',
    surface: '#0a0800',
    surfaceHover: '#120f00',
    border: 'rgba(212,175,55,0.08)',
    borderStrong: 'rgba(212,175,55,0.15)',
    gold: '#D4AF37',
    goldLight: 'rgba(212,175,55,0.1)',
    text: '#e8e8e0',
    textMuted: 'rgba(255,255,255,0.4)',
    textFaint: 'rgba(255,255,255,0.2)',
  };

  return (
    <div className="seller-layout-wrapper" style={{ display: 'flex', minHeight: '100vh', background: c.bg, color: c.text, direction: 'rtl' }}>

      {/* Mobile overlay */}
      {mobileSidebarOpen && (
        <div onClick={() => setMobileSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 40, backdropFilter: 'blur(4px)' }} />
      )}

      {/* Sidebar */}
      <aside style={{
        width: sidebarOpen ? '240px' : '68px',
        background: c.surface,
        borderLeft: `1px solid ${c.border}`,
        display: 'flex', flexDirection: 'column',
        transition: 'width 0.3s ease',
        position: 'sticky', top: 0, height: '100vh',
        boxShadow: '-4px 0 30px rgba(0,0,0,0.4)',
        flexShrink: 0,
        zIndex: 30,
      }}>
        {/* Logo area */}
        <div style={{
          padding: sidebarOpen ? '1.2rem 1rem' : '1.2rem 0.6rem',
          borderBottom: `1px solid ${c.border}`,
          display: 'flex', alignItems: 'center',
          justifyContent: sidebarOpen ? 'space-between' : 'center',
          gap: '0.5rem',
        }}>
          {sidebarOpen && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'linear-gradient(135deg, #D4AF37, #FFD700)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>⚡</div>
              <div>
                <div style={{ color: c.gold, fontWeight: 950, fontSize: '0.95rem', letterSpacing: '-0.5px' }}>بوجا كار</div>
                <div style={{ color: c.textFaint, fontSize: '0.65rem', fontWeight: 700 }}>لوحة التاجر</div>
              </div>
            </div>
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ background: c.surfaceHover, border: `1px solid ${c.border}`, color: c.textMuted, width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, transition: 'all 0.2s' }}>
            <Menu size={16} />
          </button>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: sidebarOpen ? '1rem 0.7rem' : '1rem 0.4rem', display: 'flex', flexDirection: 'column', gap: '0.2rem', overflowY: 'auto' }}>
          {navItems.map(item => {
            const active = pathname === item.href || (item.href !== '/seller/dashboard' && pathname.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href}
                title={!sidebarOpen ? item.label : undefined}
                style={{
                  display: 'flex', alignItems: 'center',
                  gap: '0.7rem',
                  padding: sidebarOpen ? '0.75rem 0.9rem' : '0.75rem',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  justifyContent: sidebarOpen ? 'flex-start' : 'center',
                  background: active ? c.goldLight : 'transparent',
                  color: active ? c.gold : c.textMuted,
                  fontWeight: active ? 800 : 600,
                  fontSize: '0.88rem',
                  transition: 'all 0.2s',
                  border: `1px solid ${active ? c.borderStrong : 'transparent'}`,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                }}
                onMouseOver={e => { if (!active) { e.currentTarget.style.background = c.surfaceHover; e.currentTarget.style.color = c.text; } }}
                onMouseOut={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = c.textMuted; } }}
              >
                <div style={{ flexShrink: 0 }}>{item.icon}</div>
                {sidebarOpen && <span>{item.label}</span>}
                {sidebarOpen && active && <div style={{ marginRight: 'auto', width: '6px', height: '6px', borderRadius: '50%', background: c.gold }} />}
              </Link>
            );
          })}
        </nav>

        {/* Bottom: merchant badge */}
        {sidebarOpen && (
          <div style={{ padding: '1rem', borderTop: `1px solid ${c.border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', padding: '0.8rem', background: c.surfaceHover, borderRadius: '12px', border: `1px solid ${c.border}` }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'linear-gradient(135deg, #D4AF37, #B8860B)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.9rem', color: '#111', flexShrink: 0 }}>
                {merchantInitial}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: c.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{merchantName}</div>
                <div style={{ fontSize: '0.68rem', color: c.textFaint, fontWeight: 600 }}>تاجر موثق ✓</div>
              </div>
              <div style={{ marginRight: 'auto', width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981', flexShrink: 0 }} />
            </div>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '0.5rem', padding: '0.6rem', borderRadius: '10px', color: c.textFaint, fontSize: '0.78rem', fontWeight: 600, textDecoration: 'none', transition: 'all 0.2s' }}
              onMouseOver={e => { e.currentTarget.style.color = c.gold; }}
              onMouseOut={e => { e.currentTarget.style.color = c.textFaint; }}>
              <ChevronLeft size={14} /> الموقع الرئيسي
            </Link>
          </div>
        )}

        {/* Collapsed bottom */}
        {!sidebarOpen && (
          <div style={{ padding: '0.8rem 0.4rem', borderTop: `1px solid ${c.border}`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'linear-gradient(135deg, #D4AF37, #B8860B)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.9rem', color: '#111' }}>
              {merchantInitial}
            </div>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px #10b981' }} />
          </div>
        )}
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflowX: 'hidden' }}>

        {/* Top bar */}
        <header style={{
          background: c.surface,
          borderBottom: `1px solid ${c.border}`,
          padding: '0.8rem 1.5rem',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          position: 'sticky', top: 0, zIndex: 20,
          boxShadow: '0 2px 20px rgba(0,0,0,0.3)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px #10b981' }} />
            <span style={{ fontSize: '0.82rem', color: c.textMuted, fontWeight: 700 }}>
              {navItems.find(n => pathname === n.href || (n.href !== '/seller/dashboard' && pathname.startsWith(n.href)))?.label || 'لوحة التحكم'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            {/* Search */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input type="text" placeholder="بحث..."
                style={{ background: c.surfaceHover, border: `1px solid ${c.border}`, padding: '0.5rem 1rem 0.5rem 2rem', borderRadius: '10px', color: c.text, fontSize: '0.82rem', width: '160px', outline: 'none' }} />
              <Search size={13} color={c.textFaint} style={{ position: 'absolute', left: '0.7rem' }} />
            </div>

            {/* Notifications */}
            <Link href="/seller/orders" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '10px', background: c.surfaceHover, border: `1px solid ${c.border}`, color: c.textMuted, textDecoration: 'none', transition: 'all 0.2s' }}
              onMouseOver={e => { e.currentTarget.style.borderColor = c.borderStrong; e.currentTarget.style.color = c.gold; }}
              onMouseOut={e => { e.currentTarget.style.borderColor = c.border; e.currentTarget.style.color = c.textMuted; }}>
              <Bell size={16} />
            </Link>

            {/* Profile */}
            <Link href="/seller/settings" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.8rem', background: c.goldLight, border: `1px solid ${c.borderStrong}`, borderRadius: '10px', textDecoration: 'none', transition: 'all 0.2s' }}
              onMouseOver={e => e.currentTarget.style.background = 'rgba(212,175,55,0.15)'}
              onMouseOut={e => e.currentTarget.style.background = c.goldLight}>
              <div style={{ width: '24px', height: '24px', borderRadius: '7px', background: 'linear-gradient(135deg, #D4AF37, #B8860B)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 900, color: '#111' }}>
                {merchantInitial}
              </div>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: c.gold, maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{merchantName}</span>
            </Link>
          </div>
        </header>

        {/* Page content */}
        <div style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
          {children}
        </div>
      </main>

      <style>{`
        @keyframes pulse { 0%,100%{transform:scale(1);opacity:0.8} 50%{transform:scale(1.1);opacity:1} }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(212,175,55,0.2); border-radius: 4px; }
        /* Hide the main site Navbar inside seller pages — Navbar renders as a fixed <nav> */
        .seller-layout-wrapper nav,
        .seller-layout-wrapper > div > div > nav {
          display: none !important;
        }
        /* Remove the 7rem top padding that pages add for the Navbar */
        .seller-layout-wrapper [style*="7rem"] {
          padding-top: 1.5rem !important;
        }
        /* Ensure backgrounds are transparent in seller layout */
        .seller-layout-wrapper main {
          background: transparent !important;
        }
        @media (max-width: 768px) {
          aside { position: fixed !important; right: 0; top: 0; height: 100vh; z-index: 50; }
        }
      `}</style>
    </div>
  );
}
