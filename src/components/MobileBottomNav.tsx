"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home, ShoppingBag, User, ShoppingCart, MessageCircle,
  LayoutDashboard, Package, Users, BarChart3, Menu, X,
  Wrench, Truck, Car, Tag, Sparkles, HelpCircle, Phone,
  Shield, FileText, Store, Search, Heart, PlusCircle, CreditCard
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

// Role-specific bottom nav items
const USER_NAV: any[] = [
  { href: '/', label: 'الرئيسية', icon: Home },
  { href: '/products', label: 'المنتجات', icon: ShoppingBag },
  { href: '#cart', label: 'السلة', icon: ShoppingCart, isCart: true },
  { href: '/profile', label: 'حسابي', icon: User },
  { href: '#more', label: 'المزيد', icon: Menu, isMore: true },
];

const SELLER_NAV: any[] = [
  { href: '/seller/dashboard', label: 'لوحة التحكم', icon: LayoutDashboard },
  { href: '/seller/products', label: 'منتجاتي', icon: Package },
  { href: '/sell', label: 'إضافة', icon: PlusCircle, isCenter: true },
  { href: '#cart', label: 'السلة', icon: ShoppingCart, isCart: true },
  { href: '#more', label: 'المزيد', icon: Menu, isMore: true },
];

const ADMIN_NAV: any[] = [
  { href: '/admin', label: 'لوحة التحكم', icon: LayoutDashboard },
  { href: '/admin/users', label: 'المستخدمين', icon: Users },
  { href: '/admin/products', label: 'المنتجات', icon: Package },
  { href: '/admin/finances', label: 'المالية', icon: BarChart3 },
  { href: '#more', label: 'المزيد', icon: Menu, isMore: true },
];

// Full menu links for the "More" drawer
const MORE_LINKS_USER = [
  { section: 'تسوق', items: [
    { href: '/products', label: 'قطع الغيار', icon: Wrench, emoji: '🔧' },
    { href: '/accessories', label: 'أكسسوارات', icon: Sparkles, emoji: '✨' },
    { href: '/categories', label: 'التصنيفات', icon: ShoppingBag, emoji: '📦' },
    { href: '/request-part', label: 'اطلب قطعتك', icon: Search, emoji: '🔍', isNew: true },
  ]},
  { section: 'خدماتك', items: [
    { href: '/garage', label: 'كراجي', icon: Car, emoji: '🚗' },
    { href: '/track-order', label: 'تتبع الشحنة', icon: Truck, emoji: '📦' },
    { href: '/wishlist', label: 'المفضلة', icon: Heart, emoji: '❤️' },
    { href: '/price-request', label: 'سعّرلي', icon: CreditCard, emoji: '💰' },
  ]},
  { section: 'معلومات', items: [
    { href: '/about', label: 'من نحن', icon: Store, emoji: '🏪' },
    { href: '/contact', label: 'تواصل معنا', icon: Phone, emoji: '📞' },
    { href: '/faq', label: 'الأسئلة الشائعة', icon: HelpCircle, emoji: '❓' },
    { href: '/become-dealer', label: 'انضم كتاجر', icon: Users, emoji: '🤝' },
    { href: '/warranty', label: 'الضمان', icon: Shield, emoji: '🛡️' },
    { href: '/shipping', label: 'سياسة الشحن', icon: Truck, emoji: '🚚' },
  ]},
];

