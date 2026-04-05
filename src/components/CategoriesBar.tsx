"use client";
import React, { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Circle, Lightbulb, Wind, Wrench, Cog, CarFront, CircuitBoard, Fuel,
  Shield, Gauge, Radio, BatteryCharging, Armchair, PaintBucket, Filter, Disc3, LayoutGrid,
  Monitor, PenTool, Droplets, Flame
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
  const [navHeight, setNavHeight] = useState(73);

  useEffect(() => {
    const measure = () => {
      const navbar = document.querySelector('header');
      if (navbar) setNavHeight(navbar.offsetHeight);
    };
    measure();
    const ro = new ResizeObserver(measure);
    const navbar = document.querySelector('header');
    if (navbar) ro.observe(navbar);
    return () => ro.disconnect();
  }, []);

  const handleCategoryClick = (name: string) => {
    if (name === 'الكل') {
      router.push('/products');
    } else {
      router.push(`/products?category=${encodeURIComponent(name)}`);
    }
  };

  return (
    <section style={{
      background: 'rgba(8,8,12,0.95)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255,255,255,0.04)',
      padding: '0',
      position: 'sticky',
      top: `${navHeight}px`,
      zIndex: 90,
      boxShadow: '0 4px 30px rgba(0,0,0,0.4)'
    }}>
      <div style={{
        maxWidth: '1400px', margin: '0 auto',
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
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem',
                padding: '1.2rem 1.8rem', minWidth: '120px',
                textDecoration: 'none', 
                color: isActive ? '#e11d48' : 'rgba(255,255,255,0.4)',
                fontSize: '0.78rem', fontWeight: 700, textAlign: 'center',
                borderLeft: '1px solid rgba(255,255,255,0.04)',
                background: isActive ? 'rgba(225,29,72,0.06)' : 'transparent',
                borderBottom: isActive ? '2px solid #e11d48' : '2px solid transparent',
                transition: 'all 0.3s ease',
                cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
              }}
            >
              <span style={{ 
                color: isActive ? '#e11d48' : 'rgba(255,255,255,0.35)', 
                transition: 'all 0.3s ease',
              }} className="cat-icon-container">
                {cat.icon}
              </span>
              {cat.name}
            </div>
          );
        })}
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
