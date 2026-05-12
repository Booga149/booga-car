"use client";
import React, { useEffect, useState, useRef, Suspense } from 'react';
import Navbar from '@/components/Navbar';
import { FileText, Printer, ArrowRight, ShieldCheck, Phone, MapPin, Building2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

type OrderData = {
  id: string;
  created_at: string;
  total: number;
  status: string;
  shipping_address: string;
  payment_method: string;
  order_items: { id: string; quantity: number; price: number; product_name: string; product_image?: string }[];
};

function InvoiceContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('id');
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPrintMode, setIsPrintMode] = useState(false);
  const invoiceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!orderId) { setLoading(false); return; }
    async function fetchOrder() {
      try {
        const res = await fetch(`/api/invoice?id=${orderId}`);
        const result = await res.json();
        if (res.ok && result.order) {
          setOrder(result.order as any);
        }
      } catch (err) {
        console.error('Failed to fetch invoice:', err);
      }
      setLoading(false);
    }
    fetchOrder();
  }, [orderId]);

  const handlePrint = () => {
    setIsPrintMode(true);
    document.body.classList.add('invoice-printing');
    setTimeout(() => {
      window.print();
      setTimeout(() => {
        document.body.classList.remove('invoice-printing');
        setIsPrintMode(false);
      }, 500);
    }, 150);
  };

  if (loading) return (
    <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ color: 'var(--text-secondary)', fontWeight: 700, fontSize: '1.2rem' }}>جاري تحميل الفاتورة...</div>
    </div>
  );

  if (!order) return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '1rem' }}>
      <FileText size={64} color="var(--border)" />
      <h2 style={{ color: 'var(--text-primary)' }}>الفاتورة غير موجودة</h2>
      <a href="/profile" style={{ color: 'var(--primary)', fontWeight: 800 }}>العودة للملف الشخصي</a>
    </div>
  );

  const invoiceNumber = `INV-${order.id.substring(0, 8).toUpperCase()}`;
  const orderDate = new Date(order.created_at);
  // Subtotal = sum of items at unit price (before VAT, before shipping, before coupon)
  const subtotal = order.order_items?.reduce((s, i: any) => s + ((i.price_at_time || i.price || 0) * i.quantity), 0) || 0;
  // VAT is always 15% of the subtotal (pre-discount base)
  const vat = Math.round(subtotal * 0.15 * 100) / 100;
  // Shipping threshold is based on subtotal (not total), matching pricing.ts FREE_SHIPPING_THRESHOLD = 500
  const shipping = subtotal >= 500 ? 0 : 35;

  return (
    <>
      {/* Action Bar - hidden during print */}
      {!isPrintMode && (
        <div style={{ maxWidth: '900px', width: '100%', margin: '6rem auto 0', padding: '0 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <a href="/profile" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 700 }}>
            <ArrowRight size={18} /> العودة للملف الشخصي
          </a>
          <button onClick={handlePrint} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.8rem 1.5rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 800, cursor: 'pointer', fontSize: '0.95rem', boxShadow: '0 6px 20px rgba(225,29,72,0.3)' }}>
            <Printer size={18} /> طباعة / حفظ PDF
          </button>
        </div>
      )}

      {/* Invoice Document */}
      <div ref={invoiceRef} className="invoice-print-area" style={{ maxWidth: isPrintMode ? '100%' : '900px', width: '100%', margin: isPrintMode ? '0' : '1.5rem auto 4rem', padding: isPrintMode ? '0' : '0 1rem' }}>
        <div style={{ background: isPrintMode ? 'white' : 'var(--surface)', borderRadius: isPrintMode ? '0' : '24px', border: isPrintMode ? 'none' : '1px solid var(--border)', boxShadow: isPrintMode ? 'none' : 'var(--card-shadow)', overflow: 'hidden' }}>
          
          {/* Header */}
          <div style={{ background: isPrintMode ? 'transparent' : 'linear-gradient(135deg, #1e293b, #0f172a)', padding: isPrintMode ? '1rem' : 'clamp(1.5rem, 4vw, 3rem)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem', borderBottom: isPrintMode ? '2px dashed #000' : 'none' }}>
            <div>
              <h1 style={{ margin: '0 0 0.5rem', fontSize: isPrintMode ? '1.5rem' : 'clamp(1.5rem, 4vw, 2.5rem)', fontWeight: 950, color: isPrintMode ? '#000' : 'white', letterSpacing: '-1px' }}>
                CAR <span style={{ color: isPrintMode ? '#000' : '#e11d48' }}>BOOGA</span>
              </h1>
              <p style={{ color: isPrintMode ? '#333' : 'rgba(255,255,255,0.5)', margin: 0, fontWeight: 600, fontSize: '0.85rem' }}>منصة قطع غيار السيارات الأولى في السعودية</p>
              <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.3rem', color: isPrintMode ? '#555' : 'rgba(255,255,255,0.4)', fontSize: '0.78rem', fontWeight: 600 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><MapPin size={12} /> الرياض، المملكة العربية السعودية</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Phone size={12} /> +966 55 000 0000</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Building2 size={12} /> سجل تجاري: 1010543210</div>
              </div>
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ background: isPrintMode ? 'transparent' : 'rgba(225,29,72,0.15)', color: isPrintMode ? '#000' : '#e11d48', padding: '0.4rem 1rem', borderRadius: '8px', fontWeight: 900, fontSize: '0.95rem', marginBottom: '0.8rem', border: isPrintMode ? '2px solid #000' : '1px solid rgba(225,29,72,0.3)', display: 'inline-block' }}>
                فاتورة ضريبية
              </div>
              <div style={{ color: isPrintMode ? '#555' : 'rgba(255,255,255,0.5)', fontSize: '0.78rem', fontWeight: 600, marginBottom: '0.2rem' }}>رقم الفاتورة</div>
              <div style={{ color: isPrintMode ? '#000' : 'white', fontWeight: 900, fontSize: '1rem', fontFamily: 'monospace', letterSpacing: '1px' }}>{invoiceNumber}</div>
              <div style={{ color: isPrintMode ? '#555' : 'rgba(255,255,255,0.5)', fontSize: '0.78rem', fontWeight: 600, marginTop: '0.6rem', marginBottom: '0.2rem' }}>تاريخ الإصدار</div>
              <div style={{ color: isPrintMode ? '#000' : 'white', fontWeight: 800, fontSize: '0.9rem' }}>{orderDate.toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
            </div>
          </div>

          {/* Customer Info + Order Info */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', padding: isPrintMode ? '1rem' : 'clamp(1.5rem, 3vw, 2.5rem) clamp(1.5rem, 4vw, 3rem)' }}>
            <div>
              <h3 style={{ margin: '0 0 0.8rem', fontSize: '0.8rem', fontWeight: 900, color: isPrintMode ? '#555' : 'var(--text-secondary)', letterSpacing: '1px', textTransform: 'uppercase' }}>عنوان الشحن</h3>
              <p style={{ margin: 0, color: isPrintMode ? '#000' : 'var(--text-primary)', fontWeight: 700, lineHeight: 1.8, fontSize: '0.9rem' }}>
                {order.shipping_address || '—'}
              </p>
            </div>
            <div>
              <h3 style={{ margin: '0 0 0.8rem', fontSize: '0.8rem', fontWeight: 900, color: isPrintMode ? '#555' : 'var(--text-secondary)', letterSpacing: '1px', textTransform: 'uppercase' }}>تفاصيل الدفع</h3>
              <p style={{ margin: 0, color: isPrintMode ? '#000' : 'var(--text-primary)', fontWeight: 700, fontSize: '0.9rem' }}>{order.payment_method}</p>
              <p style={{ margin: '0.3rem 0 0', color: isPrintMode ? '#555' : 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem' }}>الحالة: {order.status}</p>
            </div>
          </div>

          {/* Items Table */}
          <div style={{ padding: isPrintMode ? '0 1rem 1rem' : '0 clamp(1rem, 3vw, 3rem) 2rem', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '400px' }}>
              <thead>
                <tr style={{ borderBottom: isPrintMode ? '2px solid #000' : '2px solid var(--border)' }}>
                  {['#', 'المنتج', 'الكمية', 'سعر الوحدة', 'المجموع'].map((h, i) => (
                    <th key={i} style={{ padding: '0.8rem 0.5rem', textAlign: i > 1 ? 'center' : 'right', color: isPrintMode ? '#000' : 'var(--text-secondary)', fontWeight: 800, fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {order.order_items?.map((item: any, idx) => (
                  <tr key={item.id} style={{ borderBottom: isPrintMode ? '1px solid #ccc' : '1px solid var(--border)' }}>
                    <td style={{ padding: '1rem 0.5rem', color: isPrintMode ? '#000' : 'var(--text-secondary)', fontWeight: 700, fontSize: '0.85rem' }}>{idx + 1}</td>
                    <td style={{ padding: '1rem 0.5rem' }}>
                      <div style={{ color: isPrintMode ? '#000' : 'var(--text-primary)', fontWeight: 800, fontSize: '0.85rem', marginBottom: '0.2rem' }}>
                        {item.product?.name || item.product_name || 'قطعة غيار مجهولة'}
                      </div>
                      <div style={{ color: isPrintMode ? '#555' : 'var(--text-secondary)', fontWeight: 600, fontSize: '0.75rem', fontFamily: 'monospace' }}>
                        رقم القطعة: {item.product?.part_number || 'غير متوفر'}
                      </div>
                    </td>
                    <td style={{ padding: '1rem 0.5rem', textAlign: 'center', color: isPrintMode ? '#000' : 'var(--text-primary)', fontWeight: 700, fontSize: '0.85rem' }}>{item.quantity}</td>
                    <td style={{ padding: '1rem 0.5rem', textAlign: 'center', color: isPrintMode ? '#000' : 'var(--text-primary)', fontWeight: 700, fontSize: '0.85rem', whiteSpace: 'nowrap' }}>{(item.price_at_time || item.price || 0)?.toLocaleString()} ر.س</td>
                    <td style={{ padding: '1rem 0.5rem', textAlign: 'center', color: isPrintMode ? '#000' : 'var(--text-primary)', fontWeight: 900, fontSize: '0.85rem', whiteSpace: 'nowrap' }}>{((item.price_at_time || item.price || 0) * item.quantity)?.toLocaleString()} ر.س</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div style={{ padding: isPrintMode ? '0 1rem 1rem' : '0 clamp(1rem, 3vw, 3rem) 2.5rem', display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{ width: '100%', maxWidth: '300px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.7rem 0', borderBottom: isPrintMode ? '1px solid #ccc' : '1px solid var(--border)', color: isPrintMode ? '#000' : 'var(--text-secondary)', fontWeight: 700, fontSize: '0.9rem' }}>
                <span>المجموع الفرعي</span>
                <span style={{ color: isPrintMode ? '#000' : 'var(--text-primary)' }}>{subtotal.toLocaleString()} ر.س</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.7rem 0', borderBottom: isPrintMode ? '1px solid #ccc' : '1px solid var(--border)', color: isPrintMode ? '#000' : 'var(--text-secondary)', fontWeight: 700, fontSize: '0.9rem' }}>
                <span>ضريبة القيمة المضافة (15%)</span>
                <span style={{ color: isPrintMode ? '#000' : 'var(--text-primary)' }}>{vat.toLocaleString()} ر.س</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.7rem 0', borderBottom: isPrintMode ? '1px solid #ccc' : '1px solid var(--border)', color: isPrintMode ? '#000' : 'var(--text-secondary)', fontWeight: 700, fontSize: '0.9rem' }}>
                <span>الشحن</span>
                <span style={{ color: isPrintMode ? '#000' : shipping === 0 ? 'var(--success)' : 'var(--text-primary)', fontWeight: shipping === 0 ? 900 : 700 }}>{shipping === 0 ? 'مجاني' : `${shipping} ر.س`}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 0', fontWeight: 900, fontSize: '1.3rem', color: isPrintMode ? '#000' : 'var(--primary)' }}>
                <span>الإجمالي</span>
                <span>{order.total?.toLocaleString()} ر.س</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{ background: isPrintMode ? 'transparent' : 'var(--surface-hover, var(--background))', padding: '1.5rem clamp(1rem, 3vw, 3rem)', borderTop: isPrintMode ? '2px dashed #000' : '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.8rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: isPrintMode ? '#000' : 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 700 }}>
              <ShieldCheck size={16} color={isPrintMode ? '#000' : 'var(--success)'} /> الرقم الضريبي: 300054321000003
            </div>
            <div style={{ color: isPrintMode ? '#000' : 'var(--text-secondary)', fontSize: '0.78rem', fontWeight: 600 }}>
              فاتورة إلكترونية — Booga Car
            </div>
          </div>

        </div>
      </div>
      {/* Inline print styles — scoped via body.invoice-printing class to bypass inline-style specificity */}
      <style>{`
        body.invoice-printing > * { visibility: hidden !important; }
        body.invoice-printing .invoice-print-area,
        body.invoice-printing .invoice-print-area * { visibility: visible !important; }
        body.invoice-printing .invoice-print-area {
          position: fixed !important;
          top: 0 !important; left: 0 !important;
          width: 100% !important;
          z-index: 999999 !important;
          background: white !important;
          overflow: auto !important;
        }
        @media print {
          @page { margin: 8mm; }
          body.invoice-printing > * { visibility: hidden !important; }
          body.invoice-printing .invoice-print-area,
          body.invoice-printing .invoice-print-area * { visibility: visible !important; }
          body.invoice-printing .invoice-print-area {
            position: absolute !important;
            top: 0 !important; left: 0 !important;
            width: 100% !important;
          }
        }
      `}</style>
    </>
  );
}

export default function InvoicePage() {
  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--background)' }}>
      <Navbar />
      <Suspense fallback={<div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--text-secondary)' }}>جاري التحميل...</div>}>
        <InvoiceContent />
      </Suspense>
    </main>
  );
}
