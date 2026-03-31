"use client";
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import { useCart } from '@/context/CartContext';
import { supabase } from '@/lib/supabase';
import { PartyPopper, CreditCard, Truck, Smartphone } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function CheckoutPage() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const [successOrderId, setSuccessOrderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', address: '', city: 'الرياض', paymentMethod: 'الدفع عند الاستلام' });

  // Discount logic
  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);

  const applyDiscount = () => {
    if (discountCode.trim().toUpperCase() === 'SAUDI15') {
       setAppliedDiscount(0.15); // 15% discount
       alert('🎉 تم تطبيق خصم الترحيب بنجاح! تم خصم 15% من المجموع.');
    } else {
       setAppliedDiscount(0);
       alert('❌ كود الخصم غير صحيح أو منتهي الصلاحية.');
    }
  };

  // Shipping cost logic
  const shippingCost = cartTotal > 500 ? 0 : 35; // Free shipping over 500 SAR
  const discountAmount = Math.round(cartTotal * appliedDiscount); // Exact rounded number
  const finalTotal = cartTotal - discountAmount + shippingCost;

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) return;
    
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id || null; // Will act as guest if not logged in

      // 1. Insert Order (Fallback to Client-side temporarily till DB admin creates RPC)
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: userId,
          total: finalTotal,
          status: 'قيد المراجعة',
          shipping_address: `${formData.city} - ${formData.address}`,
          payment_method: formData.paymentMethod
        })
        .select()
        .single();

      if (orderError) {
        throw new Error(orderError.message || "Failed to create order");
      }

      // 2. Insert Order Items safely
      if (orderData) {
        const orderItemsData = cartItems.map(item => {
          const rate = 0.10; // 10% commission
          const gross = item.price;
          const fee = gross * rate;
          const net = gross - fee;

          return {
            order_id: orderData.id,
            product_id: item.id,
            product_name: item.name,
            product_image: item.image,
            quantity: item.quantity,
            price: item.price
          };
        });

        const { error: itemsError } = await supabase.from('order_items').insert(orderItemsData);
        if (itemsError) throw itemsError;
      }
      
      // Notify Admin Board safely
      await supabase.from('admin_notifications').insert({
        type: 'NEW_ORDER',
        title: 'طلب جديد',
        message: `طلب مبدئي بقيمة ${finalTotal} ر.س تم استلامه من ${formData.name}.`
      });

      setSuccessOrderId(orderData.id);
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
                  <span style={{ color: 'var(--text-primary)' }}>{cartTotal?.toLocaleString()} ر.س</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', fontSize: '1.1rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  <span>تكلفة الشحن</span>
                  <span style={{ color: shippingCost === 0 ? 'var(--success)' : 'var(--text-primary)', fontWeight: shippingCost === 0 ? 900 : 600 }}>
                    {shippingCost === 0 ? 'مجاني!' : `${shippingCost} ر.س`}
                  </span>
                </div>

                {/* --- Discount Code Section --- */}
                <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.5rem' }}>
                  <input type="text" placeholder="أدخل كود الخصم" value={discountCode} onChange={e => setDiscountCode(e.target.value)} style={{
                    flex: 1, padding: '0.8rem 1rem', background: 'var(--background)',
                    border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--text-primary)',
                    outline: 'none', fontWeight: 600, fontSize: '0.95rem'
                  }} onFocus={e => e.currentTarget.style.borderColor = 'var(--primary)'} onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'} />
                  
                  <button type="button" onClick={applyDiscount} style={{
                    padding: '0.8rem 1.2rem', background: 'rgba(255,255,255,0.05)', color: 'white',
                    border: '1px solid var(--border)', borderRadius: '12px', fontWeight: 800, cursor: 'pointer',
                    transition: '0.3s'
                  }} onMouseOver={e=>{e.currentTarget.style.background='var(--primary)'; e.currentTarget.style.borderColor='var(--primary)';}} onMouseOut={e=>{e.currentTarget.style.background='rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor='var(--border)';}}>
                    تطبيق
                  </button>
                </div>

                {appliedDiscount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', fontSize: '1.1rem', color: 'var(--primary)', fontWeight: 800 }}>
                    <span>الخصم المطبق (15%)</span>
                    <span>- {discountAmount?.toLocaleString()} ر.س</span>
                  </div>
                )}
                {/* --------------------------- */}
                {shippingCost > 0 && (
                  <div style={{ 
                    fontSize: '0.85rem', color: 'var(--primary)', marginBottom: '2rem', 
                    textAlign: 'center', background: 'rgba(244, 63, 94, 0.08)', 
                    padding: '0.8rem', borderRadius: '12px', fontWeight: 800, border: '1px solid rgba(244, 63, 94, 0.1)'
                  }}>
                    أضف منتجات بقيمة {(500 - cartTotal)?.toLocaleString()} ر.س إضافية للحصول على شحن مجاني!
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
