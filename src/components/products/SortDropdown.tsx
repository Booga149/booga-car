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
      background: 'rgba(12,12,16,0.9)', borderRadius: '14px', 
      border: '1px solid rgba(255,255,255,0.06)',
    }}>
      <p style={{ margin: 0, color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem', fontWeight: 600 }}>
        عرض <span style={{ color: '#ffffff', fontWeight: 900 }}>{totalResults}</span> نتيجة
      </p>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', fontWeight: 600 }}>ترتيب حسب:</span>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{
          padding: '0.6rem 1rem', background: 'rgba(255,255,255,0.04)', 
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '10px', color: '#ffffff', outline: 'none', cursor: 'pointer',
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
        select option { background: #0c0c10; color: #fff; }
      `}</style>
    </div>
  );
}
