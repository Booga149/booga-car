"use client";
import { useRouter, usePathname } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { useState } from 'react';

const HIDDEN_ON = ['/', '/products', '/categories'];

export default function BackButton() {
  const router = useRouter();
  const pathname = usePathname();
  const [hovered, setHovered] = useState(false);

  if (HIDDEN_ON.includes(pathname)) return null;

  return (
    <button
      onClick={() => router.back()}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'fixed',
        top: '50%',
        right: 0,
        transform: 'translateY(-50%)',
        zIndex: 998,
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: hovered ? '0.75rem 1.2rem' : '0.75rem 0.8rem',
        background: hovered ? '#D4AF37' : 'rgba(212,175,55,0.12)',
        border: '1px solid rgba(212,175,55,0.35)',
        borderRight: 'none',
        borderRadius: '12px 0 0 12px',
        color: hovered ? '#000' : '#D4AF37',
        fontWeight: 800,
        fontSize: '0.9rem',
        cursor: 'pointer',
        boxShadow: hovered ? '0 4px 24px rgba(212,175,55,0.35)' : '0 2px 12px rgba(0,0,0,0.3)',
        transition: 'all 0.25s ease',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
      }}
    >
      <ArrowRight size={20} />
      <span style={{
        maxWidth: hovered ? '80px' : '0',
        overflow: 'hidden',
        transition: 'max-width 0.25s ease',
        display: 'inline-block',
      }}>
        رجوع
      </span>
    </button>
  );
}
