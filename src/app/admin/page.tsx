"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { CircleDollarSign, Package, Users, User, Activity, ChevronDown, ChevronUp, Clock, Truck, CheckCircle2, XCircle, MapPin, ShieldCheck, ShieldAlert, Terminal, Crosshair, Zap, Building2, Phone, BarChart2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Order } from '@/types';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, CartesianGrid, BarChart, Bar } from 'recharts';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ products: 0, orders: 0, users: 0, revenue: 0, merchants: 0 });
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('الكل');
  const [pendingDealers, setPendingDealers] = useState<any[]>([]);

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
        setStats({ products: prodRes.count || 0, orders: ordersData.length, users: userRes.count || 0, merchants: merchantRes.count || 0, revenue: totalRevenue });
        setOrders(ordersData);

        const { data: logs } = await supabase.from('admin_notifications').select('*').order('created_at', { ascending: false }).limit(8);
        if (logs) setRecentLogs(logs);

        const { data: dealers } = await supabase.from('profiles').select('id, full_name, business_name, cr_number, city, phone, dealer_status, created_at').eq('dealer_status', 'pending').order('created_at', { ascending: false });
        if (dealers) setPendingDealers(dealers);
      } catch (e) {}
    }
    fetchAll();
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
           message: `طلبك رقم #${orderId.substring(0,6).toUpperCase()} أصبح الآن في حالة: ${newStatus}`,
           link: `/track-order?id=${orderId}`
        }]);
      }
    } catch (e) {}
  };

  const filteredOrders = statusFilter === 'الكل' ? orders : orders.filter(o => o.status === statusFilter);

  const handleDealerAction = async (dealerId: string, action: 'approved' | 'rejected') => {
    try {
      const updates: any = { dealer_status: action };
      if (action === 'approved') updates.role = 'seller';
      await supabase.from('profiles').update(updates).eq('id', dealerId);
      setPendingDealers(prev => prev.filter(d => d.id !== dealerId));
      const dealer = pendingDealers.find(d => d.id === dealerId);
      await supabase.from('admin_notifications').insert([{
        type: action === 'approved' ? 'NEW_DEALER' : 'SECURITY_ALERT',
        title: action === 'approved' ? `✅ تم اعتماد التاجر: ${dealer?.business_name}` : `❌ تم رفض طلب: ${dealer?.business_name}`,
        message: `السجل: ${dealer?.cr_number} | المدينة: ${dealer?.city}`,
        is_read: false
      }]);
      if (action === 'approved') setStats(prev => ({ ...prev, merchants: prev.merchants + 1 }));
    } catch (e) { console.error('Error:', e); }
  };

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

  const statCards = [
    { title: 'إجمالي المبيعات', value: formatCurrency(stats.revenue), color: '#10b981', glow: 'rgba(16, 185, 129, 0.4)', icon: <CircleDollarSign size={28} color="#10b981" /> },
    { title: 'الطلبات', value: `${stats.orders} طلب`, color: '#4cc9f0', glow: 'rgba(76, 201, 240, 0.4)', icon: <Package size={28} color="#4cc9f0" /> },
    { title: 'التجار المعتمدين', value: `${stats.merchants}`, color: '#b5179e', glow: 'rgba(181, 23, 158, 0.4)', icon: <ShieldCheck size={28} color="#b5179e" /> },
    { title: 'إجمالي المستخدمين', value: `${stats.users}`, color: '#f59e0b', glow: 'rgba(245, 158, 11, 0.4)', icon: <Crosshair size={28} color="#f59e0b" /> }
  ];

  const allStatuses = ['الكل', 'قيد المراجعة', 'تم التأكيد', 'جاري الشحن', 'تم التوصيل', 'ملغي'];

  // Calculate Chart Data
  const getChartData = () => {
    const dataMap: Record<string, number> = {};
    const reversed = [...orders].reverse();
    reversed.forEach(o => {
      const date = new Date(o.created_at).toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' });
      dataMap[date] = (dataMap[date] || 0) + Number(o.total || 0);
    });
    return Object.entries(dataMap).map(([date, total]) => ({ date, total }));
  };
  const getStatusChartData = () => {
    const dataMap: Record<string, number> = {};
    orders.forEach(o => {
      dataMap[o.status] = (dataMap[o.status] || 0) + 1;
    });
    return Object.entries(dataMap).map(([name, value]) => ({ name, value }));
  };

  const revenueChartData = getChartData();
  const statusChartData = getStatusChartData();

  return (
    <div style={{ color: '#fff', paddingBottom: '4rem' }}>
      {/* Hero Header */}
      <div style={{ marginBottom: '3rem', position: 'relative', padding: '2rem', background: 'linear-gradient(90deg, rgba(76,201,240,0.1), transparent)', borderRadius: '24px', border: '1px solid rgba(76,201,240,0.2)', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, transparent, #4cc9f0, transparent)', opacity: 0.5 }} />
        <h1 style={{ fontSize: '2.5rem', margin: '0 0 0.5rem', fontWeight: 950, letterSpacing: '-1px', display: 'flex', alignItems: 'center', gap: '1rem', textShadow: '0 0 20px rgba(76,201,240,0.3)' }}>
          <Zap size={36} color="#4cc9f0" /> لوحة المراقبة الشاملة
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.6)', margin: 0, fontSize: '1.05rem', fontWeight: 700, letterSpacing: '1px' }}>تم تفعيل بروتوكول الإدارة الاستراتيجية. كل الصلاحيات ممنوحة.</p>
      </div>

      {/* Stats Cards */}
      <div className="admin-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '3.5rem' }}>
        {statCards.map((stat) => (
          <div key={stat.title} style={{ background: 'rgba(10, 10, 15, 0.6)', padding: '1.8rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', boxShadow: `0 10px 30px rgba(0,0,0,0.5), inset 0 0 0 1px ${stat.glow}`, position: 'relative', overflow: 'hidden', cursor: 'default', transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }} onMouseOver={e=>{e.currentTarget.style.transform='translateY(-5px) scale(1.02)'; e.currentTarget.style.boxShadow=`0 20px 40px rgba(0,0,0,0.8), inset 0 0 20px ${stat.glow}`}} onMouseOut={e=>{e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow=`0 10px 30px rgba(0,0,0,0.5), inset 0 0 0 1px ${stat.glow}`}}>
            <div style={{ position: 'absolute', top: 0, right: 0, padding: '1.5rem', opacity: 0.1, transform: 'scale(2.5) translate(20%, -20%)' }}>{stat.icon}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', position: 'relative', zIndex: 1 }}>
              <h3 style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', margin: 0, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>{stat.title}</h3>
              <div style={{ background: 'rgba(0,0,0,0.5)', padding: '0.6rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>{stat.icon}</div>
            </div>
            <p style={{ fontSize: '2.2rem', fontWeight: 950, margin: 0, color: '#fff', position: 'relative', zIndex: 1, textShadow: `0 0 20px ${stat.glow}` }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Analytics Charts */}
      {orders.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', marginBottom: '3.5rem' }}>
          {/* Revenue Area Chart */}
          <div style={{ background: 'rgba(10, 10, 15, 0.7)', padding: '2rem', borderRadius: '24px', border: '1px solid rgba(16,185,129,0.2)', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
             <h3 style={{ margin: '0 0 1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem', color: '#10b981', fontSize: '1.2rem', fontWeight: 900 }}>
               <BarChart2 size={20} /> المبيعات اليومية
             </h3>
             <div style={{ width: '100%', height: 300 }} dir="ltr">
               <ResponsiveContainer>
                 <AreaChart data={revenueChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                   <defs>
                     <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                       <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                     </linearGradient>
                   </defs>
                   <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                   <XAxis dataKey="date" stroke="rgba(255,255,255,0.3)" fontSize={12} tickMargin={10} />
                   <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} tickFormatter={(val) => `${val/1000}k`} />
                   <RechartsTooltip contentStyle={{ background: '#0a0a0f', borderColor: '#10b981', borderRadius: '12px', fontWeight: 700 }} formatter={(value: number) => [`${value} ر.س`, 'المبيعات']} />
                   <Area type="monotone" dataKey="total" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
                 </AreaChart>
               </ResponsiveContainer>
             </div>
          </div>
          
          {/* Status Bar Chart */}
          <div style={{ background: 'rgba(10, 10, 15, 0.7)', padding: '2rem', borderRadius: '24px', border: '1px solid rgba(76,201,240,0.2)', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
             <h3 style={{ margin: '0 0 1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem', color: '#4cc9f0', fontSize: '1.2rem', fontWeight: 900 }}>
               <Package size={20} /> انتشار حالات الطلب
             </h3>
             <div style={{ width: '100%', height: 300 }} dir="ltr">
               <ResponsiveContainer>
                 <BarChart data={statusChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                   <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                   <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={12} tickMargin={10} />
                   <RechartsTooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ background: '#0a0a0f', borderColor: '#4cc9f0', borderRadius: '12px', fontWeight: 700 }} formatter={(value: number) => [value, 'عدد الطلبات']} />
                   <Bar dataKey="value" fill="#4cc9f0" radius={[6, 6, 0, 0]} />
                 </BarChart>
               </ResponsiveContainer>
             </div>
          </div>
        </div>
      )}

      {/* Pending Dealer Applications */}
      {pendingDealers.length > 0 && (
        <div style={{ background: 'rgba(10, 10, 15, 0.7)', backdropFilter: 'blur(30px)', borderRadius: '24px', border: '1px solid rgba(245, 158, 11, 0.3)', marginBottom: '3.5rem', overflow: 'hidden', boxShadow: '0 30px 60px rgba(0,0,0,0.8)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 2rem', borderBottom: '1px solid rgba(245, 158, 11, 0.15)', background: 'linear-gradient(180deg, rgba(245, 158, 11, 0.08) 0%, transparent 100%)' }}>
            <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '0.8rem', color: '#fff' }}>
              <Building2 size={22} color="#f59e0b" /> طلبات التجار المعلقة
              <span style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b', padding: '0.2rem 0.8rem', borderRadius: '20px', fontSize: '0.9rem', animation: 'blink 1.5s infinite' }}>{pendingDealers.length} طلب</span>
            </h2>
          </div>
          <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {pendingDealers.map(dealer => (
              <div key={dealer.id} style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '16px', padding: '1.5rem 2rem', border: '1px solid rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap', transition: 'all 0.3s' }}
                onMouseOver={e => { e.currentTarget.style.background = 'rgba(245, 158, 11, 0.05)'; e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.3)'; }}
                onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.15)'; }}>
                <div style={{ width: '50px', height: '50px', borderRadius: '14px', background: 'rgba(245,158,11,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid rgba(245,158,11,0.2)' }}><Building2 size={24} color="#f59e0b" /></div>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <div style={{ fontWeight: 900, fontSize: '1.1rem', color: '#fff', marginBottom: '0.4rem' }}>{dealer.business_name || 'بدون اسم'}</div>
                  <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', color: 'rgba(255,255,255,0.5)', fontSize: '0.88rem', fontWeight: 700 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><ShieldCheck size={14} color="#f59e0b" /> السجل: <span style={{ color: '#f59e0b', fontFamily: 'monospace', fontWeight: 900 }}>{dealer.cr_number}</span></span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><MapPin size={14} color="#4cc9f0" /> {dealer.city || '—'}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Phone size={14} color="#10b981" /> {dealer.phone || '—'}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.8rem', flexShrink: 0 }}>
                  <button onClick={() => handleDealerAction(dealer.id, 'approved')} style={{ padding: '0.7rem 1.5rem', borderRadius: '12px', border: '1px solid rgba(16,185,129,0.3)', background: 'rgba(16,185,129,0.1)', color: '#10b981', fontWeight: 900, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.3s' }}
                    onMouseOver={e => { e.currentTarget.style.background = '#10b981'; e.currentTarget.style.color = '#000'; }}
                    onMouseOut={e => { e.currentTarget.style.background = 'rgba(16,185,129,0.1)'; e.currentTarget.style.color = '#10b981'; }}>
                    <CheckCircle2 size={16} /> اعتماد
                  </button>
                  <button onClick={() => handleDealerAction(dealer.id, 'rejected')} style={{ padding: '0.7rem 1.5rem', borderRadius: '12px', border: '1px solid rgba(244,63,94,0.3)', background: 'rgba(244,63,94,0.1)', color: '#f43f5e', fontWeight: 900, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.3s' }}
                    onMouseOver={e => { e.currentTarget.style.background = '#f43f5e'; e.currentTarget.style.color = '#fff'; }}
                    onMouseOut={e => { e.currentTarget.style.background = 'rgba(244,63,94,0.1)'; e.currentTarget.style.color = '#f43f5e'; }}>
                    <XCircle size={16} /> رفض
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Orders Report */}
      <div style={{ background: 'rgba(10, 10, 15, 0.7)', backdropFilter: 'blur(30px)', borderRadius: '24px', border: '1px solid rgba(76,201,240,0.2)', marginBottom: '3.5rem', overflow: 'hidden', boxShadow: '0 30px 60px rgba(0,0,0,0.8)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 2rem', borderBottom: '1px solid rgba(76,201,240,0.1)', background: 'linear-gradient(180deg, rgba(76,201,240,0.05) 0%, transparent 100%)', flexWrap: 'wrap', gap: '1rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '0.8rem', color: '#fff' }}>
            <Crosshair size={22} color="#4cc9f0" /> رادار تتبع الطلبات <span style={{ background: 'rgba(76,201,240,0.15)', color: '#4cc9f0', padding: '0.2rem 0.8rem', borderRadius: '20px', fontSize: '0.9rem' }}>{filteredOrders.length} هدف</span>
          </h2>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', background: 'rgba(0,0,0,0.4)', padding: '0.3rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
            {allStatuses.map(s => (
              <button key={s} onClick={() => setStatusFilter(s)} style={{ padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 900, cursor: 'pointer', transition: 'all 0.3s', background: statusFilter === s ? '#4cc9f0' : 'transparent', color: statusFilter === s ? '#020205' : 'rgba(255,255,255,0.5)', border: 'none', boxShadow: statusFilter === s ? '0 0 15px rgba(76,201,240,0.5)' : 'none' }}>{s}</button>
            ))}
          </div>
        </div>
        <div style={{ overflowX: 'auto', padding: '0.5rem' }}>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 0.5rem', fontSize: '0.95rem', minWidth: '800px' }}>
            <thead><tr>
              <th style={{ padding: '0 1.5rem', textAlign: 'right', fontWeight: 900, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.8rem' }}>معرف العملية</th>
              <th style={{ padding: '0 1.5rem', textAlign: 'right', fontWeight: 900, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.8rem' }}>التاريخ</th>
              <th style={{ padding: '0 1.5rem', textAlign: 'right', fontWeight: 900, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.8rem' }}>القيمة</th>
              <th style={{ padding: '0 1.5rem', textAlign: 'right', fontWeight: 900, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.8rem' }}>قناة الدفع</th>
              <th style={{ padding: '0 1.5rem', textAlign: 'right', fontWeight: 900, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.8rem' }}>الحالة</th>
              <th style={{ padding: '0 1.5rem', textAlign: 'center', fontWeight: 900, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.8rem' }}>الإجراءات</th>
            </tr></thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: '5rem', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontWeight: 800, fontSize: '1.2rem' }}>لا توجد أهداف نشطة حالياً</td></tr>
              ) : filteredOrders.map(order => (
                <React.Fragment key={order.id}>
                  <tr style={{ background: 'rgba(255,255,255,0.02)', cursor: 'pointer', transition: 'all 0.2s', border: expandedOrder === order.id ? '1px solid rgba(76,201,240,0.5)' : '1px solid transparent' }}
                    onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                    onMouseOver={e => { e.currentTarget.style.background = 'rgba(76,201,240,0.05)'; }} onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}>
                    <td style={{ padding: '1.2rem 1.5rem', fontWeight: 900, color: '#fff', letterSpacing: '2px' }}><span style={{ color: '#4cc9f0' }}>#BC</span>-{order.id.substring(0, 6).toUpperCase()}</td>
                    <td style={{ padding: '1.2rem 1.5rem', color: 'rgba(255,255,255,0.6)', fontWeight: 700 }}>{new Date(order.created_at).toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                    <td style={{ padding: '1.2rem 1.5rem', fontWeight: 950, color: '#10b981' }}>{formatCurrency(order.total)}</td>
                    <td style={{ padding: '1.2rem 1.5rem', color: 'rgba(255,255,255,0.6)', fontWeight: 700 }}>{order.payment_method || '—'}</td>
                    <td style={{ padding: '1.2rem 1.5rem' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 1rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 900, color: statusColor(order.status), background: 'rgba(0,0,0,0.5)', border: `1px solid ${statusColor(order.status)}` }}>
                        {statusIcon(order.status)} {order.status}
                      </span>
                    </td>
                    <td style={{ padding: '1.2rem 1.5rem', textAlign: 'center' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: expandedOrder === order.id ? '#4cc9f0' : 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                        {expandedOrder === order.id ? <ChevronUp size={18} color="#000" /> : <ChevronDown size={18} color="#fff" />}
                      </div>
                    </td>
                  </tr>
                  {expandedOrder === order.id && (
                    <tr><td colSpan={6} style={{ padding: '0 1rem 1rem' }}>
                      <div style={{ background: 'rgba(0,0,0,0.6)', padding: '2rem', borderRadius: '16px', border: '1px solid rgba(76,201,240,0.2)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem' }}>
                        <div>
                          <h4 style={{ margin: '0 0 1.5rem', fontSize: '1.1rem', fontWeight: 900, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><MapPin size={18} color="#4cc9f0" /> البيانات الفنية</h4>
                          <div style={{ color: 'rgba(255,255,255,0.6)', display: 'grid', gap: '1rem', fontSize: '0.95rem', fontWeight: 700 }}>
                            <p style={{ margin: 0, paddingBottom: '0.8rem', borderBottom: '1px dashed rgba(255,255,255,0.1)' }}><strong style={{ color: '#aaa', display: 'inline-block', width: '90px' }}>العنوان:</strong> {order.shipping_address || '—'}</p>
                            <p style={{ margin: 0, paddingBottom: '0.8rem', borderBottom: '1px dashed rgba(255,255,255,0.1)' }}><strong style={{ color: '#aaa', display: 'inline-block', width: '90px' }}>المعرف:</strong> <span style={{ fontFamily: 'monospace', color: '#4cc9f0' }}>{order.user_id}</span></p>
                            <p style={{ margin: 0 }}><strong style={{ color: '#aaa', display: 'inline-block', width: '90px' }}>القطع:</strong> {order.order_items?.length || 0} قطعة</p>
                          </div>
                        </div>
                        <div>
                          <h4 style={{ margin: '0 0 1.5rem', fontSize: '1.1rem', fontWeight: 900, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Terminal size={18} color="#4cc9f0" /> تغيير الحالة</h4>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                            {['قيد المراجعة', 'تم التأكيد', 'جاري الشحن', 'تم التوصيل', 'ملغي'].map(s => (
                              <button key={s} onClick={(e) => { e.stopPropagation(); updateOrderStatus(order.id, s); }} style={{ padding: '0.8rem 1rem', borderRadius: '8px', border: '1px solid', borderColor: order.status === s ? statusColor(s) : 'rgba(255,255,255,0.1)', background: order.status === s ? `${statusColor(s)}20` : 'rgba(255,255,255,0.02)', color: order.status === s ? statusColor(s) : 'rgba(255,255,255,0.5)', fontSize: '0.85rem', fontWeight: 900, cursor: 'pointer', transition: 'all 0.2s' }}>{s}</button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </td></tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Activity Log */}
      <div style={{ background: '#020205', padding: '2.5rem', borderRadius: '24px', border: '1px solid rgba(244,63,94,0.3)', boxShadow: '0 30px 60px rgba(0,0,0,0.8)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #f43f5e, transparent)' }} />
        <h2 style={{ fontSize: '1.4rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.8rem', color: '#f43f5e', fontWeight: 950, letterSpacing: '2px', textTransform: 'uppercase' }}>
          <Terminal size={24} /> سجل العمليات <span style={{ fontSize: '0.8rem', color: 'rgba(244,63,94,0.5)', animation: 'blink 1.5s infinite' }}>[LIVE]</span>
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontFamily: 'monospace' }}>
          {recentLogs.length === 0 ? (
            <p style={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: '3rem', fontSize: '1.2rem', fontWeight: 800 }}>[ لا توجد عمليات مسجلة ]</p>
          ) : recentLogs.map((log) => (
            <div key={log.id} style={{ padding: '1.2rem 1.5rem', borderRadius: '12px', background: 'rgba(244,63,94,0.02)', borderLeft: `4px solid ${log.type === 'NEW_USER' ? '#3b82f6' : log.type === 'NEW_ORDER' ? '#10b981' : log.type === 'NEW_DEALER' ? '#b5179e' : log.type === 'SECURITY_ALERT' ? '#f43f5e' : '#f59e0b'}`, display: 'flex', alignItems: 'center', gap: '1.5rem', transition: 'all 0.3s', cursor: 'default' }}
              onMouseOver={e=>{e.currentTarget.style.background='rgba(244,63,94,0.05)'; e.currentTarget.style.transform='translateX(5px)'}}
              onMouseOut={e=>{e.currentTarget.style.background='rgba(244,63,94,0.02)'; e.currentTarget.style.transform='none'}}>
              <div style={{ width: '45px', height: '45px', borderRadius: '12px', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid rgba(255,255,255,0.05)' }}>
                {log.type === 'NEW_USER' ? <User size={20} color="#3b82f6" /> : log.type === 'NEW_ORDER' ? <Package size={20} color="#10b981" /> : log.type === 'NEW_DEALER' ? <ShieldCheck size={20} color="#b5179e" /> : log.type === 'SECURITY_ALERT' ? <ShieldAlert size={20} color="#f43f5e" /> : <Activity size={20} color="#f59e0b" />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 900, color: '#fff', marginBottom: '0.3rem', fontSize: '1rem' }}>{log.title}</div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', lineHeight: 1.4 }}>{log.message}</div>
              </div>
              <div style={{ color: '#4cc9f0', fontSize: '0.85rem', fontWeight: 800, background: 'rgba(76,201,240,0.1)', padding: '0.3rem 0.8rem', borderRadius: '8px', border: '1px dashed rgba(76,201,240,0.3)' }}>
                {new Date(log.created_at).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
