"use client";
import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { logSecurityEvent } from '@/lib/utils';
import { useAdminNotifications } from '@/hooks/useAdminNotifications';
import { useAuth } from '@/context/AuthContext';
import { BarChart2, Package, ShoppingCart, Users, Activity, Globe, Bell, User, Upload, Search, Menu, ShieldAlert, Ticket, LayoutDashboard } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, role, loading: authLoading, profile } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();
  const { notifications, markAsRead } = useAdminNotifications();

  useEffect(() => {
    if (authLoading) return;
    if (role === 'admin') {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
      logSecurityEvent(supabase, {
        type: 'SECURITY_ALERT',
        title: 'محاولة دخول غير مصرحة!',
        account: user?.email ? `مستخدم (${user.email})` : 'زائر مجهول'
      }).catch(() => {});
    }
    setLoading(false);
  }, [authLoading, role, user]);

  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--background)' }}>
      <LayoutDashboard size={48} color="var(--primary)" style={{ animation: 'pulse 2s infinite' }} />
      <h2 style={{ marginTop: '1.5rem', color: 'var(--primary)', fontSize: '1rem', fontWeight: 700 }}>جارٍ التحقق من الصلاحيات...</h2>
      <style>{`@keyframes pulse { 0%,100% { opacity: 0.4; transform: scale(0.95); } 50% { opacity: 1; transform: scale(1.05); } }`}</style>
    </div>
  );

  if (!isAdmin) return (
    <div style={{ padding: '5rem', textAlign: 'center', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--background)' }}>
      <ShieldAlert size={64} color="var(--error)" style={{ marginBottom: '1.5rem' }} />
      <h1 style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: '2rem', marginBottom: '0.5rem' }}>غير مصرح بالدخول</h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: '2rem', maxWidth: '400px' }}>ليس لديك صلاحية الوصول لهذه الصفحة. تم تسجيل هذه المحاولة.</p>
      <a href="/" style={{ padding: '0.8rem 2rem', background: 'var(--primary)', color: '#fff', textDecoration: 'none', borderRadius: '12px', fontWeight: 700, transition: 'all 0.2s' }}>
        العودة للرئيسية
      </a>
    </div>
  );

  const navItems = [
    { href: '/admin', icon: <BarChart2 size={20} />, label: 'لوحة التحكم' },
    { href: '/admin/products', icon: <Package size={20} />, label: 'المنتجات' },
    { href: '/admin/users', icon: <Users size={20} />, label: 'المستخدمين' },
    { href: '/admin/import', icon: <Upload size={20} />, label: 'استيراد المنتجات' },
    { href: '/admin/dropship', icon: <Globe size={20} />, label: 'الدروب شيبنج' },
    { href: '/admin/coupons', icon: <Ticket size={20} />, label: 'الكوبونات' },
    { href: '/admin/logs', icon: <Activity size={20} />, label: 'سجل المراقبة' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--background)' }}>

      {/* Sidebar */}
      <aside style={{
        width: sidebarOpen ? '260px' : '72px',
        background: 'var(--surface)',
        borderLeft: '1px solid var(--border)',
        padding: sidebarOpen ? '1.5rem 1rem' : '1.5rem 0.6rem',
        display: 'flex', flexDirection: 'column',
        transition: 'all 0.3s ease',
        alignItems: sidebarOpen ? 'stretch' : 'center',
        boxShadow: '-2px 0 8px rgba(0,0,0,0.03)',
      }}>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: sidebarOpen ? 'space-between' : 'center', marginBottom: '2rem' }}>
          {sidebarOpen && (
            <h2 style={{ color: 'var(--primary)', fontSize: '1.2rem', margin: 0, fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <LayoutDashboard size={20} /> الإدارة
            </h2>
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{
            background: 'var(--surface-hover)', border: '1px solid var(--border)', color: 'var(--text-secondary)',
            width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center',
            justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s'
          }}>
            <Menu size={18} />
          </button>
        </div>
        
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', flex: 1 }}>
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <a 
                key={item.href}
                href={item.href} 
                style={{ 
                  padding: sidebarOpen ? '0.8rem 1rem' : '0.8rem', borderRadius: '10px',
                  textDecoration: 'none', fontWeight: active ? 700 : 500,
                  display: 'flex', alignItems: 'center', gap: '0.8rem',
                  transition: 'all 0.2s', cursor: 'pointer',
                  background: active ? 'var(--primary-lighter)' : 'transparent',
                  color: active ? 'var(--primary)' : 'var(--text-secondary)',
                  justifyContent: sidebarOpen ? 'flex-start' : 'center',
                  fontSize: '0.9rem',
                }} 
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{item.icon}</div>
                {sidebarOpen && <span>{item.label}</span>}
              </a>
            );
          })}
          
          <div style={{ height: '1px', background: 'var(--border)', margin: '1rem 0' }} />
          
          <a href="/" style={{
            padding: '0.8rem', borderRadius: '10px', color: 'var(--text-secondary)',
            textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: '0.5rem', transition: 'all 0.2s',
            border: '1px solid var(--border)', fontSize: '0.85rem',
          }}>
            <Globe size={16} /> {sidebarOpen ? 'الموقع الرئيسي' : ''}
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: sidebarOpen ? '1.5rem 2.5rem' : '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', transition: 'all 0.3s' }}>
        
        {/* Top Bar */}
        <header style={{
          background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px',
          padding: '0.8rem 1.5rem', display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', marginBottom: '2rem', boxShadow: 'var(--card-shadow)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)' }} />
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>لوحة الإدارة</span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ position: 'relative' }}>
              <input type="text" placeholder="بحث..." style={{
                background: 'var(--surface-hover)', border: '1px solid var(--border)',
                padding: '0.6rem 1rem', paddingRight: '2.2rem', borderRadius: '10px',
                color: 'var(--text-primary)', fontSize: '0.85rem', width: '200px', outline: 'none',
              }} />
              <Search size={14} color="var(--text-tertiary)" style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>

            <div onClick={() => setShowDropdown(!showDropdown)} style={{
              position: 'relative', cursor: 'pointer', padding: '0.5rem',
              background: 'var(--surface-hover)', borderRadius: '10px', border: '1px solid var(--border)',
              transition: 'all 0.2s',
            }}>
              <Bell size={20} color={notifications.length > 0 ? 'var(--primary)' : 'var(--text-tertiary)'} />
              {notifications.length > 0 && (
                <span style={{
                  position: 'absolute', top: -4, right: -4, background: 'var(--error)',
                  color: 'white', borderRadius: '50%', width: '20px', height: '20px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.7rem', fontWeight: 800,
                }}>
                  {notifications.length}
                </span>
              )}
            </div>
          </div>
          
          {showDropdown && (
            <div style={{
              position: 'absolute', top: '5rem', left: '2rem', width: '340px',
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: '16px', zIndex: 50, padding: '1rem',
              boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '0.8rem', marginBottom: '0.8rem' }}>
                <h3 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-primary)', fontWeight: 700 }}>الإشعارات</h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}
                  onClick={() => { notifications.forEach(n => markAsRead(n.id)); setShowDropdown(false); }}>
                  تنظيف الكل
                </span>
              </div>
              {notifications.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-tertiary)', padding: '2rem', fontWeight: 600 }}>
                  لا توجد إشعارات جديدة
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '300px', overflowY: 'auto' }}>
                  {notifications.map(n => (
                    <div key={n.id} onClick={() => markAsRead(n.id)} style={{
                      padding: '0.8rem', background: 'var(--primary-lighter)', borderRadius: '10px',
                      cursor: 'pointer', transition: 'all 0.2s', borderRight: '3px solid var(--primary)',
                    }}>
                      <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.3rem', color: 'var(--text-primary)' }}>{n.title}</div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>{n.message}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </header>

        {children}
      </main>

      <style jsx global>{`
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>
    </div>
  );
}
