"use client";
import React, { Suspense, useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Circle, Lightbulb, Wind, Wrench, Cog, CarFront, CircuitBoard, Fuel,
  Shield, Gauge, Radio, BatteryCharging, Armchair, PaintBucket, Filter, Disc3, LayoutGrid,
  Monitor, PenTool, Droplets, Flame, ChevronLeft, ChevronRight
} from 'lucide-react';

const allCategories = [
  { name: 'الكل', icon: <LayoutGrid size={20} /> },
  { name: 'الأكثر مبيعاً', icon: <Flame size={20} /> },
  { name: 'فحص كمبيوتر', icon: <Monitor size={20} /> },
  { name: 'صيانة دورية', icon: <PenTool size={20} /> },
  { name: 'تظليل وحماية', icon: <Droplets size={20} /> },
  { name: 'الصدامات والواجهة', icon: <Shield size={20} /> },
  { name: 'الشمعات والإضاءة', icon: <Lightbulb size={20} /> },
  { name: 'الفرامل والأقمشة', icon: <Circle size={20} /> },
  { name: 'الأبواب والرفرف', icon: <CarFront size={20} /> },
  { name: 'المساعدات والمقصات', icon: <Wrench size={20} /> },
  { name: 'البواجي والفلاتر', icon: <Filter size={20} /> },
  { name: 'نظام التكييف والتبريد', icon: <Wind size={20} /> },
  { name: 'نظام الوقود', icon: <Fuel size={20} /> },
  { name: 'الدركسون وملحقاته', icon: <Radio size={20} /> },
  { name: 'الكهرباء والحساسات', icon: <CircuitBoard size={20} /> },
  { name: 'البطاريات وملحقاتها', icon: <BatteryCharging size={20} /> },
  { name: 'الديكور الداخلي والمقاعد', icon: <Armchair size={20} /> },
  { name: 'البودي والطلاء', icon: <PaintBucket size={20} /> },
  { name: 'العكس والدفرنس', icon: <Disc3 size={20} /> },
  { name: 'الجنوط والكفرات', icon: <Cog size={20} /> },
];

function CategoriesBarInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get('category') || '';
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 5);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 5);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll);
    return () => { el.removeEventListener('scroll', checkScroll); window.removeEventListener('resize', checkScroll); };
  }, [checkScroll]);

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = dir === 'left' ? -300 : 300;
    el.scrollBy({ left: amount, behavior: 'smooth' });
  };

  const handleCategoryClick = (name: string) => {
    if (name === 'الكل') {
      router.push('/products');
    } else {
      router.push(`/products?category=${encodeURIComponent(name)}`);
    }
  };

  const arrowStyle = (): React.CSSProperties => ({
    position: 'absolute', top: '50%', transform: 'translateY(-50%)',
    width: '36px', height: '36px', borderRadius: '50%',
    background: 'rgba(10,10,14,0.95)', border: '1px solid rgba(245,158,11,0.5)',
    color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', zIndex: 10, transition: 'all 0.3s ease',
    opacity: 1,
    boxShadow: '0 0 12px rgba(245,158,11,0.2), 0 4px 15px rgba(0,0,0,0.4)',
  });

  return (
    <section className="categories-sticky" style={{
      background: 'var(--surface)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border)',
      padding: '0',
      zIndex: 90,
      boxShadow: 'var(--card-shadow)',
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', alignItems: 'center', position: 'relative' }}>
        {/* Left Arrow */}
        <div onClick={() => scroll('left')} className="desktop-only" style={{ ...arrowStyle(), position: 'relative', top: 'auto', transform: 'none', flexShrink: 0, marginRight: '4px' }}
          onMouseOver={e => { e.currentTarget.style.background = '#f59e0b'; e.currentTarget.style.color = '#fff'; }}
          onMouseOut={e => { e.currentTarget.style.background = 'var(--surface-hover)'; e.currentTarget.style.color = '#f59e0b'; }}>
          <ChevronLeft size={20} />
        </div>

        {/* Scrollable categories */}
        <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
          {canScrollLeft && <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '40px', background: 'linear-gradient(to right, var(--surface), transparent)', zIndex: 5, pointerEvents: 'none' }} />}
          {canScrollRight && <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '40px', background: 'linear-gradient(to left, var(--surface), transparent)', zIndex: 5, pointerEvents: 'none' }} />}
          <div ref={scrollRef} style={{
            display: 'flex', overflowX: 'auto',
            gap: '0', scrollbarWidth: 'none',
          }}>
          {allCategories.map((cat, i) => {
            const isActive = (cat.name === 'الكل' && !activeCategory) || activeCategory === cat.name;
            return (
              <div
                key={i}
                onClick={() => handleCategoryClick(cat.name)}
                className="cat-item"
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem',
                  padding: '0.7rem 1rem', minWidth: '95px',
                  textDecoration: 'none', 
                  color: isActive ? '#e11d48' : 'var(--text-secondary)',
                  fontSize: '0.78rem', fontWeight: 700, textAlign: 'center',
                  borderLeft: '1px solid var(--border)',
                  background: isActive ? 'rgba(225,29,72,0.06)' : 'transparent',
                  borderBottom: isActive ? '2px solid #e11d48' : '2px solid transparent',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
                }}
              >
                <span style={{ 
                  color: isActive ? '#e11d48' : 'var(--text-secondary)', 
                  transition: 'all 0.3s ease',
                }} className="cat-icon-container">
                  {cat.icon}
                </span>
                {cat.name}
              </div>
            );
          })}
          </div>
        </div>

        {/* Right Arrow */}
        <div onClick={() => scroll('right')} className="desktop-only" style={{ ...arrowStyle(), position: 'relative', top: 'auto', transform: 'none', flexShrink: 0, marginLeft: '4px' }}
          onMouseOver={e => { e.currentTarget.style.background = '#f59e0b'; e.currentTarget.style.color = '#fff'; }}
          onMouseOut={e => { e.currentTarget.style.background = 'var(--surface-hover)'; e.currentTarget.style.color = '#f59e0b'; }}>
          <ChevronRight size={20} />
        </div>
      </div>
      <style jsx>{`
        div::-webkit-scrollbar { display: none; }
        .cat-item:hover { 
          color: #e11d48 !important;
          background: rgba(225,29,72,0.04) !important;
        }
        .cat-item:hover .cat-icon-container { 
          transform: scale(1.15);
          color: #e11d48 !important;
        }
      `}</style>
    </section>
  );
}

export default function CategoriesBar() {
  return (
    <Suspense fallback={<div style={{ height: '70px', background: 'rgba(8,8,12,0.95)' }} />}>
      <CategoriesBarInner />
    </Suspense>
  );
}
