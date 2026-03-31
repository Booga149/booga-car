"use client";
import React, { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useAuth } from '@/context/AuthContext';
import { Heart, Star, ShoppingCart, Check, Truck, ShieldCheck } from 'lucide-react';
import { Product } from '@/types';
import { formatCurrency } from '@/lib/utils';

type ProductProps = Product & {
  imagePlaceholderColor: string;
};

export default function ProductCard({
  id, name, price, oldPrice, brand, category, condition, stock, shipping, rating, reviews, image, imagePlaceholderColor, is_verified_seller = false, seller_name, part_number, seller_id
}: ProductProps) {
  const { addToCart } = useCart();
  const { user, openLoginModal } = useAuth();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [isHovered, setIsHovered] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const discount = oldPrice ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0;
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
        style={{
          background: 'var(--surface)',
          // background: 'var(--surface)',
          borderRadius: '16px',
          overflow: 'hidden',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          border: '1px solid var(--border)',
          boxShadow: isHovered
            ? '0 20px 40px -10px rgba(0,0,0,0.2)'
            : 'var(--card-shadow)',
          transform: isHovered ? 'translateY(-8px)' : 'translateY(0)',
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* ─── Image Section ─── */}
        <div style={{
          position: 'relative',
          height: '240px',
          background: 'var(--background)',
          overflow: 'hidden',
        }}>
          <img
            src={image}
            alt=""
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.6s ease',
              transform: isHovered ? 'scale(1.1)' : 'scale(1)',
            }}
          />

          {/* Top-Left Badges */}
          <div style={{
            position: 'absolute', top: '12px', left: '12px',
            display: 'flex', flexDirection: 'column', gap: '8px', zIndex: 5,
          }}>
            {discount > 0 && (
              <span style={{
                background: 'var(--primary)',
                color: '#fff',
                fontSize: '0.75rem',
                fontWeight: 800,
                padding: '4px 10px',
                borderRadius: '6px',
                boxShadow: '0 4px 10px rgba(244, 63, 94, 0.3)'
              }}>
                -{discount}%
              </span>
            )}
            {shipping === 'مجاني' && (
              <span style={{
                background: '#059669',
                color: '#fff',
                fontSize: '0.75rem',
                fontWeight: 800,
                padding: '4px 10px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                boxShadow: '0 4px 10px rgba(5, 150, 105, 0.3)'
              }}>
                <Truck size={14} /> مجاني
              </span>
            )}
            {is_verified_seller && (
              <span style={{
                background: 'linear-gradient(45deg, #FFD700, #DAA520)',
                color: '#000',
                fontSize: '0.75rem',
                fontWeight: 900,
                padding: '4px 10px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                boxShadow: '0 4px 15px rgba(218, 165, 32, 0.4)',
                border: '1px solid rgba(0,0,0,0.1)'
              }}>
                <ShieldCheck size={14} /> تاجر موثوق
              </span>
            )}
          </div>

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
            borderRadius: '6px',
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
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 800,
              color: 'var(--primary)',
              background: 'rgba(244, 63, 94, 0.08)',
              padding: '3px 10px',
              borderRadius: '6px',
            }}>
              {brand}
            </span>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              color: 'var(--text-secondary)',
            }}>
              {seller_name ? `بواسطة: ${seller_name}` : category}
            </span>
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
              <div style={{ 
                fontSize: '0.7rem', 
                color: 'var(--text-secondary)', 
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                opacity: 0.8
              }}>
                رقم القطعة: <span style={{ color: 'var(--text-primary)', background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px' }}>{part_number}</span>
              </div>
            )}
          </div>

          {/* Rating */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <div style={{ display: 'flex', gap: '2px' }}>
              {[1, 2, 3, 4, 5].map(s => (
                <Star
                  key={s}
                  size={14}
                  fill={s <= Math.round(rating) ? '#fbbf24' : 'transparent'}
                  stroke={s <= Math.round(rating) ? '#fbbf24' : 'var(--border)'}
                  strokeWidth={2}
                />
              ))}
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              ({reviews})
            </span>
          </div>

          {/* Price Section */}
          <div style={{
            marginTop: 'auto',
            paddingTop: '1rem',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {oldPrice && (
                <span style={{
                  fontSize: '0.85rem',
                  color: 'var(--text-secondary)',
                  textDecoration: 'line-through',
                  fontWeight: 500,
                }}>
                  {formatCurrency(oldPrice).replace('$', '')} ر.س
                </span>
              )}
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                <span style={{
                  fontSize: '1.4rem',
                  fontWeight: 900,
                  color: 'var(--text-primary)',
                  lineHeight: 1,
                }}>
                  {formatCurrency(price).replace('$', '')}
                </span>
                <span style={{
                  fontSize: '0.85rem',
                  color: 'var(--text-secondary)',
                  fontWeight: 800,
                }}>
                  ر.س
                </span>
              </div>
            </div>

            {/* Stock indicator */}
            <div style={{ textAlign: 'right' }}>
              <span style={{
                fontSize: '0.75rem',
                fontWeight: 800,
                color: stock === 'متوفر' ? '#10b981' : 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                justifyContent: 'flex-end'
              }}>
                <span style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: stock === 'متوفر' ? '#10b981' : 'var(--primary)',
                  display: 'inline-block',
                }} />
                {stock}
              </span>
            </div>
          </div>

          {/* Add to Cart Button */}
          {user?.id === seller_id ? (
            <a
              href={`/seller/products/edit/${id}`}
              style={{
                marginTop: '0.5rem',
                width: '100%',
                padding: '1rem',
                borderRadius: '12px',
                border: '1px solid var(--primary)',
                fontWeight: 950,
                fontSize: '1rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.3s ease',
                background: 'rgba(244, 63, 94, 0.05)',
                color: 'var(--primary)',
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
            </a>
          ) : (
            <button
              disabled={stock !== 'متوفر'}
              onClick={handleAddToCart}
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
                transition: 'all 0.3s ease',
                background: justAdded
                  ? '#059669'
                  : stock === 'متوفر'
                    ? 'var(--primary)'
                    : 'var(--surface-hover)',
                color: stock === 'متوفر' ? '#ffffff' : 'var(--text-secondary)',
                boxShadow: stock === 'متوفر'
                  ? '0 6px 20px rgba(244, 63, 94, 0.25)'
                  : 'none',
              }}
              onMouseOver={e => {
                 if (stock === 'متوفر' && !justAdded) {
                   e.currentTarget.style.background = 'var(--primary-hover)';
                   e.currentTarget.style.transform = 'scale(1.02)';
                 }
              }}
              onMouseOut={e => {
                 if (stock === 'متوفر' && !justAdded) {
                   e.currentTarget.style.background = 'var(--primary)';
                   e.currentTarget.style.transform = 'scale(1)';
                 }
              }}
            >
              {justAdded ? (
                <>
                  <Check size={20} /> تمت الإضافة
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
