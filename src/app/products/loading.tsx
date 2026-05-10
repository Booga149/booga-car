import React from 'react';
import SkeletonCard from '@/components/SkeletonCard';

export default function ProductsLoading() {
  return (
    <div className="products-page-container" style={{ padding: '7rem 2rem 5rem', maxWidth: '1400px', margin: '0 auto' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div style={{ width: '200px', height: '30px', background: 'var(--surface-hover)', borderRadius: '8px', animation: 'pulse 1.5s infinite' }} />
        <div style={{ width: '100px', height: '30px', background: 'var(--surface-hover)', borderRadius: '8px', animation: 'pulse 1.5s infinite' }} />
      </div>

      <div className="sidebar-container" style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '2rem' }}>
        <div className="desktop-only" style={{ background: 'var(--surface)', borderRadius: '20px', padding: '1.5rem', height: '500px', animation: 'pulse 1.5s infinite' }} />
        
        <div className="product-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '2rem',
        }}>
          {Array(8).fill(0).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
