"use client";
import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  TrendingUp, 
  History, 
  Banknote, 
  PackagePlus, 
  Sparkles,
  Eye,
  Heart,
  AlertCircle,
  Settings
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SellerDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [wallet, setWallet] = useState({
    totalSales: 0,
    totalCommission: 0,
    availableBalance: 0,
    pendingPayouts: 0
  });
  const [stats, setStats] = useState({
    totalViews: 0,
    totalLikes: 0,
    activeProducts: 0
  });
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;

    async function loadData() {
      setLoading(true);
      try {
        // 1. Fetch Product Stats (Views, Likes, Count)
        const { data: productsData, error: prodError } = await supabase
          .from('products')
          .select('views_count, likes_count, is_active')
          .eq('seller_id', user.id);

        if (prodError) throw prodError;

        if (productsData) {
          const totalViews = productsData.reduce((sum, p) => sum + (p.views_count || 0), 0);
          const totalLikes = productsData.reduce((sum, p) => sum + (p.likes_count || 0), 0);
          const activeCount = productsData.filter(p => p.is_active).length;
          setStats({ totalViews, totalLikes, activeProducts: activeCount });
        }

        // 2. Fetch Sales (Confirmed/Delivered orders for this seller's products)
        const { data: salesData, error: salesError } = await supabase
          .from('order_items')
          .select(`
            id,
            price,
            quantity,
            product_name,
            created_at,
            order:orders!inner(status)
          `)
          .eq('product:products!inner(seller_id)', user.id);

        if (salesError) throw salesError;

        if (salesData) {
          let totalSalesText = 0;
          const transactions = salesData.map((item: any) => {
            const salePrice = Number(item.price) * (item.quantity || 1);
            const status = item.order?.status === 'delivered' || item.order?.status === 'confirmed' ? 'مكتمل' : 'قيد المراجعة';
            
            if (status === 'مكتمل') {
              totalSalesText += salePrice;
            }

            return {
              id: item.id,
              product: item.product_name,
              price: salePrice,
              comm: salePrice * 0.1,
              net: salePrice * 0.9,
              status: status,
              date: new Date(item.created_at).toLocaleDateString('ar-SA')
            };
          });

          setWallet({
            totalSales: totalSalesText,
            totalCommission: totalSalesText * 0.1,
            availableBalance: totalSalesText * 0.9,
            pendingPayouts: transactions.filter(t => t.status === 'قيد المراجعة').reduce((sum, t) => sum + t.price, 0)
          });
          setRecentTransactions(transactions.sort((a,b) => b.id - a.id).slice(0, 5));
        }

      } catch (err) {
        console.error("Error loading dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  if (loading) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--background)' }}>
        <div style={{ textAlign: 'center' }}>
          <Sparkles className="animate-pulse" size={48} color="var(--primary)" />
          <p style={{ marginTop: '1rem', fontWeight: 700, color: 'var(--text-secondary)' }}>جاري تحضير المتجر...</p>
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--background)' }}>
      <Navbar />
      
      <div style={{ maxWidth: '1200px', width: '100%', margin: '0 auto', padding: '7rem 2rem 4rem', flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 950, color: 'var(--text-primary)', letterSpacing: '-1px' }}>
            لوحة تحكم <span style={{ color: 'var(--primary)' }}>التاجر</span>
          </h1>
          <Link href="/seller/settings">
            <button style={{ 
              padding: '0.8rem 1.5rem', borderRadius: '16px', background: 'var(--surface)', 
              border: '1px solid var(--border)', color: 'var(--text-primary)', fontWeight: 800, 
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.6rem'
            }}>
              <Settings size={20} /> إعدادات المحل
            </button>
          </Link>
        </div>

        {/* ─── ANALYTICS QUICK VIEW ─── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
          <div style={{ background: 'rgba(59, 130, 246, 0.05)', padding: '1.5rem', borderRadius: '20px', border: '1px solid rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '0.8rem', borderRadius: '14px', color: '#3b82f6' }}><Eye size={24}/></div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 950 }}>{stats.totalViews}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700 }}>إجمالي المشاهدات</div>
            </div>
          </div>
          <div style={{ background: 'rgba(244, 63, 94, 0.05)', padding: '1.5rem', borderRadius: '20px', border: '1px solid rgba(244, 63, 94, 0.1)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
             <div style={{ background: 'rgba(244, 63, 94, 0.1)', padding: '0.8rem', borderRadius: '14px', color: 'var(--primary)' }}><Heart size={24}/></div>
             <div>
               <div style={{ fontSize: '1.5rem', fontWeight: 950 }}>{stats.totalLikes}</div>
               <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700 }}>إجمالي التفضيلات</div>
             </div>
          </div>
          <div style={{ background: 'rgba(16, 185, 129, 0.05)', padding: '1.5rem', borderRadius: '20px', border: '1px solid rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
             <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '0.8rem', borderRadius: '14px', color: 'var(--success)' }}><PackagePlus size={24}/></div>
             <div>
               <div style={{ fontSize: '1.5rem', fontWeight: 950 }}>{stats.activeProducts}</div>
               <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700 }}>منتج نشط</div>
             </div>
          </div>
        </div>

        {/* ─── WALLET Kpis ─── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
          
          <div className="glass-panel" style={{ padding: '2rem', borderRadius: '24px', border: '1px solid var(--border)', background: 'var(--surface)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: 'var(--success)' }}></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
               <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '1rem', borderRadius: '16px', color: 'var(--success)' }}>
                  <Wallet size={28} />
               </div>
               <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-secondary)', background: 'var(--background)', padding: '4px 12px', borderRadius: '20px' }}>الصافي المحقق</span>
            </div>
            <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: 700, marginBottom: '0.5rem' }}>رصيدك المتاح</h3>
            <div style={{ fontSize: '2.5rem', fontWeight: 950, color: 'var(--text-primary)' }}>
               {wallet.availableBalance.toLocaleString()} <span style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', fontWeight: 700 }}>ر.س</span>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '2rem', borderRadius: '24px', border: '1px solid var(--border)', background: 'var(--surface)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
               <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '1rem', borderRadius: '16px', color: '#3b82f6' }}>
                  <TrendingUp size={28} />
               </div>
            </div>
            <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: 700, marginBottom: '0.5rem' }}>إجمالي المبيعات</h3>
            <div style={{ fontSize: '2.5rem', fontWeight: 950, color: 'var(--text-primary)' }}>
               {wallet.totalSales.toLocaleString()} <span style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', fontWeight: 700 }}>ر.س</span>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '2rem', borderRadius: '24px', border: '1px solid var(--border)', background: 'var(--surface)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
               <div style={{ background: 'rgba(244, 63, 94, 0.1)', padding: '1rem', borderRadius: '16px', color: '#f43f5e' }}>
                  <ArrowDownLeft size={28} />
               </div>
               <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-secondary)', background: 'var(--background)', padding: '4px 12px', borderRadius: '20px' }}>رسوم المنصة 10%</span>
            </div>
            <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: 700, marginBottom: '0.5rem' }}>العمولة المخصومة</h3>
            <div style={{ fontSize: '2.5rem', fontWeight: 950, color: '#f43f5e' }}>
               - {wallet.totalCommission.toLocaleString()} <span style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', fontWeight: 700 }}>ر.س</span>
            </div>
          </div>

        </div>

        {/* ─── Payout Action ─── */}
        <div className="glass-panel" style={{ padding: '2rem', borderRadius: '24px', border: '1px solid var(--border)', background: 'linear-gradient(135deg, var(--surface) 0%, rgba(20,20,20,1) 100%)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4rem', flexWrap: 'wrap', gap: '2rem' }}>
           <div>
             <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>نظام التسوية المالية التلقائي ⚡</h2>
             <p style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>يتم تحويل الأرباح تلقائياً إلى حسابك البنكي بعد استقطاع عمولة المنصة عند اكتمال عملية التوصيل.</p>
           </div>
           <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', padding: '0.8rem 1.5rem', borderRadius: '16px', fontWeight: 900 }}>
             <Banknote size={22}/> التسوية الآلية نشطة
           </div>
        </div>

        {/* ─── PRODUCT MANAGEMENT ─── */}
        <h2 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '1.5rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <PackagePlus color="var(--primary)" /> إدارة مخزن المنتجات
        </h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '4rem' }}>
           <Link href="/seller/import" style={{ textDecoration: 'none' }}>
            <div className="glass-panel" style={{ 
              padding: '2rem', borderRadius: '24px', border: '1px solid var(--border)', background: 'var(--surface)',
              display: 'flex', alignItems: 'center', gap: '1.5rem', transition: '0.3s', cursor: 'pointer'
            }} onMouseOver={e=>e.currentTarget.style.borderColor='var(--primary)'} onMouseOut={e=>e.currentTarget.style.borderColor='var(--border)'}>
               <div style={{ background: 'rgba(244, 63, 94, 0.1)', padding: '1rem', borderRadius: '16px', color: 'var(--primary)' }}>
                  <Sparkles size={32} />
               </div>
               <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '0.3rem' }}>الرفع الذكي للمنتجات</h3>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>ارفع ملفات Excel/CSV وسيتعرف النظام عليها تلقائياً</p>
               </div>
            </div>
           </Link>

           <Link href="/sell" style={{ textDecoration: 'none' }}>
            <div className="glass-panel" style={{ 
              padding: '2rem', borderRadius: '24px', border: '1px solid var(--border)', background: 'var(--surface)',
              display: 'flex', alignItems: 'center', gap: '1.5rem', transition: '0.3s', cursor: 'pointer'
            }} onMouseOver={e=>e.currentTarget.style.borderColor='var(--primary)'} onMouseOut={e=>e.currentTarget.style.borderColor='var(--border)'}>
               <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '1rem', borderRadius: '16px', color: '#3b82f6' }}>
                  <PackagePlus size={32} />
               </div>
               <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '0.3rem' }}>إضافة منتج يدوي</h3>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>إضافة قطعة واحدة بشكل يدوي وسريع</p>
               </div>
            </div>
           </Link>
        </div>

        {/* ─── Recent Transactions ─── */}
        <h2 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '1.5rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <History color="var(--primary)" /> سجل أحدث العمليات
        </h2>
        
        {recentTransactions.length > 0 ? (
          <div style={{ overflowX: 'auto', background: 'var(--surface)', borderRadius: '24px', border: '1px solid var(--border)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
              <thead>
                <tr style={{ background: 'var(--background)' }}>
                  <th style={{ padding: '1.5rem', color: 'var(--text-secondary)', fontWeight: 800 }}>المنتج</th>
                  <th style={{ padding: '1.5rem', color: 'var(--text-secondary)', fontWeight: 800 }}>التاريخ</th>
                  <th style={{ padding: '1.5rem', color: 'var(--text-secondary)', fontWeight: 800 }}>قيمة البيع</th>
                  <th style={{ padding: '1.5rem', color: '#f43f5e', fontWeight: 800 }}>عمولة المنصة</th>
                  <th style={{ padding: '1.5rem', color: 'var(--success)', fontWeight: 800 }}>الصافي لك</th>
                  <th style={{ padding: '1.5rem', color: 'var(--text-secondary)', fontWeight: 800 }}>الحالة</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((tx, idx) => (
                  <tr key={tx.id} style={{ borderTop: '1px solid var(--border)', background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
                    <td style={{ padding: '1.5rem', color: 'var(--text-primary)', fontWeight: 700 }}>{tx.product}</td>
                    <td style={{ padding: '1.5rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{tx.date}</td>
                    <td style={{ padding: '1.5rem', color: 'var(--text-primary)', fontWeight: 800 }}>{tx.price.toLocaleString()} ر.س</td>
                    <td style={{ padding: '1.5rem', color: '#f43f5e', fontWeight: 800 }}>- {tx.comm.toLocaleString()} ر.س</td>
                    <td style={{ padding: '1.5rem', color: 'var(--success)', fontWeight: 900 }}>+ {tx.net.toLocaleString()} ر.س</td>
                    <td style={{ padding: '1.5rem' }}>
                      <span style={{ 
                        background: tx.status === 'مكتمل' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                        color: tx.status === 'مكتمل' ? '#10b981' : '#f59e0b',
                        padding: '0.4rem 1rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 800
                      }}>
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ 
            padding: '4rem', background: 'var(--surface)', borderRadius: '24px', border: '1px solid var(--border)',
            textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem'
          }}>
            <AlertCircle size={48} color="var(--text-secondary)" opacity={0.5} />
            <h3 style={{ fontWeight: 800, color: 'var(--text-secondary)' }}>لا توجد عمليات بيع بعد</h3>
            <p style={{ color: 'var(--text-secondary)', opacity: 0.7 }}>ابدأ برفع منتجاتك لتظهر مبيعاتك هنا</p>
          </div>
        )}

      </div>
    </main>
  );
}

