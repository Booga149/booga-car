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

import AdminToastListener from '@/components/AdminToastListener';
import BackButton from '@/components/BackButton';
import AdminGodModeEnforcer from '@/components/AdminGodModeEnforcer';
import MobileBottomNav from '@/components/MobileBottomNav';
import VisitorTracker from '@/components/VisitorTracker';
import WhatsAppButtonWrapper from '@/components/WhatsAppButtonWrapper';
import PWAInstaller from '@/components/PWAInstaller';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <link rel="icon" href={siteConfig.seo.favicon} />
        <link rel="manifest" href="/manifest.json" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
        <meta name="theme-color" content={siteConfig.seo.themeColor} />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Booga Car" />
        <link rel="apple-touch-icon" href="/favicon.png" />
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
                  <WhatsAppButtonWrapper />
                  
                  {children}
                  <BackButton />
                  <CartDrawer />
                  <Footer />
                  <AdminToastListener />
                  <AdminGodModeEnforcer />
                  <MobileBottomNav />
                  <VisitorTracker />
                  <PWAInstaller />
                </CartProvider>
              </ProductsProvider>
            </WishlistProvider>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
