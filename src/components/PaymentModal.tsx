"use client";
import React, { useState, useEffect, useRef } from 'react';
import { X, Lock, CreditCard, Smartphone, Shield, CheckCircle, AlertCircle } from 'lucide-react';

// ═══════════════════════════════════════════════════════════
//  Payment Modal — بوبات الدفع المخصصة لكل طريقة دفع
// ═══════════════════════════════════════════════════════════

interface PaymentModalProps {
  isOpen: boolean;
  paymentMethod: string;
  amount: number;
  customerName: string;
  customerPhone: string;
  onConfirm: (cardData?: CardData) => void;
  onClose: () => void;
  loading?: boolean;
}

export interface CardData {
  name: string;
  number: string;
  month: string;
  year: string;
  cvc: string;
}

// ─── Brand Colors ───
const BRAND_COLORS: Record<string, { primary: string; gradient: string; light: string; glow: string }> = {
  'مدى': {
    primary: '#00afaa',
    gradient: 'linear-gradient(135deg, #00afaa 0%, #007a78 100%)',
    light: 'rgba(0, 175, 170, 0.08)',
    glow: 'rgba(0, 175, 170, 0.25)',
  },
  'فيزا / ماستركارد': {
    primary: '#1434CB',
    gradient: 'linear-gradient(135deg, #1434CB 0%, #6B21A8 100%)',
    light: 'rgba(20, 52, 203, 0.08)',
    glow: 'rgba(20, 52, 203, 0.25)',
  },
  'STC Pay': {
    primary: '#4f008c',
    gradient: 'linear-gradient(135deg, #4f008c 0%, #7c3aed 100%)',
    light: 'rgba(79, 0, 140, 0.08)',
    glow: 'rgba(79, 0, 140, 0.25)',
  },
  'Apple Pay': {
    primary: '#000000',
    gradient: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    light: 'rgba(0, 0, 0, 0.06)',
    glow: 'rgba(0, 0, 0, 0.15)',
  },
  'تابي (Tabby)': {
    primary: '#3EEDB5',
    gradient: 'linear-gradient(135deg, #3EEDB5 0%, #1cb37a 100%)',
    light: 'rgba(62, 237, 181, 0.08)',
    glow: 'rgba(62, 237, 181, 0.25)',
  },
  'تمارا (Tamara)': {
    primary: '#f36968',
    gradient: 'linear-gradient(135deg, #f36968 0%, #e11d48 100%)',
    light: 'rgba(243, 105, 104, 0.08)',
    glow: 'rgba(243, 105, 104, 0.25)',
  },
};

// ═══ Format card number with spaces ═══
function formatCardNumber(val: string): string {
  const digits = val.replace(/\D/g, '').slice(0, 16);
  return digits.replace(/(.{4})/g, '$1 ').trim();
}

// ═══ Format expiry ═══
function formatExpiry(val: string): string {
  const digits = val.replace(/\D/g, '').slice(0, 4);
  if (digits.length >= 3) return digits.slice(0, 2) + '/' + digits.slice(2);
  return digits;
}

