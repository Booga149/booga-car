"use client";
import React from 'react';
import { ShoppingCart, Star, Zap, ShieldCheck } from 'lucide-react';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';

export default function AccessoryGrid({ products }: { products: Product[] }) {
  const { addToCart } = useCart();
  const { addToast } = useToast();

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
      gap: '2.5rem',
      padding: '2rem 0'
    }}>
      {products.map((item) => (
        <div key={item.id} style={{
          background: 'var(--surface)',
          borderRadius: '28px',
          border: '1px solid var(--border)',
          overflow: 'hidden',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
          cursor: 'pointer'
        }}
        onMouseOver={e => {
            e.currentTarget.style.transform = 'translateY(-10px)';
            e.currentTarget.style.boxShadow = `0 20px 40px rgba(16, 185, 129, 0.15)`;
        }}
        onMouseOut={e => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.05)';
        }}
        >
          {/* Image Container */}
          <div style={{ height: '240px', background: item.color || '#111', position: 'relative', overflow: 'hidden' }}>
             <img 
               src={item.image} 
               alt={item.name}
               style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }}
             />
             <div style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(0,0,0,0.6)', padding: '0.4rem 0.8rem', borderRadius: '10px', color: 'white', fontSize: '0.75rem', fontWeight: 800, backdropFilter: 'blur(5px)' }}>
                {item.category}
             </div>
             {item.oldPrice && (
               <div style={{ position: 'absolute', top: '1rem', left: '1rem', background: 'var(--primary)', color: 'white', padding: '0.4rem 0.8rem', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 900 }}>
                  خصم {Math.round(((item.oldPrice - item.price) / item.oldPrice) * 100)}%
               </div>
             )}
          </div>

          {/* Content */}
          <div style={{ padding: '1.8rem' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 800 }}>{item.brand}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#fbbf24', fontSize: '0.85rem', fontWeight: 700 }}>
                   <Star size={14} fill="#fbbf24" /> {item.rating}
                </div>
             </div>
             
             <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '1rem', minHeight: '3rem', lineHeight: 1.4 }}>
                {item.name}
             </h3>

             <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 950, color: 'var(--text-primary)' }}>{item.price} ريال</div>
                {item.oldPrice && (
                    <div style={{ fontSize: '1rem', textDecoration: 'line-through', color: 'var(--text-secondary)', opacity: 0.6 }}>{item.oldPrice} ريال</div>
                )}
             </div>

             <div style={{ display: 'flex', gap: '0.8rem' }}>
                <button 
                  onClick={() => {
                    const { id, name, price, image, brand } = item;
                    addToCart({ id, name, price, image, brand });
                    addToast('تمت إضافة الإكسسوار إلى سلة مشترياتك', 'success');
                  }}
                  style={{
                    flex: 1, background: 'var(--text-primary)', color: 'var(--background)',
                    border: 'none', padding: '1rem', borderRadius: '16px', fontWeight: 800,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem',
                    transition: 'opacity 0.2s'
                  }}
                  onMouseOver={e => e.currentTarget.style.opacity = '0.9'}
                  onMouseOut={e => e.currentTarget.style.opacity = '1'}
                >
                   أضف للسلة <ShoppingCart size={18} />
                </button>
                <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
                    <ShieldCheck size={24} />
                </div>
             </div>
          </div>
        </div>
      ))}
    </div>
  );
}
