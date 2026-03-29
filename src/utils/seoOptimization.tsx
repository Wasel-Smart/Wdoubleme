/**
 * SEO Optimization Utils for Wasel
 * 
 * Features:
 * - Dynamic meta tags generation
 * - Schema.org structured data
 * - Open Graph tags
 * - Twitter Card tags
 * - JSON-LD for rich snippets
 * - Sitemap generation
 * - Robots.txt optimization
 */

import { useEffect } from 'react';
import type { TripData } from '../components/TripCardWithWhatsApp';

const BRAND_NAME = 'Wasel';
const BRAND_TITLE = 'Wasel | واصل';
const BRAND_DESCRIPTION = "Jordan's smart mobility platform for rides, delivery, buses, and wallet services.";

// ══════════════════════════════════════════════════════════════════════════════
// META TAGS MANAGEMENT
// ══════════════════════════════════════════════════════════════════════════════

export interface SEOMetadata {
  title: string;
  description: string;
  keywords?: string[];
  canonical?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'product';
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  locale?: 'ar_JO' | 'en_US';
}

/**
 * Set dynamic meta tags for SEO
 */
export function useSEO(metadata: SEOMetadata) {
  useEffect(() => {
    const { 
      title, 
      description, 
      keywords = [], 
      canonical, 
      ogImage = '/og-image.png',
      ogType = 'website',
      twitterCard = 'summary_large_image',
      author,
      publishedTime,
      modifiedTime,
      locale = 'ar_JO',
    } = metadata;

    // Set document title
    document.title = title;

    // Helper to set meta tag
    const setMeta = (name: string, content: string, type: 'name' | 'property' = 'name') => {
      let element = document.querySelector(`meta[${type}="${name}"]`) as HTMLMetaElement;
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(type, name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Basic meta tags
    setMeta('description', description);
    if (keywords.length > 0) {
      setMeta('keywords', keywords.join(', '));
    }
    if (author) {
      setMeta('author', author);
    }

    // Canonical URL
    if (canonical) {
      let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'canonical');
        document.head.appendChild(link);
      }
      link.setAttribute('href', canonical);
    }

    // Open Graph tags
    setMeta('og:title', title, 'property');
    setMeta('og:description', description, 'property');
    setMeta('og:type', ogType, 'property');
    setMeta('og:image', ogImage, 'property');
    setMeta('og:locale', locale, 'property');
    if (canonical) {
      setMeta('og:url', canonical, 'property');
    }

    // Twitter Card tags
    setMeta('twitter:card', twitterCard);
    setMeta('twitter:title', title);
    setMeta('twitter:description', description);
    setMeta('twitter:image', ogImage);

    // Article-specific tags
    if (publishedTime) {
      setMeta('article:published_time', publishedTime, 'property');
    }
    if (modifiedTime) {
      setMeta('article:modified_time', modifiedTime, 'property');
    }

    // Mobile app tags
    setMeta('apple-mobile-web-app-capable', 'yes');
    setMeta('apple-mobile-web-app-status-bar-style', 'default');
    setMeta('apple-mobile-web-app-title', BRAND_NAME);
    setMeta('mobile-web-app-capable', 'yes');

    // Cleanup function
    return () => {
      // Optionally restore default title
      document.title = `${BRAND_TITLE} - شريكك الذكي بالتنقل`;
    };
  }, [metadata]);
}

// ══════════════════════════════════════════════════════════════════════════════
// STRUCTURED DATA (Schema.org JSON-LD)
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Generate JSON-LD structured data for the entire website
 */
export function generateWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: BRAND_TITLE,
    url: 'https://wasel.jo',
    description: BRAND_DESCRIPTION,
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://wasel.jo/search?from={from}&to={to}',
      'query-input': 'required name=from name=to',
    },
    inLanguage: ['ar-JO', 'en-US'],
    publisher: {
      '@type': 'Organization',
      name: BRAND_NAME,
      logo: {
        '@type': 'ImageObject',
        url: 'https://wasel.jo/logo.png',
      },
    },
  };
}

/**
 * Generate JSON-LD structured data for a trip listing
 */
