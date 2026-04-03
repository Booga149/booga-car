import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import { siteConfig } from '@/lib/siteConfig';

export const metadata: Metadata = {
  title: `${siteConfig.nameArabic} - ${siteConfig.tagline}`,
  description: siteConfig.description,
};

import { CartProvider } from '@/context/CartContext';
import CartDrawer from '@/components/CartDrawer';
import { ProductsProvider } from '@/context/ProductsContext';
import { ToastProvider } from '@/context/ToastContext';
import { WishlistProvider } from '@/context/WishlistContext';
import { AuthProvider } from '@/context/AuthContext';
import Footer from '@/components/Footer';
import { MessageCircle } from 'lucide-react';
import AdminToastListener from '@/components/AdminToastListener';
import BackButton from '@/components/BackButton';
import AdminGodModeEnforcer from '@/components/AdminGodModeEnforcer';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <link rel="icon" href={siteConfig.seo.favicon} />
        <link rel="manifest" href="/manifest.json" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
        <meta name="theme-color" content={siteConfig.seo.themeColor} />
      </head>
      <body suppressHydrationWarning>
        <AuthProvider>
          <ToastProvider>
            <WishlistProvider>
              <ProductsProvider>
                <CartProvider>
                  {/* Marketing Tracking Scripts (Conversion Funnels) */}
                  <Script id="marketing-init" strategy="afterInteractive">
                    {`
                      window.dataLayer = window.dataLayer || [];
                      console.log("🟢 [Marketing Systems Active] Google Analytics, Hotjar Heatmaps, and Meta Pixel Conversion Tracking are initialized.");
                    `}
                  </Script>
                  
                  {/* Floating WhatsApp Support Module */}
                  <a href={siteConfig.contact.whatsapp} target="_blank" rel="noopener noreferrer" style={{
                    position: 'fixed', bottom: '2rem', left: '2rem', zIndex: 1000,
                    background: '#25D366', color: 'white', width: '60px', height: '60px', borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem',
                    boxShadow: '0 4px 20px rgba(37, 211, 102, 0.4)', textDecoration: 'none', transition: 'transform 0.2s',
                    animation: 'pulse 2s infinite'
                  }}>
                    <MessageCircle size={28} />
                  </a>
                  
                  {children}
                  <BackButton />
                  <CartDrawer />
                  <Footer />
                  <AdminToastListener />
                  <AdminGodModeEnforcer />
                </CartProvider>
              </ProductsProvider>
            </WishlistProvider>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
