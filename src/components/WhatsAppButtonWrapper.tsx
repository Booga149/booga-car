"use client";
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';

const WhatsAppButton = dynamic(() => import('@/components/WhatsAppButton'), { ssr: false });

export default function WhatsAppButtonWrapper() {
  const pathname = usePathname();
  if (pathname?.startsWith('/checkout')) {
    return null;
  }
  return <WhatsAppButton />;
}