export function generateTripSchema(trip: TripData) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BusTrip',
    name: `${trip.from} to ${trip.to}`,
    description: `Ride from ${trip.from} to ${trip.to} on ${trip.date} at ${trip.time}`,
    departureLocation: {
      '@type': 'Place',
      name: trip.from,
    },
    arrivalLocation: {
      '@type': 'Place',
      name: trip.to,
    },
    departureTime: `${trip.date}T${trip.time}`,
    provider: {
      '@type': 'Person',
      name: trip.driver.name,
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: trip.driver.rating,
        bestRating: 5,
        worstRating: 1,
      },
    },
    offers: {
      '@type': 'Offer',
      price: trip.price,
      priceCurrency: 'JOD',
      availability: trip.availableSeats > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      validFrom: new Date().toISOString(),
      url: `https://wasel.jo/trips/${trip.id}`,
    },
  };
}

/**
 * Generate JSON-LD for local business
 */
export function generateLocalBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: BRAND_NAME,
    description: BRAND_DESCRIPTION,
    url: 'https://wasel.jo',
    logo: 'https://wasel.jo/logo.png',
    image: 'https://wasel.jo/og-image.png',
    telephone: '+962-79-000-0000',
    email: 'support@wasel.jo',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Amman, Jordan',
      addressLocality: 'Amman',
      addressCountry: 'JO',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 31.9454,
      longitude: 35.9284,
    },
    openingHours: 'Mo-Su 00:00-24:00',
    priceRange: 'JOD 3-25',
    areaServed: {
      '@type': 'Country',
      name: 'Jordan',
    },
  };
}

/**
 * Generate JSON-LD for FAQs
 */
export function generateFAQSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/**
 * Insert JSON-LD script into document head
 */
export function insertJSONLD(data: object) {
  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(data);
    script.id = 'jsonld-schema';
    
    const existing = document.getElementById('jsonld-schema');
    if (existing) {
      existing.replaceWith(script);
    } else {
      document.head.appendChild(script);
    }

    return () => {
      script.remove();
    };
  }, [data]);
}

// ══════════════════════════════════════════════════════════════════════════════
// ROUTE-SPECIFIC SEO
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Generate SEO metadata for trip search page
 */
export function generateTripSearchSEO(from: string, to: string, date?: string): SEOMetadata {
  const routeName = `${from} → ${to}`;
  const dateStr = date ? ` on ${date}` : '';
  
  return {
      title: `Rides from ${from} to ${to}${dateStr} | ${BRAND_NAME}`,
    description: `Find affordable carpooling rides from ${from} to ${to}${dateStr}. Book seats, compare prices, and travel safely across Jordan.`,
    keywords: [
      `${from} to ${to}`,
      `carpool ${from} ${to}`,
      `rides ${from} ${to}`,
      'Jordan carpooling',
      'intercity transport Jordan',
      'cheap travel Jordan',
      from,
      to,
    ],
    canonical: `https://wasel.jo/search?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
    ogType: 'website',
  };
}

/**
 * Generate SEO metadata for home page
 */
export function generateHomeSEO(language: 'ar' | 'en'): SEOMetadata {
  if (language === 'ar') {
    return {
      title: `${BRAND_TITLE} - شريكك الذكي بالتنقل`,
      description: 'منصة التنقل الأذكى في الأردن. احجز رحلات مشتركة، باصات، وأرسل طرود بأسعار مناسبة. آلاف الرحلات اليومية بين المدن.',
      keywords: [
        'واصل',
        'تنقل',
        'مشاوير',
        'كاربولينج',
        'باصات',
        'الأردن',
        'عمان',
        'العقبة',
        'إربد',
        'توصيل طرود',
      ],
      canonical: 'https://wasel.jo',
      locale: 'ar_JO',
    };
  }

  return {
      title: `${BRAND_NAME} | Jordan's Smart Mobility Platform`,
    description: 'Jordan\'s leading intercity mobility marketplace. Find carpooling rides, book buses, and send packages affordably. Thousands of daily trips across Jordan.',
    keywords: [
      'Wasel',
      'carpooling Jordan',
      'ridesharing',
      'intercity transport',
      'bus booking Jordan',
      'Amman to Aqaba',
      'Amman to Irbid',
      'package delivery',
      'travel Jordan',
    ],
    canonical: 'https://wasel.jo',
    locale: 'en_US',
  };
}

