"use client";
import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { logSecurityEvent } from '@/lib/utils';
import { useAdminNotifications } from '@/hooks/useAdminNotifications';
import { Ban, BarChart2, Package, ShoppingCart, Users, Activity, Globe, Bell, Flower2, User, Upload, Fingerprint, Search, Menu, ShieldAlert } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();
  const { notifications, markAsRead } = useAdminNotifications();

  useEffect(() => {
    // Add custom body styling overriding globals temporarily for admin pages
    document.body.style.background = '#020205';
    document.body.style.color = '#ffffff';

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const email = session?.user?.email;
      if (email && (email.startsWith('mrmrx2824') || email.startsWith('admin'))) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
        await logSecurityEvent(supabase, {
          type: 'SECURITY_ALERT',
          title: 'محاولة دخول غير مصرحة!',
          account: email ? `مستخدم (${email})` : 'زائر مجهول'
        });
      }
      setLoading(false);
    });

    return () => {
      document.body.style.background = '';
      document.body.style.color = '';
    };
  }, []);

  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#020205' }}>
      <Fingerprint size={64} color="#f43f5e" style={{ animation: 'adminPulse 2s infinite' }} />
      <h2 style={{ marginTop: '2rem', color: '#f43f5e', letterSpacing: '4px', textTransform: 'uppercase', fontSize: '1rem', fontWeight: 900 }}>جارٍ التحقق من الهوية السيادية</h2>
      <style>{`@keyframes adminPulse { 0% { opacity: 0.3; transform: scale(0.9); filter: drop-shadow(0 0 10px #f43f5e) } 50% { opacity: 1; transform: scale(1.1); filter: drop-shadow(0 0 30px #f43f5e) } 100% { opacity: 0.3; transform: scale(0.9); filter: drop-shadow(0 0 10px #f43f5e) } }`}</style>
    </div>
  );

  if (!isAdmin) return (
    <div style={{ padding: '5rem', textAlign: 'center', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#000', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(244, 63, 94, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(244, 63, 94, 0.05) 1px, transparent 1px)', backgroundSize: '40px 40px', zIndex: 0 }} />
      <ShieldAlert size={80} color="#f43f5e" style={{ position: 'relative', zIndex: 1, marginBottom: '2rem', filter: 'drop-shadow(0 0 30px rgba(244,63,94,0.6))' }} />
      <h1 style={{ color: '#f43f5e', position: 'relative', zIndex: 1, fontWeight: 950, fontSize: '3rem', letterSpacing: '-1px', marginBottom: '1rem' }}>محظور أمنياً</h1>
      <p style={{ color: '#aaa', position: 'relative', zIndex: 1, fontSize: '1.2rem', marginBottom: '3rem', maxWidth: '500px' }}>لقد تم تسجيل هذه المحاولة. لا تملك صلاحية الدخول لمركز العمليات.</p>
      <a href="/profile" style={{ position: 'relative', zIndex: 1, padding: '1rem 3rem', background: 'transparent', color: '#f43f5e', border: '1px solid #f43f5e', textDecoration: 'none', borderRadius: '4px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '2px', transition: 'all 0.3s', boxShadow: 'inset 0 0 20px rgba(244,63,94,0.1)' }} onMouseOver={e => { e.currentTarget.style.background = '#f43f5e'; e.currentTarget.style.color = '#fff' }} onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#f43f5e' }}>الانسحاب فوراً</a>
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#020205', color: '#fff', position: 'relative', overflow: 'hidden' }}>
      
      {/* Background Cyber Grid */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(76, 201, 240, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(76, 201, 240, 0.03) 1px, transparent 1px)', backgroundSize: '50px 50px', zIndex: 0, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(244,63,94,0.1) 0%, transparent 70%)', zIndex: 0, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '800px', height: '800px', background: 'radial-gradient(circle, rgba(76,201,240,0.08) 0%, transparent 70%)', zIndex: 0, pointerEvents: 'none' }} />

      {/* Cyber Sidebar */}
      <aside style={{ width: sidebarOpen ? '280px' : '80px', background: 'rgba(5, 5, 10, 0.8)', backdropFilter: 'blur(30px)', borderLeft: '1px solid rgba(76,201,240,0.1)', padding: sidebarOpen ? '2rem 1.5rem' : '2rem 1rem', display: 'flex', flexDirection: 'column', transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)', position: 'relative', zIndex: 10, alignItems: sidebarOpen ? 'stretch' : 'center' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: sidebarOpen ? 'space-between' : 'center', marginBottom: '3rem' }}>
          {sidebarOpen && (
             <h2 style={{ color: '#f43f5e', fontSize: '1.4rem', margin: 0, fontWeight: 950, letterSpacing: '2px', textShadow: '0 0 20px rgba(244,63,94,0.4)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
               <Fingerprint size={24} /> COMMAND
             </h2>
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'transparent', border: '1px solid rgba(76,201,240,0.2)', color: '#4cc9f0', width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={e => e.currentTarget.style.background = 'rgba(76,201,240,0.1)'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
            <Menu size={18} />
          </button>
        </div>
        
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
          {[
            { href: '/admin', icon: <BarChart2 size={20} />, label: 'مركز القيادة' },
            { href: '/admin/products', icon: <Package size={20} />, label: 'ترسانة المنتجات' },
            { href: '/admin', id: 'orders', icon: <ShoppingCart size={20} />, label: 'رادار المبيعات' },
            { href: '/admin/users', icon: <Users size={20} />, label: 'سجلات المستهدفين' },
            { href: '/admin/import', icon: <Upload size={20} />, label: 'تغذية المنتجات' },
            { href: '/admin/logs', icon: <Activity size={20} />, label: 'مراقبة الشبكة' },
          ].map((item) => {
            const active = pathname === item.href && (!item.id || pathname.includes(item.id));
            return (
              <a 
                key={item.href + (item.id || '')}
                href={item.href} 
                style={{ 
                  padding: sidebarOpen ? '1rem 1.2rem' : '1rem', borderRadius: '12px', textDecoration: 'none', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '1rem', transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)', cursor: 'pointer', position: 'relative', overflow: 'hidden',
                  background: active ? 'linear-gradient(90deg, rgba(76,201,240,0.1) 0%, transparent 100%)' : 'transparent',
                  color: active ? '#4cc9f0' : 'rgba(255,255,255,0.4)',
                  justifyContent: sidebarOpen ? 'flex-start' : 'center'
                }} 
                onMouseOver={e => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.color = '#fff' } }} 
                onMouseOut={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)' } }}
              >
                {active && (
                  <div style={{ position: 'absolute', right: 0, top: '10%', bottom: '10%', width: '3px', background: '#4cc9f0', borderRadius: '10px', boxShadow: '0 0 10px #4cc9f0' }} />
                )}
                <div style={{ zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{item.icon}</div>
                {sidebarOpen && <span style={{ zIndex: 1, fontSize: '0.95rem' }}>{item.label}</span>}
              </a>
            );
          })}
          
          <div style={{ height: '1px', background: 'linear-gradient(90deg, rgba(255,255,255,0.1), transparent)', margin: '1.5rem 0' }} />
          
          <a href="/" style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(244,63,94,0.05)', border: '1px solid rgba(244,63,94,0.3)', color: '#f43f5e', textDecoration: 'none', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem', transition: 'all 0.3s', boxShadow: 'inset 0 0 20px rgba(244,63,94,0.05)' }} onMouseOver={e=>{e.currentTarget.style.background='rgba(244,63,94,0.15)'; e.currentTarget.style.boxShadow='inset 0 0 30px rgba(244,63,94,0.2)'}} onMouseOut={e=>{e.currentTarget.style.background='rgba(244,63,94,0.05)'; e.currentTarget.style.boxShadow='inset 0 0 20px rgba(244,63,94,0.05)'}}>
            {sidebarOpen ? 'مغادرة القاعدة' : ''} <Globe size={18} />
          </a>
        </nav>
      </aside>

      {/* Main Command Center Content */}
      <main style={{ flex: 1, padding: sidebarOpen ? '2rem 3.5rem' : '2rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 5, transition: 'all 0.3s' }}>
        
        {/* Floating Top Navbar / HUD */}
        <header style={{ background: 'rgba(5, 5, 12, 0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 10px #10b981', animation: 'blink 2s infinite' }} />
            <h2 style={{ fontSize: '1rem', color: '#aaa', fontWeight: 800, margin: 0, textTransform: 'uppercase', letterSpacing: '2px' }}>نظام المركز | ONLINE</h2>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            {/* Global Search Bar (Visual) */}
            <div style={{ position: 'relative', display: 'block' }}>
              <input type="text" placeholder="بحث المشفر..." style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(76,201,240,0.2)', padding: '0.8rem 1.2rem', paddingRight: '2.5rem', borderRadius: '12px', color: '#fff', fontSize: '0.9rem', width: '250px', outline: 'none' }} />
              <Search size={16} color="#4cc9f0" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>

            <div onClick={() => setShowDropdown(!showDropdown)} style={{ position: 'relative', cursor: 'pointer', padding: '0.8rem', background: 'rgba(76,201,240,0.05)', borderRadius: '12px', border: '1px solid rgba(76,201,240,0.1)', transition: 'all 0.3s' }} onMouseOver={e=>{e.currentTarget.style.background='rgba(76,201,240,0.15)'; e.currentTarget.style.boxShadow='0 0 20px rgba(76,201,240,0.2)'}} onMouseOut={e=>{e.currentTarget.style.background='rgba(76,201,240,0.05)'; e.currentTarget.style.boxShadow='none'}}>
              <Bell size={22} color={notifications.length > 0 ? '#4cc9f0' : 'rgba(255,255,255,0.4)'} />
              {notifications.length > 0 && (
                <span style={{ position: 'absolute', top: -5, right: -5, background: '#f43f5e', color: 'white', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 900, border: '2px solid #020205', boxShadow: '0 0 10px rgba(244,63,94,0.5)' }}>
                  {notifications.length}
                </span>
              )}
            </div>
          </div>
          
          {/* Cyber Notification Dropdown */}
          {showDropdown && (
            <div style={{ position: 'absolute', top: '5.5rem', left: '2rem', width: '380px', background: 'rgba(10, 10, 15, 0.95)', backdropFilter: 'blur(20px)', border: '1px solid rgba(76,201,240,0.2)', borderRadius: '20px', zIndex: 50, padding: '1.5rem', boxShadow: '0 30px 60px rgba(0,0,0,0.8), inset 0 0 0 1px rgba(255,255,255,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#fff', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Activity size={18} color="#4cc9f0" /> الإشارات الواردة
                </h3>
                <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontWeight: 700, transition: 'color 0.2s' }} onMouseOver={e=>e.currentTarget.style.color='#f43f5e'} onMouseOut={e=>e.currentTarget.style.color='rgba(255,255,255,0.4)'} onClick={() => { notifications.forEach(n => markAsRead(n.id)); setShowDropdown(false); }}>تنظيف الرادار</span>
              </div>
              
              {notifications.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', padding: '3rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', fontWeight: 800 }}>
                  <ShieldAlert size={32} color="rgba(255,255,255,0.1)" />
                  النطاق آمن، لا توجد إشارات
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', maxHeight: '400px', overflowY: 'auto' }}>
                  {notifications.map(n => (
                    <div key={n.id} onClick={() => markAsRead(n.id)} style={{ padding: '1.2rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s', border: '1px solid rgba(255,255,255,0.02)', position: 'relative', overflow: 'hidden' }} onMouseOver={e=>{e.currentTarget.style.background='rgba(76,201,240,0.08)'; e.currentTarget.style.borderColor='rgba(76,201,240,0.3)'}} onMouseOut={e=>{e.currentTarget.style.background='rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.02)'}}>
                       <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '4px', background: n.type === 'NEW_USER' ? '#3b82f6' : n.type === 'NEW_PRODUCT' ? '#10b981' : '#f59e0b' }} />
                       <div style={{ fontWeight: 900, fontSize: '0.95rem', marginBottom: '0.6rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                         {n.type === 'NEW_USER' ? <User size={16} color="#3b82f6"/> : n.type === 'NEW_PRODUCT' ? <Package size={16} color="#10b981"/> : <ShoppingCart size={16} color="#f59e0b"/>} {n.title}
                       </div>
                       <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', lineHeight: 1.5, fontWeight: 600 }}>{n.message}</div>
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
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        /* Scrollbar customizing within admin */
        main::-webkit-scrollbar { width: 8px; height: 8px; }
        main::-webkit-scrollbar-track { background: rgba(255,255,255,0.02); }
        main::-webkit-scrollbar-thumb { background: rgba(76,201,240,0.3); border-radius: 10px; }
        main::-webkit-scrollbar-thumb:hover { background: rgba(76,201,240,0.5); }
      `}</style>
    </div>
  );
}
