"use client";
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import { supabase } from '@/lib/supabase';
import { useCart } from '@/context/CartContext';
import { useProducts } from '@/context/ProductsContext';
import { Product } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import ProductCard from '@/components/ProductCard';
import { Frown, Flame, ShoppingCart, Star, Package, Truck, Lock, CreditCard, Landmark, Smartphone, Globe, ShieldCheck, RefreshCw, Send, MessageSquare, Bell } from 'lucide-react';
import { saveRecentlyViewed } from '@/components/RecentlyViewed';

export default function ProductDetailsClient({ id }: { id: string }) {
  const { products } = useProducts();
  const { addToCart } = useCart();
  const { user, openLoginModal } = useAuth();
  const { addToast } = useToast();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [sellerProfile, setSellerProfile] = useState<any>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState<any[]>([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [userReview, setUserReview] = useState<any>(null);
  const [notifyMeStatus, setNotifyMeStatus] = useState<'idle' | 'loading' | 'done' | 'already'>('idle');

  useEffect(() => {
    async function fetchProductDetails() {
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
        setLoading(false);
        return;
      }

      // 1. Instantly check local cache to show UI immediately if possible
      const localMatch = products.find(p => p.id === id);
      if (localMatch) {
        setProduct(localMatch);
        setRelated(products.filter(p => p.category === localMatch.category && p.id !== id).slice(0, 4));
        setLoading(false); // Instant UI rendering!
      }

      try {
        const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
        if (data) {
          setProduct({
            id: data.id,
            name: data.name,
            brand: data.brand || '',
            category: data.category || 'أخرى',
            price: Number(data.price),
            oldPrice: data.old_price ? Number(data.old_price) : undefined,
            condition: data.condition || 'جديد',
            stock: data.stock || 'متوفر',
            shipping: data.shipping || 'عادي',
            rating: data.rating || 0,
            reviews: data.reviews_count || 0,
            image: data.image_url || 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=500&q=80',
            color: 'var(--border)',
            stock_quantity: data.stock_quantity ?? 0,
          });
          
          setLoading(false); // Ensure UI unblocks once we have the product!

          // Fetch Related Products and Seller Profile in PARALLEL silently
          const pRelated = supabase.from('products').select('*').eq('category', data.category).neq('id', id).limit(4);
          const pProfile = data.seller_id ? supabase.from('profiles').select('full_name, business_name, cr_number').eq('id', data.seller_id).single() : Promise.resolve({ data: null });

          const [relRes, profRes] = await Promise.all([pRelated, pProfile]);

          if (relRes.data) {
            setRelated(relRes.data.map((d: any) => ({
              id: d.id, name: d.name, brand: d.brand || '', category: d.category || '',
              price: Number(d.price), oldPrice: d.old_price ? Number(d.old_price) : undefined,
              condition: d.condition || 'جديد', stock: d.stock || 'متوفر', shipping: d.shipping || 'عادي',
              rating: d.rating || 0, reviews: d.reviews_count || 0, image: d.image_url || '', color: 'var(--border)'
            })));
          }

          if (profRes.data) {
            setSellerProfile(profRes.data);
          }
        } else if (!localMatch) {
          // If no data and no local match
          setLoading(false);
        }
      } catch (e) {
        console.error("Error fetching detail:", e);
        setLoading(false);
      }
    }
    
    // Only run if products has been loaded (to allow instant cache lookup) 
    // OR if products context isn't running
    fetchProductDetails();
  }, [id]);

  // Fetch reviews
  useEffect(() => {
    if (!id) return;
    supabase.from('reviews').select('*').eq('product_id', id).order('created_at', { ascending: false }).then(({ data }) => {
      if (data) {
        setReviews(data);
        if (user) {
          const mine = data.find((r: any) => r.user_id === user.id);
          if (mine) setUserReview(mine);
        }
      }
    });
  }, [id, user]);

  const handleSubmitReview = async () => {
    if (!user) { openLoginModal(); return; }
    if (!newReview.comment.trim()) { addToast('اكتب تعليقك أولاً', 'error'); return; }
    setSubmittingReview(true);
    try {
      const profileRes = await supabase.from('profiles').select('full_name').eq('id', user.id).single();
      const { data, error } = await supabase.from('reviews').insert([{
        product_id: id, user_id: user.id, rating: newReview.rating,
        comment: newReview.comment, user_name: profileRes.data?.full_name || user.email?.split('@')[0] || 'مستخدم',
        is_verified_purchase: true
      }]).select().single();
      if (error) {
        if (error.code === '23505') addToast('لقد قمت بتقييم هذا المنتج مسبقاً', 'info');
        else throw error;
      } else {
        setReviews(prev => [data, ...prev]);
        setUserReview(data);
        setNewReview({ rating: 5, comment: '' });
        addToast('تم إضافة تقييمك بنجاح! شكراً لك 🌟', 'success');
      }
    } catch (e: any) { addToast('حدث خطأ أثناء إرسال التقييم', 'error'); }
    finally { setSubmittingReview(false); }
  };

  const avgRating = reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : '0';

  // Save to recently viewed
  useEffect(() => {
    if (product) {
      saveRecentlyViewed({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
      });
    }
  }, [product]);

  if (loading) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ fontSize: '1.5rem', color: 'var(--text-secondary)', animation: 'pulse 1.5s infinite' }}>جاري تحميل التفاصيل...</div>
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ marginBottom: '1.5rem' }}><Frown size={64} color="var(--primary)" /></div>
          <h1 style={{ fontSize: '3rem', margin: '0 0 1rem' }}>المنتج غير موجود</h1>
          <p style={{ color: 'var(--text-secondary)' }}>تأكد من الرابط الصحيح أو ربما تم حذف هذا المنتج.</p>
          <a href="/products" style={{ marginTop: '2rem', padding: '1rem 2rem', background: 'var(--primary)', color: 'white', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold' }}>العودة لتصفح المنتجات</a>
        </div>
      </main>
    );
  }

  const maxQty = product.stock_quantity ?? 999;
  const isOutOfStock = product.stock !== 'متوفر' || maxQty <= 0;

  const handleAddToCart = () => {
    if (isOutOfStock) {
      addToast('هذا المنتج غير متوفر حالياً', 'error');
      return;
    }
    if (!user) {
      addToast('يرجى تسجيل الدخول أولاً لإضافة منتجات إلى السلة', 'info');
      openLoginModal();
      return;
    }
    if (quantity > maxQty) {
      addToast(`متبقي ${maxQty} قطع فقط من هذا المنتج`, 'error');
      setQuantity(maxQty);
      return;
    }

    for (let i = 0; i < quantity; i++) {
        addToCart({ id: product.id, name: product.name, price: product.price, brand: product.brand, image: product.image, category: product.category });
    }
    addToast(`تم إضافة ${quantity} قطعة من ${product.name} إلى السلة`, 'success');
  };

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      
      <div className="product-detail-container" style={{ maxWidth: '1200px', width: '100%', margin: '0 auto', padding: '6rem 2rem 4rem', flex: 1 }}>
        <div className="product-detail-breadcrumb" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '3rem' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            <a href="/" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>الرئيسية</a> 
            <span style={{ margin: '0 0.5rem' }}>&gt;</span>
            <a href="/products" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>قطع الغيار</a> 
            <span style={{ margin: '0 0.5rem' }}>&gt;</span>
            <span style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>{product.category}</span>
          </div>
        </div>

        <div className="product-detail-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'start', marginBottom: '6rem' }}>
          
          {/* Main Image Gallery */}
          <div className="product-detail-image" style={{ background: 'var(--surface-hover)', borderRadius: '24px', padding: '2rem', border: '1px solid var(--border)', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '500px', position: 'relative' }}>
            <Image src={product.image} alt={product.name} fill sizes="(max-width: 768px) 100vw, 50vw" style={{ objectFit: 'contain', mixBlendMode: 'screen', filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.5))' }} priority />
          </div>

          {/* Product Info */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            
            <div style={{ display: 'inline-block', padding: '0.4rem 1rem', background: 'rgba(0,0,0,0.03)', borderRadius: '20px', fontSize: '0.9rem', width: 'fit-content', border: '1px solid var(--border)', marginBottom: '1rem' }}>
              ماركة: <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>{product.brand}</span>
            </div>
            
            <h1 className="product-detail-title" style={{ fontSize: '2.5rem', margin: '0 0 1rem', lineHeight: 1.3 }}>{product.name}</h1>
            
            {/* Merchant Info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'var(--surface)', borderRadius: '16px', border: '1px solid var(--border)', marginBottom: '1.5rem', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
               <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981', fontWeight: 900, fontSize: '1.3rem' }}>
                  {sellerProfile ? (sellerProfile.business_name || sellerProfile.full_name)?.charAt(0) : 'B'}
               </div>
               <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
                    <span style={{ fontWeight: 900, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                      {sellerProfile ? (sellerProfile.business_name || sellerProfile.full_name) : 'Booga Car'}
                    </span>
                    {((sellerProfile && sellerProfile.cr_number) || !sellerProfile) && (
                      <div title="متجر موثق" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#10b981', borderRadius: '50%', width: '18px', height: '18px' }}>
                         <ShieldCheck size={12} color="white" />
                      </div>
                    )}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {((sellerProfile && sellerProfile.cr_number) || !sellerProfile) ? (
                      <span style={{ color: '#10b981', fontWeight: 800 }}>تاجر موثق بمنصة الأعمال</span>
                    ) : (
                      <span style={{ fontWeight: 600 }}>بائع مستقل</span>
                    )}
                  </div>
               </div>
            </div>

            {/* Removed Urgency Box for cleaner aesthetic */}
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#FFD700', fontSize: '1.2rem' }}>
                <Star size={18} fill="#FFD700" /> {product.rating} 
              </div>
              <span style={{ color: 'var(--text-secondary)' }}>(تستند إلى {product.reviews} تقييم)</span>
              <span style={{ color: 'var(--border)' }}>|</span>
              <span style={{ color: isOutOfStock ? '#e63946' : '#8ac926', fontWeight: 'bold' }}>
                {isOutOfStock ? '× نفذت الكمية' : maxQty <= 5 ? `✓ متبقي ${maxQty} فقط!` : '✓ متوفر بالمخزن'}
              </span>
            </div>

            <div className="product-detail-price" style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem', marginBottom: '3rem' }}>
              <div style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--primary)', lineHeight: 1 }}>
                {product.price} <span style={{ fontSize: '1.2rem', fontWeight: 'normal' }}>ر.س</span>
              </div>
              {product.oldPrice && (
                <div style={{ fontSize: '1.5rem', color: 'var(--text-secondary)', textDecoration: 'line-through', marginBottom: '0.4rem' }}>
                  {product.oldPrice} ر.س
                </div>
              )}
            </div>

            {/* Badges / Condition */}
            <div className="product-detail-badges" style={{ display: 'flex', gap: '1rem', marginBottom: '3rem' }}>
               <div style={{ flex: 1, padding: '1rem', background: 'rgba(0,0,0,0.02)', border: '1px solid var(--border)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                 <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Package size={32} color="var(--primary)" /></div>
                 <div>
                   <h4 style={{ margin: '0 0 0.3rem', color: 'var(--text-primary)' }}>حالة القطعة</h4>
                   <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.95rem' }}>{product.condition}</p>
                 </div>
               </div>
               <div style={{ flex: 1, padding: '1rem', background: 'rgba(0,0,0,0.02)', border: '1px solid var(--border)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                 <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Truck size={32} color="var(--primary)" /></div>
                 <div>
                   <h4 style={{ margin: '0 0 0.3rem', color: 'var(--text-primary)' }}>الشحن</h4>
                   <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.95rem' }}>{product.shipping === 'مجاني' ? 'شحن سريع ومجاني' : 'يتم احتساب التوصيل عند الدفع'}</p>
                 </div>
               </div>
            </div>
            {/* ─── Urgency Badges ─── */}
            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
              {!isOutOfStock && maxQty <= 5 && maxQty > 0 && (
                <span style={{
                  background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444',
                  padding: '0.4rem 0.8rem', borderRadius: '8px',
                  fontSize: '0.82rem', fontWeight: 800,
                  display: 'flex', alignItems: 'center', gap: '0.3rem',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                }}>
                  🔥 متبقي {maxQty} فقط!
                </span>
              )}
              {product.rating >= 4 && (
                <span style={{
                  background: 'rgba(212, 175, 55, 0.1)', color: '#D4AF37',
                  padding: '0.4rem 0.8rem', borderRadius: '8px',
                  fontSize: '0.82rem', fontWeight: 800,
                  display: 'flex', alignItems: 'center', gap: '0.3rem',
                  border: '1px solid rgba(212, 175, 55, 0.2)',
                }}>
                  ⭐ الأكثر مبيعاً
                </span>
              )}
              {product.shipping === 'مجاني' && (
                <span style={{
                  background: 'rgba(16, 185, 129, 0.1)', color: '#10b981',
                  padding: '0.4rem 0.8rem', borderRadius: '8px',
                  fontSize: '0.82rem', fontWeight: 800,
                  display: 'flex', alignItems: 'center', gap: '0.3rem',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                }}>
                  🚚 شحن مجاني
                </span>
              )}
            </div>

            {/* Actions — Desktop */}
            <div className="product-detail-actions-desktop" style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden', height: '54px' }}>
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} style={{ padding: '0 1.2rem', background: 'rgba(0,0,0,0.03)', color: 'var(--text-primary)', border: 'none', borderRight: '1px solid var(--border)', cursor: 'pointer', fontSize: '1.2rem', height: '100%' }}>-</button>
                <div style={{ padding: '0 1.5rem', fontSize: '1.1rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', background: 'var(--surface-hover)' }}>{quantity}</div>
                <button onClick={() => setQuantity(Math.min(maxQty, quantity + 1))} disabled={quantity >= maxQty} style={{ padding: '0 1.2rem', background: 'rgba(0,0,0,0.03)', color: quantity >= maxQty ? 'var(--text-secondary)' : 'var(--text-primary)', border: 'none', borderLeft: '1px solid var(--border)', cursor: quantity >= maxQty ? 'not-allowed' : 'pointer', fontSize: '1.2rem', height: '100%', opacity: quantity >= maxQty ? 0.4 : 1 }}>+</button>
              </div>

              <button 
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                style={{
                  flex: 1, height: '54px', background: !isOutOfStock ? 'var(--primary)' : 'var(--surface-hover)', 
                  color: !isOutOfStock ? '#fff' : 'var(--text-secondary)', border: 'none', borderRadius: '12px', cursor: !isOutOfStock ? 'pointer' : 'not-allowed', 
                  fontWeight: 900, fontSize: '1rem', transition: 'all 0.2s', boxShadow: !isOutOfStock ? '0 8px 20px rgba(37, 99, 235, 0.3)' : 'none',
                  opacity: !isOutOfStock ? 1 : 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                }}
              >
                <ShoppingCart size={18} />
                {!isOutOfStock ? `أضف للسلة · ${(product.price * quantity).toLocaleString()} ر.س` : 'غير متوفر حالياً'}
              </button>

              {/* Buy Now — Direct Checkout */}
              {!isOutOfStock && (
                <button
                  onClick={() => {
                    handleAddToCart();
                    window.location.href = '/checkout';
                  }}
                  style={{
                    height: '54px', padding: '0 2rem',
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    color: '#fff', border: 'none', borderRadius: '12px',
                    fontWeight: 900, fontSize: '1rem', cursor: 'pointer',
                    boxShadow: '0 8px 20px rgba(16, 185, 129, 0.3)',
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    transition: 'all 0.2s',
                  }}
                >
                  ⚡ اشتري الآن
                </button>
              )}
            </div>

            {/* Notify Me — for out of stock */}
            {isOutOfStock && (
              <div style={{ marginTop: '1rem' }}>
                <button
                  onClick={async () => {
                    if (!user) { openLoginModal(); return; }
                    setNotifyMeStatus('loading');
                    const { error } = await supabase.from('stock_waitlist').insert({
                      product_id: product.id,
                      user_id: user.id,
                      email: user.email,
                    });
                    if (error?.code === '23505') {
                      setNotifyMeStatus('already');
                      addToast('أنت مسجل بالفعل — سنبلغك لما يتوفر ✓', 'success');
                    } else if (!error) {
                      setNotifyMeStatus('done');
                      addToast('تم! سنبلغك لما يتوفر المنتج 🔔', 'success');
                    } else {
                      setNotifyMeStatus('idle');
                      addToast('حدث خطأ، حاول مرة أخرى', 'error');
                    }
                  }}
                  disabled={notifyMeStatus === 'loading' || notifyMeStatus === 'done' || notifyMeStatus === 'already'}
                  style={{
                    width: '100%', padding: '1rem', borderRadius: '12px',
                    background: notifyMeStatus === 'done' || notifyMeStatus === 'already' ? 'rgba(16,185,129,0.1)' : 'rgba(59,130,246,0.08)',
                    border: `1px solid ${notifyMeStatus === 'done' || notifyMeStatus === 'already' ? 'rgba(16,185,129,0.2)' : 'rgba(59,130,246,0.2)'}`,
                    color: notifyMeStatus === 'done' || notifyMeStatus === 'already' ? '#10b981' : '#3b82f6',
                    fontWeight: 900, fontSize: '1rem', cursor: notifyMeStatus !== 'idle' ? 'default' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                    transition: 'all 0.2s',
                  }}
                >
                  <Bell size={18} />
                  {notifyMeStatus === 'done' || notifyMeStatus === 'already' ? 'سنبلغك لما يتوفر ✓' : notifyMeStatus === 'loading' ? 'جاري التسجيل...' : '🔔 أبلغني لما يتوفر'}
                </button>
              </div>
            )}

            {/* Extended Trust Badges (CRO) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '3rem', borderTop: '1px solid var(--border)', paddingTop: '2rem' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.02)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'var(--text-secondary)' }}>
                  <Lock size={20} /> تشفير SSL آمن
                </div>
                <div style={{ display: 'flex', gap: '1.2rem', alignItems: 'center', opacity: 0.8 }}>
                  <CreditCard size={28} /> <Landmark size={28} /> <Smartphone size={28} /> <Globe size={28} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'var(--text-secondary)' }}>
                  <ShieldCheck size={20} /> ضمان استرجاع 14 يوم
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'var(--text-secondary)' }}>
                  <Truck size={20} /> شحن موثوق وسريع
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Real User Reviews Section (Dynamic) */}
        <div className="product-detail-reviews" style={{ marginTop: '2rem', paddingTop: '4rem', borderTop: '1px solid var(--border)' }}>
           <div className="product-detail-reviews-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
             <div>
               <h2 className="product-detail-reviews-title" style={{ fontSize: '2.2rem', color: 'var(--text-primary)', margin: '0 0 0.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                 تقييمات المنتج <Star size={28} fill="#FFD700" color="#FFD700" />
               </h2>
               <p style={{ color: 'var(--text-secondary)', margin: 0 }}>{reviews.length} تقييم من عملاء حقيقيين</p>
             </div>
             <div style={{ fontSize: '1.5rem', color: '#FFD700', fontWeight: 'bold' }}>
                {avgRating} / 5.0
             </div>
           </div>

           {/* Add Review Form */}
           {!userReview && (
             <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '24px', padding: '2rem', marginBottom: '2.5rem' }}>
               <h3 style={{ margin: '0 0 1.2rem', fontSize: '1.3rem', fontWeight: 900, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                 <MessageSquare size={22} color="var(--primary)" /> أضف تقييمك
               </h3>
               {/* Star selector */}
               <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.2rem' }}>
                 {[1,2,3,4,5].map(s => (
                   <Star key={s} size={28} fill={s <= newReview.rating ? '#FFD700' : 'transparent'} color={s <= newReview.rating ? '#FFD700' : 'var(--border)'} style={{ cursor: 'pointer', transition: '0.2s' }} onClick={() => setNewReview(p => ({...p, rating: s}))} />
                 ))}
                 <span style={{ color: 'var(--text-secondary)', fontWeight: 700, marginRight: '0.5rem', alignSelf: 'center' }}>{newReview.rating}/5</span>
               </div>
               <textarea placeholder="شاركنا رأيك في هذا المنتج..." value={newReview.comment} onChange={e => setNewReview(p => ({...p, comment: e.target.value}))} rows={3} style={{ width: '100%', padding: '1rem', borderRadius: '14px', background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontWeight: 600, fontSize: '1rem', outline: 'none', resize: 'vertical', marginBottom: '1rem' }} />
               <button onClick={handleSubmitReview} disabled={submittingReview} style={{ padding: '0.9rem 2rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '14px', fontWeight: 900, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.6rem', boxShadow: '0 6px 20px rgba(244,63,94,0.3)', opacity: submittingReview ? 0.7 : 1 }}>
                 <Send size={18} /> {submittingReview ? 'جاري الإرسال...' : 'إرسال التقييم'}
               </button>
             </div>
           )}
           
           {/* Reviews List */}
           <div className="product-detail-reviews-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
             {reviews.length === 0 && (
               <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)', fontWeight: 700, background: 'var(--surface)', borderRadius: '20px', border: '1px dashed var(--border)' }}>
                 <Star size={48} color="var(--border)" style={{ marginBottom: '1rem' }} />
                 <p style={{ fontSize: '1.2rem', margin: '0 0 0.5rem', color: 'var(--text-primary)' }}>لا توجد تقييمات بعد</p>
                 <p style={{ margin: 0 }}>كن أول من يقيّم هذا المنتج!</p>
               </div>
             )}
             {reviews.map((r: any) => (
               <div key={r.id} style={{ background: 'linear-gradient(145deg, var(--surface-hover), transparent)', padding: '2rem', borderRadius: '20px', border: r.user_id === user?.id ? '2px solid var(--primary)' : '1px solid rgba(0,0,0,0.03)' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                     <div style={{ width: '46px', height: '46px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), #d90429)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', fontWeight: 900 }}>{(r.user_name || 'م').charAt(0)}</div>
                     <div>
                       <h4 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.05rem', fontWeight: 800 }}>{r.user_name || 'مستخدم'}</h4>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
                         {r.is_verified_purchase && <span style={{ color: '#10b981', fontSize: '0.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>✓ مشتري مؤكد</span>}
                         <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>{new Date(r.created_at).toLocaleDateString('ar-SA')}</span>
                       </div>
                     </div>
                   </div>
                   <div style={{ display: 'flex', gap: '0.15rem' }}>
                     {[1,2,3,4,5].map(s => <Star key={s} size={14} fill={s <= r.rating ? '#FFD700' : 'transparent'} color={s <= r.rating ? '#FFD700' : 'var(--border)'} />)}
                   </div>
                 </div>
                 <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '1rem', margin: 0, fontWeight: 500 }}>{r.comment}</p>
               </div>
             ))}
           </div>
        </div>

        {/* Related Products Section */}
        {related.length > 0 && (
          <div style={{ marginTop: '2rem', paddingTop: '4rem', borderTop: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
               <h2 style={{ fontSize: 'clamp(1.2rem, 3vw, 2rem)', color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                 🔗 منتجات ذات صلة
               </h2>
               <a href={`/products?category=${encodeURIComponent(product.category)}`} style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem' }}>عرض الكل</a>
            </div>
            
            <div className="product-grid mobile-swipeable-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
               {related.map(p => (
                 <ProductCard key={p.id} {...p} imagePlaceholderColor="var(--border)" />
               ))}
            </div>
          </div>
        )}

        {/* "Customers Also Bought" Section */}
        {products.length > 4 && product && (
          <div style={{ marginTop: '2rem', paddingTop: '3rem', borderTop: '1px solid var(--border)' }}>
            <h2 style={{ fontSize: 'clamp(1.2rem, 3vw, 1.6rem)', color: 'var(--text-primary)', margin: '0 0 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              🛒 ناس اشترت ده اشترت كمان...
            </h2>
            <div className="product-grid mobile-swipeable-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
              {products
                .filter(p => p.id !== product.id && p.category !== product.category)
                .sort((a, b) => b.rating - a.rating)
                .slice(0, 4)
                .map(p => (
                  <ProductCard key={p.id} {...p} imagePlaceholderColor="var(--border)" />
                ))}
            </div>
          </div>
        )}

      </div>

      {/* ═══ MOBILE STICKY ADD TO CART ═══ */}
      <div className="mobile-sticky-cta" style={{ display: 'none' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.8rem',
          padding: '0.8rem 1rem',
          background: 'var(--surface)',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid var(--border)',
        }}>
          {/* Quantity controls */}
          <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border)', borderRadius: '10px', overflow: 'hidden', height: '48px', flexShrink: 0 }}>
            <button onClick={() => setQuantity(Math.max(1, quantity - 1))} style={{ padding: '0 1rem', background: 'var(--surface-hover)', color: 'var(--text-primary)', border: 'none', borderLeft: '1px solid var(--border)', cursor: 'pointer', fontSize: '1.1rem', height: '100%', fontWeight: 900 }}>-</button>
            <div style={{ padding: '0 1rem', fontSize: '1rem', fontWeight: 900, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>{quantity}</div>
            <button onClick={() => setQuantity(Math.min(maxQty, quantity + 1))} disabled={quantity >= maxQty} style={{ padding: '0 1rem', background: 'var(--surface-hover)', color: quantity >= maxQty ? 'var(--text-secondary)' : 'var(--text-primary)', border: 'none', borderRight: '1px solid var(--border)', cursor: quantity >= maxQty ? 'not-allowed' : 'pointer', fontSize: '1.1rem', height: '100%', fontWeight: 900, opacity: quantity >= maxQty ? 0.4 : 1 }}>+</button>
          </div>
          {/* CTA button */}
            <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className="btn-tap"
            style={{
              flex: 1, height: '48px',
              background: !isOutOfStock ? 'var(--primary)' : 'var(--surface-hover)',
              color: !isOutOfStock ? '#fff' : 'var(--text-secondary)',
              border: 'none', borderRadius: '12px',
              fontWeight: 900, fontSize: '1rem',
              cursor: !isOutOfStock ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              boxShadow: !isOutOfStock ? '0 6px 20px rgba(37,99,235,0.4)' : 'none',
            }}
          >
            <ShoppingCart size={20} />
            {!isOutOfStock ? `أضف للسلة · ${(product.price * quantity).toLocaleString()} ر.س` : 'غير متوفر'}
          </button>
        </div>
      </div>
    </main>
  );
}
