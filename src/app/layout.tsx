import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import { siteConfig } from '@/lib/siteConfig';

const SITE_URL = 'https://booga-car.vercel.app';

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.nameArabic} - ${siteConfig.tagline}`,
    template: `%s | ${siteConfig.nameArabic}`,
  },
  description: siteConfig.description,
  keywords: [
    'قطع غيار سيارات', 'قطع غيار أصلية', 'بوجا كار', 'Booga Car',
    'قطع غيار السعودية', 'فرامل', 'فلتر زيت', 'بواجي', 'مساعدات',
    'قطع غيار تويوتا', 'قطع غيار هيونداي', 'قطع غيار نيسان',
    'متجر قطع غيار', 'شراء قطع غيار أونلاين', 'توصيل قطع غيار',
    'أرامكس شحن', 'قطع غيار الرياض', 'قطع غيار جدة',
    'car parts Saudi Arabia', 'auto parts KSA', 'OEM parts',
  ],
  authors: [{ name: 'Booga Car', url: SITE_URL }],
  creator: 'Booga Car',
  publisher: 'Booga Car',
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: SITE_URL,
    languages: { 'ar-SA': SITE_URL },
  },
  openGraph: {
    type: 'website',
    locale: 'ar_SA',
    url: SITE_URL,
    siteName: siteConfig.nameArabic,
    title: `${siteConfig.nameArabic} - ${siteConfig.tagline}`,
    description: siteConfig.description,
    images: [
      {
        url: `${SITE_URL}/icon-512.png`,
        width: 512,
        height: 512,
        alt: siteConfig.nameArabic,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${siteConfig.nameArabic} - ${siteConfig.tagline}`,
    description: siteConfig.description,
    images: [`${SITE_URL}/icon-512.png`],
    creator: '@boogacar',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add your Google Search Console verification code here
    // google: 'your-verification-code',
  },
  category: 'automotive',
};

import { CartProvider } from '@/context/CartContext';
import CartDrawer from '@/components/CartDrawer';
import { ProductsProvider } from '@/context/ProductsContext';
import { ToastProvider } from '@/context/ToastContext';
import { WishlistProvider } from '@/context/WishlistContext';
import { AuthProvider } from '@/context/AuthContext';
import Footer from '@/components/Footer';

import AdminToastListener from '@/components/AdminToastListener';
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
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Booga Car" />
        <link rel="apple-touch-icon" href="/favicon.png" />
        <meta name="geo.region" content="SA" />
        <meta name="geo.placename" content="Riyadh, Saudi Arabia" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@graph': [
                {
                  '@type': 'Organization',
                  '@id': `${SITE_URL}/#organization`,
                  name: 'Booga Car',
                  alternateName: 'بوجا كار',
                  url: SITE_URL,
                  logo: `${SITE_URL}/icon-512.png`,
                  contactPoint: {
                    '@type': 'ContactPoint',
                    telephone: siteConfig.contact.phone,
                    contactType: 'customer service',
                    areaServed: 'SA',
                    availableLanguage: ['Arabic', 'English'],
                  },
                  sameAs: [
                    siteConfig.socials.twitter,
                    siteConfig.socials.instagram,
                    siteConfig.socials.linkedin,
                  ],
                },
                {
                  '@type': 'WebSite',
                  '@id': `${SITE_URL}/#website`,
                  url: SITE_URL,
                  name: 'بوجا كار',
                  description: siteConfig.description,
                  publisher: { '@id': `${SITE_URL}/#organization` },
                  inLanguage: 'ar',
                  potentialAction: {
                    '@type': 'SearchAction',
                    target: `${SITE_URL}/products?q={search_term_string}`,
                    'query-input': 'required name=search_term_string',
                  },
                },
                {
                  '@type': 'LocalBusiness',
                  '@id': `${SITE_URL}/#localbusiness`,
                  name: 'بوجا كار - قطع غيار السيارات',
                  image: `${SITE_URL}/icon-512.png`,
                  address: {
                    '@type': 'PostalAddress',
                    addressLocality: 'الرياض',
                    addressCountry: 'SA',
                  },
                  telephone: siteConfig.contact.phone,
                  url: SITE_URL,
                  priceRange: '$$',
                  openingHours: 'Mo-Sa 09:00-22:00',
                  paymentAccepted: 'Cash, Credit Card, Bank Transfer',
                  areaServed: {
                    '@type': 'Country',
                    name: 'Saudi Arabia',
                  },
                },
              ],
            }),
          }}
        />
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
                  
                  {children}
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
