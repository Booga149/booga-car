"use client";
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import ProductCard from '@/components/ProductCard';
import { useProducts } from '@/context/ProductsContext';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import {
  ShieldCheck, Zap, Globe, Award, ArrowUpRight, Terminal, Users, Package, CircleDollarSign, ShoppingCart as CartIcon, Crosshair
} from 'lucide-react';
import EngineeringSystems from '@/components/EngineeringSystems';
import KSATrustBar from '@/components/KSATrustBar';
import WhatsAppHub from '@/components/WhatsAppHub';
import WelcomeOffer from '@/components/WelcomeOffer';
import NearbySellers from '@/components/NearbySellers';
import RecentlyViewed from '@/components/RecentlyViewed';
import SkeletonCard from '@/components/SkeletonCard';

export default function Home() {
  const { products } = useProducts();
  const { user } = useAuth();
  const [showWelcome, setShowWelcome] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminStats, setAdminStats] = useState({ users: 0, orders: 0, products: 0, revenue: 0 });

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcome(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  // Admin detection + stats (role-based only)
  const { role: authRole } = useAuth();
  useEffect(() => {
    if (authRole === 'admin') {
      setIsAdmin(true);
      loadAdminStats();
    } else {
      setIsAdmin(false);
    }
  }, [authRole]);

  async function loadAdminStats() {
    const [u, o, p] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('orders').select('total'),
      supabase.from('products').select('id', { count: 'exact', head: true }),
    ]);
    const revenue = (o.data || []).reduce((s: number, x: any) => s + (Number(x.total) || 0), 0);
    setAdminStats({ users: u.count || 0, orders: (o.data || []).length, products: p.count || 0, revenue });
  }

  return (
    <main style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      overflowX: 'hidden', 
      background: 'var(--background)',
      position: 'relative'
    }}>
      {/* Global Precision Grid */}
      <div className="mobile-hide-section" style={{
        position: 'fixed', inset: 0,
        backgroundImage: isAdmin
          ? 'linear-gradient(rgba(76,201,240,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(76,201,240,0.03) 1px, transparent 1px)'
          : 'radial-gradient(rgba(0, 0, 0, 0.04) 1px, transparent 1px)',
        backgroundSize: isAdmin ? '50px 50px' : '80px 80px',
        zIndex: 0, pointerEvents: 'none'
      }} />

      <Navbar />
      <div style={{ position: 'relative', zIndex: 10 }}>

        {/* ═══ ADMIN COMMAND BAR ═══ */}
        {isAdmin && (
          <div className="mobile-hide-section" style={{
            marginTop: '120px', marginLeft: '2rem', marginRight: '2rem',
            background: 'rgba(5, 5, 12, 0.85)', backdropFilter: 'blur(20px)',
            border: '1px solid rgba(76,201,240,0.2)', borderRadius: '20px',
            padding: '1rem 2rem',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexWrap: 'wrap', gap: '1rem',
            boxShadow: '0 10px 40px rgba(0,0,0,0.6), inset 0 0 15px rgba(76,201,240,0.03)',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, #4cc9f0, transparent)', opacity: 0.5 }} />
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ position: 'relative' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f43f5e', boxShadow: '0 0 10px #f43f5e' }} />
                <div style={{ position: 'absolute', inset: '-3px', borderRadius: '50%', border: '1px solid #f43f5e', opacity: 0.4, animation: 'adminPing 2s infinite' }} />
              </div>
              <span style={{ color: '#4cc9f0', fontSize: '0.78rem', fontWeight: 900, letterSpacing: '1.5px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Terminal size={14} /> أنت تتصفح كمدير النظام
              </span>
            </div>

            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
              {[
                { label: 'المستخدمين', value: adminStats.users, icon: <Users size={14} />, color: '#f59e0b', href: '/admin/users' },
                { label: 'الطلبات', value: adminStats.orders, icon: <CartIcon size={14} />, color: '#4cc9f0', href: '/admin' },
                { label: 'المنتجات', value: adminStats.products, icon: <Package size={14} />, color: '#b5179e', href: '/admin/products' },
                { label: 'الإيرادات', value: `${(adminStats.revenue / 1000).toFixed(1)}K`, icon: <CircleDollarSign size={14} />, color: '#10b981', href: '/admin' },
              ].map(s => (
                <a key={s.label} href={s.href} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', padding: '0.4rem 0.8rem', borderRadius: '10px', transition: 'all 0.2s', cursor: 'pointer' }}
                  onMouseOver={e => { e.currentTarget.style.background = `${s.color}15`; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                  <div style={{ color: s.color, opacity: 0.7 }}>{s.icon}</div>
                  <span style={{ color: '#fff', fontWeight: 950, fontSize: '1rem' }}>{s.value}</span>
                  <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.7rem', fontWeight: 700 }}>{s.label}</span>
                </a>
              ))}
            </div>

            <a href="/admin" style={{
              padding: '0.5rem 1.2rem', borderRadius: '10px',
              background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)',
              color: '#f43f5e', textDecoration: 'none', fontWeight: 900, fontSize: '0.8rem',
              display: 'flex', alignItems: 'center', gap: '0.4rem', transition: '0.2s',
            }}>
              <Crosshair size={13} /> مركز القيادة
            </a>
          </div>
        )}

        {showWelcome && <WelcomeOffer />}
        <Hero />
        
        {/* ═══ MOBILE CATEGORIES CHIPS ═══ */}
        <div className="mobile-only" style={{
          display: 'none',
          padding: '0.8rem 1rem',
          background: 'var(--surface)',
          borderBottom: '1px solid var(--border)',
        }}>
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            overflowX: 'auto',
            scrollbarWidth: 'none',
            WebkitOverflowScrolling: 'touch',
            paddingBottom: '0.3rem',
          }} className="scrollbar-hide">
            {[
              { name: 'الكل', emoji: '🔥' },
              { name: 'فرامل', emoji: '🛞' },
              { name: 'فلاتر', emoji: '🔧' },
              { name: 'إضاءة', emoji: '💡' },
              { name: 'محركات', emoji: '⚙️' },
              { name: 'كهرباء', emoji: '⚡' },
              { name: 'زيوت', emoji: '🛢️' },
              { name: 'بطاريات', emoji: '🔋' },
            ].map(cat => (
              <a
                key={cat.name}
                href={cat.name === 'الكل' ? '/products' : `/products?category=${encodeURIComponent(cat.name)}`}
                className="btn-tap"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.5rem 0.9rem',
                  borderRadius: '20px',
                  background: 'var(--surface-hover)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  transition: 'all 0.2s',
                }}
              >
                <span>{cat.emoji}</span> {cat.name}
              </a>
            ))}
          </div>
        </div>

        {/* ═══ SECTION: Nearby Sellers — Desktop only ═══ */}
        <div className="mobile-hide-section">
          <NearbySellers />
        </div>

        {/* ═══ SECTION: Engineering Discovery — Desktop only ═══ */}
        <div className="mobile-hide-section">
          <EngineeringSystems />
        </div>

        {/* ═══ BANNER SLIDER ═══ */}
        <BannerSlider />

        {/* ═══ SECTION: 🔥 Featured Products ═══ */}
        <ProductSection
          title="منتجات مميزة"
          emoji="🔥"
          products={products.slice(0, 4)}
          isLoading={products.length === 0}
        />

        {/* ═══ SECTION: 🆕 New Products ═══ */}
        <ProductSection
          title="وصل حديثاً"
          emoji="🆕"
          products={products.filter(p => p.condition === 'جديد').slice(0, 4)}
          isLoading={products.length === 0}
        />

        {/* ═══ SECTION: ⭐ Best Sellers ═══ */}
        <ProductSection
          title="الأكثر مبيعاً"
          emoji="⭐"
          products={[...products].sort((a, b) => b.rating - a.rating).slice(0, 4)}
          isLoading={products.length === 0}
          showViewAll
        />

        {/* Recently Viewed */}
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
          <RecentlyViewed />
        </div>

        {/* ═══ Desktop-only sections ═══ */}
        <div className="mobile-hide-section">
          <section style={{
            padding: 'clamp(3rem, 8vw, 8rem) clamp(1rem, 3vw, 2rem)', maxWidth: '1400px', margin: '0 auto',
            width: '100%', position: 'relative', zIndex: 10
          }}>
            <div className="support-section-inner" style={{
              background: 'var(--surface)',
              borderRadius: 'clamp(24px, 5vw, 60px)', padding: 'clamp(2rem, 5vw, 6rem)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
              flexWrap: 'wrap', gap: 'clamp(2rem, 5vw, 5rem)', border: '1px solid var(--border)',
              boxShadow: 'var(--card-shadow)'
            }}>
              <div style={{ flex: 1, minWidth: 'min(400px, 100%)' }}>
                <h2 style={{ color: 'var(--text-primary)', fontSize: 'clamp(1.8rem, 5vw, 3.5rem)', fontWeight: 950, marginBottom: 'clamp(1rem, 3vw, 2rem)', lineHeight: 1.1 }}>
                  خبيرك الخاص في <br /> <span style={{ color: 'var(--primary)' }}>توافقية</span> القطع
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: 'clamp(0.95rem, 2vw, 1.3rem)', lineHeight: 1.8, marginBottom: 'clamp(1.5rem, 4vw, 3.5rem)', fontWeight: 500 }}>
                  سواء كنت تمتلك سيارة نادرة أو حديثة، فريقنا الهندسي متصل بشبكة توريد عالمية تضمن لك الحصول على القطع الصحيحة بالرقم التسلسلي الأصلي.
                </p>
                <div style={{ display: 'flex', gap: 'clamp(1rem, 3vw, 2rem)', alignItems: 'center', flexWrap: 'wrap' }}>
                  <a href="https://wa.me/966500000000" style={{
                    background: 'var(--primary)', color: 'white', padding: '1.2rem 3rem',
                    borderRadius: '20px', fontWeight: 900, textDecoration: 'none',
                    boxShadow: '0 15px 35px rgba(244, 63, 94, 0.4)', fontSize: '1.2rem',
                    transition: '0.3s'
                  }}>تحدث مع المهندس</a>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-primary)', fontWeight: 800 }}>
                    <Award size={28} color="#FFD700" /> موثق من تجارة
                  </div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                {[
                  { title: 'شحن قاري', icon: <Globe size={28} /> },
                  { title: 'دقة VIN', icon: <Zap size={28} /> },
                  { title: 'ضمان سنة', icon: <ShieldCheck size={28} /> },
                  { title: 'دعم مباشر', icon: <Zap size={28} /> },
                ].map((item, i) => (
                  <div key={i} style={{ 
                    background: 'var(--background)', padding: '2.5rem', 
                    borderRadius: '32px', border: '1px solid var(--border)',
                    textAlign: 'center', color: 'var(--text-primary)', transition: '0.3s'
                  }}>
                    <div style={{ color: 'var(--primary)', marginBottom: '1.2rem', display: 'flex', justifyContent: 'center' }}>{item.icon}</div>
                    <div style={{ fontWeight: 900, fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>{item.title}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <KSATrustBar />
          <WhatsAppHub />
        </div>
      </div>

      <style jsx>{`
        .product-grid {
          margin-bottom: 2rem;
        }
      `}</style>
    </main>
  );
}

/* ═══════════════════════════════════════════
   BANNER SLIDER COMPONENT
═══════════════════════════════════════════ */
function BannerSlider() {
  const [current, setCurrent] = React.useState(0);

  const banners = [
    {
      title: 'خصم 20% على الفرامل',
      subtitle: 'فرامل أصلية بأعلى جودة',
      gradient: 'linear-gradient(135deg, #1e293b 0%, #0f172a 50%, #1e293b 100%)',
      accent: '#e11d48',
    },
    {
      title: 'شحن مجاني فوق 200 ر.س',
      subtitle: 'توصيل سريع لكل المملكة',
      gradient: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)',
      accent: '#D4AF37',
    },
    {
      title: 'قطع غيار أصلية 100%',
      subtitle: 'ضمان سنة على جميع المنتجات',
      gradient: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #1a1a2e 100%)',
      accent: '#10b981',
    },
  ];

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [banners.length]);

  return (
    <section style={{
      padding: '1rem',
      maxWidth: '1200px',
      margin: '0 auto',
      width: '100%',
    }}>
      <div style={{
        position: 'relative',
        borderRadius: '20px',
        overflow: 'hidden',
        height: 'clamp(140px, 30vw, 220px)',
        background: banners[current].gradient,
        transition: 'background 0.8s ease',
        border: '1px solid var(--border)',
        boxShadow: '0 8px 30px rgba(0,0,0,0.1)',
      }}>
        {/* Content */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          justifyContent: 'center',
          padding: 'clamp(1.5rem, 4vw, 3rem)',
          zIndex: 2,
        }}>
          <h3 style={{
            color: '#ffffff',
            fontSize: 'clamp(1.2rem, 4vw, 2rem)',
            fontWeight: 900,
            margin: '0 0 0.5rem',
            lineHeight: 1.2,
          }}>
            {banners[current].title}
          </h3>
          <p style={{
            color: 'rgba(255,255,255,0.7)',
            fontSize: 'clamp(0.8rem, 2vw, 1rem)',
            fontWeight: 600,
            margin: '0 0 1rem',
          }}>
            {banners[current].subtitle}
          </p>
          <a href="/products" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.6rem 1.2rem',
            borderRadius: '10px',
            background: banners[current].accent,
            color: '#fff',
            fontWeight: 800,
            fontSize: '0.85rem',
            textDecoration: 'none',
            width: 'fit-content',
            transition: 'transform 0.2s',
          }}>
            تسوق الآن <ArrowUpRight size={16} />
          </a>
        </div>

        {/* Decorative circle */}
        <div style={{
          position: 'absolute',
          left: '-20px',
          top: '50%',
          transform: 'translateY(-50%)',
          width: 'clamp(120px, 25vw, 200px)',
          height: 'clamp(120px, 25vw, 200px)',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${banners[current].accent}20, transparent 70%)`,
          zIndex: 1,
        }} />

        {/* Dots */}
        <div style={{
          position: 'absolute',
          bottom: '0.8rem',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '0.4rem',
          zIndex: 3,
        }}>
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              style={{
                width: current === i ? '20px' : '6px',
                height: '6px',
                borderRadius: '10px',
                background: current === i ? '#fff' : 'rgba(255,255,255,0.4)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                padding: 0,
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   PRODUCT SECTION COMPONENT
═══════════════════════════════════════════ */
function ProductSection({ title, emoji, products, isLoading, showViewAll }: {
  title: string;
  emoji: string;
  products: any[];
  isLoading: boolean;
  showViewAll?: boolean;
}) {
  return (
    <section style={{
      padding: 'clamp(1.5rem, 4vw, 3rem) 0',
      position: 'relative',
      zIndex: 10,
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 clamp(1rem, 3vw, 2rem)' }}>
        {/* Section Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.2rem',
        }}>
          <h2 style={{
            fontSize: 'clamp(1.1rem, 3vw, 1.6rem)',
            fontWeight: 900,
            color: 'var(--text-primary)',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}>
            <span>{emoji}</span> {title}
          </h2>
          {showViewAll && (
            <a href="/products" style={{
              color: 'var(--primary)',
              fontWeight: 800,
              fontSize: '0.85rem',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
            }}>
              عرض الكل <ArrowUpRight size={14} />
            </a>
          )}
        </div>

        {/* Product Grid */}
        <div className="product-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(280px, 100%), 1fr))',
          gap: 'clamp(1rem, 3vw, 2rem)',
        }}>
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))
          ) : (
            products.map((prod) => (
              <ProductCard
                key={prod.id}
                {...prod}
                imagePlaceholderColor={prod.color || 'var(--border)'}
              />
            ))
          )}
        </div>
      </div>
    </section>
  );
}
