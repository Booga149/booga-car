"use client";
import { useRouter, usePathname } from 'next/navigation';
import { ArrowRight } from 'lucide-react';

// Pages where the back button should NOT appear
const HIDDEN_ON = ['/', '/products', '/categories'];

export default function BackButton() {
  const router = useRouter();
  const pathname = usePathname();

  // Don't show on home page or main listing pages
  if (HIDDEN_ON.includes(pathname)) return null;

  return (
    <button
      onClick={() => router.back()}
      title="رجوع"
      style={{
        position: 'fixed',
        bottom: '2rem',
        right: '2rem',
        zIndex: 999,
        width: '52px',
        height: '52px',
        borderRadius: '50%',
        background: 'rgba(20,20,20,0.92)',
        border: '1px solid rgba(255,255,255,0.1)',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
        backdropFilter: 'blur(10px)',
        transition: 'all 0.25s ease',
      }}
      onMouseOver={e => {
        e.currentTarget.style.background = 'rgba(212,175,55,0.15)';
        e.currentTarget.style.borderColor = 'rgba(212,175,55,0.5)';
        e.currentTarget.style.transform = 'scale(1.1)';
      }}
      onMouseOut={e => {
        e.currentTarget.style.background = 'rgba(20,20,20,0.92)';
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
        e.currentTarget.style.transform = 'scale(1)';
      }}
    >
      <ArrowRight size={22} />
    </button>
  );
}
