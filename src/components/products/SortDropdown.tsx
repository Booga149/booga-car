"use client";
import React from 'react';

type SortProps = {
  sortBy: string;
  setSortBy: (sort: string) => void;
  totalResults: number;
};

export default function SortDropdown({ sortBy, setSortBy, totalResults }: SortProps) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', padding: '1rem', background: 'var(--surface)', borderRadius: '12px', border: '1px solid var(--border)' }}>
      <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
        عرض <span style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>{totalResults}</span> نتيجة
      </p>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>ترتيب حسب:</span>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{
          padding: '0.6rem 1rem', background: 'rgba(0,0,0,0.03)', border: '1px solid var(--border)',
          borderRadius: '8px', color: 'var(--text-primary)', outline: 'none', cursor: 'pointer'
        }}>
          <option value="popular">الأكثر شهرة</option>
          <option value="price_asc">الأقل سعراً</option>
          <option value="price_desc">الأعلى سعراً</option>
          <option value="rating">الأعلى تقييماً</option>
        </select>
      </div>
    </div>
  );
}
