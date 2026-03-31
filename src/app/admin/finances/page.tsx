"use client";
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { supabase } from '@/lib/supabase';
import { Landmark, ArrowUpRight, ArrowDownLeft, TrendingUp, AlertCircle, ShieldCheck } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function AdminFinances() {
  const [loading, setLoading] = useState(true);
  const [finances, setFinances] = useState({
    totalPlatformFees: 0,
    totalSellerNet: 0,
    totalGrossSales: 0,
    pendingSellerPayouts: 0
  });

  const [payouts, setPayouts] = useState<any[]>([]);

  useEffect(() => {
    // In a real production app, this would query aggregated sums from supabase
    // For now, we mock data to map to the new database architecture 
    setTimeout(() => {
      setFinances({
        totalGrossSales: 254000,
        totalPlatformFees: 25400, // 10%
        totalSellerNet: 228600,   // 90%
        pendingSellerPayouts: 48500
      });

      setPayouts([
        { id: '1', seller: 'معرض الأداء العالي', amount: 15400, status: 'بانتظار التحويل', bank: 'بنك الراجحي', date: '2026-03-30', reason: 'طلب مستحقات' },
        { id: '2', seller: 'وكالة المجدوعي', amount: 32000, status: 'بانتظار التحويل', bank: 'البنك الأهلي', date: '2026-03-29', reason: 'مبيعات شهر مارس' },
        { id: '3', seller: 'قطع غيار الخليج', amount: 8400, status: 'مكتمل (محول)', bank: 'الإنماء', date: '2026-03-25', reason: 'طلب مستحقات' },
      ]);
      setLoading(false);
    }, 1200);
  }, []);

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--background)' }}>
      <Navbar />
      
      <div style={{ maxWidth: '1200px', width: '100%', margin: '0 auto', padding: '7rem 2rem 4rem', flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 950, color: 'var(--text-primary)', letterSpacing: '-1px' }}>
            الرقابة <span style={{ color: 'var(--primary)' }}>المالية والعمولات</span>
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', padding: '0.6rem 1.2rem', borderRadius: '16px', fontWeight: 900 }}>
            <ShieldCheck size={20} /> لوحة تحكم الإدارة العليا
          </div>
        </div>

        {/* ─── Platform Kpis ─── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
          
          <div className="glass-panel" style={{ padding: '2rem', borderRadius: '24px', border: '1px solid var(--primary)', background: 'linear-gradient(135deg, rgba(20,20,20,1) 0%, rgba(30,30,30,1) 100%)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: 'var(--primary)' }}></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
               <div style={{ background: 'rgba(244, 63, 94, 0.1)', padding: '1rem', borderRadius: '16px', color: 'var(--primary)' }}>
                  <Landmark size={28} />
               </div>
               <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)', background: 'rgba(255,255,255,0.1)', padding: '4px 12px', borderRadius: '20px' }}>أرباح الموقع</span>
            </div>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', fontWeight: 700, marginBottom: '0.5rem' }}>إجمالي العمولات المحصلة (Booga Car)</h3>
            <div style={{ fontSize: '2.5rem', fontWeight: 950, color: 'var(--primary)' }}>
               {finances.totalPlatformFees.toLocaleString()} <span style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', fontWeight: 700 }}>ر.س</span>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '2rem', borderRadius: '24px', border: '1px solid var(--border)', background: 'var(--surface)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
               <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '1rem', borderRadius: '16px', color: 'var(--success)' }}>
                  <TrendingUp size={28} />
               </div>
               <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-secondary)', background: 'var(--background)', padding: '4px 12px', borderRadius: '20px' }}>حصيلة الاستقطاب</span>
            </div>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', fontWeight: 700, marginBottom: '0.5rem' }}>إجمالي المبيعات الإجمالية للقطاع</h3>
            <div style={{ fontSize: '2.5rem', fontWeight: 950, color: 'var(--success)' }}>
               {finances.totalGrossSales.toLocaleString()} <span style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', fontWeight: 700 }}>ر.س</span>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '2rem', borderRadius: '24px', border: '1px solid var(--border)', background: 'var(--surface)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
               <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '1rem', borderRadius: '16px', color: '#f59e0b' }}>
                  <AlertCircle size={28} />
               </div>
               <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-secondary)', background: 'var(--background)', padding: '4px 12px', borderRadius: '20px' }}>جاري التحويل</span>
            </div>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', fontWeight: 700, marginBottom: '0.5rem' }}>مبالغ في طريقها للبائعين هذا الأسبوع</h3>
            <div style={{ fontSize: '2.5rem', fontWeight: 950, color: '#f59e0b' }}>
               {finances.pendingSellerPayouts.toLocaleString()} <span style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', fontWeight: 700 }}>ر.س</span>
            </div>
          </div>

        </div>

        {/* ─── Payout Requests Table ─── */}
        <h2 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '1.5rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          طلبات سحب والتسويات
        </h2>
        
        <div style={{ overflowX: 'auto', background: 'var(--surface)', borderRadius: '24px', border: '1px solid var(--border)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
            <thead>
              <tr style={{ background: 'var(--background)' }}>
                <th style={{ padding: '1.5rem', color: 'var(--text-secondary)', fontWeight: 800 }}>اسم التاجر/المتجر</th>
                <th style={{ padding: '1.5rem', color: 'var(--text-secondary)', fontWeight: 800 }}>التاريخ</th>
                <th style={{ padding: '1.5rem', color: 'var(--text-secondary)', fontWeight: 800 }}>البنك</th>
                <th style={{ padding: '1.5rem', color: 'var(--text-primary)', fontWeight: 800 }}>الصافي للتسوية</th>
                <th style={{ padding: '1.5rem', color: 'var(--text-secondary)', fontWeight: 800 }}>حالة التحويل البنكي الآلي</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>جاري تحميل البيانات المالية...</td></tr>
              ) : payouts.map((req, idx) => (
                <tr key={req.id} style={{ borderTop: '1px solid var(--border)', background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
                  <td style={{ padding: '1.5rem', color: 'var(--text-primary)', fontWeight: 800 }}>{req.seller}</td>
                  <td style={{ padding: '1.5rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{req.date}</td>
                  <td style={{ padding: '1.5rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{req.bank}</td>
                  <td style={{ padding: '1.5rem', color: 'var(--text-primary)', fontWeight: 900 }}>{req.amount.toLocaleString()} ر.س</td>
                  <td style={{ padding: '1.5rem' }}>
                    <span style={{ 
                      background: req.status.includes('مكتمل') ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                      color: req.status.includes('مكتمل') ? '#10b981' : '#f59e0b',
                      padding: '0.4rem 1rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 800
                    }}>
                      {req.status}
                    </span>
                  </td>
                  <td style={{ padding: '1.5rem' }}>
                    <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>تتم تلقائياً ⚡</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </main>
  );
}
