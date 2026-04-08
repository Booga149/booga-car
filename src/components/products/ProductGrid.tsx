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
          <div key={i} style={{ 
            height: '420px', background: 'var(--surface-hover)', 
            borderRadius: '20px', animation: 'shimmer 1.5s infinite ease-in-out', 
            border: '1px solid var(--border)' 
          }} />
        ))}
        <style>{`
          @keyframes shimmer {
            0% { opacity: 0.3; }
            50% { opacity: 0.6; }
            100% { opacity: 0.3; }
          }
        `}</style>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div style={{ 
        textAlign: 'center', padding: '6rem 2rem', 
        background: 'var(--surface)', borderRadius: '20px', 
        border: '1px dashed var(--border)' 
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <Search size={64} opacity={0.2} color="var(--text-secondary)" />
        </div>
        <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>لا يوجد منتجات مطابقة</h3>
        <p style={{ color: 'var(--text-secondary)' }}>حاول تغيير خيارات البحث أو الفلتر للعثور على ما تبحث عنه.</p>
      </div>
    );
  }

  const visibleProducts = products.slice(0, visibleCount);
  const hasMore = visibleCount < products.length;

  return (
    <>
      <div className="product-grid">
        {visibleProducts.map((prod, i) => (
          <div 
            key={prod.id} 
            style={{ 
              animation: `fadeInUp 0.5s ease ${i * 0.05}s both`,
            }}
          >
            <ProductCard {...prod} imagePlaceholderColor={prod.color || 'var(--border)'} />
          </div>
        ))}
      </div>
      
      {hasMore && (
        <div style={{ textAlign: 'center', marginTop: '3rem' }}>
          <button 
            onClick={onLoadMore} 
            style={{
              padding: '1rem 3rem', background: 'var(--surface)', 
              color: 'var(--text-secondary)', border: '1px solid var(--border)',
              borderRadius: '14px', cursor: 'pointer', fontWeight: 800, fontSize: '0.95rem', 
              transition: 'all 0.3s ease', letterSpacing: '0.3px',
            }} 
            onMouseOver={e => { e.currentTarget.style.background = 'rgba(225,29,72,0.1)'; e.currentTarget.style.borderColor = 'rgba(225,29,72,0.3)'; e.currentTarget.style.color = '#e11d48'; }} 
            onMouseOut={e => { e.currentTarget.style.background = 'var(--surface)'; e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
          >
            عرض المزيد
          </button>
        </div>
      )}

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
