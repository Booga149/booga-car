"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Package, ArrowLeft, RefreshCw, ExternalLink, Trash2, ToggleLeft, ToggleRight, AlertTriangle, CheckCircle } from 'lucide-react';

export default function DropshipProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => { loadProducts(); }, []);

  async function loadProducts() {
    setLoading(true);
    const { data } = await supabase
      .from('dropship_products')
      .select('*, local_product:products(id, name, price, image, stock)')
      .order('created_at', { ascending: false });
    setProducts(data || []);
    setLoading(false);
  }

  async function syncAll() {
    setSyncing(true);
    try {
      const res = await fetch('/api/dropship/sync', { method: 'POST' });
      const data = await res.json();
      alert(`✅ تم المزامنة: ${data.synced} منتج محدث${data.errors > 0 ? `, ${data.errors} خطأ` : ''}`);
      loadProducts();
    } catch { alert('❌ فشلت المزامنة'); }
    setSyncing(false);
  }

  async function toggleActive(id: string, current: boolean) {
    await supabase.from('dropship_products').update({ is_active: !current }).eq('id', id);
    loadProducts();
  }

  async function deleteProduct(id: string, localId: string) {
    if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;
    await supabase.from('dropship_products').delete().eq('id', id);
    await supabase.from('products').delete().eq('id', localId);
    loadProducts();
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link href="/admin/dropship" style={{
            width: '36px', height: '36px', borderRadius: '10px', border: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--surface)', textDecoration: 'none', color: 'var(--text-secondary)',
          }}>
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>المنتجات المستوردة</h1>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{products.length} منتج مربوط</p>
          </div>
        </div>
        <button onClick={syncAll} disabled={syncing} style={{
          padding: '0.7rem 1.5rem', background: 'var(--primary)', color: '#fff',
          border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem',
          opacity: syncing ? 0.7 : 1,
        }}>
          <RefreshCw size={16} className={syncing ? 'spin' : ''} /> {syncing ? 'جارٍ المزامنة...' : 'مزامنة الكل'}
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-tertiary)' }}>جارٍ التحميل...</div>
      ) : products.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '4rem', background: 'var(--surface)',
          border: '1px solid var(--border)', borderRadius: '14px',
        }}>
          <Package size={48} color="var(--text-tertiary)" style={{ marginBottom: '1rem' }} />
          <h3 style={{ color: 'var(--text-primary)', fontWeight: 700 }}>لا توجد منتجات مستوردة</h3>
          <p style={{ color: 'var(--text-secondary)' }}>ابدأ بالبحث واستيراد منتجات من AliExpress</p>
          <Link href="/admin/dropship/search" style={{
            padding: '0.7rem 2rem', background: 'var(--primary)', color: '#fff',
            borderRadius: '10px', textDecoration: 'none', fontWeight: 700, display: 'inline-block', marginTop: '1rem',
          }}>ابدأ الاستيراد</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          {products.map((dp) => (
            <div key={dp.id} style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: '14px', padding: '1rem 1.5rem', display: 'flex',
              alignItems: 'center', gap: '1.2rem', boxShadow: 'var(--card-shadow)',
              opacity: dp.is_active ? 1 : 0.6,
            }}>
              <img src={dp.local_product?.image || dp.provider_images?.[0] || ''} alt=""
                style={{ width: '70px', height: '70px', borderRadius: '10px', objectFit: 'cover', border: '1px solid var(--border)' }} />
              
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '0.3rem',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {dp.local_product?.name || 'منتج محذوف'}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  <span>سعر المورد: <b style={{ color: '#f59e0b' }}>${dp.provider_price}</b></span>
                  <span>سعر البيع: <b style={{ color: '#10b981' }}>{dp.local_price} ر.س</b></span>
                  <span>الهامش: <b>{dp.markup_percent}%</b></span>
                  {dp.sync_error && <span style={{ color: 'var(--error)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                    <AlertTriangle size={12} /> {dp.sync_error}
                  </span>}
                  {!dp.sync_error && dp.last_synced_at && <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                    <CheckCircle size={12} color="var(--success)" /> آخر مزامنة: {new Date(dp.last_synced_at).toLocaleString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                  </span>}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <a href={dp.provider_product_url} target="_blank" rel="noopener noreferrer" style={{
                  width: '34px', height: '34px', borderRadius: '8px', border: '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)',
                }}>
                  <ExternalLink size={14} />
                </a>
                <button onClick={() => toggleActive(dp.id, dp.is_active)} style={{
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  color: dp.is_active ? 'var(--primary)' : 'var(--text-tertiary)',
                }}>
                  {dp.is_active ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                </button>
                <button onClick={() => deleteProduct(dp.id, dp.local_product_id)} style={{
                  width: '34px', height: '34px', borderRadius: '8px', border: '1px solid #fecaca',
                  background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--error)', cursor: 'pointer',
                }}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .spin { animation: spin 1s linear infinite; }
      `}</style>
    </div>
  );
}
