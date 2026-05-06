"use client";
import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { formatCurrency } from '@/lib/utils';
import { Order } from '@/types';
import {
  Package, Clock, Truck, CheckCircle2, XCircle, MapPin, Terminal,
  Search, ChevronDown, ChevronUp, CircleDollarSign, Eye, Phone,
  Mail, User, ShoppingBag, Calendar, CreditCard, Filter, RefreshCw,
  AlertTriangle, Printer
} from 'lucide-react';

const allStatuses = ['الكل', 'قيد المراجعة', 'تم التأكيد', 'جاري الشحن', 'تم التوصيل', 'ملغي'];

const statusColor = (s: string) => {
  switch (s) {
    case 'قيد المراجعة': return '#f59e0b';
    case 'تم التأكيد': return '#4cc9f0';
    case 'جاري الشحن': return '#b5179e';
    case 'تم التوصيل': return '#10b981';
    case 'ملغي': return '#f43f5e';
    default: return 'rgba(255,255,255,0.4)';
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

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<(Order & { profiles?: any })[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('الكل');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [paymentFilter, setPaymentFilter] = useState('الكل');

  const fetchOrders = async () => {
    setRefreshing(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*), profiles:user_id(full_name, phone)')
        .order('created_at', { ascending: false });
      if (error) console.error("Fetch orders error:", error);
      if (data) setOrders(data);
    } catch (e) { console.error(e); }
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => { fetchOrders(); }, []);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('admin-orders-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchOrders();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { data: order } = await supabase.from('orders')
        .update({ status: newStatus })
        .eq('id', orderId)
        .select('user_id')
        .single();
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      if (order?.user_id) {
        await supabase.from('user_notifications').insert([{
          user_id: order.user_id,
          type: 'order_update',
          title: `تحديث حالة طلبك 📦`,
          message: `طلبك رقم #${orderId.substring(0, 6).toUpperCase()} أصبح الآن في حالة: ${newStatus}`,
          link: `/track-order?id=${orderId}`
        }]);
      }
    } catch (e) { console.error(e); }
  };

  const filteredOrders = useMemo(() => {
    let result = orders;
    if (statusFilter !== 'الكل') result = result.filter(o => o.status === statusFilter);
    if (paymentFilter !== 'الكل') {
      if (paymentFilter === 'مدفوع') result = result.filter(o => o.payment_status === 'paid');
      else if (paymentFilter === 'معلق') result = result.filter(o => o.payment_status !== 'paid');
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(o =>
        o.id.toLowerCase().includes(q) ||
        o.shipping_address?.toLowerCase().includes(q) ||
        (o.profiles as any)?.full_name?.toLowerCase().includes(q) ||
        (o.profiles as any)?.phone?.includes(q)
      );
    }
    return result;
  }, [orders, statusFilter, paymentFilter, searchQuery]);

  // Stats
  const totalRevenue = orders.filter(o => o.payment_status === 'paid').reduce((s, o) => s + (Number(o.total) || 0), 0);
  const pendingCount = orders.filter(o => o.status === 'قيد المراجعة').length;
  const shippingCount = orders.filter(o => o.status === 'جاري الشحن').length;
  const deliveredCount = orders.filter(o => o.status === 'تم التوصيل').length;

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div style={{ textAlign: 'center' }}>
        <Package size={48} color="#4cc9f0" style={{ animation: 'pulse 2s infinite' }} />
        <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: '1rem', fontWeight: 700 }}>جارٍ تحميل الطلبات...</p>
        <style>{`@keyframes pulse { 0%,100% { opacity: 0.4; transform: scale(0.95); } 50% { opacity: 1; transform: scale(1.05); } }`}</style>
      </div>
    </div>
  );

  const miniStats = [
    { label: 'إجمالي المبيعات', value: formatCurrency(totalRevenue), color: '#10b981', icon: <CircleDollarSign size={20} /> },
    { label: 'قيد المراجعة', value: pendingCount, color: '#f59e0b', icon: <Clock size={20} /> },
    { label: 'جاري الشحن', value: shippingCount, color: '#b5179e', icon: <Truck size={20} /> },
    { label: 'تم التوصيل', value: deliveredCount, color: '#10b981', icon: <CheckCircle2 size={20} /> },
  ];

  return (
    <div style={{ color: '#fff', paddingBottom: '4rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 950, display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <ShoppingBag size={32} color="#4cc9f0" /> إدارة الطلبات
          </h1>
          <p style={{ margin: '0.3rem 0 0', color: 'rgba(255,255,255,0.4)', fontWeight: 700, fontSize: '0.95rem' }}>
            {orders.length} طلب إجمالي • {filteredOrders.length} معروض
          </p>
        </div>
        <button onClick={fetchOrders} disabled={refreshing} style={{
          padding: '0.7rem 1.5rem', borderRadius: '12px', border: '1px solid rgba(76,201,240,0.3)',
          background: 'rgba(76,201,240,0.1)', color: '#4cc9f0', fontWeight: 800, fontSize: '0.9rem',
          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.3s',
        }}>
          <RefreshCw size={16} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} /> تحديث
          <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </button>
      </div>

      {/* Mini Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {miniStats.map(s => (
          <div key={s.label} style={{
            background: 'rgba(10,10,15,0.6)', padding: '1.2rem 1.5rem', borderRadius: '16px',
            border: `1px solid ${s.color}25`, display: 'flex', alignItems: 'center', gap: '1rem',
          }}>
            <div style={{ color: s.color, background: `${s.color}15`, padding: '0.6rem', borderRadius: '10px' }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', fontWeight: 700 }}>{s.label}</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 950, color: '#fff' }}>{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters Bar */}
      <div style={{
        background: 'rgba(10,10,15,0.6)', padding: '1.2rem 1.5rem', borderRadius: '16px',
        border: '1px solid rgba(255,255,255,0.06)', marginBottom: '1.5rem',
        display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap',
      }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1', minWidth: '220px' }}>
          <input
            type="text" placeholder="بحث بالاسم، الرقم، العنوان، الهاتف..."
            value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: '100%', padding: '0.7rem 1rem', paddingRight: '2.5rem', borderRadius: '10px',
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
              color: '#fff', fontSize: '0.88rem', outline: 'none', fontWeight: 600,
            }}
          />
          <Search size={16} color="rgba(255,255,255,0.3)" style={{ position: 'absolute', right: '0.8rem', top: '50%', transform: 'translateY(-50%)' }} />
        </div>

        {/* Status Filter */}
        <div style={{ display: 'flex', gap: '0.3rem', background: 'rgba(0,0,0,0.4)', padding: '0.3rem', borderRadius: '10px', flexWrap: 'wrap' }}>
          {allStatuses.map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} style={{
              padding: '0.5rem 0.9rem', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 800,
              cursor: 'pointer', transition: 'all 0.2s', border: 'none',
              background: statusFilter === s ? '#4cc9f0' : 'transparent',
              color: statusFilter === s ? '#020205' : 'rgba(255,255,255,0.5)',
            }}>{s}</button>
          ))}
        </div>

        {/* Payment Filter */}
        <div style={{ display: 'flex', gap: '0.3rem', background: 'rgba(0,0,0,0.4)', padding: '0.3rem', borderRadius: '10px' }}>
          {['الكل', 'مدفوع', 'معلق'].map(s => (
            <button key={s} onClick={() => setPaymentFilter(s)} style={{
              padding: '0.5rem 0.9rem', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 800,
              cursor: 'pointer', transition: 'all 0.2s', border: 'none',
              background: paymentFilter === s ? '#10b981' : 'transparent',
              color: paymentFilter === s ? '#020205' : 'rgba(255,255,255,0.5)',
            }}>{s}</button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div style={{
        background: 'rgba(10,10,15,0.7)', borderRadius: '20px',
        border: '1px solid rgba(76,201,240,0.15)', overflow: 'hidden',
        boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
      }}>
        <style>{`
          @media (max-width: 768px) {
            .orders-table, .orders-table tbody, .orders-table tr, .orders-table td { display: block; width: 100%; }
            .orders-table thead { display: none; }
            .orders-table td { text-align: right; position: relative; padding-left: 45%; border-bottom: 1px solid rgba(255,255,255,0.05); }
            .orders-table td::before { content: attr(data-label); position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); font-weight: 800; color: rgba(255,255,255,0.35); font-size: 0.78rem; }
          }
        `}</style>

        {filteredOrders.length === 0 ? (
          <div style={{ padding: '5rem 2rem', textAlign: 'center' }}>
            <AlertTriangle size={48} color="rgba(255,255,255,0.2)" style={{ marginBottom: '1rem' }} />
            <p style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 800, fontSize: '1.1rem' }}>لا توجد طلبات مطابقة</p>
          </div>
        ) : (
          <table className="orders-table" style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 2px' }}>
            <thead>
              <tr style={{ background: 'rgba(76,201,240,0.05)' }}>
                {['رقم الطلب', 'العميل', 'التاريخ', 'المبلغ', 'الدفع', 'الحالة', 'تفاصيل'].map(h => (
                  <th key={h} style={{ padding: '1rem 1.2rem', textAlign: 'right', fontWeight: 800, color: 'rgba(255,255,255,0.35)', fontSize: '0.78rem', letterSpacing: '0.5px', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(order => {
                const profile = order.profiles as any;
                const isExpanded = expandedOrder === order.id;
                return (
                  <React.Fragment key={order.id}>
                    <tr
                      onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                      style={{
                        background: isExpanded ? 'rgba(76,201,240,0.04)' : 'transparent',
                        cursor: 'pointer', transition: 'all 0.2s',
                        borderBottom: '1px solid rgba(255,255,255,0.03)',
                      }}
                      onMouseOver={e => { if (!isExpanded) e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
                      onMouseOut={e => { if (!isExpanded) e.currentTarget.style.background = 'transparent'; }}
                    >
                      <td data-label="رقم الطلب" style={{ padding: '1rem 1.2rem', fontWeight: 900, fontFamily: 'monospace', fontSize: '0.9rem' }}>
                        <span style={{ color: '#4cc9f0' }}>#BC</span>-{order.id.substring(0, 6).toUpperCase()}
                      </td>
                      <td data-label="العميل" style={{ padding: '1rem 1.2rem' }}>
                        <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#fff' }}>{profile?.full_name || 'زائر'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', fontWeight: 600 }}>{profile?.phone || '—'}</div>
                      </td>
                      <td data-label="التاريخ" style={{ padding: '1rem 1.2rem', color: 'rgba(255,255,255,0.5)', fontWeight: 700, fontSize: '0.85rem' }}>
                        {new Date(order.created_at).toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                      <td data-label="المبلغ" style={{ padding: '1rem 1.2rem', fontWeight: 950, color: '#10b981', fontSize: '0.95rem' }}>
                        {formatCurrency(order.total)}
                      </td>
                      <td data-label="الدفع" style={{ padding: '1rem 1.2rem' }}>
                        <span style={{
                          padding: '0.3rem 0.7rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800,
                          background: order.payment_status === 'paid' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                          color: order.payment_status === 'paid' ? '#10b981' : '#f59e0b',
                          border: `1px solid ${order.payment_status === 'paid' ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)'}`,
                        }}>
                          {order.payment_status === 'paid' ? '✓ مدفوع' : '⏳ معلق'}
                        </span>
                      </td>
                      <td data-label="الحالة" style={{ padding: '1rem 1.2rem' }}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                          padding: '0.35rem 0.8rem', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 800,
                          color: statusColor(order.status), background: 'rgba(0,0,0,0.4)',
                          border: `1px solid ${statusColor(order.status)}40`,
                        }}>
                          {statusIcon(order.status)} {order.status}
                        </span>
                      </td>
                      <td data-label="تفاصيل" style={{ padding: '1rem 1.2rem', textAlign: 'center' }}>
                        <div style={{
                          width: '30px', height: '30px', borderRadius: '50%', margin: '0 auto',
                          background: isExpanded ? '#4cc9f0' : 'rgba(255,255,255,0.05)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s',
                        }}>
                          {isExpanded ? <ChevronUp size={16} color="#000" /> : <ChevronDown size={16} />}
                        </div>
                      </td>
                    </tr>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <tr>
                        <td colSpan={7} style={{ padding: '0 1rem 1rem' }}>
                          <div style={{
                            background: 'rgba(0,0,0,0.5)', padding: '2rem', borderRadius: '16px',
                            border: '1px solid rgba(76,201,240,0.15)',
                            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem',
                          }}>
                            {/* Customer Info */}
                            <div>
                              <h4 style={{ margin: '0 0 1.2rem', fontWeight: 900, color: '#4cc9f0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem' }}>
                                <User size={18} /> بيانات العميل
                              </h4>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', fontSize: '0.9rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'rgba(255,255,255,0.6)' }}>
                                  <User size={14} color="#4cc9f0" />
                                  <span style={{ fontWeight: 700 }}>{profile?.full_name || 'غير معروف'}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'rgba(255,255,255,0.6)' }}>
                                  <Phone size={14} color="#10b981" />
                                  <span style={{ fontWeight: 700, direction: 'ltr' }}>{profile?.phone || '—'}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'rgba(255,255,255,0.6)' }}>
                                  <Mail size={14} color="#f59e0b" />
                                  <span style={{ fontWeight: 700, fontSize: '0.82rem' }}>{profile?.email || '—'}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'rgba(255,255,255,0.6)' }}>
                                  <MapPin size={14} color="#b5179e" />
                                  <span style={{ fontWeight: 700 }}>{order.shipping_address || '—'}</span>
                                </div>
                              </div>
                            </div>

                            {/* Order Details */}
                            <div>
                              <h4 style={{ margin: '0 0 1.2rem', fontWeight: 900, color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem' }}>
                                <Package size={18} /> تفاصيل الطلب
                              </h4>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', fontSize: '0.9rem' }}>
                                <div style={{ color: 'rgba(255,255,255,0.6)', fontWeight: 700 }}>
                                  <CreditCard size={14} color="#4cc9f0" style={{ marginLeft: '0.5rem', verticalAlign: 'middle' }} />
                                  طريقة الدفع: <span style={{ color: '#fff' }}>{order.payment_method || '—'}</span>
                                </div>
                                <div style={{ color: 'rgba(255,255,255,0.6)', fontWeight: 700 }}>
                                  <Calendar size={14} color="#4cc9f0" style={{ marginLeft: '0.5rem', verticalAlign: 'middle' }} />
                                  الوقت: <span style={{ color: '#fff' }}>{new Date(order.created_at).toLocaleString('ar-SA')}</span>
                                </div>
                                <div style={{ color: 'rgba(255,255,255,0.6)', fontWeight: 700 }}>
                                  <ShoppingBag size={14} color="#4cc9f0" style={{ marginLeft: '0.5rem', verticalAlign: 'middle' }} />
                                  عدد المنتجات: <span style={{ color: '#fff' }}>{order.order_items?.length || 0} قطعة</span>
                                </div>
                                <div style={{ color: 'rgba(255,255,255,0.6)', fontWeight: 700, fontSize: '0.78rem', fontFamily: 'monospace' }}>
                                  ID: <span style={{ color: '#4cc9f0' }}>{order.id}</span>
                                </div>
                              </div>
                            </div>

                            {/* Status Change */}
                            <div>
                              <h4 style={{ margin: '0 0 1.2rem', fontWeight: 900, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem' }}>
                                <Terminal size={18} /> تغيير الحالة
                              </h4>
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                                {['قيد المراجعة', 'تم التأكيد', 'جاري الشحن', 'تم التوصيل', 'ملغي'].map(s => (
                                  <button key={s} onClick={(e) => { e.stopPropagation(); updateOrderStatus(order.id, s); }}
                                    style={{
                                      padding: '0.7rem', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 800,
                                      cursor: 'pointer', transition: 'all 0.2s',
                                      border: `1px solid ${order.status === s ? statusColor(s) : 'rgba(255,255,255,0.08)'}`,
                                      background: order.status === s ? `${statusColor(s)}20` : 'rgba(255,255,255,0.02)',
                                      color: order.status === s ? statusColor(s) : 'rgba(255,255,255,0.5)',
                                    }}>
                                    {statusIcon(s)} {s}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Order Items */}
                          {order.order_items && order.order_items.length > 0 && (
                            <div style={{ marginTop: '1rem', background: 'rgba(0,0,0,0.3)', borderRadius: '12px', padding: '1.2rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                              <h5 style={{ margin: '0 0 1rem', color: 'rgba(255,255,255,0.5)', fontWeight: 800, fontSize: '0.85rem' }}>📦 المنتجات في الطلب</h5>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {order.order_items.map((item: any, i: number) => (
                                  <div key={item.id || i} style={{
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    padding: '0.8rem 1rem', borderRadius: '8px', background: 'rgba(255,255,255,0.02)',
                                    border: '1px solid rgba(255,255,255,0.04)',
                                  }}>
                                    <div>
                                      <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem', fontWeight: 700 }}>منتج #{i + 1}</span>
                                      <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.72rem', marginRight: '0.5rem', fontFamily: 'monospace' }}>({item.product_id?.substring(0, 8)})</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                                      <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.82rem', fontWeight: 700 }}>×{item.quantity}</span>
                                      <span style={{ color: '#10b981', fontWeight: 900, fontSize: '0.9rem' }}>{formatCurrency(item.price_at_time)}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
