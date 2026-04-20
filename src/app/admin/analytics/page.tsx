"use client";
import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { supabase } from '@/lib/supabase';
import { TrendingUp, AlertOctagon, Undo2, CheckCircle, PackageX } from 'lucide-react';

export default function AnalyticsDashboard() {
  const [metrics, setMetrics] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      // Fetch raw metrics for top-of-funnel tracking
      const metricsRes = await supabase.from('checkout_metrics').select('*').order('created_at', { ascending: false }).limit(2000);
      if (metricsRes.data) setMetrics(metricsRes.data);

      // Fetch actual orders for bottom-of-funnel tracking
      const ordersRes = await supabase.from('orders').select('id, status, payment_status, total, cro_version').order('created_at', { ascending: false }).limit(2000);
      if (ordersRes.data) setOrders(ordersRes.data);
      
    } catch(err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const int = setInterval(fetchData, 15000);
    return () => clearInterval(int);
  }, []);

  // Breakdown Numbers
  const started = metrics.filter(m => m.event_type === 'started').length;
  
  // Completed = implicitly successful or explicitly paid
  const paidOrders = orders.filter(o => o.payment_status === 'paid' || o.status === 'قيد التجهيز' || o.status === 'مكتمل' || o.status === 'تم التوصيل');
  const paid = paidOrders.length;
  
  const cancelledOrders = orders.filter(o => o.status === 'ملغي' || o.status === 'cancelled');
  const cancelled = cancelledOrders.length;
  
  const refundedOrders = orders.filter(o => o.status === 'مرتجع' || o.status === 'refunded');
  const refunded = refundedOrders.length;

  // Calculators
  const conversionRate = started ? ((paid / started) * 100).toFixed(1) : '0.0';
  const cancellationRate = paid ? ((cancelled / paid) * 100).toFixed(1) : '0.0';
  const refundRate = paid ? ((refunded / paid) * 100).toFixed(1) : '0.0';

  return (
    <main style={{ minHeight: '100vh', background: 'var(--background)' }}>
      <Navbar />
      
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '6rem 2rem' }}>
        <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--text-primary)' }}>Live Conversion Tracker</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', fontWeight: 700 }}>Real Profit = Orders - (Cancel + Refund)</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
          {/* Started */}
          <div style={{ background: 'var(--surface)', padding: '2rem', borderRadius: '24px', border: '1px solid var(--border)' }}>
            <div style={{ color: 'var(--text-secondary)', fontWeight: 800, marginBottom: '0.8rem' }}>🛒 Checkout Started</div>
            <div style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--text-primary)' }}>{started}</div>
            <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 800 }}>Total attempts</div>
          </div>

          {/* Paid */}
          <div style={{ background: 'var(--surface)', padding: '2rem', borderRadius: '24px', border: '1px solid var(--border)' }}>
            <div style={{ color: 'var(--text-secondary)', fontWeight: 800, marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle size={18} color="#10b981" /> Completed (Paid)
            </div>
            <div style={{ fontSize: '3rem', fontWeight: 900, color: '#10b981' }}>{paid}</div>
            <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#10b981', fontWeight: 900 }}>
              Conversion: {conversionRate}%
            </div>
          </div>

          {/* Cancelled */}
          <div style={{ background: 'var(--surface)', padding: '2rem', borderRadius: '24px', border: '1px solid var(--border)' }}>
            <div style={{ color: 'var(--text-secondary)', fontWeight: 800, marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <PackageX size={18} color="#ef4444" /> Cancelled
            </div>
            <div style={{ fontSize: '3rem', fontWeight: 900, color: '#ef4444' }}>{cancelled}</div>
            <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#ef4444', fontWeight: 900 }}>
              Cancel Rate: {cancellationRate}%
            </div>
          </div>
          
          {/* Refunded */}
          <div style={{ background: 'var(--surface)', padding: '2rem', borderRadius: '24px', border: '1px solid var(--border)' }}>
            <div style={{ color: 'var(--text-secondary)', fontWeight: 800, marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Undo2 size={18} color="#f59e0b" /> Refunded
            </div>
            <div style={{ fontSize: '3rem', fontWeight: 900, color: '#f59e0b' }}>{refunded}</div>
            <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#f59e0b', fontWeight: 900 }}>
              Refund Rate: {refundRate}%
            </div>
          </div>
        </div>

        {/* Breakdown by Variant */}
        <div style={{ background: 'var(--surface)', padding: '2.5rem', borderRadius: '24px', border: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertOctagon size={24} color="var(--primary)" /> مراقبة النسخ (A/B Test Status)
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            {['v1', 'v2'].map(v => {
              const vStarted = metrics.filter(m => m.event_type === 'started' && m.metadata?.version === v).length;
              const vPaid = paidOrders.filter(o => o.cro_version === v).length;
              const vCancelled = cancelledOrders.filter(o => o.cro_version === v).length;
              
              const vConvRate = vStarted ? ((vPaid/vStarted)*100).toFixed(1) : '0';
              const vCancelRate = vPaid ? ((vCancelled/vPaid)*100).toFixed(1) : '0';
              
              const header = v === 'v1' ? 'Version 1 (التجربة الهادئة)' : 'Version 2 (الضغط النفسي)';
              const isDanger = parseFloat(vCancelRate) > 10;
              
              return (
                <div key={v} style={{ padding: '1.5rem', border: `2px solid ${isDanger ? '#ef4444' : 'var(--border)'}`, borderRadius: '16px', background: 'var(--background)' }}>
                  <h3 style={{ margin: '0 0 1rem', display: 'flex', justifyContent: 'space-between' }}>
                    <span>{header}</span>
                    <span style={{ background: 'var(--primary)', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem' }}>{v.toUpperCase()}</span>
                  </h3>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--text-secondary)', fontWeight: 800 }}>Conversion</span>
                    <span style={{ fontWeight: 900, color: '#10b981' }}>{vConvRate}%</span>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)', fontWeight: 800 }}>Cancelation</span>
                    <span style={{ fontWeight: 900, color: isDanger ? '#ef4444' : 'var(--text-primary)' }}>{vCancelRate}%</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(37, 99, 235, 0.05)', borderRadius: '12px', fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-secondary)' }}>
            استراتيجية المرحلة 5: إذا ارتفع الـ Conversion في V2 مع انخفاض أو ثبات الإلغاء، سيتم تعميمه. إذا ارتفع الإلغاء بشكل حاد 🔴 يجب إيقافه فوراً.
          </div>
        </div>

      </div>
    </main>
  );
}
