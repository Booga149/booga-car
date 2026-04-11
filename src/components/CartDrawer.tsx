"use client";
import React from 'react';
import { useCart } from '@/context/CartContext';
import { ShoppingCart, Trash2 } from 'lucide-react';
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
        position: 'fixed', top: 0, left: 0, bottom: 0, width: '400px', maxWidth: '100vw',
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
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>سلة المشتريات</h2>
          <button 
            onClick={() => setIsCartOpen(false)}
            style={{ 
              background: 'rgba(0,0,0,0.06)', border: 'none', color: 'var(--text-primary)', 
              width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s'
            }}
            onMouseOver={e => e.currentTarget.style.background = 'rgba(0,0,0,0.1)'}
            onMouseOut={e => e.currentTarget.style.background = 'rgba(0,0,0,0.06)'}
          >
            ✕
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', paddingRight: '0.5rem' }}>
          {cartItems.length === 0 ? (
             <div style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '4rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                <ShoppingCart size={64} opacity={0.2} color="var(--text-secondary)" />
                <p>سلتك فارغة حالياً</p>
             </div>
          ) : (
             cartItems.map(item => (
                <div key={item.id} style={{ display: 'flex', gap: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
                   <img src={item.image} alt={item.name} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border)' }} />
                   <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                     <h4 style={{ margin: '0 0 0.5rem', fontSize: '1rem', lineHeight: 1.3 }}>{item.name}</h4>
                     <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0 0 0.5rem' }}>{item.brand}</p>
                     
                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                       <span style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '1.1rem' }}>{formatCurrency(item.price)}</span>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', background: 'rgba(0,0,0,0.03)', borderRadius: '6px', padding: '0.2rem 0.5rem', border: '1px solid var(--border)' }}>
                         <button onClick={() => updateQuantity(item.id, item.quantity - 1)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.2rem' }}>-</button>
                         <span style={{ fontWeight: 'bold' }}>{item.quantity}</span>
                         <button onClick={() => updateQuantity(item.id, item.quantity + 1)} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '1.2rem' }}>+</button>
                       </div>
                     </div>
                   </div>
                   <button 
                     onClick={() => removeFromCart(item.id)}
                     style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 0, alignSelf: 'flex-start' }}
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
            
            {/* Promo Code Copy Box */}
            <div style={{ 
              marginBottom: '1.5rem', background: 'rgba(255, 215, 0, 0.05)', 
              border: '1px dashed rgba(255, 215, 0, 0.4)', padding: '1rem', borderRadius: '14px',
              display: 'flex', flexDirection: 'column', gap: '0.6rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#FFD700', fontWeight: 900, fontSize: '0.9rem' }}>
                 🎁 هدية أول طلب: خصم 15%
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input 
                  type="text" 
                  readOnly 
                  value="SAUDI15" 
                  style={{ 
                    flex: 1, padding: '0.6rem', border: '1px solid rgba(255, 215, 0, 0.2)', 
                    background: 'var(--background)', color: 'var(--text-primary)', 
                    fontWeight: 900, letterSpacing: '2px', fontSize: '1rem', textAlign: 'center', 
                    borderRadius: '8px', outline: 'none' 
                  }} 
                />
                <button 
                  onClick={(e) => { 
                    navigator.clipboard.writeText('SAUDI15'); 
                    const btn = e.currentTarget;
                    btn.innerText = 'تم!';
                    btn.style.background = '#10b981';
                    setTimeout(() => { btn.innerText = 'نسخ'; btn.style.background = 'var(--surface-hover)'; }, 2000);
                  }} 
                  style={{ 
                    padding: '0 1.2rem', background: 'var(--surface-hover)', color: 'var(--text-primary)', 
                    border: '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer', 
                    fontWeight: 800, transition: '0.3s' 
                  }}
                  onMouseOver={e=>e.currentTarget.style.borderColor='var(--primary)'}
                  onMouseOut={e=>e.currentTarget.style.borderColor='var(--border)'}
                >
                  نسخ
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', fontSize: '1.2rem', fontWeight: 'bold' }}>
               <span>الإجمالي:</span>
               <span style={{ color: 'var(--primary)', fontSize: '1.5rem', fontWeight: 900 }}>{formatCurrency(cartTotal)}</span>
            </div>
            <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '1rem', marginTop: '-0.8rem' }}>
              * الأسعار لا تشمل ضريبة القيمة المضافة (15%) والشحن
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
            متابعة الشراء الآمن
          </a>
          </div>
        )}
      </div>
    </>
  );
}

