import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://booga-car.vercel.app';

  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/products', '/catalog', '/request-part'],
      disallow: ['/admin', '/api/', '/checkout', '/invoice', '/track-order', '/auth/callback'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
