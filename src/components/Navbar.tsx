"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { logSecurityEvent } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { Heart, ShoppingCart, User, Settings, LogOut, Tag, Trophy, Zap, Hand, Rocket, Lock, Eye, EyeOff, X as XIcon, Car, Wallet, Landmark, ShieldCheck, BarChart3, PackagePlus, Store, Crown, TrendingUp, Package } from 'lucide-react';
import AuthModal from './AuthModal';

export default function Navbar() {
  const { user, isAuthModalOpen, closeAuthModal, openLoginModal, openSignUpModal, signOut } = useAuth();
  const { cartCount, setIsCartOpen } = useCart();
  const pathname = usePathname();
  
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (user?.id) {
       supabase.from('profiles').select('*').eq('id', user.id).single().then(({data}) => {
         if (data) setProfile(data);
       });
    } else {
       setProfile(null);
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut();
      setShowProfileMenu(false);
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  const isAdmin = user?.email?.startsWith('mrmrx2824') || user?.email?.startsWith('admin') || profile?.role === 'admin' || profile?.role === 'superadmin';
  const isMerchant = !!profile?.cr_number;
  const merchantName = profile?.business_name || profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0];
  const merchantInitial = (profile?.business_name?.charAt(0) || profile?.full_name?.charAt(0) || user?.email?.charAt(0) || '?').toUpperCase();

  // Merchant Command Panel link item style
  const cmdLink = (accent?: string) => ({
    padding: '0.75rem 0.9rem',
    color: 'rgba(255,255,255,0.75)',
    textDecoration: 'none',
    borderRadius: '12px',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: '0.9rem',
    fontWeight: 600,
    fontSize: '0.88rem',
    cursor: 'pointer',
    background: 'transparent',
    border: 'none',
    width: '100%',
    textAlign: 'right' as const,
  });

  return (
    <>
      <header style={{
        position: 'fixed',
        top: 0, left: 0, right: 0,
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        background: isAdmin 
          ? 'rgba(5, 5, 12, 0.85)' /* Cyber Dark */
          : isMerchant
            ? '#080702'
            : 'rgba(10, 10, 10, 0.98)',
        backdropFilter: isAdmin ? 'blur(25px)' : 'none',
        borderBottom: isAdmin
          ? '1px solid rgba(76,201,240,0.2)'
          : isMerchant
            ? '1px solid rgba(212,175,55,0.18)'
            : '1px solid var(--border)',
        boxShadow: isAdmin
          ? '0 10px 40px rgba(0,0,0,0.8), 0 0 0 1px rgba(76,201,240,0.05) inset'
          : isMerchant
            ? '0 4px 40px rgba(0,0,0,0.8), 0 0 0 1px rgba(212,175,55,0.06) inset'
            : '0 4px 30px rgba(0,0,0,0.4)',
        transition: 'all 0.5s ease',
      }}>

        {/* ═══ ADMIN GOD MODE TOP BAR ═══ */}
        {isAdmin ? (
          <div style={{
            background: 'linear-gradient(90deg, rgba(76,201,240,0) 0%, rgba(76,201,240,0.07) 20%, rgba(76,201,240,0.15) 50%, rgba(76,201,240,0.07) 80%, rgba(76,201,240,0) 100%)',
            borderBottom: '1px solid rgba(76,201,240,0.1)',
            padding: '0.38rem 2.5rem',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.8rem' }}>
              {/* Live dot + label */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#f43f5e', boxShadow: '0 0 8px rgba(244,63,94,0.8)' }} />
                  <div style={{ position: 'absolute', inset: '-3px', borderRadius: '50%', border: '1.5px solid #f43f5e', opacity: 0.4, animation: 'ping 1.5s cubic-bezier(0,0,0.2,1) infinite' }} />
                </div>
                <span style={{ color: '#4cc9f0', fontSize: '0.68rem', fontWeight: 900, letterSpacing: '1.5px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Crown size={12} color="#f43f5e" /> System Admin
                </span>
              </div>
              {/* Quick Admin links */}
              {[
                { href: '/admin', label: 'مركز القيادة' },
                { href: '/admin/finances', label: 'الماليات والعمولات' },
                { href: '/admin/users', label: 'سجلات المستهدفين' },
              ].map(link => (
                <Link key={link.href} href={link.href} style={{
                  color: 'rgba(76,201,240,0.5)', fontSize: '0.68rem', fontWeight: 700,
                  textDecoration: 'none', letterSpacing: '0.3px', transition: '0.2s',
                  display: 'flex', alignItems: 'center', gap: '0.3rem'
                }}
                  onMouseOver={e => e.currentTarget.style.color = '#4cc9f0'}
                  onMouseOut={e => e.currentTarget.style.color = 'rgba(76,201,240,0.5)'}
                >{link.label}</Link>
              ))}
            </div>
            <div style={{ color: '#f43f5e', fontSize: '0.65rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '0.4rem', letterSpacing: '1px' }}>
              <ShieldCheck size={10} /> صلاحيات عليا (GOD MODE)
            </div>
          </div>
        ) : isMerchant ? (
          /* ═══ MERCHANT GOLD TOP BAR ═══ */
          <div style={{
            background: 'linear-gradient(90deg, rgba(212,175,55,0) 0%, rgba(212,175,55,0.07) 20%, rgba(212,175,55,0.1) 50%, rgba(212,175,55,0.07) 80%, rgba(212,175,55,0) 100%)',
            borderBottom: '1px solid rgba(212,175,55,0.1)',
            padding: '0.38rem 2.5rem',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.8rem' }}>
              {/* Live dot + label */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px rgba(16,185,129,0.8)' }} />
                  <div style={{ position: 'absolute', inset: '-3px', borderRadius: '50%', border: '1.5px solid #10b981', opacity: 0.4, animation: 'ping 1.5s cubic-bezier(0,0,0.2,1) infinite' }} />
                </div>
                <span style={{ color: '#D4AF37', fontSize: '0.68rem', fontWeight: 900, letterSpacing: '1.5px', textTransform: 'uppercase' }}>
                  Merchant Pro
                </span>
              </div>
              {/* Quick merchant links */}
              {[
                { href: '/seller/dashboard', label: 'لوحة التحكم' },
                { href: '/sell', label: 'إضافة منتج' },
                { href: '/seller/products', label: 'المخزن' },
              ].map(link => (
                <Link key={link.href} href={link.href} style={{
                  color: 'rgba(212,175,55,0.45)', fontSize: '0.68rem', fontWeight: 700,
                  textDecoration: 'none', letterSpacing: '0.3px', transition: '0.2s',
                }}
                  onMouseOver={e => e.currentTarget.style.color = '#D4AF37'}
                  onMouseOut={e => e.currentTarget.style.color = 'rgba(212,175,55,0.45)'}
                >{link.label}</Link>
              ))}
            </div>
            <div style={{ color: 'rgba(212,175,55,0.35)', fontSize: '0.65rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <ShieldCheck size={10} /> سجل تجاري موثق {profile.cr_number}
            </div>
          </div>
        ) : null}

        {/* ═══ MAIN NAV ROW ═══ */}
        <div style={{
          padding: '0.8rem 2.5rem',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          {/* Branding Area */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '3rem' }}>
            <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ position: 'relative' }}>
                <h1 style={{ 
                  color: isAdmin ? '#4cc9f0' : isMerchant ? '#D4AF37' : 'var(--text-primary)', 
                  margin: 0, fontSize: '1.9rem', fontWeight: 950, letterSpacing: '-1px',
                  textShadow: isAdmin ? '0 0 20px rgba(76,201,240,0.5)' : isMerchant ? '0 0 30px rgba(212,175,55,0.3)' : '0 0 20px rgba(244, 63, 94, 0.2)',
                  display: 'flex', alignItems: 'center', gap: '0.4rem'
                }}>
                  BOOGA <span style={{ color: isAdmin ? '#f43f5e' : isMerchant ? '#FFD700' : 'var(--primary)' }}>CAR</span>
                </h1>
                {/* Badge */}
                {isAdmin ? (
                  <div style={{ 
                    position: 'absolute', top: -14, right: -40, 
                    fontSize: '0.6rem', fontWeight: 900, 
                    background: 'linear-gradient(90deg, #f43f5e, #be123c)', color: '#fff',
                    padding: '0.2rem 0.6rem', borderRadius: '40px',
                    border: '1px solid rgba(255,255,255,0.4)',
                    boxShadow: '0 2px 15px rgba(244,63,94,0.5)',
                    letterSpacing: '0.5px'
                  }}>GOD MODE</div>
                ) : isMerchant ? (
                  <div style={{ 
                    position: 'absolute', top: -14, right: -30, 
                    fontSize: '0.6rem', fontWeight: 900, 
                    background: 'linear-gradient(90deg, #D4AF37, #AA7C11)', color: '#000',
                    padding: '0.2rem 0.6rem', borderRadius: '40px',
                    border: '2px solid rgba(212,175,55,0.3)',
                    boxShadow: '0 2px 10px rgba(212,175,55,0.3)',
                    letterSpacing: '0.5px'
                  }}>B2B PRO</div>
                ) : (
                  <div style={{ 
                    position: 'absolute', top: -14, right: -25, 
                    fontSize: '0.65rem', fontWeight: 900, 
                    background: 'linear-gradient(90deg, #10b981, #059669)', color: 'white',
                    padding: '0.2rem 0.6rem', borderRadius: '40px',
                    border: '2px solid var(--surface)',
                    boxShadow: '0 2px 10px rgba(16, 185, 129, 0.3)'
                  }}>🇸🇦 KSA STORE</div>
                )}
              </div>
            </Link>

            <nav className="desktop-nav" style={{ display: 'flex', gap: '2rem' }}>
              {(isAdmin ? [
                { href: '/admin', label: '🛡️ مركز القيادة' },
                { href: '/admin/products', label: 'ترسانة المنتجات' },
                { href: '/admin/users', label: 'سجلات المستهدفين' },
                { href: '/products', label: 'تصفح كالمستخدم' },
              ] : isMerchant ? [
                { href: '/seller/dashboard', label: '⚡ لوحة التحكم' },
                { href: '/sell', label: 'إضافة منتج' },
                { href: '/seller/products', label: 'منتجاتي' },
                { href: '/products', label: 'المتجر' },
              ] : [
                { href: '/', label: 'الرئيسية' },
                { href: '/products', label: 'قطع الغيار' },
                { href: '/accessories', label: 'أكسسوارات', isNew: true },
                { href: '/track-order', label: 'تتبع الطلبات' },
                { href: '/garage', label: 'كراجي' },
                { href: '/sell', label: 'اعرض قطعة' },
                { href: '/become-dealer', label: 'بوجا للأعمال', isNew: true },
              ]).map((link: any) => {
                const isActive = pathname === link.href;
                const isCTA = link.href === '/sell' || (isMerchant && link.href === '/seller/dashboard') || (isAdmin && link.href === '/admin');
                return (
                  <Link key={link.href} href={link.href} style={{
                    color: isCTA
                      ? (isAdmin ? '#4cc9f0' : isMerchant ? '#D4AF37' : 'var(--primary)')
                      : isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                    fontWeight: isActive || isCTA ? 800 : 700,
                    fontSize: '0.9rem',
                    padding: '1rem 0.2rem',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    textShadow: isCTA && isAdmin ? '0 0 15px rgba(76,201,240,0.4)' : isCTA && isMerchant ? '0 0 15px rgba(212,175,55,0.4)' : 'none',
                  }}>
                    {link.label}
                    {link.href === '/sell' && !isMerchant && !isAdmin && <Tag size={16} />}
                    {(link as any).isNew && !isMerchant && !isAdmin && (
                      <span style={{ 
                        fontSize: '0.6rem', background: 'var(--primary)', color: 'white', 
                        padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 900,
                        position: 'absolute', top: 0, right: -15
                      }}>جديد</span>
                    )}
                    {isActive && (
                      <span style={{ 
                        position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px', 
                        background: isAdmin ? '#4cc9f0' : isMerchant ? '#D4AF37' : 'var(--primary)', borderRadius: '2px',
                        boxShadow: isAdmin ? '0 2px 8px rgba(76,201,240,0.5)' : isMerchant ? '0 2px 8px rgba(212,175,55,0.5)' : '0 2px 8px rgba(244, 63, 94, 0.4)'
                      }} />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Side Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
            {!isMerchant && (
              <Link href="/wishlist" style={{ 
                textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                width: '45px', height: '45px', borderRadius: '14px', background: 'var(--surface-hover)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', border: '1px solid var(--border)', cursor: 'pointer',
                color: 'var(--text-primary)'
              }}>
                <Heart size={22} />
              </Link>
            )}

            {!isMerchant && (
              <div 
                onClick={() => setIsCartOpen(true)}
                style={{ 
                  position: 'relative', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                  width: '45px', height: '45px', borderRadius: '14px', background: 'var(--surface-hover)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', border: '1px solid var(--border)',
                  color: 'var(--text-primary)'
                }}
              >
                <ShoppingCart size={22} />
                {cartCount > 0 && (
                  <span style={{ 
                    position: 'absolute', top: -6, right: -6, background: 'var(--primary)', color: 'white', 
                    borderRadius: '8px', minWidth: '22px', height: '22px', padding: '0 4px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', 
                    fontSize: '0.75rem', fontWeight: 900, border: '2px solid var(--surface)',
                    boxShadow: '0 4px 10px rgba(244, 63, 94, 0.3)'
                  }}>
                    {cartCount}
                  </span>
                )}
              </div>
            )}

            {/* Merchant quick action buttons */}
            {isMerchant && (
              <>
                <Link href="/sell" style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.55rem 1.1rem', borderRadius: '12px',
                  background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.25)',
                  color: '#D4AF37', fontSize: '0.82rem', fontWeight: 800, textDecoration: 'none',
                  transition: 'all 0.25s',
                }} onMouseOver={e => { e.currentTarget.style.background = 'rgba(212,175,55,0.18)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                   onMouseOut={e => { e.currentTarget.style.background = 'rgba(212,175,55,0.1)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                  <PackagePlus size={16} /> إضافة منتج
                </Link>
                <div 
                  onClick={() => setIsCartOpen(true)}
                  style={{ 
                    position: 'relative', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                    width: '42px', height: '42px', borderRadius: '12px', 
                    background: 'rgba(212,175,55,0.06)',
                    transition: 'all 0.3s', border: '1px solid rgba(212,175,55,0.15)',
                    color: 'rgba(212,175,55,0.7)'
                  }}
                >
                  <ShoppingCart size={20} />
                  {cartCount > 0 && (
                    <span style={{ 
                      position: 'absolute', top: -5, right: -5, background: '#D4AF37', color: '#000', 
                      borderRadius: '6px', minWidth: '18px', height: '18px', padding: '0 3px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', 
                      fontSize: '0.7rem', fontWeight: 900,
                    }}>
                      {cartCount}
                    </span>
                  )}
                </div>
              </>
            )}

            <div style={{ width: '1px', height: '24px', background: isMerchant ? 'rgba(212,175,55,0.15)' : 'var(--border)', margin: '0 0.5rem' }} />

            {user ? (
              <div style={{ position: 'relative' }}>
                {/* ═══ MERCHANT AVATAR BUTTON ═══ */}
                {isMerchant ? (
                  <div 
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    style={{ 
                      display: 'flex', alignItems: 'center', gap: '0.9rem', cursor: 'pointer', 
                      background: 'linear-gradient(135deg, rgba(20,16,4,0.95), rgba(12,10,2,0.98))',
                      padding: '0.4rem 1.2rem 0.4rem 0.5rem', borderRadius: '16px', 
                      border: '1px solid rgba(212,175,55,0.3)', 
                      transition: 'all 0.3s',
                      boxShadow: '0 4px 20px rgba(212,175,55,0.1), inset 0 1px 0 rgba(255,215,0,0.08)',
                    }}
                    onMouseOver={e => { e.currentTarget.style.borderColor = 'rgba(212,175,55,0.6)'; e.currentTarget.style.boxShadow = '0 6px 30px rgba(212,175,55,0.2)'; }}
                    onMouseOut={e => { e.currentTarget.style.borderColor = 'rgba(212,175,55,0.3)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(212,175,55,0.1)'; }}
                  >
                    {/* Gold animated avatar */}
                    <div style={{ position: 'relative' }}>
                      <div style={{ 
                        position: 'absolute', inset: '-3px', borderRadius: '12px',
                        background: 'conic-gradient(from 0deg, #D4AF37, #FFD700, #AA7C11, #D4AF37)',
                        animation: 'spinRing 4s linear infinite',
                        opacity: 0.8,
                      }} />
                      <div style={{ 
                        width: '38px', height: '38px', borderRadius: '10px', position: 'relative',
                        background: 'linear-gradient(135deg, #D4AF37 0%, #FFD700 50%, #AA7C11 100%)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', 
                        color: '#111', fontWeight: 900, fontSize: '1.1rem', textTransform: 'uppercase',
                        boxShadow: '0 4px 15px rgba(212,175,55,0.4)',
                        zIndex: 1,
                      }}>
                        {merchantInitial}
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                      <span style={{ color: '#FFD700', fontWeight: 900, fontSize: '0.9rem', lineHeight: 1, textShadow: '0 0 10px rgba(212,175,55,0.3)' }}>
                        {merchantName}
                      </span>
                      <span style={{ fontSize: '0.62rem', color: '#10b981', fontWeight: 900, marginTop: '3px', display: 'flex', alignItems: 'center', gap: '3px', letterSpacing: '0.3px' }}>
                        <ShieldCheck size={9} /> تاجر موثق PRO
                      </span>
                    </div>
                    <Crown size={14} style={{ color: '#D4AF37', opacity: 0.7 }} />
                  </div>
                ) : (
                  /* Regular user avatar button */
                  <div 
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    style={{ 
                      display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer', 
                      background: 'var(--surface-hover)', padding: '0.4rem 1.2rem 0.4rem 0.6rem', borderRadius: '14px', 
                      border: '1px solid var(--border)', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                  >
                    <div style={{ 
                      width: '36px', height: '36px', borderRadius: '10px', 
                      background: 'var(--primary)', 
                      display: 'flex', alignItems: 'center', justifyContent: 'center', 
                      color: 'white', fontWeight: 900, fontSize: '1rem', textTransform: 'uppercase',
                      boxShadow: '0 4px 12px rgba(244, 63, 94, 0.2)',
                    }}>
                      {merchantInitial}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                       <span style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: '0.9rem', lineHeight: 1 }}>
                         {merchantName}
                       </span>
                       <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 600, marginTop: '3px' }}>
                         عميل مميز
                       </span>
                    </div>
                    <User size={16} style={{ opacity: 0.5 }} />
                  </div>
                )}
                
                {/* ═══ DROPDOWN ═══ */}
                {showProfileMenu && (
                  isMerchant ? (
                    /* MERCHANT COMMAND PANEL */
                    <div style={{ 
                      position: 'absolute', top: 'calc(100% + 14px)', left: 0, width: '300px', 
                      background: 'linear-gradient(180deg, #0e0b02 0%, #080601 100%)', 
                      border: '1px solid rgba(212,175,55,0.2)', 
                      borderRadius: '20px', 
                      overflow: 'hidden',
                      boxShadow: '0 25px 80px rgba(0,0,0,0.95), 0 0 60px rgba(212,175,55,0.06)', 
                      zIndex: 999999,
                      animation: 'fadeInScale 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}>
                      {/* Panel Header */}
                      <div style={{ 
                        padding: '1.2rem 1.2rem 1rem',
                        background: 'linear-gradient(135deg, rgba(212,175,55,0.07) 0%, rgba(212,175,55,0.03) 100%)',
                        borderBottom: '1px solid rgba(212,175,55,0.08)',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
                          <div style={{ 
                            width: '46px', height: '46px', borderRadius: '14px',
                            background: 'linear-gradient(135deg, #D4AF37, #AA7C11)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#111', fontWeight: 900, fontSize: '1.3rem',
                            boxShadow: '0 6px 20px rgba(212,175,55,0.3)',
                          }}>
                            {merchantInitial}
                          </div>
                          <div>
                            <div style={{ color: '#FFD700', fontWeight: 900, fontSize: '1rem', lineHeight: 1.2 }}>{merchantName}</div>
                            <div style={{ color: '#10b981', fontSize: '0.7rem', fontWeight: 800, marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '3px' }}>
                              <ShieldCheck size={10} /> موثق • س.ت: {profile.cr_number}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Commands */}
                      <div style={{ padding: '0.6rem' }}>
                        {/* Section: Store */}
                        <div style={{ padding: '0.5rem 0.5rem 0.3rem', color: 'rgba(212,175,55,0.4)', fontSize: '0.62rem', fontWeight: 900, letterSpacing: '2px', textTransform: 'uppercase' }}>
                          إدارة المتجر
                        </div>
                        {[
                          { href: '/seller/dashboard', label: 'لوحة التحكم', desc: 'المبيعات والأرباح الفورية', icon: <BarChart3 size={16}/>, color: '#D4AF37' },
                          { href: '/seller/products', label: 'مخزن المنتجات', desc: 'إدارة وتعديل قطعك', icon: <Package size={16}/>, color: '#3b82f6' },
                          { href: '/sell', label: 'إضافة منتج جديد', desc: 'يدوي أو رفع ملف بالجملة', icon: <PackagePlus size={16}/>, color: '#10b981' },
                        ].map(item => (
                          <Link key={item.href} href={item.href} onClick={() => setShowProfileMenu(false)} style={{ ...cmdLink(), display: 'flex' }}
                            onMouseOver={e => { e.currentTarget.style.background = 'rgba(212,175,55,0.06)'; e.currentTarget.style.color = '#fff'; }}
                            onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.75)'; }}
                          >
                            <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: `rgba(${item.color === '#D4AF37' ? '212,175,55' : item.color === '#3b82f6' ? '59,130,246' : '16,185,129'},0.12)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: item.color, flexShrink: 0 }}>
                              {item.icon}
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 800, fontSize: '0.88rem', color: 'rgba(255,255,255,0.9)' }}>{item.label}</div>
                              <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', marginTop: '1px' }}>{item.desc}</div>
                            </div>
                          </Link>
                        ))}

                        {/* Section: Account */}
                        <div style={{ padding: '0.8rem 0.5rem 0.3rem', color: 'rgba(212,175,55,0.4)', fontSize: '0.62rem', fontWeight: 900, letterSpacing: '2px', textTransform: 'uppercase', marginTop: '0.3rem' }}>
                          الحساب
                        </div>
                        {[
                          { href: '/profile', label: 'الملف الشخصي', icon: <User size={16}/> },
                          { href: '/seller/settings', label: 'إعدادات المحل', icon: <Settings size={16}/> },
                        ].map(item => (
                          <Link key={item.href} href={item.href} onClick={() => setShowProfileMenu(false)} style={{ ...cmdLink(), display: 'flex' }}
                            onMouseOver={e => { e.currentTarget.style.background = 'rgba(212,175,55,0.06)'; e.currentTarget.style.color = '#fff'; }}
                            onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.75)'; }}
                          >
                            <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(212,175,55,0.6)', flexShrink: 0 }}>
                              {item.icon}
                            </div>
                            <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{item.label}</div>
                          </Link>
                        ))}

                        {/* Admin links */}
                        {(user?.email?.startsWith('mrmrx2824') || user?.email?.startsWith('admin')) && (
                          <>
                            <div style={{ padding: '0.8rem 0.5rem 0.3rem', color: 'rgba(244,63,94,0.4)', fontSize: '0.62rem', fontWeight: 900, letterSpacing: '2px', textTransform: 'uppercase' }}>
                              الإدارة
                            </div>
                            <Link href="/admin" onClick={() => setShowProfileMenu(false)} style={{ ...cmdLink(), display: 'flex', color: 'rgba(244,63,94,0.8)' }}
                              onMouseOver={e => { e.currentTarget.style.background = 'rgba(244,63,94,0.06)'; }}
                              onMouseOut={e => { e.currentTarget.style.background = 'transparent'; }}
                            >
                              <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'rgba(244,63,94,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <Settings size={16} color="#f43f5e" />
                              </div>
                              لوحة الإدارة
                            </Link>
                          </>
                        )}
                      </div>

                      {/* Logout */}
                      <div style={{ padding: '0.5rem 0.6rem 0.7rem', borderTop: '1px solid rgba(212,175,55,0.08)' }}>
                        <button onClick={handleLogout} style={{ 
                          ...cmdLink(), display: 'flex', color: 'rgba(255,80,80,0.6)',
                          borderRadius: '10px', padding: '0.7rem 0.9rem',
                        }}
                          onMouseOver={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.07)'; e.currentTarget.style.color = '#ff5555'; }}
                          onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,80,80,0.6)'; }}
                        >
                          <LogOut size={15} /> تسجيل الخروج
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* REGULAR USER DROPDOWN */
                    <div style={{ 
                      position: 'absolute', top: 'calc(100% + 12px)', left: 0, width: '220px', 
                      background: '#0a0a0a', 
                      border: '1px solid var(--border)', 
                      borderRadius: '16px', 
                      padding: '0.6rem', display: 'flex', flexDirection: 'column', gap: '0.2rem', 
                      boxShadow: '0 10px 40px rgba(0,0,0,0.8)', 
                      zIndex: 999999,
                      animation: 'fadeInScale 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}>
                      <Link href="/profile" onClick={() => setShowProfileMenu(false)} style={{ 
                        padding: '0.8rem 1rem', color: 'var(--text-primary)', textDecoration: 'none', 
                        borderRadius: '10px', transition: '0.2s', display: 'flex', alignItems: 'center', gap: '0.8rem',
                        fontWeight: 600, fontSize: '0.95rem'
                      }} onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                        <User size={18} /> حسابي الشخصي
                      </Link>
                      {(user?.email?.startsWith('mrmrx2824') || user?.email?.startsWith('admin')) && (
                        <>
                          <Link href="/admin" onClick={() => setShowProfileMenu(false)} style={{ 
                            padding: '0.8rem 1rem', color: 'var(--primary)', textDecoration: 'none', 
                            borderRadius: '10px', transition: '0.2s', display: 'flex', alignItems: 'center', gap: '0.8rem',
                            fontWeight: 800, fontSize: '0.95rem', background: 'rgba(244, 63, 94, 0.05)'
                          }}>
                            <Settings size={18} /> لوحة الإدارة
                          </Link>
                          <Link href="/admin/finances" onClick={() => setShowProfileMenu(false)} style={{ 
                            padding: '0.8rem 1rem', color: 'var(--success)', textDecoration: 'none', 
                            borderRadius: '10px', transition: '0.2s', display: 'flex', alignItems: 'center', gap: '0.8rem',
                            fontWeight: 800, fontSize: '0.95rem', background: 'rgba(16, 185, 129, 0.05)'
                          }}>
                            <Landmark size={18} /> تسويات العمولات
                          </Link>
                        </>
                      )}
                      <div style={{ height: '1px', background: 'var(--border)', margin: '0.2rem 0.4rem' }} />
                      <button onClick={handleLogout} style={{ 
                        padding: '0.8rem 1rem', color: 'var(--text-secondary)', background: 'transparent', 
                        border: 'none', borderRadius: '10px', cursor: 'pointer', textAlign: 'right', 
                        transition: '0.2s', display: 'flex', alignItems: 'center', gap: '0.8rem', 
                        fontSize: '0.95rem', width: '100%', fontWeight: 600
                      }} onMouseOver={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.06)'; e.currentTarget.style.color = '#ff5555'; }}
                         onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
                        <LogOut size={18} /> تسجيل الخروج
                      </button>
                    </div>
                  )
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '0.8rem' }}>
                <button 
                  onClick={openLoginModal} 
                  style={{
                    background: 'transparent', color: 'var(--text-primary)', border: '1px solid var(--border)',
                    padding: '0.6rem 1.4rem', borderRadius: '12px', cursor: 'pointer', fontWeight: 700, 
                    transition: 'all 0.3s ease', fontSize: '0.9rem'
                  }} 
                >
                  دخول
                </button>
                <button 
                  onClick={openSignUpModal} 
                  style={{
                    background: 'var(--primary)', color: 'white', border: 'none', 
                    padding: '0.6rem 1.6rem', borderRadius: '12px', cursor: 'pointer', 
                    fontWeight: 800, transition: 'all 0.3s ease', fontSize: '0.9rem',
                    boxShadow: '0 6px 15px rgba(244, 63, 94, 0.25)'
                  }} 
                >
                  انضم الآن
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={closeAuthModal} 
      />

      <style jsx>{`
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.95) translateY(-10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes spinRing {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes ping {
          75%, 100% { transform: scale(2); opacity: 0; }
        }
      `}</style>
    </>
  );
}
