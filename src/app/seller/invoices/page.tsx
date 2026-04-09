"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import Link from 'next/link';
import {
  FileText, Search, Loader2, Eye, Printer, RotateCcw,
  Package, Calendar, ChevronDown, ChevronUp, X, QrCode
} from 'lucide-react';

export default function SellerInvoicesPage() {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'مكتملة' | 'مرتجعة جزئياً' | 'مرتجعة' | 'ملغية'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [expandedItems, setExpandedItems] = useState<any[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetchInvoices();
  }, [user]);

  async function fetchInvoices() {
    setLoading(true);
    const { data } = await supabase
      .from('invoices')
      .select('*')
      .eq('seller_id', user!.id)
      .order('created_at', { ascending: false });
    if (data) setInvoices(data);
    setLoading(false);
  }

  async function loadInvoiceItems(invoiceId: string) {
    if (expandedId === invoiceId) {
      setExpandedId(null);
      return;
    }
    setLoadingItems(true);
    setExpandedId(invoiceId);
    const { data } = await supabase
      .from('invoice_items')
      .select('*')
      .eq('invoice_id', invoiceId);
    setExpandedItems(data || []);
    setLoadingItems(false);
  }

  const filtered = useMemo(() => {
    let result = invoices;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(inv =>
        inv.invoice_number?.toLowerCase().includes(q) ||
        inv.customer_name?.toLowerCase().includes(q) ||
        inv.customer_phone?.includes(q)
      );
    }
    if (statusFilter !== 'all') {
      result = result.filter(inv => inv.status === statusFilter);
    }
    return result;
  }, [invoices, search, statusFilter]);

  const totalRevenue = filtered.reduce((sum, inv) => sum + Number(inv.total || 0), 0);

  const statusColors: Record<string, string> = {
    'مكتملة': '#10b981',
    'ملغية': '#f43f5e',
    'مرتجعة جزئياً': '#f59e0b',
    'مرتجعة': '#f43f5e',
  };

  function handlePrint(inv: any) {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="rtl"><head>
        <meta charset="UTF-8">
        <title>فاتورة ${inv.invoice_number}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Tahoma, sans-serif; padding: 2rem; direction: rtl; color: #222; }
          .header { text-align: center; border-bottom: 2px solid #D4AF37; padding-bottom: 1.5rem; margin-bottom: 1.5rem; }
          .header h1 { font-size: 2rem; color: #111; font-weight: 900; }
          .header .inv-num { font-size: 1.2rem; color: #D4AF37; font-weight: 800; margin-top: 0.5rem; font-family: monospace; letter-spacing: 2px; }
          .meta { display: flex; justify-content: space-between; margin-bottom: 1.5rem; font-size: 0.9rem; }
          .meta div { line-height: 1.8; }
          table { width: 100%; border-collapse: collapse; margin: 1.5rem 0; }
          th { background: #f8f8f8; padding: 0.8rem; text-align: right; border-bottom: 2px solid #ddd; font-weight: 800; }
          td { padding: 0.8rem; border-bottom: 1px solid #eee; }
          .totals { text-align: left; margin-top: 1rem; font-size: 1.1rem; }
          .totals .total-row { display: flex; justify-content: space-between; padding: 0.3rem 0; }
          .totals .final { font-size: 1.5rem; font-weight: 950; color: #10b981; border-top: 2px solid #D4AF37; padding-top: 0.5rem; margin-top: 0.5rem; }
          .footer { text-align: center; margin-top: 2rem; color: #999; font-size: 0.8rem; border-top: 1px dashed #ddd; padding-top: 1rem; }
          @media print { body { padding: 1rem; } }
        </style>
      </head><body>
        <div class="header">
          <h1>BOOGA CAR</h1>
          <div class="inv-num">${inv.invoice_number}</div>
          <div style="font-size:0.8rem;color:#888;margin-top:0.3rem">${inv.source === 'online' ? 'فاتورة إلكترونية' : 'فاتورة نقطة البيع'}</div>
        </div>
        <div class="meta">
          <div>
            <strong>التاريخ:</strong> ${new Date(inv.created_at).toLocaleDateString('ar-SA')}<br>
            <strong>الوقت:</strong> ${new Date(inv.created_at).toLocaleTimeString('ar-SA')}
          </div>
          <div>
            ${inv.customer_name ? `<strong>العميل:</strong> ${inv.customer_name}<br>` : ''}
            ${inv.customer_phone ? `<strong>الجوال:</strong> ${inv.customer_phone}` : ''}
          </div>
        </div>
        <table>
          <thead><tr><th>#</th><th>المنتج</th><th>الكمية</th><th>السعر</th><th>الإجمالي</th></tr></thead>
          <tbody id="items"><tr><td colspan="5" style="text-align:center;color:#999">جاري التحميل...</td></tr></tbody>
        </table>
        <div class="totals">
          <div class="total-row"><span>المجموع الفرعي</span><span>${Number(inv.subtotal).toLocaleString()} ر.س</span></div>
          ${Number(inv.discount) > 0 ? `<div class="total-row" style="color:#f43f5e"><span>الخصم</span><span>-${Number(inv.discount).toLocaleString()} ر.س</span></div>` : ''}
          <div class="total-row final"><span>الإجمالي</span><span>${Number(inv.total).toLocaleString()} ر.س</span></div>
        </div>
        <div class="footer">
          Booga Car • نظام إدارة المخزون<br>
          تم إنشاء هذه الفاتورة إلكترونياً
        </div>
      </body></html>
    `);
    // Load items into print
    supabase.from('invoice_items').select('*').eq('invoice_id', inv.id).then(({ data: items }) => {
      if (items && printWindow.document.getElementById('items')) {
        printWindow.document.getElementById('items')!.innerHTML = items.map((item: any, i: number) => `
          <tr>
            <td>${i + 1}</td>
            <td>${item.product_name}</td>
            <td>${item.quantity}</td>
            <td>${Number(item.unit_price).toLocaleString()} ر.س</td>
            <td>${Number(item.total).toLocaleString()} ر.س</td>
          </tr>
        `).join('');
      }
      setTimeout(() => { printWindow.print(); }, 500);
    });
  }

  return (
    <main style={{ minHeight: '100vh', background: '#030200', paddingBottom: '2rem' }}>
      {/* Header */}
      <div style={{
        padding: '1.2rem 1.5rem', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(212,175,55,0.1)', position: 'sticky', top: 0, zIndex: 10,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: 'linear-gradient(135deg, #D4AF37, #FFD700)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <FileText size={18} color="#111" />
            </div>
            <div>
              <div style={{ color: '#FFD700', fontWeight: 950, fontSize: '1.1rem' }}>الفواتير</div>
              <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.7rem', fontWeight: 700 }}>{invoices.length} فاتورة</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Link href="/seller/returns" style={{
              padding: '0.5rem 0.8rem', background: 'rgba(244,63,94,0.1)', color: '#f43f5e',
              border: '1px solid rgba(244,63,94,0.2)', borderRadius: '10px', fontSize: '0.75rem',
              fontWeight: 800, textDecoration: 'none',
            }}>↩️ المرتجعات</Link>
            <Link href="/seller/dashboard" style={{
              padding: '0.5rem 0.8rem', background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)',
              border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', fontSize: '0.75rem',
              fontWeight: 700, textDecoration: 'none',
            }}>🏠</Link>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '1.5rem' }}>

        {/* KPI */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', gap: '0.8rem', marginBottom: '1.2rem',
        }}>
          <div style={{
            flex: 1, padding: '1rem', background: 'rgba(16,185,129,0.05)',
            border: '1px solid rgba(16,185,129,0.12)', borderRadius: '14px', textAlign: 'center',
          }}>
            <div style={{ color: '#10b981', fontWeight: 950, fontSize: '1.4rem' }}>{totalRevenue.toLocaleString()}</div>
            <div style={{ color: 'rgba(16,185,129,0.5)', fontSize: '0.7rem', fontWeight: 800 }}>إجمالي (ر.س)</div>
          </div>
          <div style={{
            flex: 1, padding: '1rem', background: 'rgba(212,175,55,0.05)',
            border: '1px solid rgba(212,175,55,0.12)', borderRadius: '14px', textAlign: 'center',
          }}>
            <div style={{ color: '#D4AF37', fontWeight: 950, fontSize: '1.4rem' }}>{filtered.length}</div>
            <div style={{ color: 'rgba(212,175,55,0.5)', fontSize: '0.7rem', fontWeight: 800 }}>فاتورة</div>
          </div>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: '0.8rem' }}>
          <Search size={18} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(212,175,55,0.4)' }} />
          <input type="text" placeholder="ابحث برقم الفاتورة أو اسم العميل..."
            value={search} onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%', padding: '0.85rem 2.8rem 0.85rem 1rem',
              background: 'rgba(212,175,55,0.04)', border: '1px solid rgba(212,175,55,0.15)',
              borderRadius: '12px', color: '#fff', fontWeight: 700, fontSize: '0.9rem', outline: 'none',
            }}
          />
        </div>

        {/* Status filter */}
        <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.2rem', flexWrap: 'wrap' }}>
          {(['all', 'مكتملة', 'مرتجعة جزئياً', 'مرتجعة', 'ملغية'] as const).map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} style={{
              padding: '0.4rem 0.8rem', borderRadius: '8px', fontWeight: 800, fontSize: '0.72rem',
              border: `1px solid ${statusFilter === s ? 'rgba(212,175,55,0.3)' : 'rgba(255,255,255,0.06)'}`,
              background: statusFilter === s ? 'rgba(212,175,55,0.08)' : 'transparent',
              color: statusFilter === s ? '#D4AF37' : 'rgba(255,255,255,0.3)',
              cursor: 'pointer',
            }}>
              {s === 'all' ? 'الكل' : s}
            </button>
          ))}
        </div>

        {/* Invoice List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'rgba(212,175,55,0.5)' }}>
            <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
            <div style={{ fontWeight: 700 }}>جاري التحميل...</div>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'rgba(255,255,255,0.3)', fontWeight: 700 }}>
            لا توجد فواتير
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {filtered.map(inv => {
              const isExpanded = expandedId === inv.id;
              const sColor = statusColors[inv.status] || '#888';
              return (
                <div key={inv.id}>
                  <div style={{
                    padding: '1rem', background: 'rgba(255,255,255,0.02)',
                    border: `1px solid ${isExpanded ? 'rgba(212,175,55,0.2)' : 'rgba(255,255,255,0.06)'}`,
                    borderRadius: isExpanded ? '14px 14px 0 0' : '14px',
                    cursor: 'pointer', transition: '0.2s',
                  }} onClick={() => loadInvoiceItems(inv.id)}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <div style={{
                          width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
                          background: inv.source === 'online' ? 'rgba(59,130,246,0.08)' : 'rgba(212,175,55,0.08)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem',
                        }}>
                          {inv.source === 'online' ? '🌐' : '🏪'}
                        </div>
                        <div>
                          <div style={{ color: '#D4AF37', fontWeight: 900, fontSize: '0.9rem', fontFamily: 'monospace', letterSpacing: '1px' }}>
                            {inv.invoice_number}
                          </div>
                          <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.7rem', fontWeight: 600, marginTop: '0.1rem' }}>
                            {new Date(inv.created_at).toLocaleDateString('ar-SA')} • {inv.customer_name || 'بدون عميل'}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{
                          padding: '0.2rem 0.5rem', borderRadius: '6px', fontSize: '0.65rem', fontWeight: 900,
                          background: `${sColor}15`, color: sColor, border: `1px solid ${sColor}25`,
                        }}>
                          {inv.status}
                        </span>
                        <span style={{ color: '#10b981', fontWeight: 950, fontSize: '0.95rem' }}>
                          {Number(inv.total).toLocaleString()}
                        </span>
                        {isExpanded ? <ChevronUp size={16} color="rgba(212,175,55,0.4)" /> : <ChevronDown size={16} color="rgba(255,255,255,0.2)" />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded items */}
                  {isExpanded && (
                    <div style={{
                      padding: '1rem', background: 'rgba(212,175,55,0.02)',
                      border: '1px solid rgba(212,175,55,0.15)', borderTop: 'none',
                      borderRadius: '0 0 14px 14px',
                    }}>
                      {loadingItems ? (
                        <div style={{ textAlign: 'center', padding: '1rem', color: 'rgba(212,175,55,0.4)' }}>
                          <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                        </div>
                      ) : (
                        <>
                          {expandedItems.map((item, i) => (
                            <div key={item.id} style={{
                              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                              padding: '0.5rem 0', borderBottom: i < expandedItems.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                              fontSize: '0.82rem',
                            }}>
                              <div>
                                <span style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 700 }}>{item.product_name}</span>
                                <span style={{ color: 'rgba(255,255,255,0.25)', marginRight: '0.5rem' }}>×{item.quantity}</span>
                                {item.returned_quantity > 0 && (
                                  <span style={{ color: '#f43f5e', fontSize: '0.7rem', fontWeight: 800, marginRight: '0.3rem' }}>
                                    (مرتجع: {item.returned_quantity})
                                  </span>
                                )}
                              </div>
                              <span style={{ color: 'rgba(255,255,255,0.5)', fontWeight: 800 }}>{Number(item.total).toLocaleString()} ر.س</span>
                            </div>
                          ))}

                          {/* Actions */}
                          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.8rem' }}>
                            <button onClick={(e) => { e.stopPropagation(); handlePrint(inv); }} style={{
                              flex: 1, padding: '0.6rem', background: 'rgba(212,175,55,0.06)',
                              border: '1px solid rgba(212,175,55,0.15)', borderRadius: '10px',
                              color: '#D4AF37', fontWeight: 800, fontSize: '0.75rem', cursor: 'pointer',
                              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem',
                            }}>
                              <Printer size={14} /> طباعة
                            </button>
                            {inv.status === 'مكتملة' && (
                              <Link href={`/seller/returns?invoice=${inv.invoice_number}`} onClick={e => e.stopPropagation()} style={{
                                flex: 1, padding: '0.6rem', background: 'rgba(244,63,94,0.06)',
                                border: '1px solid rgba(244,63,94,0.15)', borderRadius: '10px',
                                color: '#f43f5e', fontWeight: 800, fontSize: '0.75rem', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem',
                                textDecoration: 'none',
                              }}>
                                <RotateCcw size={14} /> إرجاع
                              </Link>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </main>
  );
}
