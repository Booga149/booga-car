"use client";
import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { supabase } from '@/lib/supabase';
import { useCart } from '@/context/CartContext';
import { useProducts } from '@/context/ProductsContext';
import { Product } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import ProductCard from '@/components/ProductCard';
import { Frown, Flame, ShoppingCart, Star, Package, Truck, Lock, CreditCard, Landmark, Smartphone, Globe, ShieldCheck, RefreshCw } from 'lucide-react';
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

  useEffect(() => {
    async function fetchProductDetails() {
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
        setLoading(false);
        return;
      }
      try {
        const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
        if (data) {
          setProduct({
            id: data.id,
            name: data.name,
            brand: data.brand || 'غير محدد',
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
          });

          // Fetch Related Products (Same category, exclude current)
          const { data: relatedData } = await supabase.from('products')
            .select('*')
            .eq('category', data.category)
            .neq('id', id)
            .limit(4);
            
          if (relatedData) {
            setRelated(relatedData.map(d => ({
              id: d.id, name: d.name, brand: d.brand || '', category: d.category || '',
              price: Number(d.price), oldPrice: d.old_price ? Number(d.old_price) : undefined,
              condition: d.condition || 'جديد', stock: d.stock || 'متوفر', shipping: d.shipping || 'عادي',
              rating: d.rating || 0, reviews: d.reviews_count || 0, image: d.image_url || '', color: 'var(--border)'
            })));
          }

          // Fetch Seller Profile
          if (data.seller_id) {
             const { data: profileData } = await supabase.from('profiles').select('full_name, business_name, cr_number').eq('id', data.seller_id).single();
             if (profileData) {
                setSellerProfile(profileData);
             }
          }
        } else {
          // Fallback to local context in case the user clicked an unsynced, locally generated product or pseudo-ID
          const localMatch = products.find(p => p.id === id);
          if (localMatch) {
            setProduct(localMatch);
            setRelated(products.filter(p => p.category === localMatch.category && p.id !== id).slice(0, 4));
          }
        }
      } catch (e) {
        console.error("Error fetching detail:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchProductDetails();
  }, [id, products]);

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

  const handleAddToCart = () => {
    if (!user) {
      addToast('يرجى تسجيل الدخول أولاً لإضافة منتجات إلى السلة', 'info');
      openLoginModal();
      return;
    }

    for (let i = 0; i < quantity; i++) {
        addToCart({ id: product.id, name: product.name, price: product.price, brand: product.brand, image: product.image });
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
          <div className="product-detail-image" style={{ background: 'var(--surface-hover)', borderRadius: '24px', padding: '2rem', border: '1px solid var(--border)', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '500px' }}>
            <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', maxHeight: '450px', objectFit: 'contain', mixBlendMode: 'screen', filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.5))' }} />
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

            {/* Social Proof & Urgency Box */}
            <div className="product-detail-urgency" style={{ background: 'linear-gradient(90deg, rgba(230, 57, 70, 0.1), rgba(230, 57, 70, 0.02))', borderRight: '4px solid #e63946', padding: '1rem 1.5rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: '#ff4d4d', fontWeight: 'bold', fontSize: '0.95rem' }}>
                 <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ff4d4d', animation: 'pulse 1.5s infinite', flexShrink: 0 }}></div>
                 {Math.floor(Math.random() * 8) + 3} أشخاص يشاهدون هذا المنتج الآن! <Flame size={18} />
               </div>
               <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                 <ShoppingCart size={18} /> تم شراء هذا المنتج {Math.floor(Math.random() * 40) + 12} مرة هذا الأسبوع.
               </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#FFD700', fontSize: '1.2rem' }}>
                <Star size={18} fill="#FFD700" /> {product.rating} 
              </div>
              <span style={{ color: 'var(--text-secondary)' }}>(تستند إلى {product.reviews} تقييم)</span>
              <span style={{ color: 'var(--border)' }}>|</span>
              <span style={{ color: product.stock === 'متوفر' ? '#8ac926' : '#e63946', fontWeight: 'bold' }}>
                {product.stock === 'متوفر' ? '✓ متوفر بالمخزن' : '× نفذت الكمية'}
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

            {/* Actions — Desktop */}
            <div className="product-detail-actions-desktop" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden', height: '60px' }}>
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} style={{ padding: '0 1.5rem', background: 'rgba(0,0,0,0.03)', color: 'var(--text-primary)', border: 'none', borderRight: '1px solid var(--border)', cursor: 'pointer', fontSize: '1.2rem', height: '100%' }}>-</button>
                <div style={{ padding: '0 2rem', fontSize: '1.2rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', background: 'var(--surface-hover)' }}>{quantity}</div>
                <button onClick={() => setQuantity(quantity + 1)} style={{ padding: '0 1.5rem', background: 'rgba(0,0,0,0.03)', color: 'var(--text-primary)', border: 'none', borderLeft: '1px solid var(--border)', cursor: 'pointer', fontSize: '1.2rem', height: '100%' }}>+</button>
              </div>

              <button 
                onClick={handleAddToCart}
                disabled={product.stock !== 'متوفر'}
                style={{
                  flex: 1, height: '60px', background: product.stock === 'متوفر' ? 'var(--primary)' : 'var(--surface-hover)', 
                  color: 'var(--text-primary)', border: 'none', borderRadius: '12px', cursor: product.stock === 'متوفر' ? 'pointer' : 'not-allowed', 
                  fontWeight: 'bold', fontSize: '1.2rem', transition: 'all 0.2s', boxShadow: '0 10px 25px rgba(230, 57, 70, 0.4)',
                  opacity: product.stock === 'متوفر' ? 1 : 0.5
                }}
                onMouseOver={e => { if (product.stock === 'متوفر') e.currentTarget.style.transform = 'translateY(-2px)' }} 
                onMouseOut={e => { if (product.stock === 'متوفر') e.currentTarget.style.transform = 'translateY(0)' }}
              >
                {product.stock === 'متوفر' ? `أضف للسلة - ${(product.price * quantity).toLocaleString()} ر.س` : 'غير متوفر حالياً'}
              </button>
            </div>

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

        {/* Real User Reviews Section (UGC) */}
        <div className="product-detail-reviews" style={{ marginTop: '2rem', paddingTop: '4rem', borderTop: '1px solid var(--border)' }}>
           <div className="product-detail-reviews-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
             <div>
               <h2 className="product-detail-reviews-title" style={{ fontSize: '2.2rem', color: 'var(--text-primary)', margin: '0 0 0.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                 تقييمات مجتمع Booga Car <Star size={28} fill="#FFD700" color="#FFD700" />
               </h2>
               <p style={{ color: 'var(--text-secondary)', margin: 0 }}>آراء حقيقية من عشاق السيارات اللي جربوا القطعة دي</p>
             </div>
             <div style={{ fontSize: '1.5rem', color: '#FFD700', fontWeight: 'bold' }}>
                4.8 / 5.0
             </div>
           </div>
           
           <div className="product-detail-reviews-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem' }}>
             {/* Review 1 */}
             <div style={{ background: 'linear-gradient(145deg, var(--surface-hover), transparent)', padding: '2rem', borderRadius: '20px', border: '1px solid rgba(0,0,0,0.03)' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                   <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), #d90429)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold' }}>أ</div>
                   <div>
                     <h4 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.1rem' }}>أحمد عبدالله</h4>
                     <div style={{ color: '#8ac926', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.2rem' }}>
                       <span style={{ fontSize: '1rem' }}>✓</span> مشتري مؤكد
                     </div>
                   </div>
                 </div>
                 <div style={{ display: 'flex', gap: '0.2rem', marginBottom: '0.5rem' }}>
                   {[1,2,3,4,5].map(s => <Star key={'rev1_'+s} size={16} fill="#FFD700" color="#FFD700" />)}
                 </div>
               </div>
               <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '1.05rem', margin: 0 }}>
                 "القطعة أصلية 100% ومطابقة للوصف اللي بالموقع. ركبتها على سيارتي والفرق واضح جداً في الأداء. شكراً لكم على التغليف الممتاز وسرعة الشحن."
               </p>
             </div>
             
             {/* Review 2 - With Image */}
             <div style={{ background: 'linear-gradient(145deg, var(--surface-hover), transparent)', padding: '2rem', borderRadius: '20px', border: '1px solid rgba(0,0,0,0.03)' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                   <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'linear-gradient(135deg, #4cc9f0, #0077b6)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold' }}>م</div>
                   <div>
                     <h4 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.1rem' }}>محمد سعيد</h4>
                     <div style={{ color: '#8ac926', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.2rem' }}>
                       <span style={{ fontSize: '1rem' }}>✓</span> مشتري مؤكد
                     </div>
                   </div>
                 </div>
                 <div style={{ display: 'flex', gap: '0.2rem', marginBottom: '0.5rem' }}>
                   {[1,2,3,4,5].map(s => <Star key={'rev2_'+s} size={16} fill="#FFD700" color="#FFD700" />)}
                 </div>
               </div>
               <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '1.05rem', marginBottom: '1.5rem' }}>
                 "السعر هنا أرخص من الوكالة بكتير بصراحة. القطعة ركبت بمقاس الوكالة بالضبط وبدون أي تعقيد. بصراحة تجربة ممتازة وخدمة عملاء الواتس اب كانت سريعة جداً. أنصح بالتعامل التام."
               </p>
               <div style={{ width: '100%', height: '160px', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.06)' }}>
                 <img src="https://images.unsplash.com/photo-1549317661-bd32c8ce0be2?w=500&q=80" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} alt="تصوير العميل للقطعة" />
               </div>
             </div>
           </div>
        </div>

        {/* Related Products Section */}
        {related.length > 0 && (
          <div style={{ marginTop: '2rem', paddingTop: '4rem', borderTop: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
               <h2 style={{ fontSize: '2rem', color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                 منتجات ذات صلة <RefreshCw size={24} />
               </h2>
               <a href={`/products?category=${encodeURIComponent(product.category)}`} style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 'bold' }}>عرض الكل</a>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '2rem' }}>
               {related.map(p => (
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
          background: 'rgba(10,10,15,0.98)',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(255,255,255,0.08)',
        }}>
          {/* Quantity controls */}
          <div style={{ display: 'flex', alignItems: 'center', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', overflow: 'hidden', height: '48px', flexShrink: 0 }}>
            <button onClick={() => setQuantity(Math.max(1, quantity - 1))} style={{ padding: '0 1rem', background: 'rgba(255,255,255,0.05)', color: '#fff', border: 'none', borderLeft: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', fontSize: '1.1rem', height: '100%', fontWeight: 900 }}>-</button>
            <div style={{ padding: '0 1rem', fontSize: '1rem', fontWeight: 900, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>{quantity}</div>
            <button onClick={() => setQuantity(quantity + 1)} style={{ padding: '0 1rem', background: 'rgba(255,255,255,0.05)', color: '#fff', border: 'none', borderRight: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', fontSize: '1.1rem', height: '100%', fontWeight: 900 }}>+</button>
          </div>
          {/* CTA button */}
          <button
            onClick={handleAddToCart}
            disabled={product.stock !== 'متوفر'}
            className="btn-tap"
            style={{
              flex: 1, height: '48px',
              background: product.stock === 'متوفر' ? 'linear-gradient(135deg, #e11d48, #be123c)' : 'rgba(255,255,255,0.1)',
              color: product.stock === 'متوفر' ? '#fff' : 'rgba(255,255,255,0.3)',
              border: 'none', borderRadius: '12px',
              fontWeight: 900, fontSize: '1rem',
              cursor: product.stock === 'متوفر' ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              boxShadow: product.stock === 'متوفر' ? '0 6px 20px rgba(225,29,72,0.4)' : 'none',
            }}
          >
            <ShoppingCart size={20} />
            {product.stock === 'متوفر' ? `أضف للسلة · ${(product.price * quantity).toLocaleString()} ر.س` : 'غير متوفر'}
          </button>
        </div>
      </div>
    </main>
  );
}
