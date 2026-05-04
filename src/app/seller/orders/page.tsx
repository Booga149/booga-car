"use client";
import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { formatCurrency } from '@/lib/utils';
import Navbar from '@/components/Navbar';
import {
  Package, Clock, Truck, CheckCircle2, XCircle, MapPin,
  Search, ChevronDown, ChevronUp, CircleDollarSign, Phone,
  Mail, User, ShoppingBag, Calendar, CreditCard, RefreshCw,
  AlertTriangle, Bell
} from 'lucide-react';
import { useRouter } from 'next/navigation';

const statusMap: Record<string, string> = {
  'قيد المراجعة': 'قيد المراجعة',
  'تم التأكيد': 'تم التأكيد',
  'جاري التجهيز': 'جاري التجهيز',
  'جاري الشحن': 'جاري الشحن',
  'تم التوصيل': 'تم التوصيل',
  'ملغي': 'ملغي',
};

const sellerStatuses = ['الكل', 'قيد المراجعة', 'تم التأكيد', 'جاري التجهيز', 'جاري الشحن', 'تم التوصيل'];

const statusColor = (s: string) => {
  switch (s) {
    case 'قيد المراجعة': return '#f59e0b';
    case 'تم التأكيد': return '#4cc9f0';
    case 'جاري التجهيز': return '#8b5cf6';
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
    case 'جاري التجهيز': return <Package size={14} />;
    case 'جاري الشحن': return <Truck size={14} />;
    case 'تم التوصيل': return <CheckCircle2 size={14} />;
    case 'ملغي': return <XCircle size={14} />;
    default: return <Clock size={14} />;
  }
};

type SellerOrder = {
  orderId: string;
  orderDate: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  shippingAddress: string;
  buyerName: string;
  buyerPhone: string;
  buyerEmail: string;
  items: { id: string; productName: string; productImage: string; quantity: number; price: number; productId: string }[];
  sellerTotal: number;
};

