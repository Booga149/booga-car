"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  RotateCcw, Search, Loader2, Check, Package,
  FileText, AlertTriangle, ArrowRight, Minus, Plus
} from 'lucide-react';

export default function SellerReturnsPage() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const searchParams = useSearchParams();

  const [invoiceSearch, setInvoiceSearch] = useState(searchParams.get('invoice') || '');
  const [invoice, setInvoice] = useState<any>(null);
  const [invoiceItems, setInvoiceItems] = useState<any[]>([]);
  const [returnQuantities, setReturnQuantities] = useState<Record<string, number>>({});
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<any>(null);
  const [recentReturns, setRecentReturns] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    fetchRecentReturns();
    if (invoiceSearch) handleSearch();
  }, [user]);

  async function fetchRecentReturns() {
    const { data } = await supabase
      .from('returns')
      .select('*, invoice:invoices(invoice_number, customer_name)')
      .eq('seller_id', user!.id)
      .order('created_at', { ascending: false })
      .limit(10);
    if (data) setRecentReturns(data);
  }

  async function handleSearch() {
    if (!invoiceSearch.trim()) return;
    setLoading(true);
    setInvoice(null);
    setInvoiceItems([]);

    const { data: inv } = await supabase
      .from('invoices')
      .select('*')
      .eq('seller_id', user!.id)
      .eq('invoice_number', invoiceSearch.trim().toUpperCase())
      .single();

    if (!inv) {
      addToast('لم يتم العثور على فاتورة بهذا الرقم', 'error');
      setLoading(false);
      return;
    }

    if (inv.status === 'مرتجعة') {
      addToast('هذه الفاتورة مرتجعة بالكامل بالفعل', 'error');
      setLoading(false);
      return;
    }

    if (inv.status === 'ملغية') {
      addToast('هذه الفاتورة ملغية', 'error');
      setLoading(false);
      return;
    }

    const { data: items } = await supabase
      .from('invoice_items')
      .select('*')
      .eq('invoice_id', inv.id);

    setInvoice(inv);
    setInvoiceItems(items || []);
    // Initialize return quantities to 0
    const initQty: Record<string, number> = {};
    (items || []).forEach(item => { initQty[item.id] = 0; });
    setReturnQuantities(initQty);
    setLoading(false);
  }

  function setQty(itemId: string, qty: number) {
    const item = invoiceItems.find(i => i.id === itemId);
    if (!item) return;
    const maxReturn = item.quantity - (item.returned_quantity || 0);
    setReturnQuantities(prev => ({
      ...prev,
      [itemId]: Math.max(0, Math.min(maxReturn, qty)),
    }));
  }

  const hasReturns = Object.values(returnQuantities).some(q => q > 0);
  const totalRefund = invoiceItems.reduce((sum, item) => {
    const qty = returnQuantities[item.id] || 0;
    return sum + (qty * Number(item.unit_price));
  }, 0);

  async function handleReturn() {
    if (!invoice || !hasReturns) return;
    setSubmitting(true);

    try {
      // 1. Create return record
      const { data: returnNumber, error: retErr } = await supabase.rpc('process_return', {
        p_invoice_id: invoice.id,
        p_seller_id: user!.id,
        p_reason: reason || null,
      });
      if (retErr) throw retErr;

      // Get return ID
      const { data: ret } = await supabase
        .from('returns')
        .select('id')
        .eq('return_number', returnNumber)
        .single();

      if (!ret) throw new Error('فشل إنشاء المرتجع');

      // 2. Insert return items + restore stock + update invoice items
      let isFullReturn = true;
      for (const item of invoiceItems) {
        const qty = returnQuantities[item.id] || 0;
        if (qty === 0) {
          // Check if this item still has unreturned quantity
          if ((item.quantity - (item.returned_quantity || 0)) > 0) {
            isFullReturn = false;
          }
          continue;
        }

        // Check remaining after this return
        const remainingAfter = item.quantity - (item.returned_quantity || 0) - qty;
        if (remainingAfter > 0) isFullReturn = false;

        // Insert return item
        await supabase.from('return_items').insert({
          return_id: ret.id,
          invoice_item_id: item.id,
          product_id: item.product_id,
          product_name: item.product_name,
          quantity: qty,
          unit_price: item.unit_price,
          total: qty * Number(item.unit_price),
        });

        // Update returned_quantity on invoice item
        await supabase.from('invoice_items')
          .update({ returned_quantity: (item.returned_quantity || 0) + qty })
          .eq('id', item.id);

        // Restore stock
        if (item.product_id) {
          await supabase.rpc('restore_stock', {
            p_product_id: item.product_id,
            p_quantity: qty,
            p_reason: `إرجاع فاتورة ${invoice.invoice_number}`,
          }).catch(() => {});
        }
      }

      // 3. Update return total
      await supabase.from('returns')
        .update({ total_refund: totalRefund })
        .eq('id', ret.id);

      // 4. Update invoice status
      await supabase.from('invoices')
        .update({ status: isFullReturn ? 'مرتجعة' : 'مرتجعة جزئياً' })
        .eq('id', invoice.id);

      setSuccess({
        returnNumber,
        invoiceNumber: invoice.invoice_number,
        totalRefund,
        itemCount: Object.values(returnQuantities).filter(q => q > 0).length,
      });

      addToast(`✅ تم تسجيل الإرجاع ${returnNumber}`, 'success');
      fetchRecentReturns();

    } catch (err: any) {
      addToast('فشل تسجيل الإرجاع: ' + (err.message || ''), 'error');
    }
    setSubmitting(false);
  }

  // Success screen
  if (success) {
    return (
      <main style={{ minHeight: '100vh', background: '#030200', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
        <div style={{ maxWidth: '420px', width: '100%', textAlign: 'center' }}>
          <div style={{
            width: '80px', height: '80px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #f59e0b, #d97706)', margin: '0 auto 1.5rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 10px 40px rgba(245,158,11,0.3)',
          }}>
            <RotateCcw size={40} color="white" />
          </div>
          <h2 style={{ color: '#fff', fontSize: '1.8rem', fontWeight: 950, marginBottom: '0.5rem' }}>تم تسجيل الإرجاع ↩️</h2>

          <div style={{
            background: 'rgba(245,158,11,0.04)', border: '1px solid rgba(245,158,11,0.15)', borderRadius: '20px',
            padding: '1.8rem', marginTop: '1.5rem', textAlign: 'right',
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', fontSize: '0.95rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'rgba(255,255,255,0.6)' }}>
                <span style={{ color: '#f59e0b', fontWeight: 900, fontFamily: 'monospace' }}>{success.returnNumber}</span>
                <span>رقم الإرجاع</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'rgba(255,255,255,0.6)' }}>
                <span style={{ color: '#D4AF37', fontWeight: 800, fontFamily: 'monospace' }}>{success.invoiceNumber}</span>
                <span>الفاتورة</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'rgba(255,255,255,0.6)' }}>
                <span style={{ color: '#fff', fontWeight: 800 }}>{success.itemCount} منتج</span>
                <span>المنتجات المرتجعة</span>
              </div>
              <div style={{ borderTop: '1px dashed rgba(245,158,11,0.2)', paddingTop: '0.8rem', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#f59e0b', fontWeight: 950, fontSize: '1.3rem' }}>{success.totalRefund.toLocaleString()} ر.س</span>
                <span style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 800 }}>المبلغ المسترد</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.8rem', marginTop: '2rem' }}>
            <button onClick={() => { setSuccess(null); setInvoice(null); setInvoiceSearch(''); }} style={{
              flex: 1, padding: '1.1rem', background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              color: '#111', border: 'none', borderRadius: '16px', fontWeight: 900, fontSize: '1rem', cursor: 'pointer',
            }}>
              إرجاع جديد ↩️
            </button>
            <Link href="/seller/invoices" style={{
              flex: 1, padding: '1.1rem', background: 'rgba(255,255,255,0.05)', color: '#fff',
              border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', fontWeight: 800, fontSize: '1rem',
              textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
            }}>
              الفواتير 🧾
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: '100vh', background: '#030200', paddingBottom: '2rem' }}>
      {/* Header */}
      <div style={{
        padding: '1.2rem 1.5rem', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(244,63,94,0.1)', position: 'sticky', top: 0, zIndex: 10,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <RotateCcw size={18} color="#fff" />
            </div>
            <div>
              <div style={{ color: '#f59e0b', fontWeight: 950, fontSize: '1.1rem' }}>المرتجعات</div>
              <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.7rem', fontWeight: 700 }}>إرجاع جزئي أو كامل</div>
            </div>
          </div>
          <Link href="/seller/invoices" style={{
            padding: '0.5rem 0.8rem', background: 'rgba(212,175,55,0.1)', color: '#D4AF37',
            border: '1px solid rgba(212,175,55,0.2)', borderRadius: '10px', fontSize: '0.75rem',
            fontWeight: 800, textDecoration: 'none',
          }}>🧾 الفواتير</Link>
        </div>
      </div>

      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '1.5rem' }}>

        {!invoice ? (
          <>
            {/* Search invoice */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ color: '#fff', fontSize: '1.4rem', fontWeight: 950, margin: '0 0 0.3rem' }}>1️⃣ أدخل رقم الفاتورة</h2>
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem', margin: 0, fontWeight: 600 }}>اكتب رقم الفاتورة (مثال: POS-001000)</p>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={18} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(245,158,11,0.4)' }} />
                <input type="text" placeholder="POS-001000 أو INV-001000"
                  value={invoiceSearch}
                  onChange={e => setInvoiceSearch(e.target.value.toUpperCase())}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  style={{
                    width: '100%', padding: '1rem 2.8rem 1rem 1rem',
                    background: 'rgba(245,158,11,0.04)', border: '1px solid rgba(245,158,11,0.15)',
                    borderRadius: '14px', color: '#fff', fontWeight: 800, fontSize: '1rem', outline: 'none',
                    fontFamily: 'monospace', letterSpacing: '1px', direction: 'ltr', textAlign: 'center',
                  }}
                />
              </div>
              <button onClick={handleSearch} disabled={loading} style={{
                padding: '1rem 1.5rem', background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                color: '#111', border: 'none', borderRadius: '14px', fontWeight: 900, fontSize: '1rem', cursor: 'pointer',
              }}>
                {loading ? <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} /> : 'بحث'}
              </button>
            </div>

            {/* Recent returns */}
            {recentReturns.length > 0 && (
              <div>
                <h3 style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', fontWeight: 800, margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  📋 آخر المرتجعات
                </h3>
                {recentReturns.map(ret => (
                  <div key={ret.id} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '0.8rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)',
                  }}>
                    <div>
                      <div style={{ color: '#f59e0b', fontWeight: 800, fontSize: '0.85rem', fontFamily: 'monospace' }}>{ret.return_number}</div>
                      <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.72rem', fontWeight: 600 }}>
                        {ret.invoice?.invoice_number} • {new Date(ret.created_at).toLocaleDateString('ar-SA')}
                        {ret.invoice?.customer_name && ` • ${ret.invoice.customer_name}`}
                      </div>
                    </div>
                    <span style={{ color: '#f43f5e', fontWeight: 900, fontSize: '0.9rem' }}>-{Number(ret.total_refund).toLocaleString()} ر.س</span>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            {/* Go back */}
            <button onClick={() => { setInvoice(null); setInvoiceSearch(''); }} style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'none', border: 'none',
              color: 'rgba(245,158,11,0.5)', cursor: 'pointer', fontWeight: 800, marginBottom: '1.5rem', fontSize: '0.9rem',
            }}>
              <ArrowRight size={18} /> رجوع
            </button>

            <h2 style={{ color: '#fff', fontSize: '1.4rem', fontWeight: 950, margin: '0 0 0.3rem' }}>2️⃣ اختر المنتجات المرتجعة</h2>
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem', margin: '0 0 1.5rem', fontWeight: 600 }}>
              فاتورة <span style={{ color: '#D4AF37', fontFamily: 'monospace' }}>{invoice.invoice_number}</span>
              {invoice.customer_name && ` • ${invoice.customer_name}`}
            </p>

            {/* Items with return quantity selectors */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.5rem' }}>
              {invoiceItems.map(item => {
                const maxReturn = item.quantity - (item.returned_quantity || 0);
                const currentReturn = returnQuantities[item.id] || 0;
                if (maxReturn <= 0) {
                  return (
                    <div key={item.id} style={{
                      padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '14px',
                      border: '1px solid rgba(255,255,255,0.04)', opacity: 0.4,
                    }}>
                      <div style={{ color: 'rgba(255,255,255,0.6)', fontWeight: 700, fontSize: '0.88rem' }}>{item.product_name}</div>
                      <div style={{ color: '#f43f5e', fontSize: '0.75rem', fontWeight: 800 }}>مرتجع بالكامل</div>
                    </div>
                  );
                }
                return (
                  <div key={item.id} style={{
                    padding: '1rem', background: currentReturn > 0 ? 'rgba(244,63,94,0.04)' : 'rgba(255,255,255,0.02)',
                    borderRadius: '14px',
                    border: `1px solid ${currentReturn > 0 ? 'rgba(244,63,94,0.15)' : 'rgba(255,255,255,0.06)'}`,
                    transition: '0.2s',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                      <div>
                        <div style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 800, fontSize: '0.88rem' }}>{item.product_name}</div>
                        <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', fontWeight: 600 }}>
                          {Number(item.unit_price).toLocaleString()} ر.س × {item.quantity} قطعة
                          {item.returned_quantity > 0 && <span style={{ color: '#f43f5e' }}> (مرتجع سابقاً: {item.returned_quantity})</span>}
                        </div>
                      </div>
                      <span style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 800, fontSize: '0.8rem' }}>
                        متاح: {maxReturn}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
                      <button onClick={() => setQty(item.id, currentReturn - 1)} disabled={currentReturn === 0} style={{
                        width: '40px', height: '40px', borderRadius: '12px',
                        background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.15)',
                        color: '#f43f5e', cursor: currentReturn === 0 ? 'not-allowed' : 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        opacity: currentReturn === 0 ? 0.3 : 1,
                      }}><Minus size={18} /></button>

                      <div style={{ fontSize: '2rem', fontWeight: 950, color: currentReturn > 0 ? '#f43f5e' : 'rgba(255,255,255,0.2)', minWidth: '50px', textAlign: 'center' }}>
                        {currentReturn}
                      </div>

                      <button onClick={() => setQty(item.id, currentReturn + 1)} disabled={currentReturn >= maxReturn} style={{
                        width: '40px', height: '40px', borderRadius: '12px',
                        background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)',
                        color: '#f59e0b', cursor: currentReturn >= maxReturn ? 'not-allowed' : 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        opacity: currentReturn >= maxReturn ? 0.3 : 1,
                      }}><Plus size={18} /></button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Reason */}
            <div style={{ marginBottom: '1.5rem' }}>
              <textarea placeholder="سبب الإرجاع (اختياري)" value={reason} onChange={e => setReason(e.target.value)} rows={2}
                style={{
                  width: '100%', padding: '0.9rem', background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: '#fff',
                  fontWeight: 700, outline: 'none', resize: 'none',
                }}
              />
            </div>

            {/* Refund summary */}
            {hasReturns && (
              <div style={{
                padding: '1rem', background: 'rgba(244,63,94,0.05)', borderRadius: '14px',
                border: '1px solid rgba(244,63,94,0.1)', marginBottom: '1.5rem', textAlign: 'center',
              }}>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.3rem' }}>المبلغ المسترد</div>
                <div style={{ color: '#f43f5e', fontSize: '2rem', fontWeight: 950 }}>
                  {totalRefund.toLocaleString()} <span style={{ fontSize: '1rem' }}>ر.س</span>
                </div>
              </div>
            )}

            {/* Submit */}
            <button onClick={handleReturn} disabled={!hasReturns || submitting} style={{
              width: '100%', padding: '1.3rem',
              background: hasReturns ? 'linear-gradient(135deg, #f43f5e, #e11d48)' : 'rgba(255,255,255,0.05)',
              color: hasReturns ? '#fff' : 'rgba(255,255,255,0.3)',
              border: 'none', borderRadius: '18px',
              fontSize: '1.2rem', fontWeight: 950,
              cursor: hasReturns && !submitting ? 'pointer' : 'not-allowed',
              boxShadow: hasReturns ? '0 10px 30px rgba(244,63,94,0.3)' : 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem',
              opacity: submitting ? 0.7 : 1,
            }}>
              {submitting ? (
                <><Loader2 size={22} style={{ animation: 'spin 1s linear infinite' }} /> جاري التسجيل...</>
              ) : (
                <><RotateCcw size={22} /> تأكيد الإرجاع ↩️</>
              )}
            </button>
          </>
        )}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </main>
  );
}
