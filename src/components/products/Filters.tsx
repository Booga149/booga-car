"use client";
import React, { useState } from 'react';
import { Star, X, SlidersHorizontal } from 'lucide-react';

type FiltersProps = {
  filters: any;
  setFilters: (filters: any) => void;
  clearFilters: () => void;
  brands: string[];
  categories: string[];
};

export default function Filters({ filters, setFilters, clearFilters, brands, categories }: FiltersProps) {
  const [priceRange, setPriceRange] = useState(500);

  const sectionTitle: React.CSSProperties = {
    margin: '0 0 1rem', fontSize: '0.8rem', fontWeight: 900,
    color: '#e11d48', letterSpacing: '1px',
    textTransform: 'uppercase',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  };

  const chipStyle = (active: boolean): React.CSSProperties => ({
    padding: '0.55rem 1rem',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
    border: active ? '1px solid rgba(225,29,72,0.5)' : '1px solid rgba(255,255,255,0.12)',
    background: active ? 'linear-gradient(135deg, rgba(225,29,72,0.2), rgba(225,29,72,0.1))' : 'rgba(255,255,255,0.05)',
    color: active ? '#f43f5e' : 'rgba(255,255,255,0.6)',
    fontWeight: active ? 800 : 600,
    fontSize: '0.82rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.3rem',
    boxShadow: active ? '0 4px 15px rgba(225,29,72,0.15)' : 'none',
  });

  return (
    <aside style={{
      width: '280px',
      flexShrink: 0,
      padding: '1.8rem',
      borderRadius: '20px',
      border: '1px solid rgba(255,255,255,0.1)',
      background: 'linear-gradient(180deg, rgba(16,16,22,0.98), rgba(10,10,14,0.95))',
      position: 'sticky',
      top: '100px',
      height: 'fit-content',
      maxHeight: 'calc(100vh - 120px)',
      overflowY: 'auto',
      boxShadow: '0 8px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(225,29,72,0.15)' }}>
        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 950, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <SlidersHorizontal size={18} color="#e11d48" /> تصفية النتائج
        </h3>
        <button 
          onClick={clearFilters} 
          style={{ 
            background: 'linear-gradient(135deg, rgba(225,29,72,0.15), rgba(225,29,72,0.08))', border: '1px solid rgba(225,29,72,0.3)', 
            color: '#f43f5e', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 800,
            padding: '0.45rem 0.9rem', borderRadius: '10px',
            display: 'flex', alignItems: 'center', gap: '0.3rem',
            transition: 'all 0.3s ease',
            boxShadow: '0 2px 8px rgba(225,29,72,0.1)',
          }}
        >
          <X size={12} /> مسح الكل
        </button>
      </div>

      {/* Category */}
      <div style={{ marginBottom: '2rem' }}>
        <h4 style={sectionTitle}><span style={{ width: '3px', height: '14px', background: '#e11d48', borderRadius: '2px', display: 'inline-block' }} />القسم</h4>
        <select 
          value={filters.category} 
          onChange={e => setFilters({...filters, category: e.target.value})} 
          style={{ 
            width: '100%', padding: '0.8rem 1rem', 
            background: 'rgba(255,255,255,0.06)', 
            border: '1px solid rgba(255,255,255,0.12)', 
            borderRadius: '12px', color: '#ffffff', 
            outline: 'none', fontSize: '0.88rem', fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.3s ease',
          }}
        >
          <option value="">الكل</option>
          {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
      </div>

      {/* Price Range Slider */}
      <div style={{ marginBottom: '2rem' }}>
        <h4 style={sectionTitle}><span style={{ width: '3px', height: '14px', background: '#f97316', borderRadius: '2px', display: 'inline-block' }} />السعر (ر.س)</h4>
        <div style={{ padding: '0 0.2rem' }}>
          <input 
            type="range" 
            min="0" max="2000" step="50"
            value={filters.maxPrice || 2000}
            onChange={e => {
              const val = Number(e.target.value);
              setFilters({...filters, maxPrice: val < 2000 ? String(val) : '', minPrice: ''});
            }}
            style={{
              width: '100%', height: '4px',
              appearance: 'none', WebkitAppearance: 'none',
              background: `linear-gradient(to left, rgba(225,29,72,0.5) ${((Number(filters.maxPrice) || 2000) / 2000) * 100}%, rgba(255,255,255,0.08) 0%)`,
              borderRadius: '4px', outline: 'none', cursor: 'pointer',
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.6rem' }}>
            <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', fontWeight: 700 }}>0</span>
            <span style={{ fontSize: '0.85rem', color: '#e11d48', fontWeight: 900 }}>
              {filters.maxPrice ? `حتى ${filters.maxPrice} ر.س` : 'الكل'}
            </span>
            <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', fontWeight: 700 }}>2000+</span>
          </div>
        </div>
      </div>

      {/* Brand Chips */}
      <div style={{ marginBottom: '2rem' }}>
        <h4 style={sectionTitle}><span style={{ width: '3px', height: '14px', background: '#e11d48', borderRadius: '2px', display: 'inline-block' }} />الماركة</h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', maxHeight: '160px', overflowY: 'auto', paddingRight: '0.3rem' }}>
          <button 
            onClick={() => setFilters({...filters, brand: ''})}
            style={chipStyle(filters.brand === '')}
          >
            {filters.brand === '' && '✔'} الكل
          </button>
          {brands.map(brand => (
            <button 
              key={brand}
              onClick={() => setFilters({...filters, brand})}
              style={chipStyle(filters.brand === brand)}
            >
              {filters.brand === brand && '✔'} {brand}
            </button>
          ))}
        </div>
      </div>

      {/* Condition Chips */}
      <div style={{ marginBottom: '2rem' }}>
        <h4 style={sectionTitle}><span style={{ width: '3px', height: '14px', background: '#10b981', borderRadius: '2px', display: 'inline-block' }} />حالة المنتج</h4>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {['الكل', 'جديد', 'مستعمل'].map(cond => {
            const active = filters.condition === cond || (cond === 'الكل' && !filters.condition);
            return (
              <button 
                key={cond} 
                onClick={() => setFilters({...filters, condition: cond === 'الكل' ? '' : cond})} 
                style={{
                  flex: 1, padding: '0.6rem', borderRadius: '12px', cursor: 'pointer', 
                  transition: 'all 0.3s ease', 
                  border: active ? '1px solid rgba(225,29,72,0.3)' : '1px solid rgba(255,255,255,0.08)',
                  background: active ? 'linear-gradient(135deg, #be123c, #e11d48)' : 'rgba(255,255,255,0.03)',
                  color: active ? '#fff' : 'rgba(255,255,255,0.5)', 
                  fontWeight: 800, fontSize: '0.82rem',
                  boxShadow: active ? '0 4px 15px rgba(225,29,72,0.25)' : 'none',
                }}
              >
                {cond}
              </button>
            );
          })}
        </div>
      </div>

      {/* Rating Buttons */}
      <div style={{ marginBottom: '1rem' }}>
        <h4 style={sectionTitle}><span style={{ width: '3px', height: '14px', background: '#C9A14A', borderRadius: '2px', display: 'inline-block' }} />التقييم</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {[4, 3, 2, 1].map(stars => {
            const active = filters.minRating === stars;
            return (
              <button 
                key={stars}
                onClick={() => setFilters({...filters, minRating: active ? 0 : stars})}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.6rem',
                  padding: '0.6rem 0.8rem', borderRadius: '12px', cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  border: active ? '1px solid rgba(201,161,74,0.3)' : '1px solid rgba(255,255,255,0.06)',
                  background: active ? 'rgba(201,161,74,0.1)' : 'transparent',
                  color: active ? '#C9A14A' : 'rgba(255,255,255,0.5)',
                  fontWeight: 700, fontSize: '0.82rem',
                  width: '100%', textAlign: 'right',
                }}
              >
                <span style={{ display: 'flex', gap: '2px' }}>
                  {[...Array(stars)].map((_,i) => <Star key={i} size={14} fill="#C9A14A" color="#C9A14A" />)}
                  {[...Array(5-stars)].map((_,i) => <Star key={i} size={14} fill="transparent" color="rgba(255,255,255,0.15)" />)}
                </span>
                <span>وأكثر</span>
                {active && <span style={{ marginRight: 'auto', fontSize: '0.7rem' }}>✔</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Scrollbar */}
      <style jsx>{`
        aside::-webkit-scrollbar { width: 4px; }
        aside::-webkit-scrollbar-track { background: transparent; }
        aside::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
        aside::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
        input[type=range]::-webkit-slider-thumb {
          appearance: none; -webkit-appearance: none;
          width: 20px; height: 20px; border-radius: 50%;
          background: linear-gradient(135deg, #e11d48, #f43f5e); cursor: pointer;
          box-shadow: 0 0 12px rgba(225,29,72,0.5);
          border: 2px solid rgba(255,255,255,0.3);
          transition: all 0.2s ease;
        }
        input[type=range]::-webkit-slider-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 0 20px rgba(225,29,72,0.6);
        }
        select option { background: #0c0c10; color: #fff; }
        aside button:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.3) !important;
        }
        aside select:hover {
          border-color: rgba(225,29,72,0.3) !important;
          background: rgba(255,255,255,0.08) !important;
        }
      `}</style>
    </aside>
  );
}
