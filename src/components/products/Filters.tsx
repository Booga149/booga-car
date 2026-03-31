"use client";
import React from 'react';
import { Star } from 'lucide-react';

type FiltersProps = {
  filters: any;
  setFilters: (filters: any) => void;
  clearFilters: () => void;
  brands: string[];
  categories: string[];
};

export default function Filters({ filters, setFilters, clearFilters, brands, categories }: FiltersProps) {
  return (
    <aside className="glass-panel" style={{
      width: '280px',
      flexShrink: 0,
      padding: '1.5rem',
      borderRadius: '16px',
      border: '1px solid var(--border)',
      background: 'var(--surface)',
      position: 'sticky',
      top: '100px',
      height: 'fit-content',
      maxHeight: 'calc(100vh - 120px)',
      overflowY: 'auto'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 'bold' }}>تصفية النتائج</h3>
        <button onClick={clearFilters} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 'bold' }}>مسح الفلاتر</button>
      </div>

      {/* Category */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h4 style={{ margin: '0 0 0.8rem', fontSize: '1rem', color: 'var(--text-secondary)' }}>القسم</h4>
        <select value={filters.category} onChange={e => setFilters({...filters, category: e.target.value})} style={{ width: '100%', padding: '0.8rem', background: 'var(--surface-hover)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-primary)', outline: 'none' }}>
          <option value="">الكل</option>
          {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
      </div>

      {/* Price Range */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h4 style={{ margin: '0 0 0.8rem', fontSize: '1rem', color: 'var(--text-secondary)' }}>السعر (ر.س)</h4>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <input type="number" placeholder="من" value={filters.minPrice} onChange={e => setFilters({...filters, minPrice: e.target.value})} style={{ width: '100%', padding: '0.8rem', background: 'var(--surface-hover)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-primary)', outline: 'none' }} />
          <span>-</span>
          <input type="number" placeholder="إلى" value={filters.maxPrice} onChange={e => setFilters({...filters, maxPrice: e.target.value})} style={{ width: '100%', padding: '0.8rem', background: 'var(--surface-hover)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-primary)', outline: 'none' }} />
        </div>
      </div>

      {/* Brand */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h4 style={{ margin: '0 0 0.8rem', fontSize: '1rem', color: 'var(--text-secondary)' }}>الماركة</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '150px', overflowY: 'auto', paddingRight: '0.5rem' }}>
          {brands.map(brand => (
            <label key={brand} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input type="radio" name="brand" checked={filters.brand === brand} onChange={() => setFilters({...filters, brand})} style={{ accentColor: 'var(--primary)' }} />
              <span style={{ fontSize: '0.95rem' }}>{brand}</span>
            </label>
          ))}
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input type="radio" name="brand" checked={filters.brand === ''} onChange={() => setFilters({...filters, brand: ''})} style={{ accentColor: 'var(--primary)' }} />
            <span style={{ fontSize: '0.95rem' }}>الكل</span>
          </label>
        </div>
      </div>

      {/* Condition */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h4 style={{ margin: '0 0 0.8rem', fontSize: '1rem', color: 'var(--text-secondary)' }}>حالة المنتج</h4>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {['الكل', 'جديد', 'مستعمل'].map(cond => (
            <button key={cond} onClick={() => setFilters({...filters, condition: cond === 'الكل' ? '' : cond})} style={{
              flex: 1, padding: '0.5rem', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s', border: '1px solid var(--border)',
              background: (filters.condition === cond || (cond === 'الكل' && !filters.condition)) ? 'var(--primary)' : 'var(--surface-hover)',
              color: 'var(--text-primary)', fontWeight: (filters.condition === cond || (cond === 'الكل' && !filters.condition)) ? 'bold' : 'normal',
            }}>
              {cond}
            </button>
          ))}
        </div>
      </div>

      {/* Rating */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h4 style={{ margin: '0 0 0.8rem', fontSize: '1rem', color: 'var(--text-secondary)' }}>التقييم</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {[4, 3, 2, 1].map(stars => (
            <label key={stars} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input type="radio" name="rating" checked={filters.minRating === stars} onChange={() => setFilters({...filters, minRating: stars})} style={{ accentColor: 'var(--primary)' }} />
              <span style={{ display: 'flex', gap: '0.1rem' }}>{[...Array(stars)].map((_,i) => <Star key={i} size={16} fill="#FFD700" color="#FFD700" />)}</span>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>وأكثر</span>
            </label>
          ))}
        </div>
      </div>
    </aside>
  );
}
