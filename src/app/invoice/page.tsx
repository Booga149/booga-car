"use client";
import React, { useEffect, useState, Suspense } from 'react';
import Navbar from '@/components/Navbar';
import { FileText, Printer, ArrowRight, Download } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

type OrderItem = {
  id: string;
  quantity: number;
  price: number;
  price_at_time?: number;
  product_name: string;
  product_image?: string;
  product?: { name?: string; part_number?: string; image_url?: string };
};

type OrderData = {
  id: string;
  created_at: string;
  total: number;
  status: string;
  shipping_address: string;
  shipping_cost?: number;
  payment_method: string;
  payment_status?: string;
  buyer_name?: string;
  phone?: string;
  city?: string;
  order_items: OrderItem[];
};

function InvoiceContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('id');
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) { setLoading(false); return; }
    async function fetchOrder() {
      try {
        const res = await fetch(`/api/invoice?id=${orderId}`);
        const result = await res.json();
        if (res.ok && result.order) setOrder(result.order as any);
      } catch (err) {
        console.error('Failed to fetch invoice:', err);
      }
      setLoading(false);
    }
    fetchOrder();
  }, [orderId]);

  const handlePrint = (mode: 'standard' | 'thermal') => {
    if (mode === 'thermal') {
      document.body.classList.add('print-mode-thermal');
      setTimeout(() => {
        window.print();
      }, 50);
    } else {
      document.body.classList.remove('print-mode-thermal');
      setTimeout(() => {
        window.print();
      }, 50);
    }
  };

  useEffect(() => {
    const handleAfterPrint = () => {
      document.body.classList.remove('print-mode-thermal');
    };
    window.addEventListener('afterprint', handleAfterPrint);
    return () => window.removeEventListener('afterprint', handleAfterPrint);
  }, []);

  if (loading) return (
    <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem' }}>
      <div className="inv-spinner" />
      <div style={{ color: 'var(--text-secondary)', fontWeight: 700, fontSize: '1.1rem' }}>جاري تحميل الفاتورة...</div>
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
  const dateStr = orderDate.toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' });
  const timeStr = orderDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

  const subtotal = order.order_items?.reduce((s, i: any) => s + ((i.price_at_time || i.price || 0) * i.quantity), 0) || 0;
  const vat = Math.round(subtotal * 0.15 * 100) / 100;
  const shipping = order.shipping_cost ?? (subtotal >= 500 ? 0 : 35);
  const totalItemsCount = order.order_items?.reduce((s, i) => s + i.quantity, 0) || 0;
  const qrText = `BOOGA CAR\nالرقم الضريبي: 300054321000003\nالتاريخ: ${orderDate.toLocaleDateString('en-GB')} ${timeStr}\nالإجمالي: ${order.total} ر.س\nالضريبة: ${vat} ر.س`;

  const statusMap: Record<string, { label: string; color: string; bg: string }> = {
    'قيد المراجعة': { label: '🔄 قيد المراجعة', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
    'قيد التجهيز': { label: '📦 قيد التجهيز', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
    'تم الشحن': { label: '🚚 تم الشحن', color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
    'تم التوصيل': { label: '✅ تم التوصيل', color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
    'ملغي': { label: '❌ ملغي', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
  };
  const statusInfo = statusMap[order.status] || { label: order.status, color: '#888', bg: 'rgba(136,136,136,0.1)' };

  const paymentMap: Record<string, string> = {
    'cod': 'الدفع عند الاستلام',
    'الدفع عند الاستلام': 'الدفع عند الاستلام',
    'stripe': 'بطاقة بنكية',
    'card': 'بطاقة بنكية',
  };
  const paymentLabel = paymentMap[order.payment_method] || order.payment_method;

  return (
    <>
      {/* Action Bar - hidden on print */}
      <div className="inv-action-bar no-print">
        <a href="/profile" className="inv-back-link">
          <ArrowRight size={18} /> العودة للملف الشخصي
        </a>
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          <button onClick={() => handlePrint('standard')} className="inv-print-btn" style={{ background: '#4b5563', boxShadow: '0 4px 15px rgba(75,85,99,0.25)' }}>
            <Printer size={18} /> طباعة A4
          </button>
          <button onClick={() => handlePrint('thermal')} className="inv-print-btn" style={{ background: '#059669', boxShadow: '0 4px 15px rgba(5,150,105,0.25)' }}>
            <Printer size={18} /> طباعة حرارية (XP-80)
          </button>
          <button onClick={() => handlePrint('standard')} className="inv-download-btn">
            <Download size={18} /> حفظ PDF
          </button>
        </div>
      </div>

      {/* Invoice Document */}
      <div className="inv-document standard-invoice">
        <div className="inv-paper">

          {/* ===== HEADER ===== */}
          <div className="inv-header">
            <div className="inv-header-right">
              <div className="inv-logo">BOOGA <span>CAR</span></div>
              <div className="inv-slogan">منصة قطع غيار السيارات الأولى في السعودية</div>
              <div className="inv-company-details">
                <div>📍 الرياض، المملكة العربية السعودية</div>
                <div>📞 +966 55 000 0000</div>
                <div>🏢 سجل تجاري: 1010543210</div>
                <div>📧 support@boogacar.com</div>
              </div>
            </div>
            <div className="inv-header-left">
              <div className="inv-tax-badge">فاتورة ضريبية</div>
              <div className="inv-tax-badge-en">TAX INVOICE</div>
              <table className="inv-meta-table">
                <tbody>
                  <tr><td className="inv-meta-label">رقم الفاتورة</td><td className="inv-meta-value inv-mono">{invoiceNumber}</td></tr>
                  <tr><td className="inv-meta-label">تاريخ الإصدار</td><td className="inv-meta-value">{dateStr}</td></tr>
                  <tr><td className="inv-meta-label">الوقت</td><td className="inv-meta-value">{timeStr}</td></tr>
                  <tr><td className="inv-meta-label">رقم الطلب</td><td className="inv-meta-value inv-mono" style={{ fontSize: '0.7rem' }}>#{order.id.substring(0, 12).toUpperCase()}</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* ===== DIVIDER ===== */}
          <div className="inv-divider" />

          {/* ===== CUSTOMER + ORDER INFO ===== */}
          <div className="inv-info-grid">
            <div className="inv-info-box">
              <div className="inv-info-title">👤 معلومات العميل</div>
              <table className="inv-detail-table">
                <tbody>
                  <tr><td className="inv-dt-label">الاسم</td><td className="inv-dt-value">{order.buyer_name || '—'}</td></tr>
                  <tr><td className="inv-dt-label">الجوال</td><td className="inv-dt-value" dir="ltr" style={{ textAlign: 'right' }}>{order.phone || '—'}</td></tr>
                  <tr><td className="inv-dt-label">المدينة</td><td className="inv-dt-value">{order.city || '—'}</td></tr>
                  <tr><td className="inv-dt-label">العنوان</td><td className="inv-dt-value">{order.shipping_address || '—'}</td></tr>
                </tbody>
              </table>
            </div>
            <div className="inv-info-box">
              <div className="inv-info-title">📋 معلومات الطلب</div>
              <table className="inv-detail-table">
                <tbody>
                  <tr><td className="inv-dt-label">طريقة الدفع</td><td className="inv-dt-value">{paymentLabel}</td></tr>
                  <tr>
                    <td className="inv-dt-label">حالة الطلب</td>
                    <td className="inv-dt-value">
                      <span className="inv-status-chip" style={{ color: statusInfo.color, background: statusInfo.bg, border: `1px solid ${statusInfo.color}30` }}>
                        {statusInfo.label}
                      </span>
                    </td>
                  </tr>
                  <tr><td className="inv-dt-label">عدد المنتجات</td><td className="inv-dt-value">{order.order_items?.length || 0} منتج ({totalItemsCount} قطعة)</td></tr>
                  <tr><td className="inv-dt-label">حالة الدفع</td><td className="inv-dt-value">{order.payment_status === 'paid' ? '✅ مدفوع' : '⏳ في الانتظار'}</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* ===== ITEMS TABLE ===== */}
          <div className="inv-section-title">📦 تفاصيل المنتجات</div>
          <div className="inv-items-wrap">
            <table className="inv-items-table">
              <thead>
                <tr>
                  <th style={{ width: '40px', textAlign: 'center' }}>#</th>
                  <th style={{ textAlign: 'right' }}>المنتج</th>
                  <th style={{ width: '70px', textAlign: 'center' }}>الكمية</th>
                  <th style={{ width: '110px', textAlign: 'center' }}>سعر الوحدة</th>
                  <th style={{ width: '110px', textAlign: 'center' }}>الإجمالي</th>
                </tr>
              </thead>
              <tbody>
                {order.order_items?.map((item: any, idx) => {
                  const unitPrice = item.price_at_time || item.price || 0;
                  const lineTotal = unitPrice * item.quantity;
                  return (
                    <tr key={item.id}>
                      <td style={{ textAlign: 'center', fontWeight: 700, color: '#999' }}>{idx + 1}</td>
                      <td>
                        <div style={{ fontWeight: 800, marginBottom: '2px' }}>
                          {item.product?.name || item.product_name || 'منتج'}
                        </div>
                        {item.product?.part_number && (
                          <div style={{ fontSize: '0.72rem', color: '#999', fontFamily: 'monospace' }}>
                            رقم القطعة: {item.product.part_number}
                          </div>
                        )}
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: 700 }}>{item.quantity}</td>
                      <td style={{ textAlign: 'center', fontWeight: 700, whiteSpace: 'nowrap' }}>{unitPrice.toLocaleString('ar-SA')} ر.س</td>
                      <td style={{ textAlign: 'center', fontWeight: 900, whiteSpace: 'nowrap' }}>{lineTotal.toLocaleString('ar-SA')} ر.س</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* ===== TOTALS ===== */}
          <div className="inv-totals-section">
            <div className="inv-totals-box">
              <div className="inv-total-row">
                <span>المجموع الفرعي (قبل الضريبة)</span>
                <span>{subtotal.toLocaleString('ar-SA')} ر.س</span>
              </div>
              <div className="inv-total-row">
                <span>ضريبة القيمة المضافة (15%)</span>
                <span>{vat.toLocaleString('ar-SA')} ر.س</span>
              </div>
              <div className="inv-total-row">
                <span>رسوم الشحن</span>
                <span className={shipping === 0 ? 'inv-free' : ''}>{shipping === 0 ? 'مجاني ✅' : `${shipping.toLocaleString('ar-SA')} ر.س`}</span>
              </div>
              <div className="inv-total-row inv-total-final">
                <span>الإجمالي المستحق</span>
                <span>{order.total?.toLocaleString('ar-SA')} ر.س</span>
              </div>
            </div>
          </div>

          {/* ===== FOOTER ===== */}
          <div className="inv-footer">
            <div className="inv-footer-row">
              <div>🛡️ الرقم الضريبي: <strong>300054321000003</strong></div>
              <div>🏢 سجل تجاري: <strong>1010543210</strong></div>
            </div>
            <div className="inv-footer-notes">
              <div>• جميع الأسعار شاملة ضريبة القيمة المضافة 15%</div>
              <div>• يمكن استرجاع أو استبدال المنتج خلال 7 أيام من تاريخ الاستلام بشرط توفر الفاتورة والتغليف الأصلي</div>
              <div>• للاستفسار تواصل معنا عبر: support@boogacar.com</div>
            </div>
            <div className="inv-footer-brand">
              فاتورة إلكترونية — Booga Car © {new Date().getFullYear()}
            </div>
          </div>

        </div>
      </div>

      {/* Thermal Receipt View (only shown when printing on XP-80 80mm paper or print-mode-thermal is active) */}
      <div className="thermal-receipt">
        {/* Receipt Header */}
        <div className="rec-header">
          {/* Right: Date & Time */}
          <div className="rec-header-right">
            <div>تاريخ الفاتورة</div>
            <div>{orderDate.toLocaleDateString('en-GB')}</div>
            <div>وقت الفاتورة</div>
            <div>{timeStr}</div>
          </div>

          {/* Center: Brand Details */}
          <div className="rec-header-center">
            <div className="rec-title">BOOGA CAR</div>
            <div className="rec-subtitle">(الرياض)</div>
            <div className="rec-tax-badge">فاتورة ضريبية مبسطة</div>
          </div>

          {/* Left: Sequential ID */}
          <div className="rec-header-left">
            <div>{order.id.substring(0, 8).toUpperCase()}</div>
            <div>{invoiceNumber}</div>
          </div>
        </div>

        {/* Customer Info */}
        <div className="rec-customer">
          <div>العميل : {order.buyer_name || '—'}</div>
          <div>الجوال : {order.phone || '—'}</div>
          <div>اسم المستخدم : تطبيق بوغا</div>
        </div>

        {/* Table */}
        <table className="rec-table">
          <thead>
            <tr>
              <th style={{ textAlign: 'right', width: '50%' }}>الاسم</th>
              <th style={{ textAlign: 'center', width: '10%' }}>الكمية</th>
              <th style={{ textAlign: 'center', width: '20%' }}>السعر</th>
              <th style={{ textAlign: 'center', width: '20%' }}>الإجمالي</th>
            </tr>
          </thead>
          <tbody>
            {order.order_items?.map((item: any) => {
              const unitPrice = item.price_at_time || item.price || 0;
              const lineTotal = unitPrice * item.quantity;
              return (
                <tr key={item.id}>
                  <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{item.product?.name || item.product_name}</td>
                  <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{item.quantity}</td>
                  <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{unitPrice}</td>
                  <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{lineTotal}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Totals */}
        <div className="rec-totals">
          <div className="rec-total-row">
            <span>﷼ {subtotal}</span>
            <span>الإجمالي قبل الخصومات :</span>
          </div>
          <div className="rec-total-row">
            <span>﷼ 0</span>
            <span>إجمالي الخصومات :</span>
          </div>
          <div className="rec-total-row">
            <span>﷼ {subtotal}</span>
            <span>الإجمالي بعد الخصومات :</span>
          </div>
          <div className="rec-total-row">
            <span>﷼ {order.total}</span>
            <span>الإجمالي شامل الضريبة :</span>
          </div>
          <div className="rec-total-row">
            <span>﷼ {vat}</span>
            <span>ضريبة القيمة المضافة ( 15 % ) :</span>
          </div>
          <div className="rec-total-row">
            <span>مدفوع : {order.total}</span>
            <span>طريقة الدفع :</span>
          </div>
        </div>

        {/* Footer */}
        <div className="rec-footer">
          <div style={{ margin: '0.4rem 0' }}>الجوال : 0533583061 - 0533583061</div>
          <div>رقم التسجيل الضريبي: 300054321000003</div>
          <div style={{ margin: '0.2rem 0' }}>عنوان : الرياض، المملكة العربية السعودية</div>
          <div className="rec-policy">لا يمكن استرجاع المبلغ بعد اصدار الفاتورة</div>
          
          <div className="rec-line" />
          <div className="rec-policy" style={{ marginBottom: '10px' }}>لا يمكن استرجاع المبلغ بعد اصدار الفاتورة</div>
          
          {/* QR Code compliant image */}
          <div className="rec-qr-container">
            <img 
              src={`https://api.qrserver.com/v1/create-qr-code/?size=130x130&data=${encodeURIComponent(qrText)}`} 
              alt="ZATCA Compliant QR Code" 
              className="rec-qr"
            />
          </div>
        </div>
      </div>

      {/* ===== STYLES ===== */}
      <style>{`
        /* ---- Screen Styles ---- */
        .thermal-receipt {
          display: none;
        }

        /* ---- Print Styles ---- */
        @media print {
          @page { size: A4; margin: 10mm; }
          body > *:not(.inv-document), .no-print, nav, header, footer { display: none !important; visibility: hidden !important; }
          .inv-document, .inv-document * { visibility: visible !important; }
          .inv-document { position: absolute; top: 0; left: 0; width: 100%; margin: 0 !important; padding: 0 !important; }
          .inv-paper { box-shadow: none !important; border: none !important; border-radius: 0 !important; }
          main { background: white !important; }
          .thermal-receipt { display: none !important; }
        }

        /* ---- Thermal Printer Print-Mode Override (Bulletproof XP-80) ---- */
        body.print-mode-thermal {
          background: white !important;
          color: black !important;
        }
        body.print-mode-thermal .no-print,
        body.print-mode-thermal nav,
        body.print-mode-thermal header,
        body.print-mode-thermal footer,
        body.print-mode-thermal .standard-invoice {
          display: none !important;
          visibility: hidden !important;
        }
        body.print-mode-thermal .thermal-receipt {
          display: block !important;
          visibility: visible !important;
          width: 80mm !important;
          max-width: 100% !important;
          margin: 0 auto !important;
          padding: 2mm !important;
          box-sizing: border-box !important;
          background: white !important;
          color: black !important;
          font-family: Arial, sans-serif !important;
        }

        @media print {
          body.print-mode-thermal {
            width: 80mm !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          body.print-mode-thermal @page {
            size: auto;
            margin: 2mm 0;
          }
          body.print-mode-thermal .thermal-receipt {
            display: block !important;
            visibility: visible !important;
            width: 80mm !important;
            margin: 0 !important;
            padding: 2mm !important;
          }
        }

        /* ---- Spinner ---- */
        .inv-spinner {
          width: 32px; height: 32px;
          border: 3px solid rgba(225,29,72,0.15);
          border-top-color: #e11d48;
          border-radius: 50%;
          animation: inv-spin 0.8s linear infinite;
        }
        @keyframes inv-spin { to { transform: rotate(360deg); } }

        /* ---- Action Bar ---- */
        .inv-action-bar {
          max-width: 800px; width: 100%; margin: 5.5rem auto 0; padding: 0 1.5rem;
          display: flex; justify-content: space-between; align-items: center;
          flex-wrap: wrap; gap: 1rem;
        }
        .inv-back-link {
          display: flex; align-items: center; gap: 0.5rem;
          color: var(--text-secondary); text-decoration: none; font-weight: 700; font-size: 0.9rem;
          transition: color 0.2s;
        }
        .inv-back-link:hover { color: var(--primary); }
        .inv-print-btn, .inv-download-btn {
          display: flex; align-items: center; gap: 0.5rem;
          padding: 0.7rem 1.3rem; border: none; border-radius: 12px;
          font-weight: 800; cursor: pointer; font-size: 0.88rem; transition: all 0.2s;
        }
        .inv-print-btn {
          background: var(--primary); color: white;
          box-shadow: 0 4px 15px rgba(225,29,72,0.25);
        }
        .inv-print-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(225,29,72,0.35); }
        .inv-download-btn {
          background: var(--surface); color: var(--text-primary);
          border: 1px solid var(--border);
        }
        .inv-download-btn:hover { background: var(--surface-hover, var(--border)); }

        /* ---- Document Container ---- */
        .inv-document {
          max-width: 800px; width: 100%; margin: 1.5rem auto 4rem; padding: 0 1rem;
        }
        .inv-paper {
          background: var(--surface, white); border-radius: 16px;
          border: 1px solid var(--border, #e5e7eb);
          box-shadow: 0 4px 30px rgba(0,0,0,0.08);
          overflow: hidden; font-size: 0.88rem; color: var(--text-primary, #111);
        }

        /* ---- Header ---- */
        .inv-header {
          display: flex; justify-content: space-between; align-items: flex-start;
          padding: 2rem 2rem 1.5rem; gap: 1.5rem; flex-wrap: wrap;
          background: var(--surface, white);
        }
        .inv-logo {
          font-size: 1.8rem; font-weight: 950; letter-spacing: -1px;
          color: var(--text-primary, #000); margin-bottom: 0.3rem;
        }
        .inv-logo span { color: #e11d48; }
        .inv-slogan { color: var(--text-secondary, #666); font-size: 0.8rem; font-weight: 600; margin-bottom: 0.8rem; }
        .inv-company-details {
          display: flex; flex-direction: column; gap: 0.25rem;
          font-size: 0.78rem; color: var(--text-secondary, #888); font-weight: 600;
        }

        .inv-header-left { text-align: left; flex-shrink: 0; }
        .inv-tax-badge {
          display: inline-block; padding: 0.5rem 1.2rem; border: 2px solid #e11d48;
          border-radius: 8px; font-weight: 950; font-size: 1rem; color: #e11d48;
          margin-bottom: 0.2rem;
        }
        .inv-tax-badge-en {
          font-size: 0.65rem; color: var(--text-secondary, #999); font-weight: 700;
          letter-spacing: 2px; margin-bottom: 0.8rem; text-align: center;
        }
        .inv-meta-table { border-collapse: collapse; }
        .inv-meta-table td { padding: 0.2rem 0; font-size: 0.8rem; }
        .inv-meta-label { color: var(--text-secondary, #888); font-weight: 600; padding-left: 0.8rem !important; white-space: nowrap; }
        .inv-meta-value { font-weight: 800; color: var(--text-primary, #000); }
        .inv-mono { font-family: 'Courier New', monospace; letter-spacing: 1px; }

        /* ---- Divider ---- */
        .inv-divider {
          height: 3px; margin: 0 2rem;
          background: linear-gradient(90deg, #e11d48, #f59e0b, #e11d48);
          border-radius: 2px; opacity: 0.6;
        }

        /* ---- Info Grid ---- */
        .inv-info-grid {
          display: grid; grid-template-columns: 1fr 1fr; gap: 1.2rem;
          padding: 1.5rem 2rem;
        }
        @media (max-width: 600px) { .inv-info-grid { grid-template-columns: 1fr; } }
        .inv-info-box {
          padding: 1rem; border-radius: 10px;
          background: var(--background, #f9fafb);
          border: 1px solid var(--border, #e5e7eb);
        }
        .inv-info-title {
          font-weight: 900; font-size: 0.85rem; margin-bottom: 0.8rem;
          color: var(--text-primary, #111); padding-bottom: 0.5rem;
          border-bottom: 1px solid var(--border, #e5e7eb);
        }
        .inv-detail-table { width: 100%; border-collapse: collapse; }
        .inv-detail-table td { padding: 0.35rem 0; font-size: 0.82rem; vertical-align: top; }
        .inv-dt-label { color: var(--text-secondary, #888); font-weight: 600; width: 80px; white-space: nowrap; }
        .inv-dt-value { font-weight: 700; color: var(--text-primary, #111); }
        .inv-status-chip {
          display: inline-block; padding: 0.2rem 0.6rem; border-radius: 6px;
          font-weight: 800; font-size: 0.75rem;
        }

        /* ---- Section Title ---- */
        .inv-section-title {
          padding: 0 2rem; margin: 0.5rem 0 0.8rem;
          font-weight: 900; font-size: 0.9rem; color: var(--text-primary, #111);
        }

        /* ---- Items Table ---- */
        .inv-items-wrap { padding: 0 2rem 1.5rem; overflow-x: auto; }
        .inv-items-table {
          width: 100%; border-collapse: collapse; font-size: 0.82rem;
        }
        .inv-items-table thead th {
          padding: 0.7rem 0.5rem; font-weight: 800;
          background: var(--background, #f3f4f6); color: var(--text-secondary, #666);
          border-bottom: 2px solid var(--border, #d1d5db); font-size: 0.78rem;
        }
        .inv-items-table tbody td {
          padding: 0.8rem 0.5rem; border-bottom: 1px solid var(--border, #e5e7eb);
          color: var(--text-primary, #111);
        }
        .inv-items-table tbody tr:last-child td { border-bottom: 2px solid var(--border, #d1d5db); }

        /* ---- Totals ---- */
        .inv-totals-section { padding: 0 2rem 1.5rem; display: flex; justify-content: flex-end; }
        .inv-totals-box { width: 100%; max-width: 320px; }
        .inv-total-row {
          display: flex; justify-content: space-between; align-items: center;
          padding: 0.6rem 0; font-size: 0.88rem; font-weight: 700;
          color: var(--text-secondary, #555);
          border-bottom: 1px solid var(--border, #e5e7eb);
        }
        .inv-total-row span:last-child { color: var(--text-primary, #111); font-weight: 800; }
        .inv-free { color: #10b981 !important; font-weight: 900 !important; }
        .inv-total-final {
          border-bottom: none !important; margin-top: 0.3rem; padding-top: 0.8rem;
          border-top: 2px solid var(--text-primary, #111);
          font-size: 1.2rem !important; font-weight: 950 !important;
          color: #e11d48 !important;
        }
        .inv-total-final span { color: #e11d48 !important; font-weight: 950 !important; }

        /* ---- Footer ---- */
        .inv-footer {
          padding: 1.5rem 2rem; background: var(--background, #f9fafb);
          border-top: 1px solid var(--border, #e5e7eb);
        }
        .inv-footer-row {
          display: flex; justify-content: space-between; flex-wrap: wrap; gap: 0.5rem;
          font-size: 0.78rem; color: var(--text-secondary, #666); font-weight: 600;
          margin-bottom: 1rem; padding-bottom: 0.8rem;
          border-bottom: 1px dashed var(--border, #d1d5db);
        }
        .inv-footer-notes {
          display: flex; flex-direction: column; gap: 0.3rem;
          font-size: 0.72rem; color: var(--text-secondary, #999); font-weight: 600;
          margin-bottom: 1rem; line-height: 1.6;
        }
        .inv-footer-brand {
          text-align: center; font-size: 0.75rem; font-weight: 700;
          color: var(--text-secondary, #aaa);
        }

        /* ---- Standard Print overrides ---- */
        @media print {
          .inv-paper { background: white !important; color: #000 !important; }
          .inv-header { background: white !important; }
          .inv-logo, .inv-logo span { color: #000 !important; }
          .inv-tax-badge { border-color: #000 !important; color: #000 !important; }
          .inv-divider { background: #000 !important; opacity: 1 !important; height: 2px !important; }
          .inv-info-box { background: #f8f8f8 !important; border-color: #ddd !important; }
          .inv-info-title { color: #000 !important; border-color: #ccc !important; }
          .inv-items-table thead th { background: #f0f0f0 !important; color: #333 !important; border-color: #999 !important; }
          .inv-items-table tbody td { color: #000 !important; border-color: #ddd !important; }
          .inv-total-row { color: #333 !important; border-color: #ddd !important; }
          .inv-total-row span:last-child { color: #000 !important; }
          .inv-total-final, .inv-total-final span { color: #000 !important; border-color: #000 !important; }
          .inv-footer { background: #f8f8f8 !important; border-color: #ccc !important; }
          .inv-footer-row { border-color: #ccc !important; }
          .inv-dt-label, .inv-meta-label, .inv-slogan, .inv-company-details,
          .inv-footer-row, .inv-footer-notes, .inv-footer-brand,
          .inv-section-title, .inv-tax-badge-en { color: #555 !important; }
          .inv-dt-value, .inv-meta-value { color: #000 !important; }
          .inv-status-chip { border-color: #999 !important; color: #333 !important; background: #eee !important; }
        }

        /* ---- Thermal Receipt Styles ---- */
        .rec-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          width: 100%;
          border-bottom: 1.5px solid black;
          padding-bottom: 6px;
          margin-bottom: 8px;
        }
        .rec-header-right {
          width: 28%;
          text-align: right;
          font-size: 10px;
          font-weight: bold;
          line-height: 1.3;
          color: black;
        }
        .rec-header-center {
          width: 44%;
          text-align: center;
        }
        .rec-title {
          font-size: 12px;
          font-weight: 900;
          margin-bottom: 2px;
          color: black;
        }
        .rec-subtitle {
          font-size: 10px;
          font-weight: bold;
          margin-bottom: 4px;
          color: black;
        }
        .rec-tax-badge {
          display: inline-block;
          border: 1px solid black;
          padding: 2px 4px;
          font-size: 10px;
          font-weight: 900;
          color: black;
        }
        .rec-header-left {
          width: 28%;
          text-align: left;
          font-size: 10px;
          font-weight: bold;
          font-family: monospace;
          line-height: 1.3;
          color: black;
        }

        .rec-customer {
          font-size: 11px;
          font-weight: bold;
          margin-bottom: 8px;
          line-height: 1.4;
          text-align: right;
          color: black;
        }

        .rec-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 11px;
          margin-bottom: 8px;
          color: black;
        }
        .rec-table th {
          border: 1px solid black;
          padding: 4px 2px;
          font-weight: 900;
          background: #f0f0f0;
          color: black;
        }
        .rec-table td {
          border: 1px solid black;
          padding: 5px 2px;
          word-wrap: break-word;
          color: black;
        }

        .rec-totals {
          display: flex;
          flex-direction: column;
          gap: 4px;
          font-size: 11px;
          font-weight: bold;
          border-bottom: 1.5px solid black;
          padding-bottom: 6px;
          margin-bottom: 8px;
          color: black;
        }
        .rec-total-row {
          display: flex;
          justify-content: space-between;
          width: 100%;
        }
        .rec-total-row span:first-child {
          text-align: left;
          font-weight: 900;
        }
        .rec-total-row span:last-child {
          text-align: right;
        }

        .rec-footer {
          text-align: center;
          font-size: 11px;
          font-weight: bold;
          color: black;
        }
        .rec-line {
          border-top: 1.5px solid black;
          margin: 6px 0;
        }
        .rec-policy {
          font-size: 10px;
          font-weight: 900;
          margin: 4px 0;
          color: black;
        }
        .rec-qr-container {
          display: flex;
          justify-content: center;
          margin-top: 8px;
        }
        .rec-qr {
          width: 130px;
          height: 130px;
          display: block;
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
