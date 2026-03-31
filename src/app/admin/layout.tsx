"use client";
import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { logSecurityEvent } from '@/lib/utils';
import { useAdminNotifications } from '@/hooks/useAdminNotifications';
import { Ban, BarChart2, Package, ShoppingCart, Users, Activity, Globe, Bell, Flower2, User, AlertTriangle, Upload } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const pathname = usePathname();
  const { notifications, markAsRead } = useAdminNotifications();

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const email = session?.user?.email;
      if (email && (email.startsWith('mrmrx2824') || email.startsWith('admin'))) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
        
        // Log unauthorized access attempt using the new utility
        await logSecurityEvent(supabase, {
          type: 'SECURITY_ALERT',
          title: 'محاولة دخول غير مصرحة!',
          account: email ? `مستخدم (${email})` : 'زائر مجهول'
        });
      }
      setLoading(false);
    });
  }, []);

  if (loading) return <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-primary)' }}>جاري التحقق من الصلاحيات...</div>;
  if (!isAdmin) return (
    <div style={{ padding: '5rem', textAlign: 'center', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <Ban size={64} color="var(--primary)" style={{ marginBottom: '1rem' }} />
      <h1 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>ممنوع الدخول</h1>
      <p style={{ color: '#aaa', marginBottom: '2rem' }}>لوحة التحكم هذه مخصصة لمدير الموقع فقط. حسابك حالياً هو حساب مستخدم عادي.</p>
      <a href="/profile" style={{ padding: '1rem 2rem', background: 'var(--primary)', color: 'white', textDecoration: 'none', borderRadius: '8px', fontWeight: 'bold' }}>العودة لحسابي</a>
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--background)', color: 'var(--text-primary)' }}>
      {/* Sidebar Navigation */}
      <aside style={{ width: '250px', background: 'var(--surface)', borderLeft: '1px solid var(--border)', padding: '2rem 1rem', display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ color: '#e63946', marginBottom: '3rem', fontSize: '1.8rem', textAlign: 'center', fontWeight: 'bold', letterSpacing: '1px' }}>
          بـوجـا أدمن
        </h2>
        
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', flex: 1 }}>
          {[
            { href: '/admin', icon: <BarChart2 size={18} />, label: 'الرئيسية' },
            { href: '/admin/products', icon: <Package size={18} />, label: 'إدارة المنتجات' },
            { href: '/admin', id: 'orders', icon: <ShoppingCart size={18} />, label: 'الطلبات والمبيعات' }, // Mocking for now as the link was duplicate
            { href: '/admin/users', icon: <Users size={18} />, label: 'العملاء والمستخدمين (CRM)' },
            { href: '/admin/import', icon: <Upload size={18} />, label: 'رفع منتجات (CSV)' },
            { href: '/admin/logs', icon: <Activity size={18} />, label: 'سجل المراقبة (IPs)' },
          ].map((item) => {
            const active = pathname === item.href && (!item.id || pathname.includes(item.id));
            return (
              <a 
                key={item.href + (item.id || '')}
                href={item.href} 
                style={{ 
                  padding: '1rem', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s',
                  background: active ? 'rgba(76, 201, 240, 0.08)' : 'transparent',
                  color: active ? '#4cc9f0' : '#aaa',
                  borderLeft: active ? '3px solid #4cc9f0' : 'none'
                }} 
                onMouseOver={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }} 
                onMouseOut={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
              >
                {item.icon} {item.label}
              </a>
            );
          })}
          
          <div style={{ height: '1px', background: 'var(--border)', margin: '1rem 0' }} />
          
          <a href="/" style={{ padding: '1rem', borderRadius: '8px', border: '1px solid var(--primary)', color: 'var(--primary)', textDecoration: 'none', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: 'all 0.2s' }} onMouseOver={e=>{e.currentTarget.style.background='var(--primary)'; e.currentTarget.style.color='white'}} onMouseOut={e=>{e.currentTarget.style.background='transparent'; e.currentTarget.style.color='var(--primary)'}}>
            العودة للمتجر <Globe size={18} />
          </a>
        </nav>
      </aside>

      {/* Main Dashboard Content */}
      <main style={{ flex: 1, padding: '2rem 3rem', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        
        {/* Top Navbar */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: '1.8rem', color: 'var(--text-primary)' }}>مرحباً بعودتك، مدير النظام</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div onClick={() => setShowDropdown(!showDropdown)} style={{ position: 'relative', cursor: 'pointer', padding: '0.6rem', background: 'rgba(0,0,0,0.03)', borderRadius: '50%', border: '1px solid var(--border)', transition: 'background 0.2s' }} onMouseOver={e=>e.currentTarget.style.background='rgba(0,0,0,0.06)'} onMouseOut={e=>e.currentTarget.style.background='rgba(0,0,0,0.03)'}>
              <Bell size={24} color={notifications.length > 0 ? 'var(--primary)' : 'var(--text-secondary)'} />
              {notifications.length > 0 && (
                <span style={{ position: 'absolute', top: -3, right: -3, background: 'var(--primary)', color: 'white', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold', border: '2px solid var(--background)' }}>
                  {notifications.length}
                </span>
              )}
            </div>
          </div>
          
          {/* Notification Dropdown */}
          {showDropdown && (
            <div style={{ position: 'absolute', top: '3.5rem', left: 0, width: '350px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', zIndex: 50, padding: '1rem', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '0.8rem', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary)' }}>الإشعارات الحديثة</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--primary)', cursor: 'pointer' }} onClick={() => notifications.forEach(n => markAsRead(n.id))}>تحديد الكل كمقروء</span>
              </div>
              
              {notifications.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                  <Flower2 size={24} />
                  لا توجد إشعارات جديدة
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '350px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                  {notifications.map(n => (
                    <div key={n.id} onClick={() => markAsRead(n.id)} style={{ padding: '1rem', background: 'rgba(0,0,0,0.02)', borderRadius: '8px', cursor: 'pointer', transition: 'background 0.2s', borderLeft: '3px solid var(--primary)' }} onMouseOver={e=>e.currentTarget.style.background='rgba(255,255,255,0.06)'} onMouseOut={e=>e.currentTarget.style.background='rgba(0,0,0,0.02)'}>
                       <div style={{ fontWeight: 'bold', fontSize: '0.95rem', marginBottom: '0.4rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                         {n.type === 'NEW_USER' ? <User size={16}/> : n.type === 'NEW_PRODUCT' ? <Package size={16}/> : <ShoppingCart size={16}/>} {n.title}
                       </div>
                       <div style={{ color: '#aaa', fontSize: '0.85rem', lineHeight: 1.4 }}>{n.message}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </header>

        {children}
      </main>

      {/* Global Admin Alerts are now handled by AdminToastListener in RootLayout */}
    </div>
  );
}
