"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { logSecurityEvent } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { Heart, ShoppingCart, User, Settings, LogOut, Tag, Trophy, Zap, Hand, Rocket, Lock, Eye, EyeOff, X as XIcon, Car, Wallet, Landmark, ShieldCheck } from 'lucide-react';
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

  return (
    <>
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 99999,
        background: 'rgba(10, 10, 10, 0.98)', /* Solid almost-black to replace expensive blur */
        borderBottom: '1px solid var(--border)',
        boxShadow: '0 4px 30px rgba(0,0,0,0.4)',
        transition: 'all 0.3s ease',
        padding: '0.8rem 2.5rem',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        {/* Branding Area */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '3rem' }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ position: 'relative' }}>
              <h1 style={{ 
                color: 'var(--text-primary)', 
                margin: 0, 
                fontSize: '1.9rem', 
                fontWeight: 950, 
                letterSpacing: '-1px',
                textShadow: '0 0 20px rgba(244, 63, 94, 0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}>
                CAR <span style={{ color: 'var(--primary)' }}>BOOGA</span>
              </h1>
              {/* Saudi Dedicated Badge */}
              <div style={{ 
                position: 'absolute', top: -14, right: -25, 
                fontSize: '0.65rem', fontWeight: 900, 
                background: 'linear-gradient(90deg, #10b981, #059669)', color: 'white',
                padding: '0.2rem 0.6rem', borderRadius: '40px',
                border: '2px solid var(--surface)',
                boxShadow: '0 2px 10px rgba(16, 185, 129, 0.3)'
              }}>
                🇸🇦 KSA STORE
              </div>
            </div>
          </Link>

          <nav className="desktop-nav" style={{ display: 'flex', gap: '2rem' }}>
            {[
              { href: '/', label: 'الرئيسية' },
              { href: '/products', label: 'قطع الغيار' },
              { href: '/accessories', label: 'أكسسوارات', isNew: true },
              { href: '/track-order', label: 'تتبع الطلبات' },
              { href: '/garage', label: 'كراجي' },
              { href: '/sell', label: 'اعرض قطعة' },
              { href: '/become-dealer', label: 'بوجا للأعمال', isNew: true },
            ].map(link => {
              const isActive = pathname === link.href;
              return (
                <Link key={link.href} href={link.href} style={{
                  color: link.href === '/sell' ? 'var(--primary)' : isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontWeight: isActive || link.href === '/sell' ? 800 : 700,
                  fontSize: '0.9rem',
                  padding: '1rem 0.2rem',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                }}>
                  {link.label} 
                  {link.href === '/sell' && <Tag size={16} />}
                  {link.isNew && (
                    <span style={{ 
                      fontSize: '0.6rem', background: 'var(--primary)', color: 'white', 
                      padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 900,
                      position: 'absolute', top: 0, right: -15
                    }}>جديد</span>
                  )}
                  {isActive && (
                    <span style={{ 
                      position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px', 
                      background: 'var(--primary)', borderRadius: '2px',
                      boxShadow: '0 2px 8px rgba(244, 63, 94, 0.4)'
                    }} />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
          <Link href="/wishlist" style={{ 
            textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', 
            width: '45px', height: '45px', borderRadius: '14px', background: 'var(--surface-hover)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', border: '1px solid var(--border)', cursor: 'pointer',
            color: 'var(--text-primary)'
          }}>
            <Heart size={22} />
          </Link>

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

          <div style={{ width: '1px', height: '24px', background: 'var(--border)', margin: '0 0.5rem' }} />

          {user ? (
            <div style={{ position: 'relative' }}>
              <div 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                style={{ 
                  display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer', 
                  background: profile?.cr_number ? 'linear-gradient(90deg, rgba(20,20,20,0.9), rgba(10,10,10,0.9))' : 'var(--surface-hover)', 
                  padding: '0.4rem 1.2rem 0.4rem 0.6rem', borderRadius: '14px', 
                  border: profile?.cr_number ? '1px solid rgba(212, 175, 55, 0.4)' : '1px solid var(--border)', 
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: profile?.cr_number ? '0 4px 20px rgba(212, 175, 55, 0.15)' : 'none'
                }}
              >
                <div style={{ 
                  width: '36px', height: '36px', borderRadius: '10px', 
                  background: profile?.cr_number ? 'linear-gradient(135deg, #D4AF37 0%, #AA7C11 100%)' : 'var(--primary)', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', 
                  color: profile?.cr_number ? '#111' : 'white', fontWeight: 900, fontSize: '1rem', textTransform: 'uppercase',
                  boxShadow: profile?.cr_number ? '0 4px 12px rgba(212, 175, 55, 0.3), inset 0 2px 2px rgba(255,255,255,0.4)' : '0 4px 12px rgba(244, 63, 94, 0.2)',
                  border: profile?.cr_number ? '1px solid rgba(255,215,0,0.5)' : 'none'
                }}>
                  {profile?.business_name?.charAt(0) || profile?.full_name?.charAt(0) || user.email?.charAt(0)}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                   <span style={{ color: profile?.cr_number ? '#D4AF37' : 'var(--text-primary)', fontWeight: 800, fontSize: '0.9rem', lineHeight: 1 }}>
                     {profile?.business_name || profile?.full_name?.split(' ')[0] || user.email?.split('@')[0]}
                   </span>
                   {profile?.cr_number && (
                      <span style={{ fontSize: '0.65rem', color: '#10b981', fontWeight: 900, marginTop: '4px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                         <ShieldCheck size={10} /> تاجر موثق
                      </span>
                   )}
                </div>
                <User size={16} style={{ opacity: profile?.cr_number ? 0.8 : 0.5, color: profile?.cr_number ? '#D4AF37' : 'inherit' }} />
              </div>
              
              {showProfileMenu && (
                <div style={{ 
                  position: 'absolute', top: 'calc(100% + 12px)', left: 0, width: '260px', 
                  background: profile?.cr_number ? 'linear-gradient(180deg, #181610 0%, #0a0a0a 100%)' : '#0a0a0a', 
                  border: profile?.cr_number ? '1px solid rgba(212, 175, 55, 0.3)' : '1px solid var(--border)', 
                  borderRadius: '16px', 
                  padding: '0.6rem', display: 'flex', flexDirection: 'column', gap: '0.3rem', 
                  boxShadow: profile?.cr_number ? '0 10px 40px rgba(0,0,0,0.9), 0 0 30px rgba(212, 175, 55, 0.1)' : '0 10px 40px rgba(0,0,0,0.8)', 
                  zIndex: 999999,
                  animation: 'fadeInScale 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                }}>
                  <Link href="/profile" onClick={() => setShowProfileMenu(false)} style={{ 
                    padding: '0.8rem 1rem', color: 'var(--text-primary)', textDecoration: 'none', 
                    borderRadius: '10px', transition: '0.2s', display: 'flex', alignItems: 'center', gap: '0.8rem',
                    fontWeight: 600, fontSize: '0.95rem'
                  }}>
                    <User size={18} /> حسابي الشخصي
                  </Link>
                  <Link href="/seller/dashboard" onClick={() => setShowProfileMenu(false)} style={{ 
                    padding: '0.8rem 1rem', color: 'var(--text-primary)', textDecoration: 'none', 
                    borderRadius: '10px', transition: '0.2s', display: 'flex', alignItems: 'center', gap: '0.8rem',
                    fontWeight: 600, fontSize: '0.95rem'
                  }}>
                    <Wallet size={18} /> محفظة المبيعات
                  </Link>
                  {(user.email?.startsWith('mrmrx2824') || user.email?.startsWith('admin')) && (
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
                  <div style={{ height: '1px', background: 'var(--border)', margin: '0.4rem' }}></div>
                  <button onClick={handleLogout} style={{ 
                    padding: '0.8rem 1rem', color: 'var(--text-secondary)', background: 'transparent', 
                    border: 'none', borderRadius: '10px', cursor: 'pointer', textAlign: 'right', 
                    transition: '0.2s', display: 'flex', alignItems: 'center', gap: '0.8rem', 
                    fontSize: '0.95rem', width: '100%', fontWeight: 600
                  }}>
                    <LogOut size={18} /> تسجيل الخروج
                  </button>
                </div>
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
      `}</style>
    </>
  );
}