/**
 * Generate SEO metadata for driver page
 */
export function generateDriverSEO(driverName: string, rating: number, trips: number): SEOMetadata {
  return {
      title: `${driverName} - Verified Driver | ${BRAND_NAME}`,
    description: `Book a ride with ${driverName}, a verified driver with ${rating}★ rating and ${trips} completed trips. Safe and reliable travel across Jordan.`,
    keywords: [
      driverName,
      'verified driver Jordan',
      'carpooling driver',
      'safe driver',
      'rideshare Jordan',
    ],
    ogType: 'profile',
  };
}

// ══════════════════════════════════════════════════════════════════════════════
// SITEMAP GENERATION
// ══════════════════════════════════════════════════════════════════════════════

export interface SitemapURL {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

/**
 * Generate sitemap XML
 */
export function generateSitemapXML(urls: SitemapURL[]): string {
  const urlEntries = urls.map(url => `
  <url>
    <loc>${url.loc}</loc>
    ${url.lastmod ? `<lastmod>${url.lastmod}</lastmod>` : ''}
    ${url.changefreq ? `<changefreq>${url.changefreq}</changefreq>` : ''}
    ${url.priority !== undefined ? `<priority>${url.priority}</priority>` : ''}
  </url>`).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;
}

/**
 * Generate default sitemap URLs
 */
export function getDefaultSitemapURLs(): SitemapURL[] {
  const baseURL = 'https://wasel.jo';
  const now = new Date().toISOString().split('T')[0];

  return [
    { loc: baseURL, lastmod: now, changefreq: 'daily', priority: 1.0 },
    { loc: `${baseURL}/search`, lastmod: now, changefreq: 'hourly', priority: 0.9 },
    { loc: `${baseURL}/post-ride`, lastmod: now, changefreq: 'daily', priority: 0.8 },
    { loc: `${baseURL}/how-it-works`, lastmod: now, changefreq: 'monthly', priority: 0.7 },
    { loc: `${baseURL}/safety`, lastmod: now, changefreq: 'monthly', priority: 0.7 },
    { loc: `${baseURL}/about`, lastmod: now, changefreq: 'monthly', priority: 0.6 },
    { loc: `${baseURL}/contact`, lastmod: now, changefreq: 'monthly', priority: 0.6 },
    { loc: `${baseURL}/terms`, lastmod: now, changefreq: 'yearly', priority: 0.5 },
    { loc: `${baseURL}/privacy`, lastmod: now, changefreq: 'yearly', priority: 0.5 },
  ];
}

// ══════════════════════════════════════════════════════════════════════════════
// ROBOTS.TXT GENERATION
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Generate robots.txt content
 */
export function generateRobotsTxt(sitemapURL = 'https://wasel.jo/sitemap.xml'): string {
return `# ${BRAND_NAME} - Robots.txt
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /private/
Disallow: /*.json$
Disallow: /*?*sessionid=

# Sitemap
Sitemap: ${sitemapURL}

# Crawl-delay for aggressive bots
User-agent: AhrefsBot
Crawl-delay: 10

User-agent: SemrushBot
Crawl-delay: 10

# Allow social media crawlers
User-agent: facebookexternalhit
Allow: /

User-agent: Twitterbot
Allow: /
`;
}

// ══════════════════════════════════════════════════════════════════════════════
// SOCIAL SHARING
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Generate shareable URL with UTM parameters
 */
export function generateShareURL(
  url: string,
  source: 'whatsapp' | 'facebook' | 'twitter' | 'telegram' | 'email',
  medium = 'social',
  campaign = 'organic_share'
): string {
  const urlObj = new URL(url);
  urlObj.searchParams.set('utm_source', source);
  urlObj.searchParams.set('utm_medium', medium);
  urlObj.searchParams.set('utm_campaign', campaign);
  return urlObj.toString();
}

/**
 * Track social shares (for analytics)
 */
export function trackSocialShare(platform: string, url: string, title: string) {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'share', {
      method: platform,
      content_type: 'trip',
      content_id: url,
      title,
    });
  }

  console.log('Social share tracked:', { platform, url, title });
}
