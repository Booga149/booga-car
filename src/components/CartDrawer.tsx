"use client";
import React from 'react';
import { useCart } from '@/context/CartContext';
import { ShoppingCart, Trash2, X } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function CartDrawer() {
  const { cartItems, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, cartTotal } = useCart();

  if (!isCartOpen) return null;

  return (
    <>
      <div 
        onClick={() => setIsCartOpen(false)}
        style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 9999,
          backdropFilter: 'blur(5px)'
        }} 
      />
      <div className="glass-panel" style={{
        position: 'fixed', top: 0, left: 0, bottom: 0, width: 'min(400px, 100%)',
        borderRight: '1px solid var(--border)', zIndex: 10000,
        background: 'var(--surface)',
        color: 'var(--text-primary)',
        padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column',
        boxShadow: '10px 0 30px rgba(0,0,0,0.1)',
        animation: 'slideRight 0.3s ease-out forwards'
      }}>
        <style>{`
          @keyframes slideRight {
            from { transform: translateX(-100%); }
            to { transform: translateX(0); }
          }
        `}</style>
        
        <div style={{ 
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
          marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)',
          position: 'sticky', top: '0', background: 'var(--surface)', zIndex: 20
        }}>
          <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-primary)' }}>سلة المشتريات</h2>
          <button 
            onClick={() => setIsCartOpen(false)}
            style={{ 
              background: 'var(--surface-hover)', border: 'none', color: 'var(--text-primary)', 
              width: '40px', height: '40px', borderRadius: '12px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s'
            }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {cartItems.length === 0 ? (
             <div style={{ 
               textAlign: 'center', color: 'var(--text-secondary)', marginTop: '5rem', 
               display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' 
             }}>
                <div style={{ 
                  width: '100px', height: '100px', borderRadius: '30px', 
                  background: 'var(--primary-lighter)', display: 'flex', 
                  alignItems: 'center', justifyContent: 'center', color: 'var(--primary)'
                }}>
                  <ShoppingCart size={48} strokeWidth={1.5} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>سلتك فارغة حالياً</h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-tertiary)', maxWidth: '220px', lineHeight: 1.5 }}>
                    ابدأ بإضافة قطع الغيار التي تحتاجها لسيارتك الآن وستظهر هنا
                  </p>
                </div>
                <button 
                  onClick={() => setIsCartOpen(false)}
                  style={{
                    padding: '0.8rem 2rem', background: 'var(--primary)', color: 'white',
                    border: 'none', borderRadius: '14px', fontWeight: 800, cursor: 'pointer',
                    boxShadow: '0 8px 20px rgba(225,29,72,0.2)'
                  }}
                >
                  تصفح المنتجات
                </button>
             </div>
          ) : (
             cartItems.map(item => (
                <div key={item.id} style={{ display: 'flex', gap: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
                   <img src={item.image} alt={item.name} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border)' }} />
                   <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                     <h4 style={{ margin: '0 0 0.5rem', fontSize: '1rem', lineHeight: 1.3, fontWeight: 900 }}>{item.name}</h4>
                     <p style={{ color: 'var(--text-primary)', fontSize: '0.85rem', margin: '0 0 0.5rem', fontWeight: 700 }}>{item.brand}</p>
                     
                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                       <span style={{ color: '#e11d48', fontWeight: 900, fontSize: '1.15rem' }}>{formatCurrency(item.price)}</span>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', background: 'var(--background)', borderRadius: '6px', padding: '0.2rem 0.6rem', border: '1px solid var(--border)' }}>
                         <button onClick={() => updateQuantity(item.id, item.quantity - 1)} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '1.4rem', fontWeight: 900 }}>-</button>
                         <span style={{ fontWeight: 900, color: 'var(--text-primary)' }}>{item.quantity}</span>
                         <button onClick={() => updateQuantity(item.id, item.quantity + 1)} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '1.2rem', fontWeight: 900 }}>+</button>
                       </div>
                     </div>
                   </div>
                   <button 
                     onClick={() => removeFromCart(item.id)}
                     style={{ background: 'none', border: 'none', color: '#e11d48', cursor: 'pointer', padding: '0.2rem', alignSelf: 'flex-start', background: 'rgba(225,29,72,0.1)', borderRadius: '6px' }}
                     title="حذف"
                   >
                     <Trash2 size={20} />
                   </button>
                </div>
             ))
          )}
        </div>

        {cartItems.length > 0 && (
          <div style={{ marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', fontSize: '1.2rem', fontWeight: 'bold' }}>
               <span>الإجمالي التقريبي:</span>
               <span style={{ color: 'var(--primary)', fontSize: '1.5rem', fontWeight: 900 }}>{formatCurrency(cartTotal)}</span>
            </div>
            
            <a 
              href="/checkout"
              onClick={() => setIsCartOpen(false)}
              style={{
                display: 'flex', justifyContent: 'center', alignItems: 'center', textDecoration: 'none',
                width: '100%', padding: '1.2rem', background: 'var(--primary)', color: 'white', 
                border: 'none', borderRadius: '12px', cursor: 'pointer',
                fontWeight: 900, fontSize: '1.1rem',
                transition: 'transform 0.2s, box-shadow 0.2s',
                boxShadow: '0 8px 20px rgba(244, 63, 94, 0.25)'
              }}
              onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 25px rgba(244, 63, 94, 0.35)'; }}
              onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(244, 63, 94, 0.25)'; }}
            >
              شراء الآن 🛒
            </a>
          </div>
        )}
      </div>
    </>
  );
}

