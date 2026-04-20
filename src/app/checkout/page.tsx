"use client";
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { supabase } from '@/lib/supabase';
import { PartyPopper, CreditCard, Truck, Smartphone } from 'lucide-react';
import { roundPrice, formatPrice, calculateCartTotal, calculateCommission, createPriceAuditEntry } from '@/lib/pricing';

export default function CheckoutPage() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { addToast } = useToast();
  const [successOrderId, setSuccessOrderId] = useState<string | null>(null);
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', address: '', city: 'الرياض', paymentMethod: 'الدفع عند الاستلام' });
  const [upsellAdded, setUpsellAdded] = useState(false);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [checkoutState, setCheckoutState] = useState<'idle'|'failed'>('idle');
  const [sessionId, setSessionId] = useState('');

  const logEvent = (type: string, meta: any = {}) => {
    if (!sessionId) return;
    fetch('/api/analytics', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: sessionId, event_type: type,
        payment_method: meta.method || null, order_total: meta.total || null, 
        error_message: meta.error || null, order_id: meta.orderId || null,
        metadata: { ...meta, version: 'v1' }
      })
    }).catch(()=>{});
  };

  useEffect(() => {
    let sid = localStorage.getItem('booga_checkout_session');
    if (!sid) {
      sid = crypto.randomUUID();
      localStorage.setItem('booga_checkout_session', sid);
    }
    setSessionId(sid);

    try {
      const saved = localStorage.getItem('booga_checkout_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        setFormData(prev => ({ 
          ...prev, 
          name: parsed.name || '', 
          phone: parsed.phone || '', 
          address: parsed.address || '', 
          city: parsed.city || 'الرياض' 
        }));
      }
    } catch {}

    // Analytics: Checkout Started
    if (cartItems.length > 0 && sid) {
      // Inline fetch for mount since logEvent depends on state which might not be set yet
      fetch('/api/analytics', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sid, event_type: 'started', metadata: { items: cartItems.length, value: cartTotal, version: 'v1' } })
      }).catch(()=>{});
    }
  }, [cartItems.length, successOrderId]);

  const updateFormData = (updates: any) => {
    const newForm = { ...formData, ...updates };
    setFormData(newForm);
    localStorage.setItem('booga_checkout_data', JSON.stringify({
      name: newForm.name,
      phone: newForm.phone,
      address: newForm.address,
      city: newForm.city
    }));
  };
  // Discount logic
  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<any>(null);
  const [discountStatus, setDiscountStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [discountMsg, setDiscountMsg] = useState('');

  const [couponCode, setCouponCode] = useState('');
  const [showCoupon, setShowCoupon] = useState(false);

  const applyDiscount = async (codeOverride?: string) => {
    let code = (typeof codeOverride === 'string' ? codeOverride : discountCode).replace(/\s/g, '').toUpperCase();
    if (!code) {
      code = 'SAUDI15';
      setDiscountCode('SAUDI15');
    }
    try {
      const { data, error } = await supabase.from('coupons').select('*').eq('code', code).eq('is_active', true).single();
      if (error || !data) {
        setAppliedDiscount(null);
        setDiscountStatus('error');
        setDiscountMsg('كود الخصم غير صحيح أو منتهي الصلاحية');
      } else if (data.expires_at && new Date(data.expires_at) < new Date()) {
        setAppliedDiscount(null);
        setDiscountStatus('error');
        setDiscountMsg('كود الخصم منتهي الصلاحية');
      } else if (data.max_uses && data.current_uses >= data.max_uses) {
        setAppliedDiscount(null);
        setDiscountStatus('error');
        setDiscountMsg('تم استنفاد عدد استخدامات هذا الكود');
      } else if (data.min_order_amount && cartTotal < data.min_order_amount) {
        setAppliedDiscount(null);
        setDiscountStatus('error');
        setDiscountMsg(`الحد الأدنى للطلب ${data.min_order_amount} ر.س لاستخدام هذا الكود`);
      } else {
        setAppliedDiscount(data);
        setDiscountStatus('success');
        const val = data.discount_value || data.discount_percent;
        const msgType = data.discount_type === 'percent' ? `${val}%` : data.discount_type === 'fixed' ? `${val} ر.س` : 'شحن مجاني';
        setDiscountMsg(`🎉 مبروك! تم تطبيق خصم ${msgType} بنجاح`);
      }
    } catch {
      setAppliedDiscount(null);
      setDiscountStatus('error');
      setDiscountMsg('حدث خطأ أثناء التحقق من الكود');
    }
    setTimeout(() => { setDiscountStatus('idle'); setDiscountMsg(''); }, 5000);
  };

  // ─── CENTRALIZED PRICING (Single Source of Truth) ───
  const cartPricing = calculateCartTotal(
    cartItems.map(item => ({ price: item.price, quantity: item.quantity, productId: item.id, category: item.category })),
    appliedDiscount
  );

  // Use centralized values
  const shippingCost = cartPricing.shippingCost;
  const totalBeforeDiscount = cartPricing.totalBeforeDiscount + (upsellAdded ? 25 : 0);
  const discountAmount = cartPricing.couponDiscount;
  const finalTotal = cartPricing.finalTotal + (upsellAdded ? 25 : 0);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) return;

    if (!navigator.onLine) {
      addToast('لا يوجد اتصال بالإنترنت! يرجى التحقق من الشبكة', 'error');
      logEvent('payment_failed', { error: 'Offline network' });
      return;
    }

    // Basic visual validation check
    const errors = [];
    if (formData.phone.length < 9) errors.push('phone');
    if (!formData.name) errors.push('name');
    setFormErrors(errors);
    if (errors.length > 0) {
      addToast('يرجى التأكد من تعبئة البيانات بشكل صحيح', 'error');
      logEvent('payment_failed', { error: 'Validation', details: errors });
      return;
    }
    
    logEvent('payment_clicked', { method: formData.paymentMethod, total: finalTotal });
    setLoading(true);
    setCheckoutState('idle');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id || null;

      let currentOrderId = pendingOrderId;
      let finalOrderTotal = finalTotal;

      if (!currentOrderId) {
        // ─── STEP 0: Server-side price & stock validation ───
        try {
          const validationRes = await fetch('/api/validate-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: cartItems.map(item => ({ product_id: item.id, quantity: item.quantity })),
            coupon_code: appliedDiscount ? discountCode.replace(/\s/g, '').toUpperCase() : null,
          }),
        });
        const validation = await validationRes.json();
        if (!validationRes.ok || !validation.valid) {
          // Stock or price error — BLOCK the order
          addToast(validation.error || 'فشل التحقق من الطلب', 'error');
          setLoading(false);
          return;
        }
        // Use server-validated total (ignore frontend calculation)
        const serverTotal = roundPrice(validation.order.final_total);
        if (Math.abs(serverTotal - finalTotal) > 1) {
          console.warn('Price mismatch detected:', { frontend: finalTotal, server: serverTotal });
        }
      } catch (valErr: any) {
        // If validation API is completely unavailable, continue with frontend prices
        console.warn('Server validation unavailable, using frontend prices:', valErr.message);
      }

      // ─── STEP 0.5: Reserve Stock (15 min hold) ───
      const reservationIds: string[] = [];
      try {
        // Release expired reservations first
        try { await supabase.rpc('release_expired_reservations'); } catch {}
        
        for (const item of cartItems) {
          const { data: resId, error: resErr } = await supabase.rpc('reserve_stock', {
            p_product_id: item.id,
            p_quantity: item.quantity,
            p_user_id: userId,
          });
          if (resErr) {
            // Release all previous reservations on failure
            for (const rid of reservationIds) {
              try { await supabase.from('stock_reservations').update({ status: 'expired' }).eq('id', rid); } catch {}
            }
            addToast(resErr.message || 'الكمية المطلوبة غير متاحة حالياً', 'error');
            setLoading(false);
            return;
          }
          if (resId) reservationIds.push(resId);
        }
      } catch (resErr: any) {
        console.warn('Reservation system unavailable:', resErr.message);
      }

      // ─── 🚀 SECURE SERVER-SIDE ORDER CREATION ───
      const orderRes = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cartItems.map(item => ({ id: item.id, quantity: item.quantity })),
          coupon_code: appliedDiscount ? discountCode.replace(/\s/g, '').toUpperCase() : undefined,
          shippingDetails: {
            name: formData.name,
            phone: formData.phone,
            city: formData.city,
            address: formData.address,
          },
          paymentMethod: formData.paymentMethod,
          userId: userId || null,
          cro_version: 'v1',
        }),
      });

        const orderResult = await orderRes.json();

        if (!orderRes.ok || orderResult.error) {
          throw new Error(orderResult.error || "فشل في معالجة الطلب الآمن");
        }

        currentOrderId = orderResult.orderId;
        finalOrderTotal = orderResult.finalTotal || finalTotal;
        setPendingOrderId(currentOrderId);
      } else {
        logEvent('payment_retried', { orderId: currentOrderId });
      }

      // Handle Payment Processing from Frontend
      try {
        const payRes = await fetch('/api/payment/process', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: currentOrderId,
            amount: finalOrderTotal,
            paymentMethod: formData.paymentMethod,
            customerName: formData.name,
            customerPhone: formData.phone
          }),
        });
        const payResult = await payRes.json();
        
        // Handle Payment Gateways Redirects (Moyasar 3D secure, STC Pay)
        if (payResult?.redirectUrl) {
          window.location.href = payResult.redirectUrl;
          return;
        }
      } catch (payErr) {
        console.warn('Payment process warning, fallback to manual confirmation:', payErr);
      }

      logEvent('success', { orderId: currentOrderId });
      setSuccessOrderId(currentOrderId);
      setPendingOrderId(null); // Clear pending state on success
      clearCart();

    } catch (err: any) {
      console.error("Order Checkout Error:", err);
      logEvent('payment_failed', { error: err.message });
      setCheckoutState('failed');
      
      const errMsg = err.message || '';
      if (errMsg.includes('البطاقة') || errMsg.includes('payment')) {
        addToast('❌ فشل الدفع — يرجى التأكد من بيانات البطاقة أو المحاولة بوسيلة أخرى', 'error');
      } else {
        addToast(`⚠️ عذراً، حدث خطأ أثناء تأكيد الطلب: ${errMsg || 'خطأ غير معروف'}`, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  if (successOrderId) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--background)' }}>
        <Navbar />
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem' }}>
          <div className="glass-panel" style={{ 
            textAlign: 'center', padding: '4rem 2rem', maxWidth: '600px', width: '100%', 
            borderRadius: '24px', border: '1px solid var(--primary)', 
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            background: 'var(--surface)', boxShadow: 'var(--card-shadow)'
          }}>
            <div style={{ marginBottom: '1.5rem' }}><PartyPopper size={64} color="var(--primary)" /></div>
            <h1 style={{ color: 'var(--primary)', marginBottom: '1rem', fontSize: '2.5rem', fontWeight: 900 }}>تم تأكيد طلبك بنجاح!</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', marginBottom: '0.5rem', fontWeight: 600 }}>
              شكراً لك {formData.name} على ثقتك بـ Booga Car.
            </p>
            
            <div style={{ background: 'rgba(244, 63, 94, 0.05)', padding: '1.5rem', borderRadius: '16px', border: '1px dashed var(--primary)', marginBottom: '2.5rem', width: '100%' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: '0.5rem', fontWeight: 600 }}>رقم تتبع الطلب الخاص بك هو:</p>
              <p style={{ color: 'var(--text-primary)', fontSize: '1.3rem', fontWeight: 900, fontFamily: 'monospace', letterSpacing: '1px', userSelect: 'all' }}>{successOrderId}</p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '1rem' }}>يرجى نسخ هذا الرقم لتتمكن من تتبع حالة شحنتك 📦</p>
            </div>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              <a href={`/track-order?id=${successOrderId}`} style={{ 
                padding: '1.2rem 2.5rem', background: 'var(--primary)', color: 'white', 
                borderRadius: '14px', textDecoration: 'none', fontWeight: 900, fontSize: '1.1rem',
                boxShadow: '0 8px 25px rgba(244, 63, 94, 0.3)', transition: '0.3s',
                display: 'flex', alignItems: 'center', gap: '0.5rem'
              }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-3px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                <Truck size={20} /> تتبع طلبي الآن
              </a>
              <a href={`/invoice?id=${successOrderId}`} style={{ 
                padding: '1.2rem 2.5rem', background: 'var(--surface)', color: 'var(--text-primary)', 
                borderRadius: '14px', textDecoration: 'none', fontWeight: 800, fontSize: '1.1rem',
                border: '1px solid var(--border)', transition: '0.3s',
                display: 'flex', alignItems: 'center', gap: '0.5rem'
              }} onMouseOver={e => e.currentTarget.style.background = 'var(--background)'} onMouseOut={e => e.currentTarget.style.background = 'var(--surface)'}>
                📄 عرض الفاتورة
              </a>
              <a href="/" style={{ 
                padding: '1.2rem 2.5rem', background: 'var(--surface)', color: 'var(--text-primary)', 
                borderRadius: '14px', textDecoration: 'none', fontWeight: 800, fontSize: '1.1rem',
                border: '1px solid var(--border)', transition: '0.3s'
              }} onMouseOver={e => e.currentTarget.style.background = 'var(--background)'} onMouseOut={e => e.currentTarget.style.background = 'var(--surface)'}>
                تسوق المزيد
              </a>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <>
      <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--background)' }}>
        <Navbar />
        
        <div style={{ maxWidth: '1200px', width: '100%', margin: '0 auto', padding: '6rem 2rem 4rem', flex: 1 }}>
        
        {/* Progress Tracker UX */}
        {cartItems.length > 0 && !successOrderId && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
            marginBottom: '2rem', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 800
          }}>
            <span style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{width:'20px',height:'20px',borderRadius:'50%',background:'var(--primary)',color:'white',display:'flex',justifyContent:'center',alignItems:'center',fontSize:'10px'}}>1</span>
              السلة
            </span>
            <span style={{flex: 1, maxWidth: '40px', height: '2px', background: 'var(--primary)', opacity: 0.3}}></span>
            <span style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{width:'20px',height:'20px',borderRadius:'50%',border:'2px solid var(--primary)',color:'var(--primary)',display:'flex',justifyContent:'center',alignItems:'center',fontSize:'10px'}}>2</span>
              مراجعة الطلب
            </span>
            <span style={{flex: 1, maxWidth: '40px', height: '2px', background: 'var(--border)'}}></span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', opacity: 0.5 }}>
              <span style={{width:'20px',height:'20px',borderRadius:'50%',border:'2px solid var(--border)',display:'flex',justifyContent:'center',alignItems:'center',fontSize:'10px'}}>3</span>
              إتمام الدفع
            </span>
          </div>
        )}

        <h1 style={{ 
          fontSize: '2.8rem', fontWeight: 900, marginBottom: '2rem', 
          borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem',
          color: 'var(--text-primary)', letterSpacing: '-1px'
        }}>إتمام الشراء</h1>

        {cartItems.length === 0 ? (
          <div style={{ 
            textAlign: 'center', padding: '6rem 2rem', background: 'var(--surface)', 
            borderRadius: '24px', border: '1px dashed var(--border)' 
          }}>
            <h2 style={{ color: 'var(--text-secondary)', fontWeight: 800, fontSize: '1.6rem' }}>سلة المشتريات فارغة</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>ابدأ بإضافة بعض المنتجات الرائعة لسيارتك</p>
            <a href="/products" style={{ 
              display: 'inline-block', padding: '1rem 2.5rem', background: 'var(--primary)', 
              color: 'white', borderRadius: '12px', textDecoration: 'none', fontWeight: 800 
            }}>تصفح المنتجات</a>
          </div>
        ) : (
          <div className="checkout-mobile-flow" style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            <form onSubmit={handleCheckout} id="checkout-form" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              
              {/* Order Summary (Collapsible) */}
              <details style={{
                background: 'var(--surface)', borderRadius: '16px', border: '1px solid var(--primary)', padding: '1.2rem',
                boxShadow: '0 4px 12px rgba(37,99,235,0.05)'
              }} open>
                <summary style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--text-primary)', cursor: 'pointer', outline: 'none', listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{display:'flex', alignItems:'center', gap:'0.5rem'}}>
                    <div style={{width:'8px',height:'8px',background:'var(--primary)',borderRadius:'50%',animation:'pulse 2s infinite'}}></div>
                    ملخص الطلب ({cartItems.length})
                  </div>
                  <span style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--primary)' }}>{finalTotal.toLocaleString()} ر.س</span>
                </summary>
                
                <div style={{ marginTop: '1.2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {cartItems.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: idx < cartItems.length-1 ? '1px dashed var(--border)' : 'none', paddingBottom: idx < cartItems.length-1 ? '0.8rem' : '0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                        {item.image && <img src={item.image} alt={item.name} style={{ width: '45px', height: '45px', borderRadius: '8px', objectFit: 'cover' }} />}
                        <div>
                          <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>{item.name}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700 }}>الكمية: {item.quantity}</div>
                        </div>
                      </div>
                      <div style={{ fontWeight: 900, color: 'var(--text-primary)' }}>{((item.price) * item.quantity).toLocaleString()} ر.س</div>
                    </div>
                  ))}
                  
                  {/* Marketing text and Upsell completely removed here */}
                </div>
              </details>

              {/* 1. بيانات التوصيل */}
              <div className="checkout-card" style={{ 
                padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border)',
                background: 'var(--surface)', boxShadow: 'var(--card-shadow)'
              }}>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 900, margin: '0 0 1.2rem', color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>1. بيانات التوصيل</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontWeight: 800, fontSize: '0.9rem' }}>الاسم بالكامل</label>
                    <input required autoComplete="name" value={formData.name} onChange={e => { updateFormData({name: e.target.value}); if(formErrors.includes('name')) setFormErrors(formErrors.filter(err=>err!=='name')); }} type="text" className={formErrors.includes('name') ? 'input-error' : ''} style={{ 
                      width: '100%', padding: '0.9rem 1rem', background: 'var(--background)', 
                      border: `1px solid ${formErrors.includes('name') ? '#ef4444' : 'var(--border)'}`, borderRadius: '12px', color: 'var(--text-primary)', 
                      outline: 'none', fontWeight: 700, fontSize: '1rem', transition: '0.2s'
                    }} onFocus={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.background = 'var(--surface)'; }} onBlur={e => { e.currentTarget.style.borderColor = formErrors.includes('name') ? '#ef4444' : 'var(--border)'; e.currentTarget.style.background = 'var(--background)'; }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontWeight: 800, fontSize: '0.9rem' }}>رقم الجوال</label>
                    <input required autoComplete="tel" placeholder="+966 5X XXX XXXX" value={formData.phone} onChange={e => { updateFormData({phone: e.target.value}); if(formErrors.includes('phone')) setFormErrors(formErrors.filter(err=>err!=='phone')); }} type="tel" className={formErrors.includes('phone') ? 'input-error' : ''} style={{ 
                      width: '100%', padding: '0.9rem 1rem', background: 'var(--background)', 
                      border: `1px solid ${formErrors.includes('phone') ? '#ef4444' : 'var(--border)'}`, borderRadius: '12px', color: 'var(--text-primary)', 
                      outline: 'none', fontWeight: 800, fontSize: '1rem', transition: '0.2s', direction: 'ltr', textAlign: 'left',
                    }} onFocus={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.background = 'var(--surface)'; }} onBlur={e => { e.currentTarget.style.borderColor = formErrors.includes('phone') ? '#ef4444' : 'var(--border)'; e.currentTarget.style.background = 'var(--background)'; }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontWeight: 800, fontSize: '0.9rem' }}>المدينة</label>
                    <select required autoComplete="address-level2" value={formData.city} onChange={e => updateFormData({city: e.target.value})} style={{ 
                      width: '100%', padding: '0.9rem 1rem', background: 'var(--background)', 
                      border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--text-primary)', 
                      outline: 'none', fontWeight: 700, fontSize: '1rem', transition: '0.2s',
                      appearance: 'none', backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2364748b\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")',
                      backgroundRepeat: 'no-repeat', backgroundPosition: 'left 1rem center', backgroundSize: '1rem'
                    }} onFocus={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.background = 'var(--surface)'; }} onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--background)'; }}>
                      <option value="الرياض">الرياض</option>
                      <option value="جدة">جدة</option>
                      <option value="الدمام">الدمام</option>
                      <option value="مكة المكرمة">مكة المكرمة</option>
                      <option value="أخرى">أخرى...</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontWeight: 800, fontSize: '0.9rem' }}>العنوان التفصيلي</label>
                    <input required autoComplete="street-address" value={formData.address} onChange={e => updateFormData({address: e.target.value})} type="text" placeholder="اسم الشارع، رقم المبنى، الحي" style={{ 
                      width: '100%', padding: '0.9rem 1rem', background: 'var(--background)', 
                      border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--text-primary)', 
                      outline: 'none', fontWeight: 700, fontSize: '1rem', transition: '0.2s'
                    }} onFocus={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.background = 'var(--surface)'; }} onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--background)'; }} />
                  </div>
                </div>
              </div>

              {/* 2. طريقة الدفع */}
              <div className="checkout-card" style={{ 
                padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border)',
                background: 'var(--surface)', boxShadow: 'var(--card-shadow)'
              }}>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 900, margin: '0 0 1.2rem', color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>2. طريقة الدفع</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.8rem' }}>
                  {[
                    { id: 'مدى', label: 'مدى', icon: <div style={{display: 'flex', alignItems: 'center', fontWeight: 900, direction: 'ltr', fontStyle: 'italic', letterSpacing: '-0.5px'}}><span style={{color: '#00afaa', fontSize: '1.1rem'}}>mada</span></div> },
                    { id: 'فيزا / ماستركارد', label: 'بطاقة ائتمان', icon: <div style={{display: 'flex', alignItems: 'center', gap: '4px'}}><div style={{color: '#1434CB', fontWeight: 900, fontStyle: 'italic', fontSize: '0.9rem', letterSpacing: '-0.5px'}}>VISA</div><div style={{display: 'flex', alignItems: 'center'}}><div style={{width:'12px',height:'12px',borderRadius:'50%',background:'#EB001B', position:'relative', zIndex:2}}></div><div style={{width:'12px',height:'12px',borderRadius:'50%',background:'#F79E1B', marginLeft:'-4px',opacity:0.9, position:'relative', zIndex:1}}></div></div></div> },
                    { id: 'تابي (Tabby)', label: 'تابي', icon: <div style={{ fontWeight: 900, fontSize: '1rem', letterSpacing: '-0.5px', color: '#000', background: '#3EEDB5', padding: '2px 6px', borderRadius: '4px', display: 'inline-block' }}>tabby</div> },
                    { id: 'تمارا (Tamara)', label: 'تمارا', icon: <div style={{ fontWeight: 900, color: '#f36968', fontSize: '1.1rem', letterSpacing: '-0.5px' }}>tamara</div> },
                    { id: 'Apple Pay', label: 'Apple Pay', icon: <div style={{display:'flex', alignItems:'center', gap:'2px', fontSize:'1.1rem', fontWeight:800}}><svg width="20" height="20" viewBox="0 0 384 512" fill="currentColor"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.3 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.3zM207.8 102.7c31.1-36.7 27.9-80.4 27.9-80.4-38 1.4-80.9 25.3-108.7 61-23.7 30.4-31.5 72.8-25.2 110.4 42.4 1.7 78.8-44.3 106-91z"/></svg><span style={{fontFamily:'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto'}}>Pay</span></div> },
                    { id: 'STC Pay', label: 'STC Pay', icon: <div style={{background: '#4f008c', color: 'white', fontWeight: 900, padding: '2px 6px', borderRadius: '4px', fontSize: '0.9rem', fontStyle: 'italic'}}>stc pay</div> },
                    { id: 'الدفع عند الاستلام', label: 'الدفع عند الاستلام', icon: <Truck size={20} color="#f59e0b" /> },
                  ].map(method => (
                    <label key={method.id} onClick={() => updateFormData({ paymentMethod: method.id })} style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                      padding: '1rem', border: '1.5px solid',
                      borderColor: formData.paymentMethod === method.id ? 'var(--primary)' : 'var(--border)',
                      borderRadius: '12px', cursor: 'pointer',
                      background: formData.paymentMethod === method.id ? 'var(--primary-lighter)' : 'var(--surface)',
                      transition: 'all 0.2s ease',
                      position: 'relative'
                    }}>
                      <div style={{ position: 'absolute', top: '8px', right: '8px' }}>
                        <div style={{ 
                          width: '16px', height: '16px', borderRadius: '50%', border: '2px solid', 
                          borderColor: formData.paymentMethod === method.id ? 'var(--primary)' : 'var(--border-strong)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: 'white'
                        }}>
                          {formData.paymentMethod === method.id && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)' }}></div>}
                        </div>
                      </div>
                      
                      <div style={{ height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                         {method.icon}
                      </div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)', textAlign: 'center' }}>{method.label}</div>
                    </label>
                  ))}
                </div>
              </div>

              {/* 3. الكوبون (تصميم مبسط جداً) */}
              <div className="checkout-card" style={{ padding: '1rem 1.5rem', borderRadius: '16px', border: '1px solid var(--border)', background: 'var(--surface)', boxShadow: 'var(--card-shadow)' }}>
                <button type="button" onClick={() => setShowCoupon(!showCoupon)} style={{
                  background: 'none', border: 'none', width: '100%', textAlign: 'right', color: 'var(--primary)',
                  fontWeight: 900, fontSize: '1rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 0
                }}>
                  <span>هل لديك كود خصم؟</span>
                  <span>{showCoupon ? '−' : '+'}</span>
                </button>
                
                {showCoupon && (
                  <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', animation: 'fadeIn 0.2s ease' }}>
                    <input 
                      type="text" 
                      placeholder="أدخل الكود هنا" 
                      value={discountCode} 
                      onChange={e => setDiscountCode(e.target.value)} 
                      style={{
                        flex: 1, padding: '0.8rem 1rem', background: 'var(--background)',
                        border: '1px solid var(--border)', borderRadius: '10px', 
                        color: 'var(--text-primary)', outline: 'none', fontWeight: 800, fontSize: '0.9rem', 
                        textTransform: 'uppercase'
                      }} 
                    />
                    <button type="button" onClick={() => applyDiscount()} style={{
                        padding: '0 1.2rem', background: 'var(--primary)', color: 'white',
                        border: 'none', borderRadius: '10px', fontWeight: 900, cursor: 'pointer', fontSize: '0.9rem'
                      }}>
                      تطبيق
                    </button>
                  </div>
                )}

                {!appliedDiscount && showCoupon && (
                  <button type="button" onClick={() => { setDiscountCode('SAUDI15'); setTimeout(() => applyDiscount(), 100); }} style={{
                    background: 'none', border: 'none', color: '#d97706', fontSize: '0.85rem', fontWeight: 700, padding: '0.4rem 0', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.5rem'
                  }}>
                    🎁 خصم 15% للطلب الأول - كود: SAUDI15
                  </button>
                )}
                
                {discountMsg && (
                  <div style={{ marginTop: '0.6rem', fontSize: '0.85rem', fontWeight: 800, color: discountStatus === 'success' ? '#10b981' : '#ef4444' }}>
                    {discountMsg}
                  </div>
                )}
                
                {appliedDiscount && cartPricing.couponDiscount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.6rem', fontSize: '0.9rem', fontWeight: 900, color: '#10b981' }}>
                    <span>✅ تم تطبيق الخصم:</span>
                    <span>- {cartPricing.couponDiscount?.toLocaleString()} ر.س</span>
                  </div>
                )}
              </div>

              {/* 4. الإجمالي */}
              <div className="checkout-card" style={{ 
                padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border)',
                background: 'var(--surface)', boxShadow: 'var(--card-shadow)'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: 700 }}>
                    <span>المجموع الفرعي ({cartItems.length} عناصر)</span>
                    <span style={{ color: 'var(--text-primary)' }}>{cartPricing.subtotal?.toLocaleString()} ر.س</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: 700 }}>
                    <span>رسوم الشحن</span>
                    <span style={{ color: shippingCost === 0 ? '#10b981' : 'var(--text-primary)', fontWeight: shippingCost === 0 ? 900 : 700 }}>
                      {shippingCost === 0 ? 'مجاني!' : `${shippingCost} ر.س`}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--text-primary)' }}>الإجمالي المطلوب</span>
                  <span style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--primary)' }}>{finalTotal?.toLocaleString()} <span style={{fontSize: '1rem'}}>ر.س</span></span>
                </div>
              </div>

              {/* Trust Signals */}
              <div style={{
                display: 'flex', justifyContent: 'space-around', gap: '0.5rem', marginTop: '1rem', 
                padding: '1.2rem', background: 'var(--surface)', borderRadius: '16px', border: '1px solid var(--border)',
                flexWrap: 'wrap'
              }}>
                <div style={{display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-secondary)'}}>
                  <span style={{fontSize: '1.2rem'}}>🔒</span> دفع آمن 100%
                </div>
                <div style={{display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-secondary)'}}>
                  <Truck size={18} color="var(--primary)" /> توصيل سريع
                </div>
                <div style={{display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-secondary)'}}>
                  <span style={{fontSize: '1.2rem'}}>🛡️</span> استرجاع مجاني
                </div>
              </div>

              {/* Space to ensure you can scroll past everything and see the bottom element unobstructed */}
              <div style={{ height: '180px' }}></div>
              
              {/* 5. زر الدفع الثابت */}
              <div style={{
                position: 'fixed', bottom: 0, left: 0, right: 0,
                padding: '0.8rem 1rem calc(0.8rem + env(safe-area-inset-bottom))',
                background: 'var(--surface)',
                borderTop: '1px solid var(--border)',
                zIndex: 99999, // Super high z-index to stay above everything
                zIndex: 999,
                boxShadow: '0 -4px 15px rgba(0,0,0,0.05)',
              }}>
                <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 700 }}>المجموع</span>
                    <span style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--primary)', lineHeight: 1 }}>{finalTotal?.toLocaleString()} <span style={{fontSize:'0.8rem'}}>ر.س</span></span>
                  </div>
                  <button type="submit" form="checkout-form" disabled={loading} className="btn-tap" style={{ 
                    flex: 1, padding: '1rem', 
                    background: checkoutState === 'failed' ? '#ea580c' : 'var(--primary)', color: 'white', 
                    border: 'none', borderRadius: '12px', fontSize: '1.1rem', fontWeight: 900, 
                    cursor: loading ? 'not-allowed' : 'pointer', 
                    boxShadow: checkoutState === 'failed' ? '0 4px 15px rgba(234, 88, 12, 0.3)' : '0 4px 12px rgba(37, 99, 235, 0.2)', 
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)', opacity: loading ? 0.7 : 1,
                    display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center'
                  }}>
                    {loading ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '18px', height: '18px', border: '3px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                        جاري التنفيذ...
                      </div>
                    ) : checkoutState === 'failed' ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        🔄 فشل الدفع — الدفع مجدداً
                      </div>
                    ) : `تأكيد الطلب`}
                  </button>
                </div>
              </div>

            </form>
            
            <style>{`
              @keyframes fadeInDown {
                from { opacity: 0; transform: translateY(-10px); }
                to { opacity: 1; transform: translateY(0); }
              }
              @keyframes shake {
                0%, 100% { transform: translateX(0); }
                25% { transform: translateX(-5px); }
                75% { transform: translateX(5px); }
              }
              @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
              }
              @keyframes spin {
                to { transform: rotate(360deg); }
              }
              @keyframes pulse {
                0% { box-shadow: 0 0 0 0 rgba(37,99,235,0.4); }
                70% { box-shadow: 0 0 0 6px rgba(37,99,235,0); }
                100% { box-shadow: 0 0 0 0 rgba(37,99,235,0); }
              }
              .input-error {
                animation: shake 0.3s ease-in-out;
              }
              .btn-tap:active {
                transform: scale(0.97);
              }
              details > summary::-webkit-details-marker {
                display: none;
              }
              /* Mobile adjustments to prevent keyboard overlay */
              @media (max-width: 768px) {
                input:focus, select:focus {
                  scroll-margin-top: 100px;
                }
              }
            `}</style>
          </div>
        )}
      </div>
    </main>
    </>
  );
}
