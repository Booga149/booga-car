"use client";
import dynamic from 'next/dynamic';
import React from 'react';
import Navbar from '@/components/Navbar';
import {
  Circle, Lightbulb, Wind, Wrench, Cog, CarFront, CircuitBoard, Fuel,
  Disc3, Shield, Gauge, PaintBucket, Armchair, Radio, BatteryCharging, Filter
} from 'lucide-react';
import CategoriesBar from '@/components/CategoriesBar';

const categories = [
  { name: 'الصدامات والواجهة', icon: <Shield size={32} />, count: 245 },
  { name: 'الشمعات والإضاءة', icon: <Lightbulb size={32} />, count: 312 },
  { name: 'الفرامل والأقمشة', icon: <Circle size={32} />, count: 156 },
  { name: 'الأبواب والرفرف', icon: <CarFront size={32} />, count: 198 },
  { name: 'العكس والدفرنس', icon: <Disc3 size={32} />, count: 87 },
  { name: 'البواجي والفلاتر', icon: <Filter size={32} />, count: 143 },
  { name: 'المساعدات والمقصات', icon: <Wrench size={32} />, count: 167 },
  { name: 'نظام الوقود', icon: <Fuel size={32} />, count: 94 },
  { name: 'الشكمان', icon: <Gauge size={32} />, count: 56 },
  { name: 'نظام التكييف والتبريد', icon: <Wind size={32} />, count: 123 },
  { name: 'الدركسون وملحقاته', icon: <Radio size={32} />, count: 78 },
  { name: 'الكهرباء والحساسات', icon: <CircuitBoard size={32} />, count: 234 },
  { name: 'البطاريات وملحقاتها', icon: <BatteryCharging size={32} />, count: 45 },
  { name: 'الديكور الداخلي والمقاعد', icon: <Armchair size={32} />, count: 112 },
  { name: 'البودي والطلاء', icon: <PaintBucket size={32} />, count: 89 },
  { name: 'الجنوط والكفرات', icon: <Cog size={32} />, count: 76 },
];

export default function CategoriesPage() {
  return (
    <main style={{ minHeight: '100vh', background: 'var(--background)' }}>
      <Navbar />
      <CategoriesBar />

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '6rem 1.5rem 4rem' }}>

        {/* Breadcrumb */}
        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', direction: 'rtl', fontWeight: 600 }}>
          <a href="/" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>الرئيسية</a>
          <span style={{ margin: '0 0.5rem', opacity: 0.5 }}>/</span>
          <span style={{ color: 'var(--text-primary)' }}>أقسام القطع</span>
          <span style={{ margin: '0 0.5rem', opacity: 0.5 }}>/</span>
          <span style={{ color: 'var(--text-secondary)', opacity: 0.7 }}>الكل</span>
        </div>

        {/* Page Title */}
        <div style={{ marginBottom: '3.5rem', textAlign: 'right' }}>
          <h1 style={{
            fontSize: '2.8rem', fontWeight: 900, color: 'var(--text-primary)',
            margin: '0 0 0.5rem', letterSpacing: '-1px'
          }}>
            أقسام القطع
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0, fontWeight: 600, fontSize: '1.1rem' }}>تصفح منتجاتنا حسب الفئة الفنية للسيارة.</p>
        </div>

        {/* Categories Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '1rem',
        }}>
          {categories.map((cat, i) => (
            <a
              key={i}
              href={`/products?category=${encodeURIComponent(cat.name)}`}
              className="glass-panel"
              style={{
                display: 'flex', alignItems: 'center', gap: '1.2rem',
                padding: '1.5rem',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '16px',
                textDecoration: 'none', color: 'var(--text-primary)',
                fontSize: '1rem', fontWeight: 800,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer',
                boxShadow: 'var(--card-shadow)'
              }}
              onMouseOver={e => {
                e.currentTarget.style.background = 'rgba(244, 63, 94, 0.05)';
                e.currentTarget.style.color = 'var(--primary)';
                e.currentTarget.style.borderColor = 'var(--primary)';
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 12px 25px rgba(244, 63, 94, 0.1)';
              }}
              onMouseOut={e => {
                e.currentTarget.style.background = 'var(--surface)';
                e.currentTarget.style.color = 'var(--text-primary)';
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--card-shadow)';
              }}
            >
              <div style={{ 
                color: 'var(--primary)', flexShrink: 0, background: 'var(--background)', 
                padding: '0.8rem', borderRadius: '12px', display: 'flex' 
              }}>
                {cat.icon}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                <span style={{ flex: 1, lineHeight: 1.2 }}>{cat.name}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{cat.count} قطعة متوفرة</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </main>
  );
}
