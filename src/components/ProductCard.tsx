"use client";
import React, { useState, useCallback } from 'react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useAuth } from '@/context/AuthContext';
import { Heart, Star, ShoppingCart, Check, Truck, ShieldCheck, MapPin } from 'lucide-react';
import { Product } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { calculateProductPrice, roundPrice } from '@/lib/pricing';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

type ProductProps = Product & {
  imagePlaceholderColor: string;
};



export default function ProductCard({
  id, name, price, oldPrice, brand, category, condition, stock, shipping, rating, reviews, image, imagePlaceholderColor, is_verified_seller = false, seller_name, part_number, seller_id, seller_distance, seller_city, seller_phone
}: ProductProps) {
  const { addToCart } = useCart();
  const { user, openLoginModal } = useAuth();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [isHovered, setIsHovered] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [imgError, setImgError] = useState(false);


  const priceCalc = calculateProductPrice({ originalPrice: price, oldPrice });
  const discount = priceCalc.discountPercent;
  const wishlisted = isInWishlist(id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (stock !== 'متوفر') return;

    if (!user) {
      openLoginModal();
      return;
    }

    addToCart({ id, name, price: Number(price), brand, image });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };



  return (
    <a
      href={`/products/${id}`}
      style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
    >
      <div
        className="gm-product-card"
        style={{
          background: isHovered ? '#ffffff' : '#ffffff',
          borderRadius: '20px',
          overflow: 'hidden',
          transition: 'all 0.5s cubic-bezier(0.23, 1, 0.32, 1)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          border: isHovered ? '1px solid rgba(225,29,72,0.3)' : '1px solid rgba(0,0,0,0.08)',
          boxShadow: isHovered
            ? '0 15px 40px rgba(0,0,0,0.08), 0 0 20px rgba(225,29,72,0.05)'
            : '0 4px 15px rgba(0,0,0,0.04)',
          transform: isHovered ? 'translateY(-8px) scale(1.01)' : 'translateY(0) scale(1)',
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Top accent line */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: isHovered
            ? 'linear-gradient(90deg, #e11d48, #f97316, #e11d48)'
            : 'linear-gradient(90deg, transparent, rgba(225,29,72,0.4), transparent)',
          transition: 'all 0.5s ease',
          zIndex: 10,
          opacity: isHovered ? 1 : 0.5,
        }} />
        {/* Admin-only info bar — hidden by default, shown via god-mode CSS */}
        <div className="gm-admin-info" style={{
          display: 'none',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.4rem 0.8rem',
          background: 'rgba(76,201,240,0.06)',
          borderBottom: '1px solid rgba(76,201,240,0.1)',
          fontSize: '0.65rem',
          fontFamily: 'monospace',
          color: 'rgba(76,201,240,0.6)',
          fontWeight: 700,
          letterSpacing: '0.5px',
        }}>
          <span>ID: {id?.substring(0, 8)}</span>
          {seller_id && <span>SELLER: {seller_id?.substring(0, 8)}</span>}
        </div>
        {/* ─── Image Section ─── */}
        <div className="card-image-wrap" style={{
          position: 'relative',
          height: '240px',
          background: '#f8f9fb',
          overflow: 'hidden',
        }}>
          {!imgError && image ? (
            <img
              src={image}
              alt={name}
              loading="lazy"
              onError={() => setImgError(true)}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transition: 'transform 0.6s ease',
                transform: isHovered ? 'scale(1.1)' : 'scale(1)',
              }}
            />
          ) : (
            <div style={{
              width: '100%', height: '100%',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              background: 'linear-gradient(135deg, #f0f4f8 0%, #e2e8f0 100%)',
              gap: '0.5rem',
            }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <path d="M14.31 8l5.74 9.94M9.69 8h11.48M7.38 12l5.74-9.94M9.69 16L3.95 6.06M14.31 16H2.83M16.62 12l-5.74 9.94"/>
              </svg>
              <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700 }}>قطعة غيار</span>
            </div>
          )}

          {/* Distance Badge Bottom-Left */}
          {seller_distance !== undefined && seller_distance > 0 && (
            <div style={{
              position: 'absolute',
              bottom: '12px',
              left: '12px',
              zIndex: 5,
              padding: '5px 10px',
              borderRadius: '8px',
              background: seller_distance <= 5 ? 'rgba(16,185,129,0.9)' : seller_distance <= 15 ? 'rgba(245,158,11,0.9)' : 'rgba(100,116,139,0.9)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            }}>
              <MapPin size={12} color="#fff" />
              <span style={{
                color: '#fff',
                fontSize: '0.7rem',
                fontWeight: 900,
              }}>
                {seller_distance < 1 ? `${Math.round(seller_distance * 1000)} م` : seller_distance < 10 ? `${seller_distance.toFixed(1)} كم` : `${Math.round(seller_distance)} كم`}
              </span>
            </div>
          )}



          {/* Condition Badge Top-Right */}
          <span style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            zIndex: 5,
            background: condition === 'جديد' ? '#059669' : '#d97706',
            color: '#fff',
            fontSize: '0.7rem',
            fontWeight: 800,
            padding: '4px 12px',
            borderRadius: '20px',
            border: 'none',
            boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
          }}>
            {condition}
          </span>

          {/* Wishlist Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              toggleWishlist(id);
            }}
            aria-label="إضافة للمفضلة"
            className="card-wishlist-btn"
            style={{
              position: 'absolute',
              bottom: '12px',
              right: '12px',
              zIndex: 5,
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              border: 'none',
              background: wishlisted ? 'var(--primary)' : 'rgba(var(--background), 0.8)',
              backgroundColor: wishlisted ? 'var(--primary)' : 'var(--surface)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
              transform: isHovered ? 'scale(1.1)' : 'scale(1)',
              opacity: isHovered || wishlisted ? 1 : 0,
            }}
          >
            <Heart
              size={20}
              fill={wishlisted ? '#fff' : 'none'}
              stroke={wishlisted ? '#fff' : 'var(--text-secondary)'}
              strokeWidth={2.5}
            />
          </button>
        </div>

        {/* ─── Content Section ─── */}
        <div style={{
          padding: '1.2rem',
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
          gap: '0.8rem',
        }}>

          {/* Brand & Category */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            {brand && brand !== 'غير محدد' && (
              <span style={{
                fontSize: '0.75rem',
                fontWeight: 800,
                color: '#e11d48',
                background: 'rgba(225,29,72,0.1)',
                padding: '3px 10px',
                borderRadius: '6px',
              }}>
                {brand}
              </span>
            )}
            {category && category !== 'غير محدد' && (
              <span style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'var(--text-secondary)',
              }}>
                {seller_name ? `بواسطة: ${seller_name}` : category}
              </span>
            )}
          </div>

          {/* Title */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <h3 style={{
              margin: 0,
              fontSize: '1.05rem',
              fontWeight: 800,
              lineHeight: 1.4,
              color: 'var(--text-primary)',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              minHeight: '2.9rem',
            }}>
              {name}
            </h3>
            {part_number && (
              <div className="card-desktop-only" style={{ 
                fontSize: '0.7rem', 
                 color: 'var(--text-secondary)', 
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                opacity: 0.8
              }}>
                رقم القطعة: <span style={{ color: 'var(--text-primary)', background: 'rgba(0,0,0,0.05)', padding: '2px 6px', borderRadius: '4px' }}>{part_number}</span>
              </div>
            )}
          </div>

          {/* Rating */}
          <div className="card-desktop-only" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <div style={{ display: 'flex', gap: '2px' }}>
              {[1, 2, 3, 4, 5].map(s => (
                <Star
                  key={s}
                  size={14}
                  fill={s <= Math.round(rating) ? '#C9A14A' : 'transparent'}
                  stroke={s <= Math.round(rating) ? '#C9A14A' : 'var(--border)'}
                  strokeWidth={2}
                />
              ))}
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              ({reviews})
            </span>
          </div>

          {/* ─── PRIMARY: Price Section ─── */}
          <div style={{
            marginTop: 'auto',
            paddingTop: '1rem',
            borderTop: '1px solid rgba(0,0,0,0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--surface-hover)',
            margin: '0 -1.2rem',
            padding: '1rem 1.2rem 0',
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {oldPrice && (
                <span style={{
                  fontSize: '0.85rem',
                  color: 'var(--text-secondary)',
                  textDecoration: 'line-through',
                  fontWeight: 500,
                }}>
                  {formatCurrency(oldPrice)}
                </span>
              )}
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                <span style={{
                  fontSize: '1.7rem',
                  fontWeight: 950,
                  color: '#10b981',
                  lineHeight: 1,
                }}>
                  {formatCurrency(price)}
                </span>
              </div>
            </div>

            {/* Stock indicator */}
            <div style={{ textAlign: 'right' }}>
              <span style={{
                fontSize: '0.75rem',
                fontWeight: 800,
                color: stock === 'متوفر' ? '#10b981' : '#e11d48',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                justifyContent: 'flex-end'
              }}>
                <span style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: stock === 'متوفر' ? '#10b981' : '#e11d48',
                  display: 'inline-block',
                }} />
                {stock}
              </span>
            </div>
          </div>

          {/* ─── PRIMARY: Add to Cart Button ─── */}
          {user?.id === seller_id ? (
            <div
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                window.location.href = `/seller/products/edit/${id}`;
              }}
              style={{
                marginTop: '0.5rem',
                width: '100%',
                padding: '1rem',
                borderRadius: '12px',
                border: '1px solid rgba(225,29,72,0.3)',
                fontWeight: 950,
                fontSize: '1rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.3s ease',
                background: 'rgba(225,29,72,0.08)',
                color: '#e11d48',
                textDecoration: 'none'
              }}
              onMouseOver={e => {
                 e.currentTarget.style.background = 'rgba(244, 63, 94, 0.1)';
                 e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={e => {
                 e.currentTarget.style.background = 'rgba(244, 63, 94, 0.05)';
                 e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <Check size={20} /> إدارة المنتج
            </div>
          ) : (
            <button
              disabled={stock !== 'متوفر'}
              onClick={handleAddToCart}
              className="btn-tap"
              style={{
                marginTop: '0.5rem',
                width: '100%',
                padding: '1rem',
                borderRadius: '12px',
                border: 'none',
                fontWeight: 900,
                fontSize: '1rem',
                cursor: stock === 'متوفر' ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.35s cubic-bezier(0.23, 1, 0.32, 1)',
                background: justAdded
                  ? 'linear-gradient(135deg, #059669, #10b981)'
                  : stock === 'متوفر'
                    ? 'linear-gradient(135deg, #e11d48, #f43f5e, #e11d48)'
                    : 'rgba(0,0,0,0.05)',
                backgroundSize: stock === 'متوفر' ? '200% 100%' : 'auto',
                color: stock === 'متوفر' ? '#ffffff' : 'var(--text-secondary)',
                boxShadow: justAdded
                  ? '0 8px 25px rgba(16,185,129,0.4), inset 0 1px 0 rgba(255,255,255,0.15)'
                  : stock === 'متوفر'
                    ? '0 8px 25px rgba(225,29,72,0.35), inset 0 1px 0 rgba(255,255,255,0.1)'
                    : 'none',
                letterSpacing: '0.3px',
                textShadow: stock === 'متوفر' ? '0 1px 2px rgba(0,0,0,0.2)' : 'none',
              }}
              onMouseOver={e => {
                 if (stock === 'متوفر' && !justAdded) {
                   e.currentTarget.style.background = 'linear-gradient(135deg, #be123c, #e11d48, #f43f5e)';
                   e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                   e.currentTarget.style.boxShadow = '0 12px 35px rgba(225,29,72,0.45), inset 0 1px 0 rgba(255,255,255,0.15)';
                 }
              }}
              onMouseOut={e => {
                 if (stock === 'متوفر' && !justAdded) {
                   e.currentTarget.style.background = 'linear-gradient(135deg, #e11d48, #f43f5e, #e11d48)';
                   e.currentTarget.style.transform = 'translateY(0) scale(1)';
                   e.currentTarget.style.boxShadow = '0 8px 25px rgba(225,29,72,0.35), inset 0 1px 0 rgba(255,255,255,0.1)';
                 }
              }}
            >
              {justAdded ? (
                <>
                  <Check size={20} /> تمت الإضافة ✓
                </>
              ) : stock === 'متوفر' ? (
                <>
                  <ShoppingCart size={20} /> أضف للسلة
                </>
              ) : (
                'غير متوفر حالياً'
              )}
            </button>
          )}

        </div>
      </div>
    </a>
  );
}
