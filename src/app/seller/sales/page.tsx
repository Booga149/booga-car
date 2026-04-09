"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import {
  BarChart3, TrendingUp, ShoppingBag, Store, Package,
  Calendar, Filter, Loader2, ArrowUpDown, DollarSign
} from 'lucide-react';

type SaleEntry = {
  id: string;
  product_name: string;
  quantity: number;
  total: number;
  date: string;
  source: 'online' | 'store';
  status?: string;
  customer?: string;
};

export default function SellerSalesPage() {
  const { user } = useAuth();
  const [sales, setSales] = useState<SaleEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [sourceFilter, setSourceFilter] = useState<'all' | 'online' | 'store'>('all');
  const [period, setPeriod] = useState<'all' | 'today' | 'week' | 'month'>('all');

  useEffect(() => {
    if (!user) return;
    fetchAllSales();
  }, [user]);

  async function fetchAllSales() {
    setLoading(true);

    // 1. Online sales (order_items)
    const { data: sellerProducts } = await supabase
      .from('products').select('id').eq('seller_id', user!.id);
    const productIds = sellerProducts?.map(p => p.id) || [];

    let onlineSales: SaleEntry[] = [];
    if (productIds.length > 0) {
      const { data: orderItems } = await supabase
        .from('order_items')
        .select('id, product_name, quantity, price, created_at, order:orders(status)')
        .in('product_id', productIds)
        .order('created_at', { ascending: false });

      if (orderItems) {
        onlineSales = orderItems.map((item: any) => ({
          id: item.id,
          product_name: item.product_name,
          quantity: item.quantity || 1,
          total: Number(item.price) * (item.quantity || 1),
          date: item.created_at,
          source: 'online' as const,
          status: item.order?.status || 'غير معروف',
        }));
      }
    }

    // 2. Store sales
    const { data: storeSales } = await supabase
      .from('store_sales')
      .select('*')
      .eq('seller_id', user!.id)
      .order('created_at', { ascending: false });

    const storeSalesEntries: SaleEntry[] = (storeSales || []).map((s: any) => ({
      id: s.id,
      product_name: s.product_name,
      quantity: s.quantity,
      total: Number(s.total),
      date: s.created_at,
      source: 'store' as const,
      customer: s.customer_name,
    }));

    // Merge & sort
    const all = [...onlineSales, ...storeSalesEntries].sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    setSales(all);
    setLoading(false);
  }

  const filtered = useMemo(() => {
    let result = sales;
    if (sourceFilter !== 'all') result = result.filter(s => s.source === sourceFilter);
    if (period !== 'all') {
      const now = new Date();
      const cutoff = new Date();
      if (period === 'today') cutoff.setHours(0, 0, 0, 0);
      else if (period === 'week') cutoff.setDate(now.getDate() - 7);
      else if (period === 'month') cutoff.setMonth(now.getMonth() - 1);
      result = result.filter(s => new Date(s.date) >= cutoff);
    }
    return result;
  }, [sales, sourceFilter, period]);

  const totalRevenue = filtered.reduce((sum, s) => sum + s.total, 0);
  const totalItems = filtered.reduce((sum, s) => sum + s.quantity, 0);
  const onlineCount = filtered.filter(s => s.source === 'online').length;
  const storeCount = filtered.filter(s => s.source === 'store').length;

  return (
    <main style={{ minHeight: '100vh', background: '#030200', paddingBottom: '2rem' }}>
      {/* Header */}
      <div style={{
        padding: '1.2rem 1.5rem', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(59,130,246,0.1)', position: 'sticky', top: 0, zIndex: 10,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <BarChart3 size={18} color="#fff" />
            </div>
            <div>
              <div style={{ color: '#3b82f6', fontWeight: 950, fontSize: '1.1rem' }}>تقرير البيعات</div>
              <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.7rem', fontWeight: 700 }}>محل + موقع</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Link href="/seller/pos" style={{
              padding: '0.5rem 0.8rem', background: 'rgba(212,175,55,0.1)', color: '#D4AF37',
              border: '1px solid rgba(212,175,55,0.2)', borderRadius: '10px', fontSize: '0.75rem',
              fontWeight: 800, textDecoration: 'none',
            }}>🛒 POS</Link>
            <Link href="/seller/stock" style={{
              padding: '0.5rem 0.8rem', background: 'rgba(16,185,129,0.1)', color: '#10b981',
              border: '1px solid rgba(16,185,129,0.2)', borderRadius: '10px', fontSize: '0.75rem',
              fontWeight: 800, textDecoration: 'none',
            }}>📦 المخزون</Link>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '1.5rem' }}>

        {/* KPI Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', marginBottom: '1.2rem' }}>
          <div style={{
            padding: '1.2rem', background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.12)',
            borderRadius: '16px', textAlign: 'center',
          }}>
            <DollarSign size={22} color="#10b981" style={{ margin: '0 auto 0.4rem' }} />
            <div style={{ color: '#10b981', fontWeight: 950, fontSize: '1.6rem' }}>{totalRevenue.toLocaleString()}</div>
            <div style={{ color: 'rgba(16,185,129,0.5)', fontSize: '0.72rem', fontWeight: 800 }}>إجمالي الإيرادات (ر.س)</div>
          </div>
          <div style={{
            padding: '1.2rem', background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.12)',
            borderRadius: '16px', textAlign: 'center',
          }}>
            <Package size={22} color="#3b82f6" style={{ margin: '0 auto 0.4rem' }} />
            <div style={{ color: '#3b82f6', fontWeight: 950, fontSize: '1.6rem' }}>{totalItems}</div>
            <div style={{ color: 'rgba(59,130,246,0.5)', fontSize: '0.72rem', fontWeight: 800 }}>قطعة مباعة</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', marginBottom: '1.5rem' }}>
          <div style={{
            padding: '0.8rem', background: 'rgba(212,175,55,0.04)', border: '1px solid rgba(212,175,55,0.1)',
            borderRadius: '12px', textAlign: 'center',
          }}>
            <div style={{ color: '#D4AF37', fontWeight: 950, fontSize: '1.2rem' }}>{onlineCount}</div>
            <div style={{ color: 'rgba(212,175,55,0.5)', fontSize: '0.68rem', fontWeight: 800 }}>🌐 من الموقع</div>
          </div>
          <div style={{
            padding: '0.8rem', background: 'rgba(245,158,11,0.04)', border: '1px solid rgba(245,158,11,0.1)',
            borderRadius: '12px', textAlign: 'center',
          }}>
            <div style={{ color: '#f59e0b', fontWeight: 950, fontSize: '1.2rem' }}>{storeCount}</div>
            <div style={{ color: 'rgba(245,158,11,0.5)', fontSize: '0.68rem', fontWeight: 800 }}>🏪 من المحل</div>
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          {(['all', 'online', 'store'] as const).map(s => (
            <button key={s} onClick={() => setSourceFilter(s)} style={{
              padding: '0.5rem 1rem', borderRadius: '10px', fontWeight: 800, fontSize: '0.78rem',
              border: `1px solid ${sourceFilter === s ? 'rgba(59,130,246,0.3)' : 'rgba(255,255,255,0.08)'}`,
              background: sourceFilter === s ? 'rgba(59,130,246,0.1)' : 'rgba(255,255,255,0.03)',
              color: sourceFilter === s ? '#3b82f6' : 'rgba(255,255,255,0.4)',
              cursor: 'pointer',
            }}>
              {s === 'all' ? 'الكل' : s === 'online' ? '🌐 الموقع' : '🏪 المحل'}
            </button>
          ))}
          <div style={{ flex: 1 }} />
          {(['all', 'today', 'week', 'month'] as const).map(p => (
            <button key={p} onClick={() => setPeriod(p)} style={{
              padding: '0.5rem 0.8rem', borderRadius: '10px', fontWeight: 800, fontSize: '0.72rem',
              border: `1px solid ${period === p ? 'rgba(212,175,55,0.3)' : 'rgba(255,255,255,0.06)'}`,
              background: period === p ? 'rgba(212,175,55,0.08)' : 'transparent',
              color: period === p ? '#D4AF37' : 'rgba(255,255,255,0.3)',
              cursor: 'pointer',
            }}>
              {p === 'all' ? 'كل' : p === 'today' ? 'اليوم' : p === 'week' ? 'أسبوع' : 'شهر'}
            </button>
          ))}
        </div>

        {/* Sales List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'rgba(59,130,246,0.5)' }}>
            <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
            <div style={{ fontWeight: 700 }}>جاري التحميل...</div>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'rgba(255,255,255,0.3)', fontWeight: 700 }}>
            لا توجد بيعات في هذه الفترة
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {filtered.map(sale => (
              <div key={sale.id} style={{
                display: 'flex', alignItems: 'center', gap: '0.8rem',
                padding: '1rem', background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px',
              }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
                  background: sale.source === 'online' ? 'rgba(212,175,55,0.08)' : 'rgba(245,158,11,0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem',
                }}>
                  {sale.source === 'online' ? '🌐' : '🏪'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 800, fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sale.product_name}</div>
                  <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.7rem', color: 'rgba(255,255,255,0.25)', fontWeight: 600, marginTop: '0.15rem' }}>
                    <span>{sale.quantity} قطعة</span>
                    <span>•</span>
                    <span>{new Date(sale.date).toLocaleDateString('ar-SA')}</span>
                    {sale.customer && <><span>•</span><span>{sale.customer}</span></>}
                    {sale.status && sale.source === 'online' && (
                      <span style={{
                        color: sale.status === 'delivered' || sale.status === 'confirmed' ? '#10b981' : '#f59e0b',
                        fontWeight: 800,
                      }}>• {sale.status === 'delivered' ? 'مكتمل' : sale.status === 'confirmed' ? 'مؤكد' : 'قيد المراجعة'}</span>
                    )}
                  </div>
                </div>
                <div style={{ color: '#10b981', fontWeight: 950, fontSize: '0.95rem', whiteSpace: 'nowrap' }}>
                  {sale.total.toLocaleString()} <span style={{ fontSize: '0.7rem', color: 'rgba(16,185,129,0.5)' }}>ر.س</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </main>
  );
}
