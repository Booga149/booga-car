"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import Link from 'next/link';
import {
  Package, Search, Minus, Plus, AlertTriangle,
  CheckCircle, XCircle, Filter, Loader2, ShoppingBag, LayoutDashboard, Edit3
} from 'lucide-react';

export default function SellerStockPage() {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'low' | 'out'>('all');
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    fetchProducts();
  }, [user]);

  async function fetchProducts() {
    setLoading(true);
    const { data } = await supabase
      .from('products')
      .select('id, name, price, brand, category, stock_quantity, image_url, stock')
      .eq('seller_id', user!.id)
      .order('stock_quantity', { ascending: true });
    if (data) setProducts(data);
    setLoading(false);
  }

  async function updateStock(id: string, newQty: number) {
    const qty = Math.max(0, newQty);
    setUpdating(id);
    const { error } = await supabase
      .from('products')
      .update({ stock_quantity: qty, stock: qty > 0 ? 'متوفر' : 'غير متوفر' })
      .eq('id', id);
    if (!error) {
      setProducts(prev => prev.map(p => p.id === id ? { ...p, stock_quantity: qty, stock: qty > 0 ? 'متوفر' : 'غير متوفر' } : p));
      if (qty === 0) addToast('⚠️ المنتج أصبح غير متوفر', 'error');
    } else {
      addToast('فشل التحديث', 'error');
    }
    setUpdating(null);
  }

  const filtered = useMemo(() => {
    let result = products.filter(p =>
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.brand?.toLowerCase().includes(search.toLowerCase())
    );
    if (filter === 'low') result = result.filter(p => (p.stock_quantity || 0) > 0 && (p.stock_quantity || 0) <= 5);
    if (filter === 'out') result = result.filter(p => (p.stock_quantity || 0) === 0);
    return result;
  }, [products, search, filter]);

  const outCount = products.filter(p => (p.stock_quantity || 0) === 0).length;
  const lowCount = products.filter(p => (p.stock_quantity || 0) > 0 && (p.stock_quantity || 0) <= 5).length;
  const okCount = products.filter(p => (p.stock_quantity || 0) > 5).length;

  return (
    <main style={{ minHeight: '100vh', background: '#030200', paddingBottom: '2rem' }}>
      {/* Header */}
      <div style={{
        padding: '1.2rem 1.5rem', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(212,175,55,0.1)', position: 'sticky', top: 0, zIndex: 10,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Package size={18} color="#fff" />
            </div>
            <div>
              <div style={{ color: '#10b981', fontWeight: 950, fontSize: '1.1rem' }}>إدارة المخزون</div>
              <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.7rem', fontWeight: 700 }}>{products.length} منتج</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Link href="/seller/pos" style={{
              padding: '0.5rem 0.8rem', background: 'rgba(212,175,55,0.1)', color: '#D4AF37',
              border: '1px solid rgba(212,175,55,0.2)', borderRadius: '10px', fontSize: '0.75rem',
              fontWeight: 800, textDecoration: 'none',
            }}>🛒 نقطة البيع</Link>
            <Link href="/seller/dashboard" style={{
              padding: '0.5rem 0.8rem', background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)',
              border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', fontSize: '0.75rem',
              fontWeight: 700, textDecoration: 'none',
            }}>لوحة التحكم</Link>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '1.5rem' }}>

        {/* Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.8rem', marginBottom: '1.5rem' }}>
          <button onClick={() => setFilter(filter === 'out' ? 'all' : 'out')} style={{
            padding: '1rem', background: filter === 'out' ? 'rgba(244,63,94,0.12)' : 'rgba(244,63,94,0.04)',
            border: `1px solid ${filter === 'out' ? 'rgba(244,63,94,0.3)' : 'rgba(244,63,94,0.1)'}`,
            borderRadius: '14px', cursor: 'pointer', textAlign: 'center',
          }}>
            <XCircle size={20} color="#f43f5e" style={{ margin: '0 auto 0.4rem' }} />
            <div style={{ color: '#f43f5e', fontWeight: 950, fontSize: '1.5rem' }}>{outCount}</div>
            <div style={{ color: 'rgba(244,63,94,0.6)', fontSize: '0.7rem', fontWeight: 800 }}>نفد</div>
          </button>
          <button onClick={() => setFilter(filter === 'low' ? 'all' : 'low')} style={{
            padding: '1rem', background: filter === 'low' ? 'rgba(245,158,11,0.12)' : 'rgba(245,158,11,0.04)',
            border: `1px solid ${filter === 'low' ? 'rgba(245,158,11,0.3)' : 'rgba(245,158,11,0.1)'}`,
            borderRadius: '14px', cursor: 'pointer', textAlign: 'center',
          }}>
            <AlertTriangle size={20} color="#f59e0b" style={{ margin: '0 auto 0.4rem' }} />
            <div style={{ color: '#f59e0b', fontWeight: 950, fontSize: '1.5rem' }}>{lowCount}</div>
            <div style={{ color: 'rgba(245,158,11,0.6)', fontSize: '0.7rem', fontWeight: 800 }}>منخفض</div>
          </button>
          <button onClick={() => setFilter('all')} style={{
            padding: '1rem', background: filter === 'all' ? 'rgba(16,185,129,0.12)' : 'rgba(16,185,129,0.04)',
            border: `1px solid ${filter === 'all' ? 'rgba(16,185,129,0.3)' : 'rgba(16,185,129,0.1)'}`,
            borderRadius: '14px', cursor: 'pointer', textAlign: 'center',
          }}>
            <CheckCircle size={20} color="#10b981" style={{ margin: '0 auto 0.4rem' }} />
            <div style={{ color: '#10b981', fontWeight: 950, fontSize: '1.5rem' }}>{okCount}</div>
            <div style={{ color: 'rgba(16,185,129,0.6)', fontSize: '0.7rem', fontWeight: 800 }}>متوفر</div>
          </button>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: '1.2rem' }}>
          <Search size={18} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(16,185,129,0.4)' }} />
          <input
            type="text" placeholder="ابحث عن منتج..."
            value={search} onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%', padding: '1rem 2.8rem 1rem 1rem',
              background: 'rgba(16,185,129,0.04)', border: '1px solid rgba(16,185,129,0.15)',
              borderRadius: '14px', color: '#fff', fontWeight: 700, fontSize: '1rem', outline: 'none',
            }}
          />
        </div>

        {/* Products */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'rgba(16,185,129,0.5)' }}>
            <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
            <div style={{ fontWeight: 700 }}>جاري التحميل...</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {filtered.map(product => {
              const qty = product.stock_quantity || 0;
              const qtyColor = qty === 0 ? '#f43f5e' : qty <= 5 ? '#f59e0b' : '#10b981';
              const isUpdatingThis = updating === product.id;
              return (
                <div key={product.id} style={{
                  display: 'flex', alignItems: 'center', gap: '0.8rem',
                  padding: '1rem', background: 'rgba(255,255,255,0.02)',
                  border: `1px solid ${qty === 0 ? 'rgba(244,63,94,0.12)' : 'rgba(255,255,255,0.06)'}`,
                  borderRadius: '16px', transition: '0.2s',
                }}>
                  <div style={{
                    width: '46px', height: '46px', borderRadius: '12px', flexShrink: 0,
                    background: product.image_url ? `url(${product.image_url}) center/cover` : 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {!product.image_url && <Package size={20} color="rgba(255,255,255,0.15)" />}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: 'rgba(255,255,255,0.85)', fontWeight: 800, fontSize: '0.88rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.name}</div>
                    <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', fontWeight: 600, marginTop: '0.15rem' }}>{Number(product.price).toLocaleString()} ر.س</div>
                  </div>

                  {/* Stock controls */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
                    <button onClick={() => updateStock(product.id, qty - 1)} disabled={qty === 0 || isUpdatingThis}
                      style={{
                        width: '36px', height: '36px', borderRadius: '10px',
                        background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.15)',
                        color: '#f43f5e', cursor: qty === 0 ? 'not-allowed' : 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        opacity: qty === 0 ? 0.3 : 1,
                      }}><Minus size={16} /></button>

                    <button onClick={() => {
                      const val = prompt('أدخل الكمية الجديدة:', String(qty));
                      if (val !== null && !isNaN(Number(val))) updateStock(product.id, Number(val));
                    }} style={{
                      minWidth: '48px', height: '36px', borderRadius: '10px',
                      background: `${qtyColor}12`, border: `1px solid ${qtyColor}25`,
                      color: qtyColor, fontWeight: 950, fontSize: '1rem',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', gap: '0.2rem',
                    }}>
                      {isUpdatingThis ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : qty}
                    </button>

                    <button onClick={() => updateStock(product.id, qty + 1)} disabled={isUpdatingThis}
                      style={{
                        width: '36px', height: '36px', borderRadius: '10px',
                        background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)',
                        color: '#10b981', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}><Plus size={16} /></button>
                  </div>
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(255,255,255,0.3)', fontWeight: 700 }}>
                {filter !== 'all' ? 'لا توجد منتجات في هذا التصنيف' : search ? 'لا توجد نتائج' : 'لا توجد منتجات'}
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </main>
  );
}
