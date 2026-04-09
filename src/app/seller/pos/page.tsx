"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ShoppingBag, Search, Minus, Plus, Check, Package,
  Receipt, ArrowRight, X, Phone, User, FileText, Loader2, ChevronRight
} from 'lucide-react';

export default function SellerPOSPage() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const router = useRouter();

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successSale, setSuccessSale] = useState<any>(null);
  const [recentSales, setRecentSales] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    fetchProducts();
    fetchRecentSales();
  }, [user]);

  async function fetchProducts() {
    setLoading(true);
    const { data } = await supabase
      .from('products')
      .select('id, name, price, brand, category, stock_quantity, image_url, stock')
      .eq('seller_id', user!.id)
      .order('name');
    if (data) setProducts(data);
    setLoading(false);
  }

  async function fetchRecentSales() {
    const { data } = await supabase
      .from('store_sales')
      .select('*')
      .eq('seller_id', user!.id)
      .order('created_at', { ascending: false })
      .limit(10);
    if (data) setRecentSales(data);
  }

  const filtered = useMemo(() =>
    products.filter(p =>
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.brand?.toLowerCase().includes(search.toLowerCase())
    ), [products, search]);

  const handleSale = async () => {
    if (!selectedProduct || quantity < 1) return;
    setSubmitting(true);

    try {
      const total = selectedProduct.price * quantity;

      // 1. Record the sale
      const { error: saleErr } = await supabase.from('store_sales').insert({
        seller_id: user!.id,
        product_id: selectedProduct.id,
        product_name: selectedProduct.name,
        quantity,
        unit_price: selectedProduct.price,
        total,
        customer_name: customerName || null,
        customer_phone: customerPhone || null,
        notes: notes || null,
      });
      if (saleErr) throw saleErr;

      // 2. Decrement stock
      const { data: decrementOk, error: decErr } = await supabase.rpc('decrement_stock', {
        p_product_id: selectedProduct.id,
        p_quantity: quantity,
      });
      if (decErr) console.warn('Stock decrement warning:', decErr.message);

      // 3. Check low stock
      await supabase.rpc('check_low_stock', { p_product_id: selectedProduct.id }).catch(() => {});

      // 4. Update local state
      setProducts(prev => prev.map(p =>
        p.id === selectedProduct.id
          ? { ...p, stock_quantity: Math.max(0, (p.stock_quantity || 0) - quantity) }
          : p
      ));

      setSuccessSale({
        product: selectedProduct.name,
        quantity,
        unitPrice: selectedProduct.price,
        total,
        customerName,
        date: new Date().toLocaleString('ar-SA'),
      });

      addToast(`✅ تم تسجيل بيع ${quantity} × ${selectedProduct.name}`, 'success');
      fetchRecentSales();

    } catch (err: any) {
      addToast('فشل تسجيل البيعة: ' + (err.message || ''), 'error');
    }
    setSubmitting(false);
  };

  const resetForm = () => {
    setSelectedProduct(null);
    setQuantity(1);
    setCustomerName('');
    setCustomerPhone('');
    setNotes('');
    setSuccessSale(null);
  };

  // Success screen
  if (successSale) {
    return (
      <main style={{ minHeight: '100vh', background: '#030200', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
        <div style={{ maxWidth: '420px', width: '100%', textAlign: 'center' }}>
          <div style={{
            width: '80px', height: '80px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #10b981, #059669)', margin: '0 auto 1.5rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 10px 40px rgba(16,185,129,0.3)',
          }}>
            <Check size={40} color="white" />
          </div>
          <h2 style={{ color: '#fff', fontSize: '1.8rem', fontWeight: 950, marginBottom: '0.5rem' }}>تم تسجيل البيعة! ✅</h2>

          {/* Receipt card */}
          <div style={{
            background: 'rgba(212,175,55,0.04)', border: '1px solid rgba(212,175,55,0.15)', borderRadius: '20px',
            padding: '1.8rem', marginTop: '1.5rem', textAlign: 'right',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.2rem', color: 'rgba(212,175,55,0.6)', fontSize: '0.8rem', fontWeight: 800 }}>
              <Receipt size={16} /> إيصال البيع
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', fontSize: '0.95rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'rgba(255,255,255,0.6)' }}>
                <span style={{ color: '#FFD700', fontWeight: 800 }}>{successSale.product}</span>
                <span>المنتج</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'rgba(255,255,255,0.6)' }}>
                <span style={{ color: '#fff', fontWeight: 800 }}>{successSale.quantity}</span>
                <span>الكمية</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'rgba(255,255,255,0.6)' }}>
                <span style={{ color: '#fff', fontWeight: 800 }}>{successSale.unitPrice.toLocaleString()} ر.س</span>
                <span>سعر الوحدة</span>
              </div>
              {successSale.customerName && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'rgba(255,255,255,0.6)' }}>
                  <span style={{ color: '#fff', fontWeight: 700 }}>{successSale.customerName}</span>
                  <span>العميل</span>
                </div>
              )}
              <div style={{ borderTop: '1px dashed rgba(212,175,55,0.2)', paddingTop: '0.8rem', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#10b981', fontWeight: 950, fontSize: '1.3rem' }}>{successSale.total.toLocaleString()} ر.س</span>
                <span style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 800 }}>الإجمالي</span>
              </div>
            </div>
            <div style={{ marginTop: '1rem', fontSize: '0.72rem', color: 'rgba(255,255,255,0.25)', textAlign: 'center' }}>
              {successSale.date} • بيع من المحل • Booga Car POS
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.8rem', marginTop: '2rem' }}>
            <button onClick={resetForm} style={{
              flex: 1, padding: '1.1rem', background: 'linear-gradient(135deg, #D4AF37, #FFD700)',
              color: '#111', border: 'none', borderRadius: '16px', fontWeight: 900, fontSize: '1rem', cursor: 'pointer',
              boxShadow: '0 8px 20px rgba(212,175,55,0.25)',
            }}>
              بيعة جديدة 🛒
            </button>
            <Link href="/seller/stock" style={{
              flex: 1, padding: '1.1rem', background: 'rgba(255,255,255,0.05)', color: '#fff',
              border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', fontWeight: 800, fontSize: '1rem',
              textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
            }}>
              المخزون 📦
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
        borderBottom: '1px solid rgba(212,175,55,0.1)', position: 'sticky', top: 0, zIndex: 10,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: 'linear-gradient(135deg, #D4AF37, #FFD700)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <ShoppingBag size={18} color="#111" />
            </div>
            <div>
              <div style={{ color: '#FFD700', fontWeight: 950, fontSize: '1.1rem' }}>نقطة البيع</div>
              <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.7rem', fontWeight: 700 }}>سجّل بيعاتك من المحل</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Link href="/seller/stock" style={{
              padding: '0.5rem 0.8rem', background: 'rgba(16,185,129,0.1)', color: '#10b981',
              border: '1px solid rgba(16,185,129,0.2)', borderRadius: '10px', fontSize: '0.75rem',
              fontWeight: 800, textDecoration: 'none',
            }}>📦 المخزون</Link>
            <Link href="/seller/dashboard" style={{
              padding: '0.5rem 0.8rem', background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)',
              border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', fontSize: '0.75rem',
              fontWeight: 700, textDecoration: 'none',
            }}>لوحة التحكم</Link>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '1.5rem' }}>

        {/* Step 1: Select Product */}
        {!selectedProduct ? (
          <>
            <div style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ color: '#fff', fontSize: '1.4rem', fontWeight: 950, margin: '0 0 0.3rem' }}>1️⃣ اختر المنتج</h2>
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem', margin: 0, fontWeight: 600 }}>اضغط على المنتج اللي بعته من المحل</p>
            </div>

            {/* Search */}
            <div style={{ position: 'relative', marginBottom: '1.2rem' }}>
              <Search size={18} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(212,175,55,0.4)' }} />
              <input
                type="text" placeholder="ابحث عن منتج..."
                value={search} onChange={e => setSearch(e.target.value)}
                style={{
                  width: '100%', padding: '1rem 2.8rem 1rem 1rem',
                  background: 'rgba(212,175,55,0.04)', border: '1px solid rgba(212,175,55,0.15)',
                  borderRadius: '14px', color: '#fff', fontWeight: 700, fontSize: '1rem', outline: 'none',
                }}
              />
            </div>

            {/* Products List */}
            {loading ? (
              <div style={{ textAlign: 'center', padding: '4rem', color: 'rgba(212,175,55,0.5)' }}>
                <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
                <div style={{ fontWeight: 700 }}>جاري تحميل المنتجات...</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {filtered.map(product => {
                  const qty = product.stock_quantity || 0;
                  const qtyColor = qty === 0 ? '#f43f5e' : qty <= 5 ? '#f59e0b' : '#10b981';
                  return (
                    <button
                      key={product.id}
                      onClick={() => qty > 0 && setSelectedProduct(product)}
                      disabled={qty === 0}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '1rem', width: '100%',
                        padding: '1rem', background: qty === 0 ? 'rgba(244,63,94,0.03)' : 'rgba(212,175,55,0.03)',
                        border: `1px solid ${qty === 0 ? 'rgba(244,63,94,0.1)' : 'rgba(212,175,55,0.1)'}`,
                        borderRadius: '16px', cursor: qty > 0 ? 'pointer' : 'not-allowed',
                        textAlign: 'right', transition: '0.2s', opacity: qty === 0 ? 0.5 : 1,
                      }}
                    >
                      <div style={{
                        width: '50px', height: '50px', borderRadius: '12px', flexShrink: 0,
                        background: product.image_url ? `url(${product.image_url}) center/cover` : 'rgba(212,175,55,0.1)',
                        border: '1px solid rgba(212,175,55,0.08)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {!product.image_url && <Package size={22} color="rgba(212,175,55,0.3)" />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ color: '#fff', fontWeight: 800, fontSize: '0.95rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.name}</div>
                        <div style={{ display: 'flex', gap: '0.8rem', marginTop: '0.3rem', fontSize: '0.8rem' }}>
                          <span style={{ color: '#FFD700', fontWeight: 800 }}>{Number(product.price).toLocaleString()} ر.س</span>
                          {product.brand && <span style={{ color: 'rgba(255,255,255,0.3)' }}>{product.brand}</span>}
                        </div>
                      </div>
                      <div style={{
                        padding: '0.35rem 0.7rem', borderRadius: '8px', fontWeight: 900, fontSize: '0.85rem',
                        background: `${qtyColor}15`, color: qtyColor, border: `1px solid ${qtyColor}25`,
                        minWidth: '40px', textAlign: 'center',
                      }}>
                        {qty}
                      </div>
                      {qty > 0 && <ChevronRight size={18} color="rgba(212,175,55,0.3)" />}
                    </button>
                  );
                })}
                {filtered.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(255,255,255,0.3)', fontWeight: 700 }}>
                    {search ? 'لا توجد نتائج' : 'لا توجد منتجات'}
                  </div>
                )}
              </div>
            )}

            {/* Recent sales */}
            {recentSales.length > 0 && (
              <div style={{ marginTop: '2.5rem' }}>
                <h3 style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', fontWeight: 800, margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  📋 آخر البيعات من المحل
                </h3>
                {recentSales.slice(0, 5).map(sale => (
                  <div key={sale.id} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '0.8rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)',
                  }}>
                    <div>
                      <div style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 700, fontSize: '0.88rem' }}>{sale.product_name}</div>
                      <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.72rem', fontWeight: 600 }}>
                        {new Date(sale.created_at).toLocaleDateString('ar-SA')} • {sale.quantity} قطعة
                        {sale.customer_name && ` • ${sale.customer_name}`}
                      </div>
                    </div>
                    <span style={{ color: '#10b981', fontWeight: 900, fontSize: '0.9rem' }}>{Number(sale.total).toLocaleString()} ر.س</span>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          /* Step 2: Sale Details */
          <>
            <button onClick={resetForm} style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'none', border: 'none',
              color: 'rgba(212,175,55,0.5)', cursor: 'pointer', fontWeight: 800, marginBottom: '1.5rem', fontSize: '0.9rem',
            }}>
              <ArrowRight size={18} /> رجوع للمنتجات
            </button>

            <div style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ color: '#fff', fontSize: '1.4rem', fontWeight: 950, margin: '0 0 0.3rem' }}>2️⃣ تفاصيل البيعة</h2>
            </div>

            {/* Selected product card */}
            <div style={{
              background: 'rgba(212,175,55,0.05)', border: '1px solid rgba(212,175,55,0.15)',
              borderRadius: '20px', padding: '1.5rem', marginBottom: '1.5rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.2rem' }}>
                <div style={{
                  width: '56px', height: '56px', borderRadius: '14px', flexShrink: 0,
                  background: selectedProduct.image_url ? `url(${selectedProduct.image_url}) center/cover` : 'rgba(212,175,55,0.1)',
                  border: '1px solid rgba(212,175,55,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {!selectedProduct.image_url && <Package size={24} color="rgba(212,175,55,0.4)" />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: '#FFD700', fontWeight: 900, fontSize: '1.05rem' }}>{selectedProduct.name}</div>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.82rem', fontWeight: 600 }}>متبقي: {selectedProduct.stock_quantity || 0} قطعة</div>
                </div>
              </div>

              {/* Quantity selector */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', marginBottom: '1rem' }}>
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} style={{
                  width: '52px', height: '52px', borderRadius: '16px',
                  background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)',
                  color: '#f43f5e', cursor: 'pointer', fontSize: '1.5rem', fontWeight: 900,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}><Minus size={22} /></button>
                <div style={{
                  fontSize: '3rem', fontWeight: 950, color: '#fff',
                  minWidth: '80px', textAlign: 'center',
                }}>{quantity}</div>
                <button onClick={() => setQuantity(Math.min(selectedProduct.stock_quantity || 1, quantity + 1))}
                  disabled={quantity >= (selectedProduct.stock_quantity || 1)}
                  style={{
                    width: '52px', height: '52px', borderRadius: '16px',
                    background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)',
                    color: '#10b981', cursor: quantity >= (selectedProduct.stock_quantity || 1) ? 'not-allowed' : 'pointer',
                    fontSize: '1.5rem', fontWeight: 900,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    opacity: quantity >= (selectedProduct.stock_quantity || 1) ? 0.4 : 1,
                  }}><Plus size={22} /></button>
              </div>

              {/* Total */}
              <div style={{
                textAlign: 'center', padding: '1rem', background: 'rgba(16,185,129,0.05)',
                borderRadius: '14px', border: '1px solid rgba(16,185,129,0.1)',
              }}>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.3rem' }}>إجمالي البيعة</div>
                <div style={{ color: '#10b981', fontSize: '2.2rem', fontWeight: 950 }}>
                  {(selectedProduct.price * quantity).toLocaleString()} <span style={{ fontSize: '1rem' }}>ر.س</span>
                </div>
              </div>
            </div>

            {/* Optional customer details */}
            <div style={{
              background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '20px', padding: '1.5rem', marginBottom: '1.5rem',
            }}>
              <h3 style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', fontWeight: 800, margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <User size={16} /> بيانات العميل (اختياري)
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.2)' }} />
                  <input type="text" placeholder="اسم العميل" value={customerName} onChange={e => setCustomerName(e.target.value)}
                    style={{ width: '100%', padding: '0.9rem 2.5rem 0.9rem 1rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: '#fff', fontWeight: 700, outline: 'none' }} />
                </div>
                <div style={{ position: 'relative' }}>
                  <Phone size={16} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.2)' }} />
                  <input type="tel" placeholder="رقم الجوال" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)}
                    style={{ width: '100%', padding: '0.9rem 2.5rem 0.9rem 1rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: '#fff', fontWeight: 700, outline: 'none', direction: 'ltr', textAlign: 'left' }} />
                </div>
                <div style={{ position: 'relative' }}>
                  <FileText size={16} style={{ position: 'absolute', right: '1rem', top: '1rem', color: 'rgba(255,255,255,0.2)' }} />
                  <textarea placeholder="ملاحظات" value={notes} onChange={e => setNotes(e.target.value)} rows={2}
                    style={{ width: '100%', padding: '0.9rem 2.5rem 0.9rem 1rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: '#fff', fontWeight: 700, outline: 'none', resize: 'none' }} />
                </div>
              </div>
            </div>

            {/* Submit button */}
            <button onClick={handleSale} disabled={submitting}
              style={{
                width: '100%', padding: '1.3rem',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: '#fff', border: 'none', borderRadius: '18px',
                fontSize: '1.2rem', fontWeight: 950, cursor: submitting ? 'not-allowed' : 'pointer',
                boxShadow: '0 10px 30px rgba(16,185,129,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem',
                opacity: submitting ? 0.7 : 1,
              }}>
              {submitting ? (
                <><Loader2 size={22} style={{ animation: 'spin 1s linear infinite' }} /> جاري التسجيل...</>
              ) : (
                <><Check size={22} /> تأكيد البيعة ✅</>
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