// ═══════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════
export default function PaymentModal({
  isOpen, paymentMethod, amount, customerName, customerPhone, onConfirm, onClose, loading = false,
}: PaymentModalProps) {
  const [closing, setClosing] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Card form state
  const [cardName, setCardName] = useState(customerName || '');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVC, setCardCVC] = useState('');
  const [cardErrors, setCardErrors] = useState<string[]>([]);

  // STC Pay state
  const [stcPhone, setStcPhone] = useState(customerPhone || '');

  // Reset form on open
  useEffect(() => {
    if (isOpen) {
      setCardName(customerName || '');
      setCardNumber('');
      setCardExpiry('');
      setCardCVC('');
      setCardErrors([]);
      setStcPhone(customerPhone || '');
      setClosing(false);
      document.body.style.overflow = 'hidden';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen, customerName, customerPhone]);

  const handleClose = () => {
    if (loading) return;
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      onClose();
    }, 250);
  };

  // Close on backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) handleClose();
  };

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose(); };
    if (isOpen) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, loading]);

  if (!isOpen) return null;

  const brand = BRAND_COLORS[paymentMethod] || BRAND_COLORS['فيزا / ماستركارد'];

  // ─── Validate & Submit Card ───
  const handleCardSubmit = () => {
    const errs: string[] = [];
    const rawNum = cardNumber.replace(/\s/g, '');
    if (rawNum.length < 15) errs.push('cardNumber');
    if (!cardName.trim()) errs.push('cardName');
    if (cardExpiry.length < 5) errs.push('cardExpiry');
    if (cardCVC.length < 3) errs.push('cardCVC');
    setCardErrors(errs);
    if (errs.length > 0) return;

    const [month, year] = cardExpiry.split('/');
    onConfirm({
      name: cardName,
      number: rawNum,
      month,
      year: year.length === 2 ? '20' + year : year,
      cvc: cardCVC,
    });
  };

  // ─── STC Pay Submit ───
  const handleSTCSubmit = () => {
    if (stcPhone.replace(/\D/g, '').length < 9) return;
    onConfirm();
  };

  // ═══ Render Content by Method ═══
  const renderContent = () => {
    // ─── CARD PAYMENT (Mada / Visa / MC) ───
    if (paymentMethod === 'مدى' || paymentMethod === 'فيزا / ماستركارد') {
      const isMada = paymentMethod === 'مدى';
      return (
        <>
          {/* Card Visual Preview */}
          <div style={{
            background: brand.gradient,
            borderRadius: '16px', padding: '1.5rem',
            color: 'white', position: 'relative', overflow: 'hidden',
            marginBottom: '1.5rem', minHeight: '160px',
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            boxShadow: `0 12px 40px ${brand.glow}`,
          }}>
            {/* Card Chip + Logo */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{
                width: '45px', height: '32px', borderRadius: '6px',
                background: 'linear-gradient(135deg, #f5d76e 0%, #f0c040 50%, #d4a520 100%)',
                border: '1px solid rgba(255,255,255,0.2)',
              }} />
              {isMada ? (
                <span style={{ fontWeight: 900, fontSize: '1.3rem', fontStyle: 'italic', letterSpacing: '-0.5px', opacity: 0.95 }}>mada</span>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontWeight: 900, fontSize: '1.1rem', fontStyle: 'italic', letterSpacing: '-0.5px' }}>VISA</span>
                  <div style={{ display: 'flex' }}>
                    <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#EB001B' }} />
                    <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#F79E1B', marginRight: '-6px', opacity: 0.9 }} />
                  </div>
                </div>
              )}
            </div>
            {/* Card Number Display */}
            <div style={{ fontFamily: "'Courier New', monospace", fontSize: '1.25rem', letterSpacing: '2px', fontWeight: 700, marginTop: '1rem' }}>
              {cardNumber || '•••• •••• •••• ••••'}
            </div>
            {/* Name + Expiry */}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600, opacity: 0.85, marginTop: '0.5rem' }}>
              <span>{cardName || 'اسم حامل البطاقة'}</span>
              <span>{cardExpiry || 'MM/YY'}</span>
            </div>
            {/* Decorative circles */}
            <div style={{ position: 'absolute', top: '-30px', left: '-30px', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
            <div style={{ position: 'absolute', bottom: '-40px', right: '-20px', width: '150px', height: '150px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
          </div>

          {/* Card Form Fields */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={labelStyle}>اسم حامل البطاقة</label>
              <input
                type="text" autoComplete="cc-name" dir="ltr"
                value={cardName} onChange={e => { setCardName(e.target.value); setCardErrors(p => p.filter(x => x !== 'cardName')); }}
                placeholder="ABDULRAHMAN MOHAMMED"
                style={{ ...inputStyle, borderColor: cardErrors.includes('cardName') ? '#ef4444' : 'var(--border)', textAlign: 'left' }}
              />
            </div>
            <div>
              <label style={labelStyle}>رقم البطاقة</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text" autoComplete="cc-number" dir="ltr" inputMode="numeric"
                  value={cardNumber}
                  onChange={e => { setCardNumber(formatCardNumber(e.target.value)); setCardErrors(p => p.filter(x => x !== 'cardNumber')); }}
                  placeholder="0000 0000 0000 0000"
                  style={{ ...inputStyle, borderColor: cardErrors.includes('cardNumber') ? '#ef4444' : 'var(--border)', textAlign: 'left', paddingLeft: '3rem' }}
                />
                <CreditCard size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>تاريخ الانتهاء</label>
                <input
                  type="text" autoComplete="cc-exp" dir="ltr" inputMode="numeric"
                  value={cardExpiry}
                  onChange={e => { setCardExpiry(formatExpiry(e.target.value)); setCardErrors(p => p.filter(x => x !== 'cardExpiry')); }}
                  placeholder="MM/YY"
                  style={{ ...inputStyle, borderColor: cardErrors.includes('cardExpiry') ? '#ef4444' : 'var(--border)', textAlign: 'center' }}
                />
              </div>
              <div>
                <label style={labelStyle}>رمز الأمان (CVV)</label>
                <input
                  type="password" autoComplete="cc-csc" dir="ltr" inputMode="numeric" maxLength={4}
                  value={cardCVC}
                  onChange={e => { setCardCVC(e.target.value.replace(/\D/g, '').slice(0, 4)); setCardErrors(p => p.filter(x => x !== 'cardCVC')); }}
                  placeholder="•••"
                  style={{ ...inputStyle, borderColor: cardErrors.includes('cardCVC') ? '#ef4444' : 'var(--border)', textAlign: 'center', letterSpacing: '4px' }}
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            onClick={handleCardSubmit} disabled={loading}
            style={{ ...submitBtnStyle, background: brand.gradient, boxShadow: `0 8px 25px ${brand.glow}`, marginTop: '1.5rem' }}
          >
            {loading ? <Spinner /> : (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                <Lock size={18} /> ادفع {amount.toLocaleString()} ر.س
              </span>
            )}
          </button>
        </>
      );
    }

    // ─── STC PAY ───
    if (paymentMethod === 'STC Pay') {
      return (
        <>
          <div style={{
            background: brand.gradient, borderRadius: '16px', padding: '2rem',
            color: 'white', textAlign: 'center', marginBottom: '1.5rem',
            boxShadow: `0 12px 40px ${brand.glow}`, position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: '-20px', left: '-20px', width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
            <div style={{ fontWeight: 900, fontSize: '1.8rem', fontStyle: 'italic', marginBottom: '0.5rem' }}>stc pay</div>
            <p style={{ fontSize: '0.9rem', opacity: 0.85, fontWeight: 600 }}>ادفع بسهولة عبر STC Pay</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={labelStyle}>رقم الجوال المسجل في STC Pay</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="tel" dir="ltr" inputMode="tel" autoComplete="tel"
                  value={stcPhone}
                  onChange={e => setStcPhone(e.target.value)}
                  placeholder="+966 5X XXX XXXX"
                  style={{ ...inputStyle, textAlign: 'left', paddingLeft: '3rem' }}
                />
                <Smartphone size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
              </div>
            </div>

            <div style={{
              background: 'rgba(79, 0, 140, 0.05)', border: '1px solid rgba(79, 0, 140, 0.15)',
              borderRadius: '12px', padding: '1rem', display: 'flex', alignItems: 'flex-start', gap: '0.6rem',
            }}>
              <AlertCircle size={18} style={{ color: '#4f008c', flexShrink: 0, marginTop: '2px' }} />
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 700, margin: 0, lineHeight: 1.5 }}>
                سيتم إرسال رمز تحقق (OTP) إلى جوالك لإتمام عملية الدفع
              </p>
            </div>
          </div>

          <button
            onClick={handleSTCSubmit} disabled={loading}
            style={{ ...submitBtnStyle, background: brand.gradient, boxShadow: `0 8px 25px ${brand.glow}`, marginTop: '1.5rem' }}
          >
            {loading ? <Spinner /> : (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                <Lock size={18} /> متابعة الدفع — {amount.toLocaleString()} ر.س
              </span>
            )}
          </button>
        </>
      );
    }

    // ─── APPLE PAY ───
    if (paymentMethod === 'Apple Pay') {
      return (
        <>
          <div style={{
            background: brand.gradient, borderRadius: '16px', padding: '2.5rem',
            color: 'white', textAlign: 'center', marginBottom: '1.5rem',
            boxShadow: `0 12px 40px ${brand.glow}`, position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
            <svg width="40" height="40" viewBox="0 0 384 512" fill="white" style={{ marginBottom: '0.8rem' }}>
              <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.3 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.3zM207.8 102.7c31.1-36.7 27.9-80.4 27.9-80.4-38 1.4-80.9 25.3-108.7 61-23.7 30.4-31.5 72.8-25.2 110.4 42.4 1.7 78.8-44.3 106-91z" />
            </svg>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto', marginBottom: '0.3rem' }}>Apple Pay</div>
            <p style={{ fontSize: '0.9rem', opacity: 0.8, fontWeight: 600 }}>ادفع بضغطة واحدة</p>
          </div>

          <div style={{
            background: 'var(--background)', borderRadius: '12px', padding: '1.2rem',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem',
            border: '1px solid var(--border)',
          }}>
            <span style={{ fontWeight: 800, color: 'var(--text-secondary)', fontSize: '0.95rem' }}>المبلغ المطلوب</span>
            <span style={{ fontWeight: 900, fontSize: '1.3rem', color: 'var(--text-primary)' }}>{amount.toLocaleString()} <span style={{ fontSize: '0.8rem' }}>ر.س</span></span>
          </div>

          <div style={{
            background: 'rgba(0,0,0,0.03)', border: '1px solid var(--border)',
            borderRadius: '12px', padding: '1rem', display: 'flex', alignItems: 'flex-start', gap: '0.6rem', marginBottom: '1rem',
          }}>
            <Shield size={18} style={{ color: 'var(--text-tertiary)', flexShrink: 0, marginTop: '2px' }} />
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 700, margin: 0, lineHeight: 1.5 }}>
              سيتم التحقق من هويتك عبر Face ID أو Touch ID لإتمام الدفع بأمان
            </p>
          </div>

          <button
            onClick={() => onConfirm()} disabled={loading}
            style={{
              ...submitBtnStyle, background: '#000', color: '#fff',
              boxShadow: '0 8px 25px rgba(0,0,0,0.2)', marginTop: '0.5rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
            }}
          >
            {loading ? <Spinner /> : (
              <>
                <svg width="18" height="18" viewBox="0 0 384 512" fill="white"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.3 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.3zM207.8 102.7c31.1-36.7 27.9-80.4 27.9-80.4-38 1.4-80.9 25.3-108.7 61-23.7 30.4-31.5 72.8-25.2 110.4 42.4 1.7 78.8-44.3 106-91z" /></svg>
                ادفع باستخدام Apple Pay
              </>
            )}
          </button>
        </>
      );
    }

    // ─── INSTALLMENTS (Tabby / Tamara) ───
    if (paymentMethod === 'تابي (Tabby)' || paymentMethod === 'تمارا (Tamara)') {
      const isTabby = paymentMethod === 'تابي (Tabby)';
      const installments = isTabby ? 4 : 3;
      const installmentAmount = Math.ceil(amount / installments);
      const brandName = isTabby ? 'tabby' : 'tamara';
      const brandNameAr = isTabby ? 'تابي' : 'تمارا';

      return (
        <>
          {/* Brand Header */}
          <div style={{
            background: brand.gradient, borderRadius: '16px', padding: '2rem',
            color: 'white', textAlign: 'center', marginBottom: '1.5rem',
            boxShadow: `0 12px 40px ${brand.glow}`, position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
            <div style={{
              fontWeight: 900, fontSize: '1.6rem', letterSpacing: '-0.5px', marginBottom: '0.5rem',
              ...(isTabby ? { background: '#3EEDB5', color: '#000', display: 'inline-block', padding: '4px 12px', borderRadius: '6px' } : {}),
            }}>
              {brandName}
            </div>
            <p style={{ fontSize: '0.95rem', opacity: 0.9, fontWeight: 600, marginTop: '0.5rem' }}>
              قسّم المبلغ على {installments} دفعات بدون فوائد
            </p>
          </div>

          {/* Installment Breakdown */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.5rem' }}>
            {Array.from({ length: installments }, (_, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '1rem 1.2rem', borderRadius: '12px',
                background: i === 0 ? brand.light : 'var(--background)',
                border: `1px solid ${i === 0 ? brand.primary + '30' : 'var(--border)'}`,
                transition: 'all 0.2s',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '50%',
                    background: i === 0 ? brand.primary : 'var(--border)',
                    color: i === 0 ? 'white' : 'var(--text-tertiary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.75rem', fontWeight: 900,
                  }}>
                    {i + 1}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {i === 0 ? 'اليوم' : `بعد ${i * (isTabby ? 2 : 1)} ${isTabby ? 'أسابيع' : 'شهر'}`}
                    </div>
                    {i === 0 && (
                      <div style={{ fontSize: '0.75rem', color: brand.primary, fontWeight: 700 }}>
                        الدفعة الأولى عند الطلب
                      </div>
                    )}
                  </div>
                </div>
                <span style={{ fontWeight: 900, fontSize: '1.05rem', color: i === 0 ? brand.primary : 'var(--text-primary)' }}>
                  {installmentAmount.toLocaleString()} ر.س
                </span>
              </div>
            ))}
          </div>

          {/* Total */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '1rem 1.2rem', borderRadius: '12px', background: 'var(--background)',
            border: '1px dashed var(--border)', marginBottom: '1rem',
          }}>
            <span style={{ fontWeight: 900, color: 'var(--text-primary)' }}>الإجمالي</span>
            <span style={{ fontWeight: 900, fontSize: '1.2rem', color: 'var(--text-primary)' }}>{amount.toLocaleString()} ر.س</span>
          </div>

          <div style={{
            background: brand.light, border: `1px solid ${brand.primary}20`,
            borderRadius: '12px', padding: '1rem', display: 'flex', alignItems: 'flex-start', gap: '0.6rem', marginBottom: '0.5rem',
          }}>
            <CheckCircle size={18} style={{ color: brand.primary, flexShrink: 0, marginTop: '2px' }} />
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 700, margin: 0, lineHeight: 1.5 }}>
              بدون فوائد • بدون رسوم إضافية • موافقة فورية
            </p>
          </div>

          <button
            onClick={() => onConfirm()} disabled={loading}
            style={{ ...submitBtnStyle, background: brand.gradient, boxShadow: `0 8px 25px ${brand.glow}`, marginTop: '1rem', color: isTabby ? '#000' : '#fff' }}
          >
            {loading ? <Spinner /> : (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                <Lock size={18} /> متابعة مع {brandNameAr} — {installmentAmount.toLocaleString()} ر.س/
                {isTabby ? 'أسبوعين' : 'شهر'}
              </span>
            )}
          </button>
        </>
      );
    }

    return null;
  };

  return (
    <>
      {/* ─── Backdrop ─── */}
      <div
        onClick={handleBackdropClick}
        style={{
          position: 'fixed', inset: 0, zIndex: 100000,
          background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
          animation: closing ? 'pmFadeOut 0.25s ease forwards' : 'pmFadeIn 0.3s ease forwards',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '1rem',
        }}
      >
        {/* ─── Modal Card ─── */}
        <div
          ref={modalRef}
          style={{
            width: '100%', maxWidth: '460px',
            maxHeight: '90vh', overflowY: 'auto',
            background: 'var(--surface)', borderRadius: '24px',
            border: '1px solid var(--border)', boxShadow: '0 25px 70px rgba(0,0,0,0.15)',
            animation: closing ? 'pmSlideOut 0.25s ease forwards' : 'pmSlideIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
            position: 'relative',
          }}
          onClick={e => e.stopPropagation()}
        >
          {/* ─── Header ─── */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '1.2rem 1.5rem', borderBottom: '1px solid var(--border)',
            position: 'sticky', top: 0, zIndex: 10, background: 'var(--surface)', borderRadius: '24px 24px 0 0',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Lock size={16} color={brand.primary} />
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 900, color: 'var(--text-primary)' }}>
                إتمام الدفع بأمان
              </h3>
            </div>
            <button
              onClick={handleClose}
              disabled={loading}
              style={{
                background: 'var(--background)', border: '1px solid var(--border)',
                width: '34px', height: '34px', borderRadius: '10px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: loading ? 'not-allowed' : 'pointer', color: 'var(--text-secondary)',
                transition: 'all 0.2s',
              }}
            >
              <X size={16} />
            </button>
          </div>

          {/* ─── Body ─── */}
          <div style={{ padding: '1.5rem' }}>
            {renderContent()}
          </div>

          {/* ─── Security Footer ─── */}
          <div style={{
            padding: '1rem 1.5rem', borderTop: '1px solid var(--border)',
            display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem',
          }}>
            <Shield size={14} color="var(--text-tertiary)" />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 700 }}>
              جميع المعاملات مشفرة ومحمية بتقنية SSL 256-bit
            </span>
          </div>
        </div>
      </div>

      {/* ─── Animations ─── */}
      <style>{`
        @keyframes pmFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes pmFadeOut { from { opacity: 1; } to { opacity: 0; } }
        @keyframes pmSlideIn {
          from { opacity: 0; transform: translateY(30px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes pmSlideOut {
          from { opacity: 1; transform: translateY(0) scale(1); }
          to { opacity: 0; transform: translateY(20px) scale(0.97); }
        }
        @media (max-width: 640px) {
          /* Mobile: bottom sheet style */
          .pm-modal-card {
            border-radius: 24px 24px 0 0 !important;
            max-height: 95vh !important;
          }
        }
      `}</style>
    </>
  );
}

// ═══ Shared Styles ═══
const labelStyle: React.CSSProperties = {
  display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)',
  fontWeight: 800, fontSize: '0.85rem',
};

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '0.85rem 1rem',
  background: 'var(--background)', border: '1.5px solid var(--border)',
  borderRadius: '12px', color: 'var(--text-primary)',
  outline: 'none', fontWeight: 700, fontSize: '1rem',
  transition: 'border-color 0.2s, box-shadow 0.2s',
  direction: 'ltr',
};

const submitBtnStyle: React.CSSProperties = {
  width: '100%', padding: '1.1rem', border: 'none',
  borderRadius: '14px', fontSize: '1.05rem', fontWeight: 900,
  cursor: 'pointer', color: 'white',
  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
};

// ═══ Loading Spinner ═══
function Spinner() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
      <div style={{
        width: '20px', height: '20px',
        border: '3px solid rgba(255,255,255,0.3)', borderTopColor: '#fff',
        borderRadius: '50%', animation: 'spin 0.8s linear infinite',
      }} />
      <span>جاري المعالجة...</span>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
