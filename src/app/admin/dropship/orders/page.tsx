"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { ShoppingCart, ArrowLeft, RefreshCw, Package, Truck, CheckCircle, AlertTriangle, Clock, DollarSign } from 'lucide-react';

export default function DropshipOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingTracking, setUpdatingTracking] = useState(false);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => { loadOrders(); }, []);

  async function loadOrders() {
    setLoading(true);
    const { data } = await supabase
      .from('dropship_orders')
      .select('*')
      .order('created_at', { ascending: false });
    setOrders(data || []);
    setLoading(false);
  }

  async function updateTracking() {
    setUpdatingTracking(true);
    try {
      const res = await fetch('/api/dropship/tracking', { method: 'POST' });
      const data = await res.json();
      alert(`✅ تم تحديث ${data.updated} طلب`);
      loadOrders();
    } catch { alert('❌ فشل التحديث'); }
    setUpdatingTracking(false);
  }

  const filtered = filter === 'all' ? orders : orders.filter(o => o.provider_order_status === filter);
  const totalProfit = orders.filter(o => o.profit > 0).reduce((s, o) => s + (o.profit || 0), 0);

  const statusLabels: Record<string, { label: string; color: string; icon: any }> = {
    pending: { label: 'قيد الانتظار', color: '#f59e0b', icon: <Clock size={14} /> },
    created: { label: 'تم الإنشاء', color: '#2563eb', icon: <Package size={14} /> },
    shipped: { label: 'تم الشحن', color: '#8b5cf6', icon: <Truck size={14} /> },
    delivered: { label: 'تم التوصيل', color: '#10b981', icon: <CheckCircle size={14} /> },
    cancelled: { label: 'ملغي', color: '#6b7280', icon: <AlertTriangle size={14} /> },
    error: { label: 'خطأ', color: '#ef4444', icon: <AlertTriangle size={14} /> },
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link href="/admin/dropship" style={{
            width: '36px', height: '36px', borderRadius: '10px', border: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--surface)', textDecoration: 'none', color: 'var(--text-secondary)',
          }}><ArrowLeft size={18} /></Link>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>طلبات الدروب شيبنج</h1>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              {orders.length} طلب · أرباح: <b style={{ color: '#10b981' }}>{totalProfit.toLocaleString()} ر.س</b>
            </p>
          </div>
        </div>
        <button onClick={updateTracking} disabled={updatingTracking} style={{
          padding: '0.7rem 1.5rem', background: 'var(--primary)', color: '#fff',
          border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem',
        }}>
          <RefreshCw size={16} /> {updatingTracking ? 'جارٍ التحديث...' : 'تحديث التتبع'}
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {[{ key: 'all', label: 'الكل' }, ...Object.entries(statusLabels).map(([k, v]) => ({ key: k, label: v.label }))].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)} style={{
            padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: 600, fontSize: '0.82rem',
            cursor: 'pointer', border: '1px solid var(--border)', transition: 'all 0.2s',
            background: filter === f.key ? 'var(--primary)' : 'var(--surface)',
            color: filter === f.key ? '#fff' : 'var(--text-secondary)',
          }}>
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-tertiary)' }}>جارٍ التحميل...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px' }}>
          <ShoppingCart size={48} color="var(--text-tertiary)" style={{ marginBottom: '1rem' }} />
          <h3 style={{ color: 'var(--text-primary)' }}>لا توجد طلبات</h3>
        </div>
      ) : (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--surface-hover)' }}>
                {['الحالة', 'رقم الطلب (AE)', 'العميل', 'التكلفة', 'سعر البيع', 'الربح', 'رقم التتبع', 'التاريخ'].map(h => (
                  <th key={h} style={{ padding: '0.8rem 1rem', textAlign: 'right', fontWeight: 700, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(order => {
                const st = statusLabels[order.provider_order_status] || statusLabels.pending;
                return (
                  <tr key={order.id} style={{ borderTop: '1px solid var(--border)' }}>
                    <td style={{ padding: '0.8rem 1rem' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                        padding: '0.3rem 0.7rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700,
                        background: `${st.color}15`, color: st.color,
                      }}>
                        {st.icon} {st.label}
                      </span>
                    </td>
                    <td style={{ padding: '0.8rem 1rem', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'monospace' }}>
                      {order.provider_order_id || '—'}
                    </td>
                    <td style={{ padding: '0.8rem 1rem', fontSize: '0.82rem', color: 'var(--text-primary)' }}>
                      {order.customer_name || '—'}
                    </td>
                    <td style={{ padding: '0.8rem 1rem', fontSize: '0.82rem', fontWeight: 700, color: '#f59e0b' }}>
                      ${order.provider_cost || 0}
                    </td>
                    <td style={{ padding: '0.8rem 1rem', fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary)' }}>
                      {order.local_sale_price || 0} ر.س
                    </td>
                    <td style={{ padding: '0.8rem 1rem', fontSize: '0.82rem', fontWeight: 800, color: (order.profit || 0) > 0 ? '#10b981' : 'var(--error)' }}>
                      {(order.profit || 0) > 0 ? '+' : ''}{order.profit || 0} ر.س
                    </td>
                    <td style={{ padding: '0.8rem 1rem', fontSize: '0.78rem', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
                      {order.tracking_number || '—'}
                    </td>
                    <td style={{ padding: '0.8rem 1rem', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                      {new Date(order.created_at).toLocaleDateString('ar-SA')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
