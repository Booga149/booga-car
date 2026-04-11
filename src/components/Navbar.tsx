"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { Heart, ShoppingCart, User, Settings, LogOut, Tag, Crown, Zap, Package, BarChart3, PackagePlus, Store, ShieldCheck, Users, Activity, Ticket, Bell, ChevronDown } from 'lucide-react';
import AuthModal from './AuthModal';
import NotificationBell from './NotificationBell';

export default function Navbar() {
  const { user, role, profile: authProfile, isAuthModalOpen, authMode, closeAuthModal, openLoginModal, openSignUpModal, signOut } = useAuth();
  const { cartCount, setIsCartOpen } = useCart();
  const pathname = usePathname();
  
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (authProfile) {
      setProfile(authProfile);
    } else if (user?.id) {
       supabase.from('profiles').select('*').eq('id', user.id).single().then(({data}) => {
         if (data) setProfile(data);
       });
    } else {
       setProfile(null);
    }
  }, [user, authProfile]);

  const handleLogout = async () => {
    try {
      await signOut();
      setShowProfileMenu(false);
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  const isAdmin = role === 'admin';
  const isMerchant = role === 'seller' || !!profile?.cr_number;
  const displayName = profile?.business_name || profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0];
  const initial = (profile?.business_name?.charAt(0) || profile?.full_name?.charAt(0) || user?.email?.charAt(0) || '?').toUpperCase();

  // Unified nav links per role
  const navLinks = isAdmin ? [
    { href: '/admin', label: 'لوحة الإدارة' },
    { href: '/admin/products', label: 'المنتجات' },
    { href: '/admin/users', label: 'المستخدمين' },
    { href: '/products', label: 'المتجر' },
  ] : isMerchant ? [
    { href: '/seller/dashboard', label: 'لوحة التحكم' },
    { href: '/sell', label: 'إضافة منتج' },
    { href: '/seller/products', label: 'منتجاتي' },
    { href: '/products', label: 'المتجر' },
  ] : [
    { href: '/', label: 'الرئيسية' },
    { href: '/products', label: 'قطع الغيار' },
    { href: '/request-part', label: 'اطلب قطعتك', isNew: true },
    { href: '/accessories', label: 'أكسسوارات' },
    { href: '/track-order', label: 'تتبع الطلبات' },
    { href: '/garage', label: 'كراجي' },
  ];

  return (
    <>
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 99999,
        display: 'flex', flexDirection: 'column',
        background: 'rgba(255, 255, 255, 0.92)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        transition: 'all 0.3s ease',
      }}>

        {/* Top Bar for Admin/Merchant */}
        {(isAdmin || isMerchant) && (
          <div className="desktop-top-bar" style={{
            background: 'var(--primary-lighter)',
            borderBottom: '1px solid var(--border)',
            padding: '0.35rem 2.5rem',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--success)' }} />
                <span style={{ color: 'var(--primary)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.5px' }}>
                  {isAdmin ? '👑 مدير النظام' : '🛒 تاجر معتمد'}
                </span>
              </div>
              {/* Quick links */}
              {(isAdmin ? [
                { href: '/admin', label: 'لوحة القيادة' },
                { href: '/admin/logs', label: 'المراقبة' },
                { href: '/admin/users', label: 'المستخدمين' },
              ] : [
                { href: '/seller/dashboard', label: 'لوحة التحكم' },
                { href: '/sell', label: 'إضافة منتج' },
                { href: '/seller/products', label: 'المخزن' },
              ]).map(link => (
                <Link key={link.href} href={link.href} style={{
                  color: 'var(--text-secondary)', fontSize: '0.7rem', fontWeight: 600,
                  textDecoration: 'none', transition: '0.2s',
                }}>
                  {link.label}
                </Link>
              ))}
            </div>
            <div style={{ color: 'var(--text-tertiary)', fontSize: '0.65rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <ShieldCheck size={10} /> {isAdmin ? 'صلاحيات كاملة' : `س.ت: ${profile?.cr_number || ''}`}
            </div>
          </div>
        )}

        {/* Main Nav Row */}
        <div className="mobile-nav-padding" style={{
          padding: '0.8rem 3.5rem',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4rem' }}>
            <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ position: 'relative' }}>
                <h1 className="mobile-logo-size" style={{
                  color: 'var(--text-primary)', margin: 0, fontSize: '1.8rem', fontWeight: 900,
                  letterSpacing: '-1px', display: 'flex', alignItems: 'center', gap: '0.3rem',
                }}>
                  BOOGA <span style={{ color: 'var(--primary)' }}>CAR</span>
                </h1>
                {isAdmin ? (
                  <div style={{
                    position: 'absolute', top: -12, right: -35,
                    fontSize: '0.6rem', fontWeight: 800,
                    background: 'var(--primary)', color: '#fff',
                    padding: '0.15rem 0.55rem', borderRadius: '30px',
                    boxShadow: '0 2px 8px rgba(37,99,235,0.3)',
                  }}>ADMIN</div>
                ) : isMerchant ? (
                  <div style={{
                    position: 'absolute', top: -12, right: -20,
                    fontSize: '0.6rem', fontWeight: 800,
                    background: 'var(--primary)', color: '#fff',
                    padding: '0.15rem 0.55rem', borderRadius: '30px',
                    boxShadow: '0 2px 8px rgba(37,99,235,0.3)',
                  }}>PRO</div>
                ) : (
                  <div style={{
                    position: 'absolute', top: -12, right: -25,
                    fontSize: '0.6rem', fontWeight: 800,
                    background: 'var(--primary)', color: '#fff',
                    padding: '0.15rem 0.55rem', borderRadius: '30px',
                    boxShadow: '0 2px 8px rgba(37,99,235,0.3)',
                  }}>🇸🇦 KSA</div>
                )}
              </div>
            </Link>

            <nav className="desktop-nav" style={{ gap: '2rem' }}>
              {navLinks.map((link: any) => {
                const isActive = pathname === link.href;
                return (
                  <Link key={link.href} href={link.href} style={{
                    color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                    fontWeight: isActive ? 700 : 500,
                    fontSize: '0.9rem',
                    padding: '0.8rem 0.2rem',
                    transition: 'all 0.2s',
                    position: 'relative',
                    display: 'flex', alignItems: 'center', gap: '0.4rem',
                  }}>
                    {link.label}
                    {(link as any).isNew && (
                      <span style={{
                        fontSize: '0.55rem', background: 'var(--primary)', color: 'white',
                        padding: '0.1rem 0.35rem', borderRadius: '4px', fontWeight: 800,
                        position: 'absolute', top: 2, right: -15,
                      }}>جديد</span>
                    )}
                    {isActive && (
                      <span style={{
                        position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px',
                        background: 'var(--primary)', borderRadius: '2px',
                        boxShadow: '0 1px 6px rgba(37,99,235,0.3)',
                      }} />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Actions */}
          <div className="desktop-only" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            {user && <NotificationBell />}
            
            {/* Wishlist */}
            <Link href="/wishlist" style={{
              textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '42px', height: '42px', borderRadius: '12px',
              background: 'var(--surface-hover)', transition: 'all 0.2s',
              border: '1px solid var(--border)', cursor: 'pointer', color: 'var(--text-secondary)',
            }}>
              <Heart size={20} />
            </Link>

            {/* Cart */}
            <div
              onClick={() => setIsCartOpen(true)}
              style={{
                position: 'relative', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: '42px', height: '42px', borderRadius: '12px',
                background: 'var(--surface-hover)', transition: 'all 0.2s',
                border: '1px solid var(--border)', color: 'var(--text-secondary)',
              }}
            >
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span style={{
                  position: 'absolute', top: -5, right: -5, background: 'var(--primary)', color: 'white',
                  borderRadius: '7px', minWidth: '20px', height: '20px', padding: '0 4px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.72rem', fontWeight: 800, border: '2px solid var(--surface)',
                }}>
                  {cartCount}
                </span>
              )}
            </div>

            <div style={{ width: '1px', height: '24px', background: 'var(--border)', margin: '0 0.3rem' }} />

            {user ? (
              <div style={{ position: 'relative' }}>
                {/* Avatar Button */}
                <div
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.7rem', cursor: 'pointer',
                    background: 'var(--surface-hover)', padding: '0.4rem 1rem 0.4rem 0.5rem', borderRadius: '14px',
                    border: '1px solid var(--border)', transition: 'all 0.2s',
                  }}
                >
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '10px',
                    background: 'var(--primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontWeight: 800, fontSize: '1rem',
                    boxShadow: '0 2px 8px rgba(37,99,235,0.25)',
                  }}>
                    {initial}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.88rem', lineHeight: 1 }}>
                      {displayName}
                    </span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', fontWeight: 600, marginTop: '2px' }}>
                      {isAdmin ? 'مدير النظام' : isMerchant ? 'تاجر معتمد' : 'عميل'}
                    </span>
                  </div>
                  <ChevronDown size={14} style={{ color: 'var(--text-tertiary)' }} />
                </div>

                {/* Dropdown Menu */}
                {showProfileMenu && (
                  <div style={{
                    position: 'absolute', top: 'calc(100% + 8px)', left: 0, width: '260px',
                    background: 'var(--surface)', border: '1px solid var(--border)',
                    borderRadius: '14px', overflow: 'hidden',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                    zIndex: 999999, animation: 'fadeInScale 0.2s ease',
                  }}>
                    {/* User info header */}
                    <div style={{ padding: '1rem 1.2rem', borderBottom: '1px solid var(--border)', background: 'var(--primary-lighter)' }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>{displayName}</div>
                      <div style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem', marginTop: '0.2rem' }}>{user?.email}</div>
                    </div>

                    <div style={{ padding: '0.5rem' }}>
                      {/* Profile */}
                      <Link href="/profile" onClick={() => setShowProfileMenu(false)} style={{
                        padding: '0.7rem 0.9rem', color: 'var(--text-primary)', textDecoration: 'none',
                        borderRadius: '10px', transition: '0.2s', display: 'flex', alignItems: 'center', gap: '0.7rem',
                        fontWeight: 600, fontSize: '0.88rem',
                      }}>
                        <User size={18} color="var(--text-secondary)" /> الملف الشخصي
                      </Link>

                      {/* Merchant links */}
                      {isMerchant && (
                        <>
                          <Link href="/seller/dashboard" onClick={() => setShowProfileMenu(false)} style={{
                            padding: '0.7rem 0.9rem', color: 'var(--text-primary)', textDecoration: 'none',
                            borderRadius: '10px', transition: '0.2s', display: 'flex', alignItems: 'center', gap: '0.7rem',
                            fontWeight: 600, fontSize: '0.88rem',
                          }}>
                            <BarChart3 size={18} color="var(--primary)" /> لوحة التحكم
                          </Link>
                          <Link href="/seller/settings" onClick={() => setShowProfileMenu(false)} style={{
                            padding: '0.7rem 0.9rem', color: 'var(--text-primary)', textDecoration: 'none',
                            borderRadius: '10px', transition: '0.2s', display: 'flex', alignItems: 'center', gap: '0.7rem',
                            fontWeight: 600, fontSize: '0.88rem',
                          }}>
                            <Settings size={18} color="var(--text-secondary)" /> إعدادات المحل
                          </Link>
                        </>
                      )}

                      {/* Admin links */}
                      {isAdmin && (
                        <>
                          <div style={{ height: '1px', background: 'var(--border)', margin: '0.3rem 0.5rem' }} />
                          <Link href="/admin" onClick={() => setShowProfileMenu(false)} style={{
                            padding: '0.7rem 0.9rem', color: 'var(--primary)', textDecoration: 'none',
                            borderRadius: '10px', transition: '0.2s', display: 'flex', alignItems: 'center', gap: '0.7rem',
                            fontWeight: 700, fontSize: '0.88rem', background: 'var(--primary-lighter)',
                          }}>
                            <BarChart3 size={18} /> لوحة الإدارة
                          </Link>
                        </>
                      )}
                    </div>

                    {/* Logout */}
                    <div style={{ padding: '0.3rem 0.5rem 0.5rem', borderTop: '1px solid var(--border)' }}>
                      <button onClick={handleLogout} style={{
                        padding: '0.7rem 0.9rem', color: 'var(--error)', background: 'transparent',
                        border: 'none', borderRadius: '10px', cursor: 'pointer', textAlign: 'right',
                        transition: '0.2s', display: 'flex', alignItems: 'center', gap: '0.7rem',
                        fontSize: '0.88rem', width: '100%', fontWeight: 600,
                      }}>
                        <LogOut size={18} /> تسجيل الخروج
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                <button
                  onClick={openLoginModal}
                  style={{
                    background: 'transparent', color: 'var(--text-primary)',
                    border: '1px solid var(--border)',
                    padding: '0.65rem 1.5rem', borderRadius: '10px', cursor: 'pointer', fontWeight: 600,
                    transition: 'all 0.2s', fontSize: '0.88rem',
                  }}
                >
                  دخول
                </button>
                <button
                  onClick={openSignUpModal}
                  style={{
                    background: 'var(--primary)', color: 'white', border: 'none',
                    padding: '0.7rem 1.8rem', borderRadius: '10px', cursor: 'pointer',
                    fontWeight: 700, transition: 'all 0.2s', fontSize: '0.9rem',
                    boxShadow: '0 4px 14px rgba(37,99,235,0.3)',
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
        initialMode={authMode}
      />

      <style jsx>{`
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.95) translateY(-8px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </>
  );
}
