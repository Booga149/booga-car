"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import Navbar from '@/components/Navbar';
import {
  Package, PackagePlus, Pencil, Trash2, Eye, Search,
  ArrowRight, ToggleLeft, ToggleRight, Loader2, ShieldCheck
} from 'lucide-react';

export default function SellerProductsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { addToast } = useToast();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (user === undefined) return;
    if (!user) { router.replace('/'); return; }
    fetchProducts();
  }, [user]);

  async function fetchProducts() {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('seller_id', user!.id)
      .order('created_at', { ascending: false });

    if (!error && data) setProducts(data);
    setLoading(false);
  }

  async function toggleActive(id: string, current: boolean) {
    const { error } = await supabase
      .from('products')
      .update({ is_active: !current })
      .eq('id', id);
    if (!error) {
      setProducts(prev => prev.map(p => p.id === id ? { ...p, is_active: !current } : p));
      addToast(current ? 'تم إخفاء المنتج' : 'تم تفعيل المنتج', 'success');
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!window.confirm(`هل أنت متأكد من حذف "${name}" نهائياً؟`)) return;
    setDeleting(id);
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (!error) {
      setProducts(prev => prev.filter(p => p.id !== id));
      addToast('تم حذف المنتج', 'success');
    } else {
      addToast('فشل الحذف: ' + error.message, 'error');
    }
    setDeleting(null);
  }

  const filtered = products.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.brand?.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main style={{ minHeight: '100vh', background: '#030200', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      {/* Gold background glow */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse at 50% 0%, #1a1100 0%, #080600 35%, #020100 100%)' }} />

      <div style={{ maxWidth: '1280px', width: '100%', margin: '0 auto', padding: '7rem 2rem 4rem', flex: 1, position: 'relative', zIndex: 1 }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
              <Link href="/seller/dashboard" style={{ color: 'rgba(212,175,55,0.4)', fontSize: '0.85rem', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                لوحة التحكم
              </Link>
              <span style={{ color: 'rgba(212,175,55,0.25)' }}>/</span>
              <span style={{ color: 'rgba(212,175,55,0.7)', fontSize: '0.85rem', fontWeight: 700 }}>مخزن المنتجات</span>
            </div>
            <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 950, background: 'linear-gradient(135deg, #FFD700, #D4AF37)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              مخزن منتجاتي
            </h1>
            <p style={{ margin: '0.4rem 0 0', color: 'rgba(212,175,55,0.4)', fontWeight: 700, fontSize: '0.9rem' }}>
              {products.length} منتج مسجل · {products.filter(p => p.is_active !== false).length} نشط
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
            <Link href="/sell" style={{
              display: 'flex', alignItems: 'center', gap: '0.6rem',
              padding: '0.85rem 1.5rem', background: 'linear-gradient(135deg, #D4AF37, #FFD700)',
              color: '#111', borderRadius: '14px', textDecoration: 'none',
              fontWeight: 900, fontSize: '0.9rem', boxShadow: '0 8px 20px rgba(212,175,55,0.25)'
            }}>
              <PackagePlus size={18} /> إضافة منتج
            </Link>
          </div>
        </div>

        {/* Search bar */}
        <div style={{ position: 'relative', marginBottom: '2rem', maxWidth: '450px' }}>
          <Search size={18} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(212,175,55,0.4)' }} />
          <input
            type="text"
            placeholder="ابحث في منتجاتك..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%', padding: '0.9rem 2.8rem 0.9rem 1rem',
              background: 'rgba(212,175,55,0.04)', border: '1px solid rgba(212,175,55,0.15)',
              borderRadius: '14px', color: 'white', fontWeight: 700, fontSize: '0.95rem', outline: 'none'
            }}
          />
        </div>

        {/* Products Table */}
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6rem', gap: '1rem', color: 'rgba(212,175,55,0.5)', fontWeight: 800 }}>
            <Loader2 size={32} style={{ animation: 'spin 1s linear infinite' }} /> جاري تحميل منتجاتك...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '6rem 2rem', background: 'rgba(212,175,55,0.02)', borderRadius: '24px', border: '1px dashed rgba(212,175,55,0.1)' }}>
            <Package size={56} color="rgba(212,175,55,0.2)" style={{ margin: '0 auto 1.5rem' }} />
            <h3 style={{ color: 'rgba(212,175,55,0.4)', fontWeight: 800, margin: '0 0 0.5rem' }}>
              {search ? 'لا توجد نتائج' : 'لا توجد منتجات بعد'}
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.2)', fontWeight: 600, margin: '0 0 2rem' }}>
              {search ? 'جرب كلمة بحث مختلفة' : 'ابدأ بإضافة أول منتج لمتجرك'}
            </p>
            {!search && (
              <Link href="/sell" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', padding: '0.9rem 2rem', background: 'linear-gradient(135deg, #D4AF37, #FFD700)', color: '#111', borderRadius: '12px', textDecoration: 'none', fontWeight: 900 }}>
                <PackagePlus size={18} /> إضافة أول منتج
              </Link>
            )}
          </div>
        ) : (
          <div style={{ overflowX: 'auto', background: 'rgba(212,175,55,0.02)', borderRadius: '24px', border: '1px solid rgba(212,175,55,0.1)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', minWidth: '750px' }}>
              <thead>
                <tr style={{ background: 'rgba(0,0,0,0.3)', borderBottom: '1px solid rgba(212,175,55,0.08)' }}>
                  {['المنتج', 'التصنيف', 'السعر', 'المخزون', 'الحالة', 'إجراءات'].map((h, i) => (
                    <th key={i} style={{ padding: '1.2rem 1.5rem', color: 'rgba(212,175,55,0.45)', fontWeight: 800, fontSize: '0.78rem', letterSpacing: '0.5px', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(product => (
                  <tr key={product.id}
                    style={{ borderTop: '1px solid rgba(212,175,55,0.05)', transition: '0.2s' }}
                    onMouseOver={e => (e.currentTarget.style.background = 'rgba(212,175,55,0.03)')}
                    onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    {/* Product name + image */}
                    <td style={{ padding: '1.2rem 1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
                        <div style={{
                          width: '44px', height: '44px', borderRadius: '10px', flexShrink: 0,
                          background: product.image_url ? `url(${product.image_url}) center/cover` : 'rgba(212,175,55,0.1)',
                          border: '1px solid rgba(212,175,55,0.1)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                          {!product.image_url && <Package size={20} color="rgba(212,175,55,0.3)" />}
                        </div>
                        <div>
                          <div style={{ color: 'rgba(255,255,255,0.85)', fontWeight: 800, fontSize: '0.9rem', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {product.name}
                          </div>
                          {product.brand && <div style={{ color: 'rgba(212,175,55,0.4)', fontSize: '0.75rem', fontWeight: 700, marginTop: '2px' }}>{product.brand}</div>}
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: '1.2rem 1.5rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600, fontSize: '0.85rem' }}>{product.category || '—'}</td>

                    <td style={{ padding: '1.2rem 1.5rem', color: '#FFD700', fontWeight: 900, fontSize: '1rem' }}>
                      {Number(product.price).toLocaleString()} <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>ر.س</span>
                    </td>

                    <td style={{ padding: '1.2rem 1.5rem', color: 'rgba(255,255,255,0.5)', fontWeight: 700 }}>
                      {product.stock_quantity ?? '—'}
                    </td>

                    {/* Active toggle */}
                    <td style={{ padding: '1.2rem 1.5rem' }}>
                      <button
                        onClick={() => toggleActive(product.id, product.is_active !== false)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', padding: 0 }}
                      >
                        {product.is_active !== false ? (
                          <><ToggleRight size={28} color="#10b981" /><span style={{ color: '#10b981', fontSize: '0.8rem', fontWeight: 800 }}>نشط</span></>
                        ) : (
                          <><ToggleLeft size={28} color="rgba(255,255,255,0.2)" /><span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem', fontWeight: 700 }}>مخفي</span></>
                        )}
                      </button>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '1.2rem 1.5rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <Link href={`/products/${product.id}`} target="_blank"
                          style={{ padding: '0.5rem', borderRadius: '8px', background: 'rgba(59,130,246,0.08)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.15)', display: 'flex', transition: '0.2s' }}
                          title="معاينة">
                          <Eye size={16} />
                        </Link>
                        <Link href={`/seller/products/edit/${product.id}`}
                          style={{ padding: '0.5rem', borderRadius: '8px', background: 'rgba(212,175,55,0.08)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.15)', display: 'flex', transition: '0.2s' }}
                          title="تعديل">
                          <Pencil size={16} />
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id, product.name)}
                          disabled={deleting === product.id}
                          style={{ padding: '0.5rem', borderRadius: '8px', background: 'rgba(244,63,94,0.08)', color: '#f43f5e', border: '1px solid rgba(244,63,94,0.15)', display: 'flex', cursor: 'pointer', transition: '0.2s' }}
                          title="حذف">
                          {deleting === product.id ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Trash2 size={16} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </main>
  );
}
