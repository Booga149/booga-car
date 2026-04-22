"use client";
import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { logSecurityEvent } from '@/lib/utils';
import { useAdminNotifications } from '@/hooks/useAdminNotifications';
import { useAuth } from '@/context/AuthContext';
import { BarChart2, Package, ShoppingCart, Users, Activity, Globe, Bell, User, Upload, Search, Menu, ShieldAlert, Ticket, LayoutDashboard } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, role, loading: authLoading } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();
  const { notifications, markAsRead, markAllAsRead } = useAdminNotifications();

  // Log unauthorized access attempt once if auth is resolved and user is not admin
  useEffect(() => {
    if (!authLoading && role !== 'admin') {
      logSecurityEvent(supabase, {
        type: 'SECURITY_ALERT',
        title: 'محاولة دخول غير مصرحة لصفحة الإدارة!',
        account: user?.email ? `مستخدم (${user.email})` : 'زائر مجهول'
      }).catch(() => {});
    }
  }, [authLoading, role, user]);

  if (authLoading) return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--background)' }}>
      <LayoutDashboard size={48} color="var(--primary)" style={{ animation: 'pulse 2s infinite' }} />
      <h2 style={{ marginTop: '1.5rem', color: 'var(--primary)', fontSize: '1rem', fontWeight: 700 }}>جارٍ التحقق من الصلاحيات...</h2>
      <style>{`@keyframes pulse { 0%,100% { opacity: 0.4; transform: scale(0.95); } 50% { opacity: 1; transform: scale(1.05); } }`}</style>
    </div>
  );

  const isAdmin = role === 'admin';

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

  const adminColors = {
    bg: '#0a0a0f',
    surface: '#111118',
    surfaceHover: '#1a1a24',
    border: 'rgba(255,255,255,0.06)',
    borderStrong: 'rgba(255,255,255,0.1)',
    textPrimary: '#e8e8f0',
    textSecondary: 'rgba(255,255,255,0.45)',
    textTertiary: 'rgba(255,255,255,0.25)',
    primary: '#D4AF37',
    primaryLight: 'rgba(212,175,55,0.12)',
    primaryLighter: 'rgba(212,175,55,0.06)',
    cardShadow: '0 2px 12px rgba(0,0,0,0.4)',
    success: '#10b981',
    error: '#ef4444',
  };

  return (
    <div className="admin-dark-wrapper" style={{ display: 'flex', minHeight: '100vh', background: adminColors.bg, color: adminColors.textPrimary }}>

      {/* Sidebar */}
      <aside style={{
        width: sidebarOpen ? '260px' : '72px',
        background: adminColors.surface,
        borderLeft: `1px solid ${adminColors.border}`,
        padding: sidebarOpen ? '1.5rem 1rem' : '1.5rem 0.6rem',
        display: 'flex', flexDirection: 'column',
        transition: 'all 0.3s ease',
        alignItems: sidebarOpen ? 'stretch' : 'center',
        boxShadow: '-4px 0 20px rgba(0,0,0,0.3)',
      }}>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: sidebarOpen ? 'space-between' : 'center', marginBottom: '2rem' }}>
          {sidebarOpen && (
            <h2 style={{ color: adminColors.primary, fontSize: '1.2rem', margin: 0, fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <LayoutDashboard size={20} /> الإدارة
            </h2>
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{
            background: adminColors.surfaceHover, border: `1px solid ${adminColors.border}`, color: adminColors.textSecondary,
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
                  background: active ? adminColors.primaryLight : 'transparent',
                  color: active ? adminColors.primary : adminColors.textSecondary,
                  justifyContent: sidebarOpen ? 'flex-start' : 'center',
                  fontSize: '0.9rem',
                }} 
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{item.icon}</div>
                {sidebarOpen && <span>{item.label}</span>}
              </a>
            );
          })}
          
          <div style={{ height: '1px', background: adminColors.border, margin: '1rem 0' }} />
          
          <a href="/" style={{
            padding: '0.8rem', borderRadius: '10px', color: adminColors.textSecondary,
            textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: '0.5rem', transition: 'all 0.2s',
            border: `1px solid ${adminColors.border}`, fontSize: '0.85rem',
          }}>
            <Globe size={16} /> {sidebarOpen ? 'الموقع الرئيسي' : ''}
          </a>
        </nav>

        {/* Admin user badge at bottom */}
        {sidebarOpen && (
          <div style={{
            marginTop: '1rem', padding: '0.8rem 1rem', borderRadius: '12px',
            background: adminColors.surfaceHover, border: `1px solid ${adminColors.border}`,
            display: 'flex', alignItems: 'center', gap: '0.8rem',
          }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%',
              background: `linear-gradient(135deg, ${adminColors.primary}, #B8860B)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <User size={16} color="#111" />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: adminColors.textPrimary }}>
                ⚙ مدير النظام
              </div>
              <div style={{ fontSize: '0.68rem', color: adminColors.textTertiary }}>
                صلاحيات كاملة
              </div>
            </div>
            <div style={{
              width: '8px', height: '8px', borderRadius: '50%', marginRight: 'auto',
              background: adminColors.success,
              boxShadow: `0 0 8px ${adminColors.success}`,
            }} />
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: sidebarOpen ? '1.5rem 2.5rem' : '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', transition: 'all 0.3s' }}>
        
        {/* Top Bar */}
        <header style={{
          background: adminColors.surface, border: `1px solid ${adminColors.border}`, borderRadius: '14px',
          padding: '0.8rem 1.5rem', display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', marginBottom: '2rem', boxShadow: adminColors.cardShadow,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: adminColors.success, boxShadow: `0 0 6px ${adminColors.success}` }} />
            <span style={{ fontSize: '0.85rem', color: adminColors.textSecondary, fontWeight: 600 }}>لوحة الإدارة</span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ position: 'relative' }}>
              <input type="text" placeholder="بحث..." style={{
                background: adminColors.surfaceHover, border: `1px solid ${adminColors.border}`,
                padding: '0.6rem 1rem', paddingRight: '2.2rem', borderRadius: '10px',
                color: adminColors.textPrimary, fontSize: '0.85rem', width: '200px', outline: 'none',
              }} />
              <Search size={14} color={adminColors.textTertiary} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>

            <div onClick={() => setShowDropdown(!showDropdown)} style={{
              position: 'relative', cursor: 'pointer', padding: '0.5rem',
              background: adminColors.surfaceHover, borderRadius: '10px', border: `1px solid ${adminColors.border}`,
              transition: 'all 0.2s',
            }}>
              <Bell size={20} color={notifications.filter(n => !n.is_read).length > 0 ? adminColors.primary : adminColors.textTertiary} />
              {notifications.filter(n => !n.is_read).length > 0 && (
                <span style={{
                  position: 'absolute', top: -4, right: -4, background: adminColors.error,
                  color: 'white', borderRadius: '50%', width: '20px', height: '20px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.7rem', fontWeight: 800,
                }}>
                  {notifications.filter(n => !n.is_read).length}
                </span>
              )}
            </div>
          </div>
          
          {showDropdown && (
            <div style={{
              position: 'absolute', top: '5rem', left: '2rem', width: '380px',
              background: adminColors.surface, border: `1px solid ${adminColors.borderStrong}`,
              borderRadius: '16px', zIndex: 50, padding: '1rem',
              boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${adminColors.border}`, paddingBottom: '0.8rem', marginBottom: '0.8rem' }}>
                <h3 style={{ margin: 0, fontSize: '0.95rem', color: adminColors.textPrimary, fontWeight: 700 }}>الإشعارات ({notifications.filter(n => !n.is_read).length} جديد)</h3>
                {notifications.filter(n => !n.is_read).length > 0 && (
                  <span style={{ fontSize: '0.75rem', color: adminColors.primary, cursor: 'pointer', fontWeight: 600 }}
                    onClick={() => { markAllAsRead(); }}>
                    قراءة الكل ✓
                  </span>
                )}
              </div>
              {notifications.length === 0 ? (
                <div style={{ textAlign: 'center', color: adminColors.textTertiary, padding: '2rem', fontWeight: 600 }}>
                  لا توجد إشعارات
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '350px', overflowY: 'auto' }}>
                  {notifications.map(n => (
                    <div key={n.id} onClick={() => { if (!n.is_read) markAsRead(n.id); }} style={{
                      padding: '0.8rem', 
                      background: n.is_read ? 'transparent' : adminColors.primaryLighter, 
                      borderRadius: '10px',
                      cursor: 'pointer', transition: 'all 0.2s', 
                      borderRight: `3px solid ${n.is_read ? adminColors.border : adminColors.primary}`,
                      opacity: n.is_read ? 0.6 : 1,
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontWeight: n.is_read ? 600 : 700, fontSize: '0.85rem', marginBottom: '0.3rem', color: adminColors.textPrimary }}>{n.title}</div>
                        {!n.is_read && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: adminColors.primary, flexShrink: 0 }} />}
                      </div>
                      <div style={{ color: adminColors.textSecondary, fontSize: '0.78rem', lineHeight: 1.5 }}>{n.message}</div>
                      <div style={{ color: adminColors.textTertiary, fontSize: '0.68rem', marginTop: '0.4rem' }}>
                        {new Date(n.created_at).toLocaleDateString('ar-SA')} • {new Date(n.created_at).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                      </div>
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
        
        /* Override CSS variables for admin panel children */
        .admin-dark-wrapper,
        .admin-dark-wrapper * {
          --background: #0a0a0f;
          --surface: #111118;
          --surface-hover: #1a1a24;
          --surface-active: #22222e;
          --primary: #D4AF37;
          --primary-hover: #B8860B;
          --primary-light: rgba(212,175,55,0.15);
          --primary-lighter: rgba(212,175,55,0.06);
          --text-primary: #e8e8f0;
          --text-secondary: rgba(255,255,255,0.45);
          --text-tertiary: rgba(255,255,255,0.25);
          --border: rgba(255,255,255,0.06);
          --border-strong: rgba(255,255,255,0.1);
          --card-shadow: 0 2px 12px rgba(0,0,0,0.4);
          --card-shadow-hover: 0 4px 20px rgba(212,175,55,0.08), 0 8px 30px rgba(0,0,0,0.5);
          --error: #ef4444;
          --success: #10b981;
          --warning: #f59e0b;
        }
      `}</style>
    </div>
  );
}
