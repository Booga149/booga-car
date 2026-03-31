"use client";
import React from 'react';
import ProductCard from '../ProductCard';
import { Product } from '@/types';
import { Search } from 'lucide-react';

type GridProps = {
  products: Product[];
  isLoading: boolean;
  visibleCount: number;
  onLoadMore: () => void;
};

export default function ProductGrid({ products, isLoading, visibleCount, onLoadMore }: GridProps) {
  if (isLoading) {
    return (
      <div className="product-grid">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} style={{ height: '420px', background: 'var(--surface-hover)', borderRadius: '16px', animation: 'pulse 1.5s infinite ease-in-out', border: '1px solid var(--border)' }}>
             <style>{`
               @keyframes pulse {
                 0% { opacity: 0.6; }
                 50% { opacity: 1; }
                 100% { opacity: 0.6; }
               }
             `}</style>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '6rem 2rem', background: 'var(--surface)', borderRadius: '16px', border: '1px dashed var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}><Search size={64} opacity={0.3} color="var(--text-secondary)" /></div>
        <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>لا يوجد منتجات مطابقة</h3>
        <p style={{ color: 'var(--text-secondary)' }}>حاول تغيير خيارات البحث أو الفلتر للعثور على ما تبحث عنه.</p>
      </div>
    );
  }

  const visibleProducts = products.slice(0, visibleCount);
  const hasMore = visibleCount < products.length;

  return (
    <>
      <div className="product-grid">
        {visibleProducts.map(prod => (
          <ProductCard key={prod.id} {...prod} imagePlaceholderColor={prod.color || '#f3f4f6'} />
        ))}
      </div>
      
      {hasMore && (
        <div style={{ textAlign: 'center', marginTop: '3rem' }}>
          <button onClick={onLoadMore} style={{
            padding: '1rem 3rem', background: 'transparent', color: 'var(--text-primary)', border: '1px solid var(--border)',
            borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.1rem', transition: 'all 0.2s',
          }} onMouseOver={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.03)'; e.currentTarget.style.borderColor = 'var(--text-secondary)'; }} onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'var(--border)'; }}>
            عرض المزيد
          </button>
        </div>
      )}
    </>
  );
}
