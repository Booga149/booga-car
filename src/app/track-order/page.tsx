"use client";
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { supabase } from '@/lib/supabase';
import { Search, Loader2, Package, CheckCircle2, Truck, Clock, XCircle, ShieldAlert } from 'lucide-react';

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [order, setOrder] = useState<any>(null);
  const [orderItems, setOrderItems] = useState<any[]>([]);

  // Automatically load Order ID if passed in URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const idParam = urlParams.get('id');
      if (idParam) {
        setOrderId(idParam);
      }
    }
  }, []);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!orderId) {
      setError('يرجى إدخال رقم الطلب.');
      return;
    }
    setError('');
    setLoading(true);
    setOrder(null);
    setOrderItems([]);

    try {
      const res = await fetch('/api/orders/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: orderId.trim() })
      });

      const data = await res.json();

      if (!res.ok || data.error === 'not_found') {
        setError('عذراً، لم نتمكن من العثور على طلب مطابق لهذا الرقم. يرجى التأكد من البيانات.');
        setLoading(false);
        return;
      }

      if (data.error || !data.success) {
        throw new Error(data.error);
      }

      setOrder(data.order);
      setOrderItems(data.items || []);

    } catch (err: any) {
      console.error("Tracking Error:", err);
      setError('حدث خطأ أثناء البحث عن الطلب. يرجى التأكد من إدخال رقم طلب صحيح والمحاولة لاحقاً.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status: string) => {
    switch(status) {
      case 'pending': return { text: 'قيد المراجعة', icon: <Clock size={28} />, color: 'var(--primary)', step: 1 };
      case 'confirmed': return { text: 'يتم التجهيز', icon: <Package size={28} />, color: '#eab308', step: 2 };
      case 'shipped': return { text: 'تم الشحن', icon: <Truck size={28} />, color: '#3b82f6', step: 3 };
      case 'delivered': return { text: 'تم التوصيل', icon: <CheckCircle2 size={28} />, color: 'var(--success)', step: 4 };
      case 'cancelled': return { text: 'تم الإلغاء', icon: <XCircle size={28} />, color: '#ef4444', step: 0 };
      default: return { text: status, icon: <Clock size={28} />, color: 'var(--text-secondary)', step: 1 };
    }
  };

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--background)' }}>
      <Navbar />
      
      <div style={{ maxWidth: '800px', width: '100%', margin: '0 auto', padding: '6rem 2rem 4rem', flex: 1 }}>
        <h1 style={{ 
          fontSize: '2.5rem', fontWeight: 900, marginBottom: '2rem', textAlign: 'center',
          color: 'var(--text-primary)', letterSpacing: '-1px'
        }}>تتبع شحنتك 📦</h1>

        {/* Search Form */}
        <div className="glass-panel" style={{ 
          padding: '2.5rem', borderRadius: '24px', border: '1px solid var(--border)',
          background: 'var(--surface)', boxShadow: 'var(--card-shadow)', marginBottom: '3rem'
        }}>
          <form onSubmit={handleSearch} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px', marginBottom: '1rem' }}>
              <ShieldAlert size={20} color="var(--primary)" />
              <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600 }}>نظام التتبع المباشر. مجرد إدخال رقم الطلب سيوضح لك حالة الشحنة فوراً.</p>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.6rem', color: 'var(--text-secondary)', fontWeight: 700 }}>رقم الطلب (Order ID)</label>
              <input required value={orderId} onChange={e => setOrderId(e.target.value)} type="text" placeholder="مثال: 550e8400-e29b-41d4..." style={{ 
                width: '100%', padding: '1.2rem', background: 'var(--background)', 
                border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--text-primary)', 
                outline: 'none', fontWeight: 600, fontSize: '1rem', transition: '0.3s', fontFamily: 'monospace'
              }} onFocus={e => e.currentTarget.style.borderColor = 'var(--primary)'} onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'} />
            </div>

            {error && (
              <div style={{ color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '1rem', borderRadius: '12px', fontSize: '0.95rem', fontWeight: 700, textAlign: 'center' }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} style={{ 
              padding: '1.2rem', background: 'var(--primary)', color: 'white', 
              border: 'none', borderRadius: '14px', fontSize: '1.1rem', fontWeight: 800, 
              cursor: loading ? 'not-allowed' : 'pointer', 
              boxShadow: '0 8px 25px rgba(244, 63, 94, 0.25)', 
              transition: 'all 0.3s', opacity: loading ? 0.7 : 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem',
              marginTop: '1rem'
            }} onMouseOver={e=>!loading && (e.currentTarget.style.transform='translateY(-2px)')} onMouseOut={e=>!loading && (e.currentTarget.style.transform='translateY(0)')}>
              {loading ? <Loader2 className="animate-spin" size={24} /> : <><Search size={20} /> تتبع الطلب الخاص بي</>}
            </button>
          </form>
        </div>

        {/* Tracking Results */}
        {order && (
          <div className="glass-panel animate-fade-in" style={{ 
            padding: '2.5rem', borderRadius: '24px', border: '1px solid var(--border)',
            background: 'var(--surface)', boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '3rem', borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem' }}>
              <div>
                <p style={{ margin: '0 0 0.5rem', color: 'var(--text-secondary)', fontWeight: 600 }}>حالة الطلب لـ:</p>
                <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-primary)' }}>{order.buyer_name}</h2>
              </div>
              <div style={{ textAlign: 'left' }}>
                <p style={{ margin: '0 0 0.5rem', color: 'var(--text-secondary)', fontWeight: 600 }}>تاريخ الطلب:</p>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>{new Date(order.created_at).toLocaleDateString('ar-SA')}</h3>
              </div>
            </div>

            {/* Stepper / Timeline */}
            <div style={{ position: 'relative', marginBottom: '4rem', padding: '0 1rem' }}>
              <div style={{ 
                position: 'absolute', top: '24px', left: '10%', right: '10%', height: '4px', 
                background: 'var(--border)', zIndex: 0, borderRadius: '4px' 
              }}></div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
                {[
                  { id: 'pending', label: 'قيد المراجعة', icon: <Clock size={24} /> },
                  { id: 'confirmed', label: 'يتم التجهيز', icon: <Package size={24} /> },
                  { id: 'shipped', label: 'مشحون', icon: <Truck size={24} /> },
                  { id: 'delivered', label: 'تم التوصيل', icon: <CheckCircle2 size={24} /> }
                ].map((step, idx) => {
                  const currentStepInfo = getStatusInfo(order.status);
                  const isCompleted = order.status === 'cancelled' ? false : (idx + 1) <= currentStepInfo.step;
                  const isActive = (idx + 1) === currentStepInfo.step;
                  
                  return (
                    <div key={step.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', width: '80px' }}>
                      <div style={{ 
                        width: '52px', height: '52px', borderRadius: '50%', 
                        background: order.status === 'cancelled' && idx === 0 ? '#ef4444' : isCompleted ? 'var(--primary)' : 'var(--background)',
                        color: order.status === 'cancelled' && idx === 0 ? 'white' : isCompleted ? 'white' : 'var(--text-secondary)',
                        border: `3px solid ${order.status === 'cancelled' && idx === 0 ? '#ef4444' : isCompleted ? 'var(--primary)' : 'var(--border)'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: isActive ? '0 0 0 5px rgba(244, 63, 94, 0.2)' : 'none',
                        transition: '0.4s all'
                      }}>
                        {order.status === 'cancelled' && idx === 0 ? <XCircle size={24} /> : step.icon}
                      </div>
                      <span style={{ 
                        fontSize: '0.9rem', fontWeight: isActive ? 900 : 600, 
                        color: isCompleted ? 'var(--text-primary)' : 'var(--text-secondary)',
                        textAlign: 'center'
                      }}>
                        {order.status === 'cancelled' && idx === 0 ? 'ملغي' : step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Order Items Table */}
            <div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Package size={22} color="var(--primary)" /> تفاصيل الطلبية
              </h3>
              
              <div style={{ background: 'var(--background)', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                {orderItems.map((item, idx) => (
                  <div key={idx} style={{ 
                    display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.5rem',
                    borderBottom: idx !== orderItems.length - 1 ? '1px solid var(--border)' : 'none'
                  }}>
                    <img src={item.product_image || 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=100&q=80'} alt={item.product_name} style={{ width: '80px', height: '80px', borderRadius: '12px', objectFit: 'cover', border: '1px solid var(--border)' }} />
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: '0 0 0.5rem', fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>{item.product_name}</h4>
                      <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600 }}>الكمية: {item.quantity}</p>
                    </div>
                    <div style={{ fontWeight: 900, color: 'var(--primary)', fontSize: '1.2rem' }}>
                      {item.price?.toLocaleString()} ر.س
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ 
                marginTop: '1.5rem', background: 'rgba(244, 63, 94, 0.05)', padding: '1.5rem', 
                borderRadius: '16px', border: '1px solid rgba(244, 63, 94, 0.1)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}>
                <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-secondary)' }}>الإجمالي المدفوع:</span>
                <span style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--primary)' }}>{order.total?.toLocaleString()} ر.س</span>
              </div>
            </div>

          </div>
        )}

      </div>
    </main>
  );
}