export default function SellerOrdersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<SellerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('الكل');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSellerOrders = async () => {
    if (!user) return;
    setRefreshing(true);
    try {
      // 1. Get seller's product IDs
      const { data: sellerProducts } = await supabase
        .from('products')
        .select('id')
        .eq('seller_id', user.id);

      if (!sellerProducts || sellerProducts.length === 0) {
        setOrders([]);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      const productIds = sellerProducts.map(p => p.id);

      // 2. Get order_items for those products
      const { data: orderItems } = await supabase
        .from('order_items')
        .select('*, orders!inner(id, status, payment_status, payment_method, shipping_address, created_at, user_id)')
        .in('product_id', productIds)
        .order('created_at', { ascending: false });

      if (!orderItems) { setOrders([]); setLoading(false); setRefreshing(false); return; }

      // 3. Group by order
      const orderMap = new Map<string, SellerOrder>();

      for (const item of orderItems) {
        const order = (item as any).orders;
        const orderId = order.id;

        if (!orderMap.has(orderId)) {
          // Fetch buyer info
          let buyerName = 'زائر', buyerPhone = '', buyerEmail = '';
          if (order.user_id) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('full_name, phone')
              .eq('id', order.user_id)
              .single();
            buyerName = profile?.full_name || 'زائر';
            buyerPhone = profile?.phone || '';
          }

          orderMap.set(orderId, {
            orderId,
            orderDate: order.created_at,
            status: order.status || 'قيد المراجعة',
            paymentStatus: order.payment_status || 'pending',
            paymentMethod: order.payment_method || '',
            shippingAddress: order.shipping_address || '',
            buyerName,
            buyerPhone,
            buyerEmail,
            items: [],
            sellerTotal: 0,
          });
        }

        const o = orderMap.get(orderId)!;
        const itemPrice = Number(item.price) * (item.quantity || 1);
        o.items.push({
          id: item.id,
          productName: item.product_name,
          productImage: item.product_image || '',
          quantity: item.quantity,
          price: Number(item.price),
          productId: item.product_id,
        });
        o.sellerTotal += itemPrice;
      }

      setOrders(Array.from(orderMap.values()));
    } catch (e) { console.error(e); }
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    if (user === undefined) return;
    if (!user) { router.replace('/'); return; }
    fetchSellerOrders();
  }, [user]);

  // Realtime
  useEffect(() => {
    const channel = supabase
      .channel('seller-orders-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => fetchSellerOrders())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const filteredOrders = useMemo(() => {
    let result = orders;
    if (statusFilter !== 'الكل') result = result.filter(o => o.status === statusFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(o =>
        o.orderId.toLowerCase().includes(q) ||
        o.buyerName.toLowerCase().includes(q) ||
        o.buyerPhone.includes(q) ||
        o.items.some(i => i.productName.toLowerCase().includes(q))
      );
    }
    return result;
  }, [orders, statusFilter, searchQuery]);

  const totalRevenue = orders.filter(o => o.paymentStatus === 'paid').reduce((s, o) => s + o.sellerTotal, 0);
  const pendingCount = orders.filter(o => o.status === 'قيد المراجعة').length;
  const shippingCount = orders.filter(o => o.status === 'جاري الشحن').length;
  const deliveredCount = orders.filter(o => o.status === 'تم التوصيل').length;

  const miniStats = [
    { label: 'إيراداتي', value: formatCurrency(totalRevenue), color: '#D4AF37', icon: <CircleDollarSign size={20} /> },
    { label: 'طلبات جديدة', value: pendingCount, color: '#f59e0b', icon: <Bell size={20} /> },
    { label: 'جاري الشحن', value: shippingCount, color: '#b5179e', icon: <Truck size={20} /> },
    { label: 'تم التوصيل', value: deliveredCount, color: '#10b981', icon: <CheckCircle2 size={20} /> },
  ];

  if (loading) return (
    <main style={{ minHeight: '100vh', background: '#030200' }}>
      <Navbar />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <Package size={48} color="#D4AF37" style={{ animation: 'pulse 2s infinite' }} />
          <p style={{ color: 'rgba(212,175,55,0.5)', marginTop: '1rem', fontWeight: 700 }}>جارٍ تحميل طلباتك...</p>
          <style>{`@keyframes pulse { 0%,100% { opacity: 0.4; transform: scale(0.95); } 50% { opacity: 1; transform: scale(1.05); } }`}</style>
        </div>
      </div>
    </main>
  );

  return (
    <main style={{ minHeight: '100vh', background: '#030200', position: 'relative', overflow: 'hidden' }}>
      <Navbar />
      {/* Background */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 0%, #1a1100 0%, #080600 35%, #020100 100%)' }} />
      </div>

      <div style={{ maxWidth: '1280px', width: '100%', margin: '0 auto', padding: '7rem 2rem 4rem', position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 950, display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <ShoppingBag size={32} color="#D4AF37" />
              <span style={{ background: 'linear-gradient(135deg, #FFD700, #D4AF37)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>طلباتي</span>
            </h1>
            <p style={{ margin: '0.3rem 0 0', color: 'rgba(212,175,55,0.4)', fontWeight: 700, fontSize: '0.95rem' }}>
              {orders.length} طلب إجمالي • {filteredOrders.length} معروض
            </p>
          </div>
          <button onClick={fetchSellerOrders} disabled={refreshing} style={{
            padding: '0.7rem 1.5rem', borderRadius: '12px', border: '1px solid rgba(212,175,55,0.3)',
            background: 'rgba(212,175,55,0.1)', color: '#D4AF37', fontWeight: 800, fontSize: '0.9rem',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem',
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

        {/* Filters */}
        <div style={{
          background: 'rgba(10,10,15,0.6)', padding: '1.2rem 1.5rem', borderRadius: '16px',
          border: '1px solid rgba(212,175,55,0.08)', marginBottom: '1.5rem',
          display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap',
        }}>
          <div style={{ position: 'relative', flex: '1', minWidth: '220px' }}>
            <input type="text" placeholder="بحث بالاسم، المنتج، رقم الطلب..."
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%', padding: '0.7rem 1rem', paddingRight: '2.5rem', borderRadius: '10px',
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                color: '#fff', fontSize: '0.88rem', outline: 'none', fontWeight: 600,
              }}
            />
            <Search size={16} color="rgba(255,255,255,0.3)" style={{ position: 'absolute', right: '0.8rem', top: '50%', transform: 'translateY(-50%)' }} />
          </div>
          <div style={{ display: 'flex', gap: '0.3rem', background: 'rgba(0,0,0,0.4)', padding: '0.3rem', borderRadius: '10px', flexWrap: 'wrap' }}>
            {sellerStatuses.map(s => (
              <button key={s} onClick={() => setStatusFilter(s)} style={{
                padding: '0.5rem 0.9rem', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 800,
                cursor: 'pointer', border: 'none',
                background: statusFilter === s ? '#D4AF37' : 'transparent',
                color: statusFilter === s ? '#020205' : 'rgba(255,255,255,0.5)',
              }}>{s}</button>
            ))}
          </div>
        </div>

        {/* Orders */}
        <div style={{
          background: 'rgba(10,10,15,0.7)', borderRadius: '20px',
          border: '1px solid rgba(212,175,55,0.15)', overflow: 'hidden',
          boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
        }}>
          {filteredOrders.length === 0 ? (
            <div style={{ padding: '5rem 2rem', textAlign: 'center' }}>
              <AlertTriangle size={48} color="rgba(212,175,55,0.2)" style={{ marginBottom: '1rem' }} />
              <p style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 800, fontSize: '1.1rem' }}>
                {orders.length === 0 ? 'لا توجد طلبات بعد — ارفع منتجاتك وانتظر أول طلب! 🚀' : 'لا توجد طلبات مطابقة'}
              </p>
            </div>
          ) : (
            <div>
              {filteredOrders.map(order => {
                const isExpanded = expandedOrder === order.orderId;
                return (
                  <div key={order.orderId} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    {/* Order Row */}
                    <div
                      onClick={() => setExpandedOrder(isExpanded ? null : order.orderId)}
                      style={{
                        display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr auto',
                        alignItems: 'center', padding: '1.2rem 1.5rem', cursor: 'pointer',
                        background: isExpanded ? 'rgba(212,175,55,0.04)' : 'transparent',
                        transition: 'all 0.2s', gap: '1rem',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 900, fontFamily: 'monospace', fontSize: '0.9rem', color: '#D4AF37' }}>
                          #BC-{order.orderId.substring(0, 6).toUpperCase()}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', fontWeight: 600, marginTop: '0.2rem' }}>
                          {new Date(order.orderDate).toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' })}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#fff' }}>{order.buyerName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', fontWeight: 600 }}>{order.items.length} منتج</div>
                      </div>
                      <div style={{ fontWeight: 950, color: '#10b981', fontSize: '0.95rem' }}>
                        {formatCurrency(order.sellerTotal)}
                      </div>
                      <div>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                          padding: '0.35rem 0.8rem', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 800,
                          color: statusColor(order.status), background: 'rgba(0,0,0,0.4)',
                          border: `1px solid ${statusColor(order.status)}40`,
                        }}>
                          {statusIcon(order.status)} {order.status}
                        </span>
                      </div>
                      <div style={{
                        width: '30px', height: '30px', borderRadius: '50%',
                        background: isExpanded ? '#D4AF37' : 'rgba(255,255,255,0.05)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {isExpanded ? <ChevronUp size={16} color="#000" /> : <ChevronDown size={16} />}
                      </div>
                    </div>

                    {/* Expanded */}
                    {isExpanded && (
                      <div style={{ padding: '0 1.5rem 1.5rem' }}>
                        <div style={{
                          background: 'rgba(0,0,0,0.5)', padding: '2rem', borderRadius: '16px',
                          border: '1px solid rgba(212,175,55,0.15)',
                          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem',
                        }}>
                          {/* Customer Info */}
                          <div>
                            <h4 style={{ margin: '0 0 1.2rem', fontWeight: 900, color: '#D4AF37', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <User size={18} /> بيانات العميل
                            </h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', fontSize: '0.9rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'rgba(255,255,255,0.6)' }}>
                                <User size={14} color="#D4AF37" /> <span style={{ fontWeight: 700 }}>{order.buyerName}</span>
                              </div>
                              {order.buyerPhone && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'rgba(255,255,255,0.6)' }}>
                                  <Phone size={14} color="#10b981" /> <span style={{ fontWeight: 700, direction: 'ltr' }}>{order.buyerPhone}</span>
                                </div>
                              )}
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'rgba(255,255,255,0.6)' }}>
                                <MapPin size={14} color="#b5179e" /> <span style={{ fontWeight: 700 }}>{order.shippingAddress || '—'}</span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'rgba(255,255,255,0.6)' }}>
                                <CreditCard size={14} color="#4cc9f0" /> <span style={{ fontWeight: 700 }}>{order.paymentMethod}</span>
                                <span style={{
                                  padding: '0.2rem 0.5rem', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 800,
                                  background: order.paymentStatus === 'paid' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                                  color: order.paymentStatus === 'paid' ? '#10b981' : '#f59e0b',
                                }}>
                                  {order.paymentStatus === 'paid' ? '✓ مدفوع' : '⏳ معلق'}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Items */}
                          <div>
                            <h4 style={{ margin: '0 0 1.2rem', fontWeight: 900, color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <Package size={18} /> منتجاتك في الطلب
                            </h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                              {order.items.map((item, i) => (
                                <div key={item.id} style={{
                                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                  padding: '0.8rem 1rem', borderRadius: '10px', background: 'rgba(255,255,255,0.02)',
                                  border: '1px solid rgba(255,255,255,0.04)',
                                }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                    {item.productImage && (
                                      <img src={item.productImage} alt="" style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover' }} />
                                    )}
                                    <div>
                                      <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.85rem', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {item.productName}
                                      </div>
                                      <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', fontWeight: 600 }}>×{item.quantity}</div>
                                    </div>
                                  </div>
                                  <div style={{ color: '#10b981', fontWeight: 900, fontSize: '0.9rem' }}>
                                    {formatCurrency(item.price * item.quantity)}
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div style={{
                              marginTop: '1rem', padding: '0.8rem 1rem', borderRadius: '10px',
                              background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.15)',
                              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            }}>
                              <span style={{ color: 'rgba(212,175,55,0.7)', fontWeight: 800 }}>إجمالي حصتك</span>
                              <span style={{ color: '#FFD700', fontWeight: 950, fontSize: '1.1rem' }}>{formatCurrency(order.sellerTotal)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          [style*="gridTemplateColumns: '1fr 1fr 1fr 1fr auto'"] {
            grid-template-columns: 1fr 1fr !important;
          }
        }
      `}</style>
    </main>
  );
}
