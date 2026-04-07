"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ShoppingBag, PlusCircle, User, ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

const NAV_ITEMS = [
  { href: '/', label: 'الرئيسية', icon: Home },
  { href: '/products', label: 'المنتجات', icon: ShoppingBag },
  { href: '/sell', label: 'بيع', icon: PlusCircle, isCenter: true },
  { href: '/profile', label: 'حسابي', icon: User },
  { href: '#cart', label: 'السلة', icon: ShoppingCart, isCart: true },
];

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { cartCount, setIsCartOpen } = useCart();
  const { user, openLoginModal } = useAuth();

  return (
    <>
      {/* WhatsApp CTA Bar */}
      <div className="mobile-only" style={{
        position: 'fixed',
        bottom: '64px',
        left: 0, right: 0,
        zIndex: 99990,
        padding: '0 0.5rem',
      }}>
        <a
          href="https://wa.me/966500000000?text=مرحباً، أحتاج مساعدة في قطع الغيار"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            background: 'linear-gradient(135deg, #25D366, #128C7E)',
            color: 'white',
            padding: '0.65rem 1rem',
            borderRadius: '12px',
            fontWeight: 800,
            fontSize: '0.82rem',
            textDecoration: 'none',
            boxShadow: '0 4px 15px rgba(37,211,102,0.3)',
          }}
        >
          اضغط هنا للتواصل معنا عبر الواتساب 💬
        </a>
      </div>

      {/* Bottom Navigation */}
      <nav className="mobile-only" style={{
        position: 'fixed',
        bottom: 0,
        left: 0, right: 0,
        zIndex: 99999,
        background: 'rgba(10, 10, 15, 0.95)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        padding: '0.4rem 0 env(safe-area-inset-bottom, 0.3rem)',
        height: '64px',
      }}>
        {NAV_ITEMS.map((item) => {
          const isActive = item.href === '/' ? pathname === '/' : pathname?.startsWith(item.href);
          const Icon = item.icon;
          
          if (item.isCart) {
            return (
              <button
                key={item.label}
                onClick={() => setIsCartOpen(true)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.15rem',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.3rem 0.6rem',
                  position: 'relative',
                }}
              >
                <div style={{ position: 'relative' }}>
                  <Icon size={22} color="rgba(255,255,255,0.5)" strokeWidth={1.8} />
                  {cartCount > 0 && (
                    <span style={{
                      position: 'absolute', top: -6, right: -8,
                      background: '#e11d48', color: 'white',
                      borderRadius: '50%', width: '16px', height: '16px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.6rem', fontWeight: 900,
                    }}>
                      {cartCount}
                    </span>
                  )}
                </div>
                <span style={{
                  fontSize: '0.62rem',
                  fontWeight: 700,
                  color: 'rgba(255,255,255,0.4)',
                }}>
                  {item.label}
                </span>
              </button>
            );
          }

          if (item.isCenter) {
            return (
              <Link
                key={item.label}
                href={item.href}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.1rem',
                  textDecoration: 'none',
                  padding: '0.2rem 0.6rem',
                  marginTop: '-1.2rem',
                }}
              >
                <div style={{
                  background: 'linear-gradient(135deg, #e11d48, #be123c)',
                  borderRadius: '50%',
                  width: '44px', height: '44px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 6px 20px rgba(225,29,72,0.4)',
                  border: '3px solid rgba(10,10,15,0.95)',
                }}>
                  <Icon size={22} color="white" strokeWidth={2.2} />
                </div>
                <span style={{
                  fontSize: '0.6rem',
                  fontWeight: 800,
                  color: '#e11d48',
                  marginTop: '0.1rem',
                }}>
                  {item.label}
                </span>
              </Link>
            );
          }

          // Handle profile requiring login
          if (item.href === '/profile' && !user) {
            return (
              <button
                key={item.label}
                onClick={openLoginModal}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.15rem',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.3rem 0.6rem',
                }}
              >
                <Icon
                  size={22}
                  color="rgba(255,255,255,0.5)"
                  strokeWidth={1.8}
                />
                <span style={{
                  fontSize: '0.62rem',
                  fontWeight: 700,
                  color: 'rgba(255,255,255,0.4)',
                }}>
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <Link
              key={item.label}
              href={item.href}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.15rem',
                textDecoration: 'none',
                padding: '0.3rem 0.6rem',
              }}
            >
              <Icon
                size={22}
                color={isActive ? '#e11d48' : 'rgba(255,255,255,0.5)'}
                strokeWidth={isActive ? 2.2 : 1.8}
              />
              <span style={{
                fontSize: '0.62rem',
                fontWeight: isActive ? 900 : 700,
                color: isActive ? '#e11d48' : 'rgba(255,255,255,0.4)',
              }}>
                {item.label}
              </span>
              {isActive && (
                <div style={{
                  width: '4px', height: '4px',
                  borderRadius: '50%',
                  background: '#e11d48',
                  marginTop: '-0.05rem',
                  boxShadow: '0 0 6px rgba(225,29,72,0.6)',
                }} />
              )}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
