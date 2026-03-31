"use client";
import React from 'react';
import Navbar from '@/components/Navbar';
import ProductCard from '@/components/ProductCard';
import { useWishlist } from '@/context/WishlistContext';
import { useProducts } from '@/context/ProductsContext';
import { Heart } from 'lucide-react';

export default function WishlistPage() {
  const { wishlist } = useWishlist();
  const { products } = useProducts();

  // Instantly cross-reference IDs statically to avoid redundant trips to the backend database
  const wishlistProducts = products.filter(p => wishlist.includes(p.id!));

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <div style={{ maxWidth: '1200px', width: '100%', margin: '0 auto', padding: '6rem 2rem 4rem', flex: 1 }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          المنتجات المفضلة <Heart size={32} fill="#e63946" color="#e63946" />
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '3rem' }}>
          لقد قمت بحفظ هذه القطع لتتمكن من الرجوع إليها وإتمام عملية الشراء لاحقاً.
        </p>

        {wishlistProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem 0', background: 'rgba(0,0,0,0.02)', borderRadius: '16px', border: '1px dashed var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}><Heart size={64} opacity={0.3} color="var(--text-secondary)" /></div>
            <h2 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>قائمتك فارغة الآن!</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>تصفح منتجات سيارتك وأضف ما تحتاجه إلى المفضلة</p>
            <a href="/products" style={{ padding: '0.8rem 2rem', background: 'var(--primary)', color: 'white', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold' }}>تصفح قطع الغيار</a>
          </div>
        ) : (
          <div className="product-grid">
            {wishlistProducts.map(product => (
              <ProductCard key={product.id} {...product} imagePlaceholderColor="var(--border)" />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
