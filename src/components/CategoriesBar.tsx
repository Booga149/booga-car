"use client";
import React, { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Circle, Lightbulb, Wind, Wrench, Cog, CarFront, CircuitBoard, Fuel,
  Shield, Gauge, Radio, BatteryCharging, Armchair, PaintBucket, Filter, Disc3, LayoutGrid,
  Monitor, PenTool, Droplets, Flame
} from 'lucide-react';

const allCategories = [
  { name: 'الكل', icon: <LayoutGrid size={24} /> },
  { name: 'الأكثر مبيعاً', icon: <Flame size={24} color="var(--primary)" /> },
  { name: 'فحص كمبيوتر', icon: <Monitor size={24} /> },
  { name: 'صيانة دورية', icon: <PenTool size={24} /> },
  { name: 'تظليل وحماية', icon: <Droplets size={24} /> },
  { name: 'الصدامات والواجهة', icon: <Shield size={24} /> },
  { name: 'الشمعات والإضاءة', icon: <Lightbulb size={24} /> },
  { name: 'الفرامل والأقمشة', icon: <Circle size={24} /> },
  { name: 'الأبواب والرفرف', icon: <CarFront size={24} /> },
  { name: 'المساعدات والمقصات', icon: <Wrench size={24} /> },
  { name: 'البواجي والفلاتر', icon: <Filter size={24} /> },
  { name: 'نظام التكييف والتبريد', icon: <Wind size={24} /> },
  { name: 'نظام الوقود', icon: <Fuel size={24} /> },
  { name: 'الدركسون وملحقاته', icon: <Radio size={24} /> },
  { name: 'الكهرباء والحساسات', icon: <CircuitBoard size={24} /> },
  { name: 'البطاريات وملحقاتها', icon: <BatteryCharging size={24} /> },
  { name: 'الديكور الداخلي والمقاعد', icon: <Armchair size={24} /> },
  { name: 'البودي والطلاء', icon: <PaintBucket size={24} /> },
  { name: 'العكس والدفرنس', icon: <Disc3 size={24} /> },
  { name: 'الجنوط والكفرات', icon: <Cog size={24} /> },
];

function CategoriesBarInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get('category') || '';

  const handleCategoryClick = (name: string) => {
    if (name === 'الكل') {
      router.push('/products');
    } else {
      router.push(`/products?category=${encodeURIComponent(name)}`);
    }
  };

  return (
    <section style={{
      background: 'var(--surface)',
      borderTop: '1px solid var(--border)',
      borderBottom: '1px solid var(--border)',
      padding: '0',
      position: 'sticky',
      top: '73px', 
      zIndex: 90,
      backdropFilter: 'blur(10px)',
      boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
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
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.8rem',
                padding: '1.5rem 2rem', minWidth: '140px',
                textDecoration: 'none', color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                fontSize: '0.85rem', fontWeight: 800, textAlign: 'center',
                borderLeft: '1px solid var(--border)',
                background: isActive ? 'rgba(244, 63, 94, 0.05)' : 'transparent',
                borderBottom: isActive ? '3px solid var(--primary)' : '3px solid transparent',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
              }}
            >
              <span style={{ 
                color: isActive ? 'var(--primary)' : 'var(--text-secondary)', 
                transition: 'all 0.3s' 
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
          color: var(--primary) !important;
          background: var(--surface-hover) !important;
        }
        .cat-item:hover .cat-icon-container { 
          transform: scale(1.15) translateY(-2px);
          color: var(--primary) !important;
        }
      `}</style>
    </section>
  );
}

export default function CategoriesBar() {
  return (
    <Suspense fallback={<div style={{ height: '80px', background: 'var(--surface)' }} />}>
      <CategoriesBarInner />
    </Suspense>
  );
}