const MORE_LINKS_SELLER = [
  { section: 'إدارة المتجر', items: [
    { href: '/seller/dashboard', label: 'لوحة التحكم', icon: LayoutDashboard, emoji: '📊' },
    { href: '/sell', label: 'إضافة منتج', icon: PlusCircle, emoji: '➕' },
    { href: '/seller/products', label: 'منتجاتي', icon: Package, emoji: '📦' },
    { href: '/products', label: 'تصفح المتجر', icon: ShoppingBag, emoji: '🛒' },
  ]},
  { section: 'خدمات', items: [
    { href: '/track-order', label: 'تتبع الطلبات', icon: Truck, emoji: '📦' },
    { href: '/profile', label: 'حسابي', icon: User, emoji: '👤' },
    { href: '/contact', label: 'الدعم', icon: Phone, emoji: '📞' },
  ]},
];

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { cartCount, setIsCartOpen } = useCart();
  const { user, role, openLoginModal } = useAuth();
  const [showMore, setShowMore] = useState(false);

  const NAV_ITEMS = role === 'admin' ? ADMIN_NAV : role === 'seller' ? SELLER_NAV : USER_NAV;
  const MORE_LINKS = role === 'seller' ? MORE_LINKS_SELLER : MORE_LINKS_USER;

  // Checkout pages must be deeply focus-oriented—hide all navigation & chat buttons
  if (pathname?.startsWith('/checkout')) {
    return null;
  }

  return (
    <>


      {/* ═══ MORE DRAWER (Overlay) ═══ */}
      {showMore && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setShowMore(false)}
            style={{
              position: 'fixed', inset: 0, zIndex: 100000,
              background: 'rgba(0,0,0,0.5)',
              backdropFilter: 'blur(4px)',
              animation: 'fadeIn 0.2s ease',
            }}
          />
          {/* Drawer */}
          <div style={{
            position: 'fixed',
            bottom: 0, left: 0, right: 0,
            zIndex: 100001,
            background: 'var(--surface)',
            borderRadius: '24px 24px 0 0',
            maxHeight: '80vh',
            overflowY: 'auto',
            animation: 'slideUp 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
            boxShadow: '0 -10px 40px rgba(0,0,0,0.15)',
          }}>
            {/* Drawer Handle */}
            <div style={{
              display: 'flex', justifyContent: 'center',
              padding: '0.8rem 0 0.4rem',
              position: 'sticky', top: 0,
              background: 'var(--surface)',
              borderRadius: '24px 24px 0 0',
              zIndex: 2,
            }}>
              <div style={{
                width: '40px', height: '4px',
                borderRadius: '10px', background: 'var(--border-strong)',
              }} />
            </div>

            {/* Drawer Header */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '0.5rem 1.2rem 1rem',
              borderBottom: '1px solid var(--border)',
              position: 'sticky', top: '28px',
              background: 'var(--surface)', zIndex: 2,
            }}>
              <h3 style={{
                margin: 0, fontSize: '1.2rem', fontWeight: 900,
                color: 'var(--text-primary)',
              }}>
                القائمة الكاملة
              </h3>
              <button
                onClick={() => setShowMore(false)}
                style={{
                  background: 'var(--surface-hover)', border: '1px solid var(--border)',
                  borderRadius: '12px', width: '38px', height: '38px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: 'var(--text-secondary)',
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Sections */}
            <div style={{ padding: '1rem 1.2rem 2rem' }}>
              {MORE_LINKS.map((section, si) => (
                <div key={si} style={{ marginBottom: si < MORE_LINKS.length - 1 ? '1.5rem' : 0 }}>
                  <div style={{
                    fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-tertiary)',
                    textTransform: 'uppercase', letterSpacing: '1.5px',
                    marginBottom: '0.8rem', paddingRight: '0.2rem',
                  }}>
                    {section.section}
                  </div>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '0.6rem',
                  }}>
                    {section.items.map((item: any) => {
                      const isActive = pathname === item.href;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setShowMore(false)}
                          style={{
                            display: 'flex', flexDirection: 'column',
                            alignItems: 'center', gap: '0.4rem',
                            padding: '1rem 0.5rem',
                            borderRadius: '16px',
                            background: isActive ? 'var(--primary-light)' : 'var(--surface-hover)',
                            border: `1px solid ${isActive ? 'var(--primary)' : 'var(--border)'}`,
                            textDecoration: 'none',
                            transition: 'all 0.2s',
                            position: 'relative',
                          }}
                        >
                          <span style={{ fontSize: '1.4rem' }}>{item.emoji}</span>
                          <span style={{
                            fontSize: '0.72rem', fontWeight: 700,
                            color: isActive ? 'var(--primary)' : 'var(--text-primary)',
                            textAlign: 'center', lineHeight: 1.3,
                          }}>
                            {item.label}
                          </span>
                          {item.isNew && (
                            <span style={{
                              position: 'absolute', top: '0.4rem', left: '0.4rem',
                              fontSize: '0.5rem', fontWeight: 900,
                              background: 'var(--primary)', color: 'white',
                              padding: '0.1rem 0.3rem', borderRadius: '4px',
                            }}>جديد</span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* WhatsApp Quick Action */}
              <div style={{ marginTop: '1.2rem' }}>
                <a
                  href="https://wa.me/966500000000?text=مرحباً، أحتاج مساعدة في قطع الغيار"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setShowMore(false)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    gap: '0.6rem', padding: '1rem',
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, #25D366, #128C7E)',
                    color: 'white', textDecoration: 'none',
                    fontWeight: 800, fontSize: '0.95rem',
                    boxShadow: '0 4px 15px rgba(37,211,102,0.3)',
                  }}
                >
                  <MessageCircle size={20} />
                  تواصل واتساب مباشر
                </a>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ═══ Bottom Navigation Bar ═══ */}
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

          // Cart button
          if (item.isCart) {
            return (
              <button
                key={item.label}
                onClick={() => setIsCartOpen(true)}
                style={{
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', gap: '0.15rem',
                  background: 'none', border: 'none',
                  cursor: 'pointer', padding: '0.3rem 0.6rem',
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
                  fontSize: '0.62rem', fontWeight: 700,
                  color: 'var(--text-secondary)',
                }}>
                  {item.label}
                </span>
              </button>
            );
          }

          // More button
          if (item.isMore) {
            return (
              <button
                key={item.label}
                onClick={() => setShowMore(true)}
                style={{
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', gap: '0.15rem',
                  background: 'none', border: 'none',
                  cursor: 'pointer', padding: '0.3rem 0.6rem',
                }}
              >
                <Icon
                  size={22}
                  color={showMore ? '#e11d48' : 'var(--text-secondary)'}
                  strokeWidth={1.8}
                />
                <span style={{
                  fontSize: '0.62rem',
                  fontWeight: showMore ? 900 : 700,
                  color: showMore ? '#e11d48' : 'var(--text-secondary)',
                }}>
                  {item.label}
                </span>
              </button>
            );
          }

          // Center (sell) button
          if (item.isCenter) {
            return (
              <Link
                key={item.label}
                href={item.href}
                style={{
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', gap: '0.1rem',
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
                  fontSize: '0.6rem', fontWeight: 800,
                  color: '#e11d48', marginTop: '0.1rem',
                }}>
                  {item.label}
                </span>
              </Link>
            );
          }

          // Profile requiring login
          if (item.href === '/profile' && !user) {
            return (
              <button
                key={item.label}
                onClick={openLoginModal}
                style={{
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', gap: '0.15rem',
                  background: 'none', border: 'none',
                  cursor: 'pointer', padding: '0.3rem 0.6rem',
                }}
              >
                <Icon size={22} color="var(--text-secondary)" strokeWidth={1.8} />
                <span style={{
                  fontSize: '0.62rem', fontWeight: 700,
                  color: 'var(--text-secondary)',
                }}>
                  {item.label}
                </span>
              </button>
            );
          }

          // Regular nav link
          return (
            <Link
              key={item.label}
              href={item.href}
              style={{
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: '0.15rem',
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
                  borderRadius: '50%', background: '#e11d48',
                  marginTop: '-0.05rem',
                  boxShadow: '0 0 6px rgba(225,29,72,0.6)',
                }} />
              )}
            </Link>
          );
        })}
      </nav>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
