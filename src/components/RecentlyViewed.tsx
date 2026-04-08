"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Clock } from 'lucide-react';

interface RecentItem {
  id: string;
  name: string;
  price: number;
  image: string;
}

const STORAGE_KEY = 'booga_recently_viewed';
const MAX_ITEMS = 8;

/** Call this from product detail pages to save a viewed product */
export function saveRecentlyViewed(product: RecentItem) {
  if (typeof window === 'undefined') return;
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as RecentItem[];
    const filtered = stored.filter(p => p.id !== product.id);
    filtered.unshift(product);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered.slice(0, MAX_ITEMS)));
  } catch {}
}

export default function RecentlyViewed() {
  const [items, setItems] = useState<RecentItem[]>([]);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as RecentItem[];
      setItems(stored);
    } catch {}
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="mobile-only" style={{
      display: 'none',
      flexDirection: 'column',
      gap: '0.8rem',
      padding: '1rem 1rem 0',
    }}>
      <div style={{ 
        display: 'flex', alignItems: 'center', gap: '0.4rem',
        color: 'var(--text-secondary)', fontSize: '0.78rem', fontWeight: 800,
      }}>
        <Clock size={14} />
        شاهدته مؤخراً
      </div>

      <div style={{
        display: 'flex',
        gap: '0.6rem',
        overflowX: 'auto',
        paddingBottom: '0.5rem',
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'none',
      }}>
        {items.map(item => (
          <Link
            key={item.id}
            href={`/products/${item.id}`}
            style={{
              flexShrink: 0,
              width: '100px',
              textDecoration: 'none',
              color: 'inherit',
            }}
          >
            <div style={{
              width: '100px',
              height: '80px',
              borderRadius: '10px',
              overflow: 'hidden',
              background: 'rgba(0,0,0,0.03)',
              border: '1px solid var(--border)',
              marginBottom: '0.3rem',
            }}>
              <img
                src={item.image}
                alt={item.name}
                loading="lazy"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            </div>
            <div style={{
              fontSize: '0.65rem',
              fontWeight: 700,
              color: 'var(--text-secondary)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {item.name}
            </div>
            <div style={{
              fontSize: '0.7rem',
              fontWeight: 900,
              color: '#10b981',
            }}>
              {item.price} ر.س
            </div>
          </Link>
        ))}
      </div>

      <style jsx>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
