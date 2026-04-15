"use client";
import React, { useState } from 'react';
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
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', address: '', city: 'الرياض', paymentMethod: 'الدفع عند الاستلام' });

  // Discount logic
  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<any>(null);
  const [discountStatus, setDiscountStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [discountMsg, setDiscountMsg] = useState('');

  const [couponCode, setCouponCode] = useState('');

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
  const totalBeforeDiscount = cartPricing.totalBeforeDiscount;
  const discountAmount = cartPricing.couponDiscount;
  const finalTotal = cartPricing.finalTotal;

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) return;
    
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id || null;

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
        }),
      });

      const orderResult = await orderRes.json();

      if (!orderRes.ok || orderResult.error) {
        throw new Error(orderResult.error || "فشل في معالجة الطلب الآمن");
      }

      // Send Email Confirmation asynchronously
      try {
        await fetch('/api/email/order-confirmation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId: orderResult.orderId }),
        });
      } catch {}

      // Handle Payment Gateways Redirects (Moyasar 3D secure, STC Pay)
      if (orderResult.paymentResult?.redirectUrl) {
        window.location.href = orderResult.paymentResult.redirectUrl;
        return;
      }

      setSuccessOrderId(orderResult.orderId);
      clearCart();

    } catch (err: any) {
      console.error("Order Checkout Error:", err);
      // Fallback UI or strict notification
      alert(`عذراً، حدث خطأ أثناء تأكيد الطلب. ${err.message || ''}`);
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
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--background)' }}>
      <Navbar />
      
      <div style={{ maxWidth: '1200px', width: '100%', margin: '0 auto', padding: '6rem 2rem 4rem', flex: 1 }}>
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
          <div className="checkout-grid">
            
            {/* Form Section */}
            <form onSubmit={handleCheckout} style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
              
              <div className="glass-panel" style={{ 
                padding: '2.5rem', borderRadius: '24px', border: '1px solid var(--border)',
                background: 'var(--surface)', boxShadow: 'var(--card-shadow)'
              }}>
                <h3 style={{ fontSize: '1.6rem', fontWeight: 900, margin: '0 0 2rem', color: 'var(--text-primary)' }}>1. بيانات التوصيل</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', marginBottom: '0.6rem', color: 'var(--text-secondary)', fontWeight: 700, fontSize: '0.95rem' }}>الاسم بالكامل</label>
                    <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} type="text" style={{ 
                      width: '100%', padding: '1.2rem', background: 'var(--background)', 
                      border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--text-primary)', 
                      outline: 'none', fontWeight: 600, fontSize: '1rem', transition: '0.3s'
                    }} onFocus={e => e.currentTarget.style.borderColor = 'var(--primary)'} onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.6rem', color: 'var(--text-secondary)', fontWeight: 700, fontSize: '0.95rem' }}>رقم الجوال</label>
                    <input required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} type="tel" style={{ 
                      width: '100%', padding: '1.2rem', background: 'var(--background)', 
                      border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--text-primary)', 
                      outline: 'none', fontWeight: 600, fontSize: '1rem', transition: '0.3s', direction: 'ltr', textAlign: 'left'
                    }} onFocus={e => e.currentTarget.style.borderColor = 'var(--primary)'} onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.6rem', color: 'var(--text-secondary)', fontWeight: 700, fontSize: '0.95rem' }}>المدينة</label>
                    <select value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} style={{ 
                      width: '100%', padding: '1.2rem', background: 'var(--background)', 
                      border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--text-primary)', 
                      outline: 'none', fontWeight: 600, fontSize: '1rem', transition: '0.3s'
                    }} onFocus={e => e.currentTarget.style.borderColor = 'var(--primary)'} onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                      <option value="الرياض">الرياض</option>
                      <option value="جدة">جدة</option>
                      <option value="الدمام">الدمام</option>
                      <option value="مكة المكرمة">مكة المكرمة</option>
                      <option value="أخرى">أخرى...</option>
                    </select>
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', marginBottom: '0.6rem', color: 'var(--text-secondary)', fontWeight: 700, fontSize: '0.95rem' }}>العنوان التفصيلي</label>
                    <input required value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} type="text" placeholder="اسم الشارع، رقم المبنى، الحي" style={{ 
                      width: '100%', padding: '1.2rem', background: 'var(--background)', 
                      border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--text-primary)', 
                      outline: 'none', fontWeight: 600, fontSize: '1rem', transition: '0.3s'
                    }} onFocus={e => e.currentTarget.style.borderColor = 'var(--primary)'} onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'} />
                  </div>
                </div>
              </div>

              <div className="glass-panel" style={{ 
                padding: '2.5rem', borderRadius: '24px', border: '1px solid var(--border)',
                background: 'var(--surface)', boxShadow: 'var(--card-shadow)'
              }}>
                <h3 style={{ fontSize: '1.6rem', fontWeight: 900, margin: '0 0 2rem', color: 'var(--text-primary)' }}>2. طريقة الدفع</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  {[
                    { id: 'مدى', label: 'بطاقة مدى', desc: 'خصم مباشر من حسابك', icon: <div style={{display: 'flex', alignItems: 'center', fontWeight: 900, direction: 'ltr', fontStyle: 'italic', letterSpacing: '-0.5px'}}><span style={{color: '#00afaa', fontSize: '1.2rem'}}>mada</span></div> },
                    { id: 'فيزا / ماستركارد', label: 'Visa / Mastercard', desc: 'بطاقة ائتمانية', icon: <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}><div style={{color: '#1434CB', fontWeight: 900, fontStyle: 'italic', fontSize: '1.2rem', letterSpacing: '-0.5px'}}>VISA</div><div style={{display: 'flex', alignItems: 'center'}}><div style={{width:'16px',height:'16px',borderRadius:'50%',background:'#EB001B', position:'relative', zIndex:2}}></div><div style={{width:'16px',height:'16px',borderRadius:'50%',background:'#F79E1B', marginLeft:'-6px',opacity:0.9, position:'relative', zIndex:1}}></div></div></div> },
                    { id: 'تابي (Tabby)', label: 'تابي - قسطها على 4', desc: 'بدون فوائد أو رسوم', icon: <div style={{ fontWeight: 900, fontSize: '1.2rem', letterSpacing: '-1px', color: '#000', background: '#3EEDB5', padding: '2px 8px', borderRadius: '4px', display: 'inline-block' }}>tabby</div> },
                    { id: 'تمارا (Tamara)', label: 'تمارا - قسمها على 3', desc: 'حلول دفع مرنة', icon: <div style={{ fontWeight: 900, color: '#f36968', fontSize: '1.3rem', letterSpacing: '-0.5px' }}>tamara</div> },
                    { id: 'Apple Pay', label: 'Apple Pay', desc: 'ادفع بلمسة واحدة', icon: <div style={{display:'flex', alignItems:'center', gap:'2px', fontSize:'1.2rem', fontWeight:800}}><svg width="22" height="22" viewBox="0 0 384 512" fill="currentColor"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.3 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.3zM207.8 102.7c31.1-36.7 27.9-80.4 27.9-80.4-38 1.4-80.9 25.3-108.7 61-23.7 30.4-31.5 72.8-25.2 110.4 42.4 1.7 78.8-44.3 106-91z"/></svg><span style={{fontFamily:'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto'}}>Pay</span></div> },
                    { id: 'STC Pay', label: 'STC Pay', desc: 'محفظة STC الرقمية', icon: <div style={{background: '#4f008c', color: 'white', fontWeight: 900, padding: '2px 8px', borderRadius: '4px', fontSize: '1rem', fontStyle: 'italic'}}>stc pay</div> },
                    { id: 'الدفع عند الاستلام', label: 'الدفع عند الاستلام', desc: 'نقداً أو شبكة عند التسليم', icon: <Truck size={24} color="#f59e0b" /> },
                  ].map(method => (
                    <label key={method.id} style={{
                      display: 'flex', alignItems: 'center', gap: '1rem',
                      padding: '1.2rem', border: '2px solid',
                      borderColor: formData.paymentMethod === method.id ? 'var(--primary)' : 'var(--border)',
                      borderRadius: '16px', cursor: 'pointer',
                      background: formData.paymentMethod === method.id ? 'rgba(244, 63, 94, 0.05)' : 'var(--background)',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      boxShadow: formData.paymentMethod === method.id ? '0 8px 20px rgba(244, 63, 94, 0.1)' : 'none',
                      transform: formData.paymentMethod === method.id ? 'translateY(-2px)' : 'translateY(0)'
                    }}>
                      <input type="radio" name="payment" checked={formData.paymentMethod === method.id}
                        onChange={() => setFormData({ ...formData, paymentMethod: method.id })}
                        style={{ accentColor: 'var(--primary)', transform: 'scale(1.3)' }} />
                      <span style={{ color: formData.paymentMethod === method.id ? 'var(--primary)' : 'var(--text-secondary)' }}>{method.icon}</span>
                      <div>
                        <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                          {method.label}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{method.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              
              <button type="submit" disabled={loading} style={{ 
                padding: '1.8rem', background: 'var(--primary)', color: 'white', 
                border: 'none', borderRadius: '18px', fontSize: '1.4rem', fontWeight: 900, 
                cursor: loading ? 'not-allowed' : 'pointer', 
                boxShadow: '0 12px 30px rgba(244, 63, 94, 0.3)', 
                transition: 'all 0.3s', opacity: loading ? 0.7 : 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem'
              }} onMouseOver={e=>!loading && (e.currentTarget.style.transform='translateY(-3px)')} onMouseOut={e=>!loading && (e.currentTarget.style.transform='translateY(0)')}>
                {loading ? 'جاري تأكيد الطلب الآمن...' : `تأكيد الطلب ودفع ${finalTotal?.toLocaleString()} ر.س`}
              </button>

            </form>

            {/* Order Summary Sidebar */}
            <div style={{ position: 'sticky', top: '100px' }}>
              <div className="glass-panel" style={{ 
                padding: '2.5rem', borderRadius: '24px', border: '1px solid var(--border)', 
                background: 'var(--surface)', boxShadow: 'var(--card-shadow)'
              }}>
                <h3 style={{ margin: '0 0 2rem', fontSize: '1.5rem', fontWeight: 900, textAlign: 'center', color: 'var(--text-primary)' }}>ملخص الطلب</h3>
                
                <div style={{ 
                  display: 'flex', flexDirection: 'column', gap: '1.2rem', maxHeight: '400px', 
                  overflowY: 'auto', paddingRight: '0.8rem', marginBottom: '2rem', 
                  borderBottom: '1px solid var(--border)', paddingBottom: '2rem' 
                }} className="scrollbar-hide">
                  {cartItems.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '1.2rem', alignItems: 'center' }}>
                      <img src={item.image || 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=100&q=80'} alt={item.name} style={{ width: '70px', height: '70px', borderRadius: '14px', objectFit: 'cover', border: '1px solid var(--border)' }} />
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: '0 0 0.4rem', fontSize: '1rem', lineHeight: 1.4, fontWeight: 800, color: 'var(--text-primary)' }}>{item.name}</h4>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 700 }}>×{item.quantity}</div>
                      </div>
                      <div style={{ fontWeight: 900, color: 'var(--text-primary)', fontSize: '1.1rem' }}>{item.price?.toLocaleString()}</div>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.2rem', fontSize: '1.1rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  <span>المجموع الفرعي</span>
                  <span style={{ color: 'var(--text-primary)' }}>{cartPricing.subtotal?.toLocaleString()} ر.س</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.2rem', fontSize: '1.1rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  <span>تكلفة الشحن</span>
                  <span style={{ color: shippingCost === 0 ? 'var(--success)' : 'var(--text-primary)', fontWeight: shippingCost === 0 ? 900 : 600 }}>
                    {shippingCost === 0 ? 'مجاني!' : `${shippingCost} ر.س`}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', fontSize: '1.1rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  <span>ضريبة القيمة المضافة (15%)</span>
                  <span style={{ color: 'var(--text-primary)' }}>{cartPricing.vat?.toLocaleString()} ر.س</span>
                </div>

                {/* --- VIP Discount Coupon Section --- */}
                <div style={{ 
                  marginBottom: '1.5rem',
                  position: 'relative', overflow: 'hidden',
                  borderRadius: '18px',
                }}>
                  {/* Coupon outer glow */}
                  <div style={{
                    position: 'absolute', inset: '-1px',
                    borderRadius: '19px',
                    background: 'linear-gradient(135deg, rgba(244,63,94,0.5) 0%, rgba(251,146,60,0.3) 50%, rgba(244,63,94,0.5) 100%)',
                    backgroundSize: '200% 200%',
                    animation: 'couponBorderShimmer 3s ease-in-out infinite',
                    zIndex: 0,
                  }} />
                  
                  <div style={{
                    position: 'relative', zIndex: 1,
                    background: 'linear-gradient(135deg, #1a0a0f 0%, #150812 50%, #12070e 100%)',
                    borderRadius: '17px',
                    overflow: 'hidden',
                  }}>
                    {/* Subtle inner glow top */}
                    <div style={{
                      position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
                      background: 'linear-gradient(90deg, transparent, rgba(244,63,94,0.8), rgba(251,146,60,0.6), transparent)',
                    }} />
                    
                    {/* Background texture */}
                    <div style={{
                      position: 'absolute', inset: 0,
                      backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(244,63,94,0.04) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(251,146,60,0.03) 0%, transparent 50%)',
                    }} />

                    {/* Perforations left */}
                    <div style={{ position: 'absolute', right: '0', top: '50%', transform: 'translateY(-50%)', width: '14px', height: '28px', background: 'var(--surface)', borderRadius: '14px 0 0 14px', zIndex: 2 }} />
                    <div style={{ position: 'absolute', left: '0', top: '50%', transform: 'translateY(-50%)', width: '14px', height: '28px', background: 'var(--surface)', borderRadius: '0 14px 14px 0', zIndex: 2 }} />

                    {/* Dotted divider */}
                    <div style={{
                      position: 'absolute', top: '50%', left: '14px', right: '14px',
                      borderTop: '1px dashed rgba(244,63,94,0.2)',
                      display: 'none',
                    }} />

                    <div style={{ padding: '1.3rem 1.5rem', position: 'relative', zIndex: 1 }}>
                      {/* Header row */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', marginBottom: '1rem' }}>
                        <div style={{
                          width: '34px', height: '34px', borderRadius: '10px', flexShrink: 0,
                          background: 'linear-gradient(135deg, rgba(244,63,94,0.2), rgba(251,146,60,0.15))',
                          border: '1px solid rgba(244,63,94,0.3)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem',
                          boxShadow: '0 4px 12px rgba(244,63,94,0.15)',
                        }}>🎫</div>
                        <div>
                          <div style={{ fontWeight: 900, fontSize: '0.92rem', color: '#fde8ec', letterSpacing: '0.3px' }}>كود خصم حصري</div>
                          <div style={{ fontSize: '0.72rem', color: 'rgba(253,232,236,0.45)', fontWeight: 600 }}>أدخل كودك واحصل على خصم فوري</div>
                        </div>
                        <div style={{ marginRight: 'auto' }}>
                          <div style={{
                            padding: '0.2rem 0.7rem', borderRadius: '100px', fontSize: '0.65rem', fontWeight: 800,
                            background: 'rgba(244,63,94,0.12)', border: '1px solid rgba(244,63,94,0.25)',
                            color: '#f43f5e', letterSpacing: '0.5px', textTransform: 'uppercase',
                          }}>VIP</div>
                        </div>
                      </div>

                      {/* Input row */}
                      <div style={{ display: 'flex', gap: '0.6rem' }}>
                        <div style={{ position: 'relative', flex: 1 }}>
                          <input 
                            type="text" placeholder="SAUDI15" 
                            value={discountCode} onChange={e => setDiscountCode(e.target.value)} 
                            style={{
                              width: '100%', padding: '0.9rem 1rem 0.9rem 2.8rem',
                              background: 'rgba(255,255,255,0.04)',
                              border: '1.5px solid rgba(244,63,94,0.2)', borderRadius: '12px', 
                              color: '#fde8ec',
                              outline: 'none', fontWeight: 800, fontSize: '0.95rem', 
                              letterSpacing: '3px', textTransform: 'uppercase', 
                              transition: 'all 0.3s',
                              caretColor: '#f43f5e',
                            }} 
                            onFocus={e => { e.currentTarget.style.borderColor = 'rgba(244,63,94,0.6)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(244,63,94,0.08)'; }} 
                            onBlur={e => { e.currentTarget.style.borderColor = 'rgba(244,63,94,0.2)'; e.currentTarget.style.boxShadow = 'none'; }} 
                          />
                          <span style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', fontSize: '1rem', opacity: 0.5 }}>🏷️</span>
                        </div>
                        <button 
                          type="button" onClick={() => applyDiscount()} 
                          style={{
                            flexShrink: 0,
                            padding: '0.9rem 1.3rem', 
                            background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 50%, #c01038 100%)', 
                            color: 'white',
                            border: 'none', borderRadius: '12px', fontWeight: 900, cursor: 'pointer',
                            transition: 'all 0.3s', fontSize: '0.88rem',
                            boxShadow: '0 4px 16px rgba(244,63,94,0.3)',
                            whiteSpace: 'nowrap', letterSpacing: '0.3px',
                          }}
                          onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(244,63,94,0.45)'; e.currentTarget.style.filter = 'brightness(1.1)'; }}
                          onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(244,63,94,0.3)'; e.currentTarget.style.filter = 'brightness(1)'; }}
                        >
                          تطبيق ✓
                        </button>
                      </div>
                      
                      {discountMsg && (
                        <div style={{ 
                          marginTop: '0.9rem', padding: '0.8rem 1rem', borderRadius: '12px', 
                          fontSize: '0.85rem', fontWeight: 800, textAlign: 'center',
                          background: discountStatus === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(244,63,94,0.08)',
                          color: discountStatus === 'success' ? '#10b981' : '#f87171',
                          border: discountStatus === 'success' ? '1px solid rgba(16,185,129,0.25)' : '1px solid rgba(244,63,94,0.2)',
                          animation: 'fadeInUp 0.3s ease',
                          backdropFilter: 'blur(10px)',
                        }}>
                          {discountMsg}
                        </div>
                      )}
                    </div>

                    {/* Bottom hint row */}
                    <div style={{
                      padding: '0.8rem 1.5rem',
                      borderTop: '1px solid rgba(244,63,94,0.08)',
                      display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.8rem',
                      background: 'rgba(244,63,94,0.03)',
                    }}>
                      <span style={{ fontSize: '0.8rem', color: 'rgba(244,100,120,0.8)', fontWeight: 800 }}>💡 كوبونات سريعة:</span>
                      <button 
                        type="button"
                        onClick={() => {
                          setDiscountCode('SAUDI15');
                          applyDiscount('SAUDI15');
                        }}
                        style={{
                          background: 'rgba(244,63,94,0.15)',
                          border: '1px dashed rgba(244,63,94,0.4)',
                          color: '#f43f5e',
                          padding: '0.4rem 0.8rem',
                          borderRadius: '8px',
                          fontWeight: 900,
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                          transition: '0.2s'
                        }}
                      >
                        SAUDI15 (خصم 15%)
                      </button>
                    </div>
                  </div>
                </div>
                <style>{`
                  @keyframes couponBorderShimmer {
                    0%, 100% { background-position: 0% 50%; opacity: 0.7; }
                    50% { background-position: 100% 50%; opacity: 1; }
                  }
                `}</style>

                {appliedDiscount && cartPricing.couponDiscount > 0 && (
                  <div style={{ 
                    display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', 
                    fontSize: '1.1rem', fontWeight: 800,
                    padding: '1rem', borderRadius: '12px',
                    background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)',
                  }}>
                    <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      ✅ الخصم المطبق
                      {appliedDiscount.discount_type === 'percent' ? ` (${appliedDiscount.discount_value || appliedDiscount.discount_percent}%)` : ''}
                    </span>
                    <span style={{ color: '#10b981' }}>- {cartPricing.couponDiscount?.toLocaleString()} ر.س</span>
                  </div>
                )}

                {/* --------------------------- */}
                {shippingCost > 0 && (
                  <div style={{ 
                    fontSize: '0.85rem', color: 'var(--primary)', marginBottom: '2rem', 
                    textAlign: 'center', background: 'rgba(244, 63, 94, 0.08)', 
                    padding: '0.8rem', borderRadius: '12px', fontWeight: 800, border: '1px solid rgba(244, 63, 94, 0.1)'
                  }}>
                    أضف منتجات بقيمة {(500 - cartPricing.subtotal)?.toLocaleString()} ر.س إضافية للحصول على شحن مجاني!
                  </div>
                )}
                
                <div style={{ 
                  display: 'flex', justifyContent: 'space-between', borderTop: '2px solid var(--border)', 
                  paddingTop: '2rem', fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.5px'
                }}>
                  <span>الإجمالي</span>
                  <span style={{ color: 'var(--primary)' }}>{finalTotal?.toLocaleString()} ر.س</span>
                </div>
                
                <div style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', gap: '0.8rem', justifyContent: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>
                  <Truck size={16} /> توصيل آمن وموثوق خلال 48 ساعة
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </main>
  );
}
