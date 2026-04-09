"use client";
import dynamic from 'next/dynamic';

const WhatsAppButton = dynamic(() => import('@/components/WhatsAppButton'), { ssr: false });

export default function WhatsAppButtonWrapper() {
  return <WhatsAppButton />;
}
