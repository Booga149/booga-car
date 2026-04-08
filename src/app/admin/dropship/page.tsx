"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Package, ShoppingCart, TrendingUp, RefreshCw, Search, Settings, ArrowLeft, Activity, AlertTriangle, CheckCircle } from 'lucide-react';

export default function DropshipDashboard() {
  const [stats, setStats] = useState({ products: 0, activeOrders: 0, totalProfit: 0, lastSync: '' });
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [productsRes, ordersRes, profitRes, logsRes] = await Promise.all([
        supabase.from('dropship_products').select('id', { count: 'exact' }).eq('is_active', true),
        supabase.from('dropship_orders').select('id', { count: 'exact' }).not('provider_order_status', 'in', '("delivered","cancelled")'),
        supabase.from('dropship_orders').select('profit').eq('provider_order_status', 'delivered'),
        supabase.from('dropship_sync_log').select('*').order('created_at', { ascending: false }).limit(10),
      ]);

      const totalProfit = (profitRes.data || []).reduce((sum, o) => sum + (o.profit || 0), 0);
      const lastSync = logsRes.data?.[0]?.created_at || '';

      setStats({
        products: productsRes.count || 0,
        activeOrders: ordersRes.count || 0,
        totalProfit,
        lastSync,
      });
      setRecentLogs(logsRes.data || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  }

  const cards = [
    { label: 'منتجات مستوردة', value: stats.products, icon: <Package size={24} />, color: '#2563eb', href: '/admin/dropship/products' },
    { label: 'طلبات نشطة', value: stats.activeOrders, icon: <ShoppingCart size={24} />, color: '#f59e0b', href: '/admin/dropship/orders' },
    { label: 'إجمالي الأرباح', value: `${stats.totalProfit.toLocaleString()} ر.س`, icon: <TrendingUp size={24} />, color: '#10b981', href: '/admin/dropship/orders' },
  ];

  const actionLabels: Record<string, string> = {
    price_sync: 'مزامنة أسعار',
    stock_sync: 'مزامنة مخزون',
    product_import: 'استيراد منتج',
    order_fulfill: 'تنفيذ طلب',
    tracking_update: 'تحديث تتبع',
    token_refresh: 'تحديث Token',
    config_update: 'تعديل إعدادات',
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>🚀 الدروب شيبنج</h1>
          <p style={{ margin: '0.3rem 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>إدارة المنتجات المستوردة والطلبات</p>
        </div>
        <div style={{ display: 'flex', gap: '0.8rem' }}>
          <Link href="/admin/dropship/search" style={{
            padding: '0.7rem 1.5rem', background: 'var(--primary)', color: '#fff',
            borderRadius: '10px', fontWeight: 700, fontSize: '0.88rem',
            textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem',
            boxShadow: '0 4px 14px rgba(37,99,235,0.3)',
          }}>
            <Search size={18} /> بحث واستيراد
          </Link>
          <Link href="/admin/dropship/settings" style={{
            padding: '0.7rem 1.2rem', background: 'var(--surface)', color: 'var(--text-secondary)',
            borderRadius: '10px', fontWeight: 700, fontSize: '0.88rem', border: '1px solid var(--border)',
            textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem',
          }}>
            <Settings size={18} /> الإعدادات
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.2rem', marginBottom: '2rem' }}>
        {cards.map((card, i) => (
          <Link key={i} href={card.href} style={{ textDecoration: 'none' }}>
            <div style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: '14px', padding: '1.5rem', display: 'flex',
              justifyContent: 'space-between', alignItems: 'center',
              boxShadow: 'var(--card-shadow)', transition: 'all 0.2s',
              cursor: 'pointer',
            }}>
              <div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>{card.label}</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 900, color: card.color }}>{card.value}</div>
              </div>
              <div style={{
                width: '50px', height: '50px', borderRadius: '14px',
                background: `${card.color}15`, display: 'flex', alignItems: 'center',
                justifyContent: 'center', color: card.color,
              }}>
                {card.icon}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { href: '/admin/dropship/search', label: 'بحث عن منتجات', icon: <Search size={20} />, desc: 'ابحث واستورد من AliExpress' },
          { href: '/admin/dropship/products', label: 'المنتجات المستوردة', icon: <Package size={20} />, desc: 'إدارة ومزامنة المنتجات' },
          { href: '/admin/dropship/orders', label: 'الطلبات', icon: <ShoppingCart size={20} />, desc: 'تتبع وإدارة الطلبات' },
          { href: '/admin/dropship/settings', label: 'الإعدادات', icon: <Settings size={20} />, desc: 'ربط AliExpress وإعدادات' },
        ].map((a, i) => (
          <Link key={i} href={a.href} style={{
            textDecoration: 'none', background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: '12px', padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem',
            boxShadow: 'var(--card-shadow)', transition: 'all 0.2s',
          }}>
            <div style={{ color: 'var(--primary)' }}>{a.icon}</div>
            <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>{a.label}</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>{a.desc}</div>
          </Link>
        ))}
      </div>

      {/* Recent Activity */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '1.5rem', boxShadow: 'var(--card-shadow)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={18} /> آخر النشاطات
          </h2>
          <button onClick={loadData} style={{
            background: 'var(--surface-hover)', border: '1px solid var(--border)', borderRadius: '8px',
            padding: '0.4rem 0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem',
            color: 'var(--text-secondary)', fontSize: '0.78rem', fontWeight: 600,
          }}>
            <RefreshCw size={14} /> تحديث
          </button>
        </div>

        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-tertiary)' }}>جارٍ التحميل...</div>
        ) : recentLogs.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-tertiary)' }}>لا توجد نشاطات بعد</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {recentLogs.map((log) => (
              <div key={log.id} style={{
                padding: '0.8rem 1rem', background: 'var(--surface-hover)',
                borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.8rem',
                borderRight: `3px solid ${log.status === 'success' ? 'var(--success)' : log.status === 'error' ? 'var(--error)' : '#f59e0b'}`,
              }}>
                {log.status === 'success' ? <CheckCircle size={16} color="var(--success)" /> :
                 log.status === 'error' ? <AlertTriangle size={16} color="var(--error)" /> :
                 <AlertTriangle size={16} color="#f59e0b" />}
                <div style={{ flex: 1 }}>
                  <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                    {actionLabels[log.action] || log.action}
                  </span>
                  {log.affected_count > 0 && (
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', marginRight: '0.5rem' }}>
                      ({log.affected_count} عنصر)
                    </span>
                  )}
                  {log.error_message && (
                    <div style={{ color: 'var(--error)', fontSize: '0.75rem', marginTop: '0.2rem' }}>{log.error_message}</div>
                  )}
                </div>
                <span style={{ color: 'var(--text-tertiary)', fontSize: '0.72rem', whiteSpace: 'nowrap' }}>
                  {new Date(log.created_at).toLocaleString('ar-SA', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
