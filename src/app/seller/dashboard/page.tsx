"use client";
import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { 
  Wallet, ArrowUpRight, TrendingUp, History, Banknote, PackagePlus, 
  Eye, Heart, AlertCircle, Settings, ShieldCheck, Crown, Zap, 
  Package, BarChart3, Store, Clock, CheckCircle2, ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SellerDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [wallet, setWallet] = useState({ totalSales: 0, totalCommission: 0, availableBalance: 0, pendingPayouts: 0 });
  const [stats, setStats] = useState({ totalViews: 0, totalLikes: 0, activeProducts: 0 });
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [stockAlerts, setStockAlerts] = useState({ outOfStock: 0, lowStock: 0 });
  const [time, setTime] = useState(new Date());

  // Live clock
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (user === undefined) return; // Still loading auth state
    if (!user) {
      // Not logged in — redirect to home
      router.replace('/');
      return;
    }
    async function loadData() {
      setLoading(true);
      try {
        // Fetch profile
        const { data: prof } = await supabase.from('profiles').select('*').eq('id', user!.id).single();
        if (prof) setProfile(prof);

        // Fetch Product Stats (including stock)
        const { data: productsData } = await supabase
          .from('products').select('views_count, likes_count, is_active, stock_quantity').eq('seller_id', user!.id);
        if (productsData) {
          const totalViews = productsData.reduce((sum, p) => sum + (p.views_count || 0), 0);
          const totalLikes = productsData.reduce((sum, p) => sum + (p.likes_count || 0), 0);
          const activeCount = productsData.filter(p => p.is_active !== false).length;
          setStats({ totalViews, totalLikes, activeProducts: activeCount });
          // Stock alerts
          const outOfStock = productsData.filter(p => (p.stock_quantity ?? 0) === 0).length;
          const lowStock = productsData.filter(p => (p.stock_quantity ?? 0) > 0 && (p.stock_quantity ?? 0) <= 5).length;
          setStockAlerts({ outOfStock, lowStock });
        }

        // Fetch Sales — first get seller's product IDs, then order_items
        const { data: sellerProducts } = await supabase
          .from('products')
          .select('id, name')
          .eq('seller_id', user!.id);

        if (sellerProducts && sellerProducts.length > 0) {
          const productIds = sellerProducts.map((p: any) => p.id);
          const { data: salesData } = await supabase
            .from('order_items')
            .select('id, price, quantity, product_name, product_id, created_at, order:orders(status)')
            .in('product_id', productIds);

          if (salesData) {
            let totalSalesText = 0;
            const transactions = salesData.map((item: any) => {
              const salePrice = Number(item.price) * (item.quantity || 1);
              const status = item.order?.status === 'delivered' || item.order?.status === 'confirmed' ? 'مكتمل' : 'قيد المراجعة';
              if (status === 'مكتمل') totalSalesText += salePrice;
              return { id: item.id, product: item.product_name, price: salePrice, comm: salePrice * 0.1, net: salePrice * 0.9, status, date: new Date(item.created_at).toLocaleDateString('ar-SA') };
            });
            setWallet({ totalSales: totalSalesText, totalCommission: totalSalesText * 0.1, availableBalance: totalSalesText * 0.9, pendingPayouts: transactions.filter(t => t.status === 'قيد المراجعة').reduce((sum, t) => sum + t.price, 0) });
            setRecentTransactions(transactions.slice(0, 6));
          }
        }

      } catch (err) {
        console.error("Error loading dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  const merchantName = profile?.business_name || profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || '';
  const merchantInitial = (profile?.business_name?.charAt(0) || profile?.full_name?.charAt(0) || user?.email?.charAt(0) || '?').toUpperCase();

  if (loading) {
    return (
      <main style={{ minHeight: '100vh', background: '#050400', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '18px', background: 'linear-gradient(135deg, #D4AF37, #FFD700)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', fontSize: '1.8rem', boxShadow: '0 0 40px rgba(212,175,55,0.3)', animation: 'pulse 1.5s ease-in-out infinite' }}>
              ⚡
            </div>
            <p style={{ color: 'rgba(212,175,55,0.6)', fontWeight: 800, letterSpacing: '2px', fontSize: '0.85rem', textTransform: 'uppercase' }}>جاري تحضير لوحة التحكم...</p>
          </div>
        </div>
        <style>{`@keyframes pulse { 0%,100%{transform:scale(1);opacity:0.8} 50%{transform:scale(1.1);opacity:1} }`}</style>
      </main>
    );
  }

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#030200', position: 'relative', overflow: 'hidden' }}>
      <Navbar />

      {/* ═══ CINEMATIC BACKGROUND ═══ */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 0%, #1a1100 0%, #080600 35%, #020100 100%)' }} />
        <div style={{ position: 'absolute', top: '-20%', left: '50%', transform: 'translateX(-50%)', width: '800px', height: '800px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(212,175,55,0.06) 0%, transparent 70%)', animation: 'bgGlow 8s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 59px, rgba(212,175,55,0.025) 59px, rgba(212,175,55,0.025) 60px), repeating-linear-gradient(90deg, transparent, transparent 59px, rgba(212,175,55,0.015) 59px, rgba(212,175,55,0.015) 60px)', backgroundSize: '60px 60px' }} />
        {/* Top gold line */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent 0%, rgba(212,175,55,0.5) 30%, rgba(255,215,0,0.8) 50%, rgba(212,175,55,0.5) 70%, transparent 100%)' }} />
      </div>

      <div style={{ maxWidth: '1280px', width: '100%', margin: '0 auto', padding: '7rem 2rem 4rem', flex: 1, position: 'relative', zIndex: 1 }}>
        
        {/* ═══ COMMAND HEADER ═══ */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            {/* Live status badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.8rem' }}>
              <div style={{ position: 'relative' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 10px rgba(16,185,129,0.8)' }} />
                <div style={{ position: 'absolute', inset: '-3px', borderRadius: '50%', border: '2px solid #10b981', opacity: 0.4, animation: 'ping 1.5s cubic-bezier(0,0,0.2,1) infinite' }} />
              </div>
              <span style={{ color: 'rgba(16,185,129,0.8)', fontSize: '0.72rem', fontWeight: 900, letterSpacing: '1.5px', textTransform: 'uppercase' }}>System Live</span>
              <span style={{ color: 'rgba(212,175,55,0.3)', fontSize: '0.7rem', fontWeight: 700 }}>
                {time.toLocaleTimeString('ar-SA')}
              </span>
            </div>

            <h1 style={{ margin: 0, fontSize: '2.8rem', fontWeight: 950, letterSpacing: '-1.5px', lineHeight: 1, display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ background: 'linear-gradient(135deg, #FFD700, #D4AF37, #FFD700)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundSize: '200% 200%', animation: 'shimmerText 4s ease infinite' }}>
                مركز القيادة
              </span>
              <span style={{ fontSize: '1.5rem', animation: 'wavyFloat 2s ease-in-out infinite' }}>⚡</span>
            </h1>
            <p style={{ margin: '0.5rem 0 0', color: 'rgba(212,175,55,0.4)', fontWeight: 700, fontSize: '0.9rem', letterSpacing: '0.5px' }}>
              مرحباً بك، {merchantName} — تاجر موثق PRO
            </p>
          </div>

          {/* Right: Quick actions */}
          <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* CR Number badge */}
            {profile?.cr_number && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '12px', color: '#10b981', fontSize: '0.75rem', fontWeight: 900 }}>
                <ShieldCheck size={14} /> موثق • {profile.cr_number}
              </div>
            )}
            <Link href="/seller/import" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.75rem 1.4rem', background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.25)', color: '#D4AF37', borderRadius: '14px', textDecoration: 'none', fontWeight: 800, fontSize: '0.88rem', transition: 'all 0.25s' }}
              onMouseOver={e => { e.currentTarget.style.background = 'rgba(212,175,55,0.18)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseOut={e => { e.currentTarget.style.background = 'rgba(212,175,55,0.1)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
              <PackagePlus size={16} /> رفع منتجات
            </Link>
            <Link href="/seller/settings" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.75rem 1.2rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)', borderRadius: '14px', textDecoration: 'none', fontWeight: 700, fontSize: '0.88rem', transition: 'all 0.25s' }}
              onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
              onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}>
              <Settings size={16} /> الإعدادات
            </Link>
          </div>
        </div>

        {/* ═══ STOCK ALERTS BANNER ═══ */}
        {(stockAlerts.outOfStock > 0 || stockAlerts.lowStock > 0) && (
          <Link href="/seller/stock" style={{ textDecoration: 'none', display: 'block', marginBottom: '1.5rem' }}>
            <div style={{
              padding: '1.2rem 1.8rem', borderRadius: '18px',
              background: stockAlerts.outOfStock > 0 ? 'linear-gradient(135deg, rgba(244,63,94,0.08), rgba(244,63,94,0.03))' : 'linear-gradient(135deg, rgba(245,158,11,0.08), rgba(245,158,11,0.03))',
              border: `1px solid ${stockAlerts.outOfStock > 0 ? 'rgba(244,63,94,0.2)' : 'rgba(245,158,11,0.2)'}`,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap',
              transition: 'all 0.25s', cursor: 'pointer',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <span style={{ fontSize: '1.5rem' }}>{stockAlerts.outOfStock > 0 ? '🚫' : '⚠️'}</span>
                <div>
                  <div style={{ color: stockAlerts.outOfStock > 0 ? '#f43f5e' : '#f59e0b', fontWeight: 900, fontSize: '0.95rem' }}>
                    {stockAlerts.outOfStock > 0 && `${stockAlerts.outOfStock} منتج نفد`}
                    {stockAlerts.outOfStock > 0 && stockAlerts.lowStock > 0 && ' • '}
                    {stockAlerts.lowStock > 0 && `${stockAlerts.lowStock} منتج مخزونه منخفض`}
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.78rem', fontWeight: 600 }}>اضغط للانتقال لإدارة المخزون</div>
                </div>
              </div>
              <ArrowRight size={20} color={stockAlerts.outOfStock > 0 ? '#f43f5e' : '#f59e0b'} />
            </div>
          </Link>
        )}

        {/* ═══ LARGE KPI CARDS — Top Row ═══ */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
          
          {/* Main: Available Balance */}
          <div style={{ gridColumn: 'span 1', position: 'relative', overflow: 'hidden', borderRadius: '24px', border: '1px solid rgba(212,175,55,0.2)', background: 'linear-gradient(135deg, #0e0b02 0%, #0a0800 100%)', padding: '2.5rem', boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(212,175,55,0.05) inset', transition: 'all 0.3s' }}
            onMouseOver={e => { e.currentTarget.style.borderColor = 'rgba(212,175,55,0.5)'; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 30px 70px rgba(0,0,0,0.6), 0 0 40px rgba(212,175,55,0.08)'; }}
            onMouseOut={e => { e.currentTarget.style.borderColor = 'rgba(212,175,55,0.2)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(212,175,55,0.05) inset'; }}>
            {/* Accent top border */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #D4AF37, #FFD700, #D4AF37)' }} />
            <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: '200px', height: '200px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(212,175,55,0.06) 0%, transparent 70%)' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div style={{ background: 'rgba(212,175,55,0.1)', padding: '0.9rem', borderRadius: '16px', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.15)' }}>
                <Wallet size={26} />
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 900, color: 'rgba(212,175,55,0.5)', background: 'rgba(212,175,55,0.08)', padding: '4px 12px', borderRadius: '20px', border: '1px solid rgba(212,175,55,0.1)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>رصيدك المتاح</span>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'rgba(212,175,55,0.5)', fontWeight: 700, marginBottom: '0.4rem' }}>الصافي المحقق</div>
            <div style={{ fontSize: '3rem', fontWeight: 950, color: '#FFD700', letterSpacing: '-1px', lineHeight: 1, textShadow: '0 0 30px rgba(212,175,55,0.2)' }}>
              {wallet.availableBalance.toLocaleString()}
              <span style={{ fontSize: '1.2rem', color: 'rgba(212,175,55,0.5)', fontWeight: 700, marginRight: '0.4rem' }}>ر.س</span>
            </div>
          </div>

          {/* Total Sales */}
          <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '24px', border: '1px solid rgba(59,130,246,0.15)', background: 'linear-gradient(135deg, #020510 0%, #030814 100%)', padding: '2.5rem', boxShadow: '0 20px 60px rgba(0,0,0,0.5)', transition: 'all 0.3s' }}
            onMouseOver={e => { e.currentTarget.style.borderColor = 'rgba(59,130,246,0.4)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
            onMouseOut={e => { e.currentTarget.style.borderColor = 'rgba(59,130,246,0.15)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: '#3b82f6' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div style={{ background: 'rgba(59,130,246,0.1)', padding: '0.9rem', borderRadius: '16px', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.15)' }}>
                <TrendingUp size={26} />
              </div>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', fontWeight: 700, marginBottom: '0.4rem' }}>إجمالي المبيعات</div>
            <div style={{ fontSize: '3rem', fontWeight: 950, color: '#fff', letterSpacing: '-1px', lineHeight: 1 }}>
              {wallet.totalSales.toLocaleString()}
              <span style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.3)', fontWeight: 700, marginRight: '0.4rem' }}>ر.س</span>
            </div>
          </div>

          {/* Commission */}
          <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '24px', border: '1px solid rgba(244,63,94,0.15)', background: 'linear-gradient(135deg, #100207 0%, #0a0205 100%)', padding: '2.5rem', boxShadow: '0 20px 60px rgba(0,0,0,0.5)', transition: 'all 0.3s' }}
            onMouseOver={e => { e.currentTarget.style.borderColor = 'rgba(244,63,94,0.35)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
            onMouseOut={e => { e.currentTarget.style.borderColor = 'rgba(244,63,94,0.15)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: '#f43f5e' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div style={{ background: 'rgba(244,63,94,0.1)', padding: '0.9rem', borderRadius: '16px', color: '#f43f5e', border: '1px solid rgba(244,63,94,0.15)' }}>
                <ArrowUpRight size={26} />
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'rgba(244,63,94,0.5)', background: 'rgba(244,63,94,0.06)', padding: '4px 12px', borderRadius: '20px', border: '1px solid rgba(244,63,94,0.1)' }}>رسوم المنصة 10%</span>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', fontWeight: 700, marginBottom: '0.4rem' }}>العمولة المخصومة</div>
            <div style={{ fontSize: '3rem', fontWeight: 950, color: '#f87171', letterSpacing: '-1px', lineHeight: 1 }}>
              -{wallet.totalCommission.toLocaleString()}
              <span style={{ fontSize: '1.2rem', color: 'rgba(244,63,94,0.4)', fontWeight: 700, marginRight: '0.4rem' }}>ر.س</span>
            </div>
          </div>
        </div>

        {/* ═══ ANALYTICS QUICK ROW ═══ */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2.5rem' }}>
          {[
            { label: 'إجمالي المشاهدات', value: stats.totalViews.toLocaleString(), icon: <Eye size={22}/>, color: '#3b82f6', bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.12)' },
            { label: 'إجمالي الإعجابات', value: stats.totalLikes.toLocaleString(), icon: <Heart size={22}/>, color: '#f43f5e', bg: 'rgba(244,63,94,0.08)', border: 'rgba(244,63,94,0.12)' },
            { label: 'منتج نشط', value: stats.activeProducts.toString(), icon: <Package size={22}/>, color: '#10b981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.12)' },
          ].map((item, i) => (
            <div key={i} style={{ padding: '1.5rem 1.8rem', borderRadius: '20px', border: `1px solid ${item.border}`, background: item.bg, display: 'flex', alignItems: 'center', gap: '1.2rem', transition: 'all 0.25s' }}
              onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.background = item.bg.replace('0.08', '0.12'); }}
              onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.background = item.bg; }}>
              <div style={{ color: item.color }}>{item.icon}</div>
              <div>
                <div style={{ fontSize: '2rem', fontWeight: 950, color: '#fff', lineHeight: 1 }}>{item.value}</div>
                <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)', fontWeight: 700, marginTop: '0.2rem' }}>{item.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ═══ AUTO SETTLEMENT + QUICK ACTIONS ═══ */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1.5rem', marginBottom: '3rem', alignItems: 'stretch' }}>
          {/* Settlement Banner */}
          <div style={{ padding: '2rem 2.5rem', borderRadius: '24px', border: '1px solid rgba(16,185,129,0.15)', background: 'linear-gradient(135deg, rgba(16,185,129,0.06) 0%, rgba(16,185,129,0.02) 100%)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div>
              <h3 style={{ margin: '0 0 0.4rem', fontSize: '1.2rem', fontWeight: 900, color: 'rgba(255,255,255,0.85)' }}>نظام التسوية المالية الآلي ⚡</h3>
              <p style={{ margin: 0, color: 'rgba(255,255,255,0.3)', fontWeight: 600, fontSize: '0.88rem', maxWidth: '400px' }}>تحويل الأرباح تلقائياً لحسابك البنكي بعد استقطاع عمولة المنصة عند اكتمال التسليم</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: 'rgba(16,185,129,0.12)', color: '#10b981', padding: '0.8rem 1.5rem', borderRadius: '14px', fontWeight: 900, border: '1px solid rgba(16,185,129,0.2)', whiteSpace: 'nowrap' }}>
              <Banknote size={20} /> التسوية نشطة
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', minWidth: '200px' }}>
            <Link href="/seller/pos" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '1rem 1.4rem', background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', borderRadius: '18px', textDecoration: 'none', fontWeight: 900, fontSize: '0.9rem', boxShadow: '0 8px 25px rgba(16,185,129,0.25)', transition: 'all 0.3s', whiteSpace: 'nowrap' }}
              onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 35px rgba(16,185,129,0.4)'; }}
              onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 25px rgba(16,185,129,0.25)'; }}>
              🛒 نقطة البيع (POS)
            </Link>
            <Link href="/seller/stock" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '1rem 1.4rem', background: 'rgba(245,158,11,0.08)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '18px', textDecoration: 'none', fontWeight: 800, fontSize: '0.9rem', transition: 'all 0.3s', whiteSpace: 'nowrap' }}
              onMouseOver={e => { e.currentTarget.style.background = 'rgba(245,158,11,0.15)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseOut={e => { e.currentTarget.style.background = 'rgba(245,158,11,0.08)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
              📦 إدارة المخزون
            </Link>
            <Link href="/sell" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '1rem 1.4rem', background: 'linear-gradient(135deg, #D4AF37, #FFD700)', color: '#111', borderRadius: '18px', textDecoration: 'none', fontWeight: 900, fontSize: '0.9rem', boxShadow: '0 8px 25px rgba(212,175,55,0.25)', transition: 'all 0.3s', whiteSpace: 'nowrap' }}
              onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 35px rgba(212,175,55,0.4)'; }}
              onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 25px rgba(212,175,55,0.25)'; }}>
              <PackagePlus size={18} /> إضافة منتج يدوي
            </Link>
            <Link href="/seller/sales" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '1rem 1.4rem', background: 'rgba(59,130,246,0.08)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '18px', textDecoration: 'none', fontWeight: 800, fontSize: '0.9rem', transition: 'all 0.3s', whiteSpace: 'nowrap' }}
              onMouseOver={e => { e.currentTarget.style.background = 'rgba(59,130,246,0.15)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseOut={e => { e.currentTarget.style.background = 'rgba(59,130,246,0.08)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
              📊 تقرير البيعات
            </Link>
            <Link href="/seller/import" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '1rem 1.4rem', background: 'rgba(212,175,55,0.08)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.2)', borderRadius: '18px', textDecoration: 'none', fontWeight: 800, fontSize: '0.9rem', transition: 'all 0.3s', whiteSpace: 'nowrap' }}
              onMouseOver={e => { e.currentTarget.style.background = 'rgba(212,175,55,0.15)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseOut={e => { e.currentTarget.style.background = 'rgba(212,175,55,0.08)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
              <Zap size={18} /> رفع ملف Excel/CSV
            </Link>
          </div>
        </div>

        {/* ═══ TRANSACTIONS TABLE ═══ */}
        <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 900, color: 'rgba(255,255,255,0.85)', display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
            <History size={22} color="#D4AF37" /> سجل أحدث العمليات
          </h2>
          {recentTransactions.length > 0 && (
            <span style={{ color: 'rgba(212,175,55,0.5)', fontSize: '0.82rem', fontWeight: 700 }}>آخر {recentTransactions.length} عملية</span>
          )}
        </div>

        {recentTransactions.length > 0 ? (
          <div style={{ overflowX: 'auto', background: 'rgba(212,175,55,0.02)', borderRadius: '24px', border: '1px solid rgba(212,175,55,0.1)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', minWidth: '700px' }}>
              <thead>
                <tr style={{ background: 'rgba(0,0,0,0.3)', borderBottom: '1px solid rgba(212,175,55,0.08)' }}>
                  {['المنتج', 'التاريخ', 'قيمة البيع', 'عمولة المنصة', 'صافيك', 'الحالة'].map((h, i) => (
                    <th key={i} style={{ padding: '1.2rem 1.5rem', color: 'rgba(212,175,55,0.45)', fontWeight: 800, fontSize: '0.78rem', letterSpacing: '0.5px', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((tx, idx) => (
                  <tr key={tx.id} style={{ borderTop: '1px solid rgba(212,175,55,0.05)', transition: '0.2s' }}
                    onMouseOver={e => e.currentTarget.style.background = 'rgba(212,175,55,0.03)'}
                    onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '1.4rem 1.5rem', color: 'rgba(255,255,255,0.8)', fontWeight: 700, maxWidth: '200px' }}><div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tx.product}</div></td>
                    <td style={{ padding: '1.4rem 1.5rem', color: 'rgba(255,255,255,0.35)', fontWeight: 600, fontSize: '0.88rem' }}>{tx.date}</td>
                    <td style={{ padding: '1.4rem 1.5rem', color: 'rgba(255,255,255,0.85)', fontWeight: 800 }}>{tx.price.toLocaleString()} ر.س</td>
                    <td style={{ padding: '1.4rem 1.5rem', color: '#f87171', fontWeight: 800 }}>- {tx.comm.toLocaleString()} ر.س</td>
                    <td style={{ padding: '1.4rem 1.5rem', color: '#4ade80', fontWeight: 900 }}>+ {tx.net.toLocaleString()} ر.س</td>
                    <td style={{ padding: '1.4rem 1.5rem' }}>
                      <span style={{ background: tx.status === 'مكتمل' ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)', color: tx.status === 'مكتمل' ? '#10b981' : '#f59e0b', padding: '0.35rem 0.9rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 900, border: `1px solid ${tx.status === 'مكتمل' ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)'}` }}>
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '5rem 2rem', background: 'rgba(212,175,55,0.02)', borderRadius: '24px', border: '1px dashed rgba(212,175,55,0.1)', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <Store size={48} color="rgba(212,175,55,0.2)" />
            <h3 style={{ fontWeight: 800, color: 'rgba(212,175,55,0.4)', margin: 0 }}>لا توجد عمليات بيع بعد</h3>
            <p style={{ color: 'rgba(255,255,255,0.2)', margin: 0, fontWeight: 600 }}>ابدأ برفع منتجاتك لتظهر مبيعاتك هنا</p>
            <Link href="/sell" style={{ marginTop: '0.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.6rem', padding: '0.9rem 2rem', background: 'linear-gradient(135deg, #D4AF37, #FFD700)', color: '#111', borderRadius: '14px', textDecoration: 'none', fontWeight: 900, fontSize: '0.95rem' }}>
              <PackagePlus size={18} /> إضافة أول منتج
            </Link>
          </div>
        )}
      </div>

      <style>{`
        @keyframes bgGlow {
          0%, 100% { transform: translateX(-50%) scale(1); opacity: 0.5; }
          50% { transform: translateX(-50%) scale(1.15); opacity: 0.8; }
        }
        @keyframes ping {
          75%, 100% { transform: scale(2); opacity: 0; }
        }
        @keyframes shimmerText {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes wavyFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
      `}</style>
    </main>
  );
}
