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
            height: '420px', background: 'rgba(255,255,255,0.03)', 
            borderRadius: '20px', animation: 'shimmer 1.5s infinite ease-in-out', 
            border: '1px solid rgba(255,255,255,0.04)' 
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
        background: 'rgba(12,12,16,0.9)', borderRadius: '20px', 
        border: '1px dashed rgba(255,255,255,0.08)' 
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <Search size={64} opacity={0.2} color="rgba(255,255,255,0.3)" />
        </div>
        <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: '#ffffff' }}>لا يوجد منتجات مطابقة</h3>
        <p style={{ color: 'rgba(255,255,255,0.4)' }}>حاول تغيير خيارات البحث أو الفلتر للعثور على ما تبحث عنه.</p>
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
            <ProductCard {...prod} imagePlaceholderColor={prod.color || 'rgba(255,255,255,0.05)'} />
          </div>
        ))}
      </div>
      
      {hasMore && (
        <div style={{ textAlign: 'center', marginTop: '3rem' }}>
          <button 
            onClick={onLoadMore} 
            style={{
              padding: '1rem 3rem', background: 'rgba(255,255,255,0.04)', 
              color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '14px', cursor: 'pointer', fontWeight: 800, fontSize: '0.95rem', 
              transition: 'all 0.3s ease', letterSpacing: '0.3px',
            }} 
            onMouseOver={e => { e.currentTarget.style.background = 'rgba(225,29,72,0.1)'; e.currentTarget.style.borderColor = 'rgba(225,29,72,0.3)'; e.currentTarget.style.color = '#e11d48'; }} 
            onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
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
