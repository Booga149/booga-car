"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { CircleDollarSign, Package, Settings, Users, User, LogIn, Activity, Eye, ChevronDown, ChevronUp, Clock, Truck, CheckCircle2, XCircle, MapPin, ShieldCheck } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Order } from '@/types';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ products: 0, orders: 0, users: 0, revenue: 0, merchants: 0 });
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('الكل');

  useEffect(() => {
    async function fetchAll() {
      try {
        const [prodRes, orderRes, userRes, merchantRes] = await Promise.all([
          supabase.from('products').select('id', { count: 'exact', head: true }),
          supabase.from('orders').select('*, order_items(*)').order('created_at', { ascending: false }),
          supabase.from('profiles').select('id', { count: 'exact', head: true }),
          supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'seller'),
        ]);

        const ordersData = orderRes.data || [];
        const totalRevenue = ordersData.reduce((sum: number, o: any) => sum + (Number(o.total) || 0), 0);

        setStats({
          products: prodRes.count || 0,
          orders: ordersData.length,
          users: userRes.count || 0,
          merchants: merchantRes.count || 0,
          revenue: totalRevenue,
        });
        setOrders(ordersData);

        const { data: logs } = await supabase.from('admin_notifications').select('*').order('created_at', { ascending: false }).limit(8);
        if (logs) setRecentLogs(logs);
      } catch (e) {}
    }
    fetchAll();
  }, []);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch (e) {}
  };

  const filteredOrders = statusFilter === 'الكل' ? orders : orders.filter(o => o.status === statusFilter);

  const statusColor = (s: string) => {
    switch (s) {
      case 'قيد المراجعة': return '#f59e0b';
      case 'تم التأكيد': return '#2563eb';
      case 'جاري الشحن': return '#8b5cf6';
      case 'تم التوصيل': return '#059669';
      case 'ملغي': return '#dc2626';
      default: return 'var(--text-secondary)';
    }
  };

  const statusIcon = (s: string) => {
    switch (s) {
      case 'قيد المراجعة': return <Clock size={14} />;
      case 'تم التأكيد': return <CheckCircle2 size={14} />;
      case 'جاري الشحن': return <Truck size={14} />;
      case 'تم التوصيل': return <CheckCircle2 size={14} />;
      case 'ملغي': return <XCircle size={14} />;
      default: return <Clock size={14} />;
    }
  };

  const statCards = [
    { title: 'إجمالي المبيعات', value: formatCurrency(stats.revenue), color: '#059669', icon: <CircleDollarSign size={24} color="#059669" /> },
    { title: 'الطلبات', value: `${stats.orders} طلب`, color: '#2563eb', icon: <Package size={24} color="#2563eb" /> },
    { title: 'التجار المعتمدين', value: `${stats.merchants}`, color: '#FFD700', icon: <ShieldCheck size={24} color="#FFD700" /> },
    { title: 'إجمالي العملاء', value: `${stats.users}`, color: '#f59e0b', icon: <Users size={24} color="#f59e0b" /> }
  ];

  const allStatuses = ['الكل', 'قيد المراجعة', 'تم التأكيد', 'جاري الشحن', 'تم التوصيل', 'ملغي'];

  return (
    <div style={{ color: 'var(--text-primary)' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', margin: '0 0 0.3rem', fontWeight: 800 }}>لوحة التحكم</h1>
        <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.95rem' }}>إحصائيات سريعة وإدارة الطلبات الواردة.</p>
      </div>

      {/* Stats Cards */}
      <div className="admin-stats" style={{ marginBottom: '2.5rem' }}>
        {statCards.map((stat) => (
          <div key={stat.title} style={{
            background: 'var(--surface)', padding: '1.5rem', borderRadius: '12px',
            border: '1px solid var(--border)', borderTop: `3px solid ${stat.color}`,
            boxShadow: 'var(--card-shadow)', transition: '0.3s'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
              <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0, fontWeight: 600 }}>{stat.title}</h3>
              {stat.icon}
            </div>
            <p style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* ═══ Orders Report Table ═══ */}
      <div style={{ background: 'var(--surface)', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '2.5rem', overflow: 'hidden', boxShadow: 'var(--card-shadow)' }}>
        {/* Header Bar */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '1.2rem 1.5rem', borderBottom: '1px solid var(--border)', background: 'var(--background)',
          flexWrap: 'wrap', gap: '1rem'
        }}>
          <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
            <Package size={20} /> تقرير الطلبات ({filteredOrders.length})
          </h2>
          <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
            {allStatuses.map(s => (
              <button key={s} onClick={() => setStatusFilter(s)} style={{
                padding: '0.4rem 0.8rem', borderRadius: '8px',
                fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', transition: '0.2s',
                background: statusFilter === s ? 'var(--primary)' : 'var(--surface)',
                color: statusFilter === s ? '#ffffff' : 'var(--text-secondary)',
                border: statusFilter === s ? 'none' : '1px solid var(--border)'
              }}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Table wrapper for horizontal scroll */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', minWidth: '800px' }}>
            <thead>
              <tr style={{ background: 'var(--background)', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '1rem', textAlign: 'right', fontWeight: 800, color: 'var(--text-secondary)' }}>رقم الطلب</th>
                <th style={{ padding: '1rem', textAlign: 'right', fontWeight: 800, color: 'var(--text-secondary)' }}>التاريخ</th>
                <th style={{ padding: '1rem', textAlign: 'right', fontWeight: 800, color: 'var(--text-secondary)' }}>المبلغ</th>
                <th style={{ padding: '1rem', textAlign: 'right', fontWeight: 800, color: 'var(--text-secondary)' }}>طريقة الدفع</th>
                <th style={{ padding: '1rem', textAlign: 'right', fontWeight: 800, color: 'var(--text-secondary)' }}>الحالة</th>
                <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 800, color: 'var(--text-secondary)' }}>تفاصيل</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>لا توجد طلبات مطابقة حالياً</td>
                </tr>
              ) : filteredOrders.map(order => (
                <React.Fragment key={order.id}>
                  <tr style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s', cursor: 'pointer' }}
                    onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                    onMouseOver={e => e.currentTarget.style.background = 'var(--background)'}
                    onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      #BC-{order.id.substring(0, 6).toUpperCase()}
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                      {new Date(order.created_at).toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td style={{ padding: '1rem', fontWeight: 800, color: 'var(--primary)' }}>
                      {formatCurrency(order.total)}
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{order.payment_method || '—'}</td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                        padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800,
                        color: statusColor(order.status), background: `${statusColor(order.status)}15`,
                        border: `1px solid ${statusColor(order.status)}30`
                      }}>
                        {statusIcon(order.status)} {order.status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      {expandedOrder === order.id ? <ChevronUp size={18} color="var(--text-secondary)" /> : <ChevronDown size={18} color="var(--text-secondary)" />}
                    </td>
                  </tr>

                  {/* Expanded Row */}
                  {expandedOrder === order.id && (
                    <tr style={{ background: 'var(--background)' }}>
                      <td colSpan={6} style={{ padding: '2rem', borderBottom: '1px solid var(--border)' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
                          {/* Order Meta */}
                          <div>
                            <h4 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>بيانات الشحن والعميل</h4>
                            <div style={{ color: 'var(--text-secondary)', display: 'grid', gap: '0.6rem', fontSize: '0.85rem' }}>
                              <p style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}><MapPin size={16} /> <strong>العنوان:</strong> {order.shipping_address || '—'}</p>
                              <p style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}><User size={16} /> <strong>معرف العميل:</strong> {order.user_id}</p>
                              <p style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Package size={16} /> <strong>المنتجات:</strong> {order.order_items?.length || 0} قطع</p>
                            </div>
                          </div>

                          {/* Quick Actions / Status Update */}
                          <div>
                            <h4 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>تغيير الحالة بسرعة</h4>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                              {['قيد المراجعة', 'تم التأكيد', 'جاري الشحن', 'تم التوصيل', 'ملغي'].map(s => (
                                <button key={s} onClick={(e) => { e.stopPropagation(); updateOrderStatus(order.id, s); }}
                                  style={{
                                    padding: '0.5rem 1rem', borderRadius: '10px', border: '1px solid',
                                    borderColor: order.status === s ? statusColor(s) : 'var(--border)',
                                    background: order.status === s ? `${statusColor(s)}15` : 'var(--surface)',
                                    color: order.status === s ? statusColor(s) : 'var(--text-secondary)',
                                    fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer', transition: '0.2s',
                                  }}
                                >
                                  {s}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Activity Log */}
      <div style={{ background: 'var(--surface)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: 'var(--card-shadow)' }}>
        <h2 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text-primary)', fontWeight: 800 }}>
          <Activity size={20} className="text-primary" style={{ color: 'var(--primary)' }} /> نشاطات النظام الأخيرة
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {recentLogs.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>لا توجد أنشطة مسجلة في سجل النظام.</p>
          ) : recentLogs.map((log, i) => (
            <div key={log.id} style={{ 
              padding: '1rem', 
              borderRadius: '12px',
              background: 'var(--background)',
              border: '1px solid var(--border)',
              display: 'flex', 
              alignItems: 'center', 
              gap: '1rem', 
              fontSize: '0.9rem' 
            }}>
              <div style={{ 
                width: '40px', height: '40px', borderRadius: '10px', 
                background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0
              }}>
                {log.type === 'NEW_USER' ? <User size={18} color="#2563eb" /> : 
                 log.type === 'NEW_ORDER' ? <Package size={18} color="#059669" /> : 
                 log.type === 'NEW_DEALER' ? <ShieldCheck size={18} color="#FFD700" /> : 
                 log.type === 'LOGIN_TRACKING' ? <LogIn size={18} color="#f59e0b" /> : 
                 <Activity size={18} color="#8b5cf6" />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.1rem' }}>{log.title}</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{log.message}</div>
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                {new Date(log.created_at).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
