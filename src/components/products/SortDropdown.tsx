"use client";
import React from 'react';

type SortProps = {
  sortBy: string;
  setSortBy: (sort: string) => void;
  totalResults: number;
};

export default function SortDropdown({ sortBy, setSortBy, totalResults }: SortProps) {
  return (
    <div style={{ 
      display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
      marginBottom: '1.5rem', padding: '1rem 1.2rem', 
      background: 'var(--surface)', borderRadius: '14px', 
      border: '1px solid var(--border)',
    }}>
      <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600 }}>
        عرض <span style={{ color: 'var(--text-primary)', fontWeight: 900 }}>{totalResults}</span> نتيجة
      </p>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>ترتيب حسب:</span>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{
          padding: '0.6rem 1rem', background: 'var(--background)', 
          border: '1px solid var(--border)',
          borderRadius: '10px', color: 'var(--text-primary)', outline: 'none', cursor: 'pointer',
          fontWeight: 700, fontSize: '0.85rem',
        }}>
          <option value="popular">الأكثر شهرة</option>
          <option value="nearest">الأقرب إليك 📍</option>
          <option value="price_asc">الأقل سعراً</option>
          <option value="price_desc">الأعلى سعراً</option>
          <option value="rating">الأعلى تقييماً</option>
        </select>
      </div>

      <style jsx>{`
        select option { background: var(--surface); color: var(--text-primary); }
      `}</style>
    </div>
  );
}
