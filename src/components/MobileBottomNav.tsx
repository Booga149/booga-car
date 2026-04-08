"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ShoppingBag, PlusCircle, User, ShoppingCart, MessageCircle, LayoutDashboard, Package, Users, BarChart3 } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

// Role-specific navigation items
const USER_NAV = [
  { href: '/', label: 'الرئيسية', icon: Home },
  { href: '/products', label: 'المنتجات', icon: ShoppingBag },
  { href: '/sell', label: 'بيع', icon: PlusCircle, isCenter: true },
  { href: '/profile', label: 'حسابي', icon: User },
  { href: '#cart', label: 'السلة', icon: ShoppingCart, isCart: true },
];

const SELLER_NAV = [
  { href: '/seller/dashboard', label: 'لوحة التحكم', icon: LayoutDashboard },
  { href: '/seller/products', label: 'منتجاتي', icon: Package },
  { href: '/sell', label: 'إضافة', icon: PlusCircle, isCenter: true },
  { href: '#cart', label: 'السلة', icon: ShoppingCart, isCart: true },
  { href: '/profile', label: 'حسابي', icon: User },
];

const ADMIN_NAV = [
  { href: '/admin', label: 'لوحة التحكم', icon: LayoutDashboard },
  { href: '/admin/users', label: 'المستخدمين', icon: Users },
  { href: '/admin/products', label: 'المنتجات', icon: Package },
  { href: '/admin/finances', label: 'المالية', icon: BarChart3 },
  { href: '/profile', label: 'حسابي', icon: User },
];

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { cartCount, setIsCartOpen } = useCart();
  const { user, role, openLoginModal } = useAuth();

  // Pick navigation based on role
  const NAV_ITEMS = role === 'admin' ? ADMIN_NAV : role === 'seller' ? SELLER_NAV : USER_NAV;

  return (
    <>
      {/* WhatsApp CTA Button */}
      <div className="mobile-only" style={{
        position: 'fixed',
        bottom: '80px',
        right: '1rem',
        zIndex: 99990,
      }}>
        <a
          href="https://wa.me/966500000000?text=مرحباً، أحتاج مساعدة في قطع الغيار"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '54px',
            height: '54px',
            background: 'linear-gradient(135deg, #25D366, #128C7E)',
            color: 'white',
            borderRadius: '16px',
            textDecoration: 'none',
            boxShadow: '0 6px 20px rgba(37,211,102,0.4)',
          }}
        >
          <MessageCircle size={28} />
        </a>
      </div>

      {/* Bottom Navigation */}
      <nav className="mobile-only" style={{
        position: 'fixed',
        bottom: 0,
        left: 0, right: 0,
        zIndex: 99999,
        background: 'rgba(255, 255, 255, 0.98)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(0,0,0,0.08)',
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
                  <Icon size={22} color="var(--text-secondary)" strokeWidth={1.8} />
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
                  color: 'var(--text-secondary)',
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
                  marginTop: '-0.6rem',
                }}
              >
                <div style={{
                  background: 'linear-gradient(135deg, #e11d48, #be123c)',
                  borderRadius: '50%',
                  width: '38px', height: '38px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(225,29,72,0.3)',
                  border: '2px solid rgba(255, 255, 255, 0.98)',
                }}>
                  <Icon size={18} color="white" strokeWidth={2.2} />
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
                  color="var(--text-secondary)"
                  strokeWidth={1.8}
                />
                <span style={{
                  fontSize: '0.62rem',
                  fontWeight: 700,
                  color: 'var(--text-secondary)',
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
                color={isActive ? '#e11d48' : 'var(--text-secondary)'}
                strokeWidth={isActive ? 2.2 : 1.8}
              />
              <span style={{
                fontSize: '0.62rem',
                fontWeight: isActive ? 900 : 700,
                color: isActive ? '#e11d48' : 'var(--text-secondary)',
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
