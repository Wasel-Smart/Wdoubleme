/**
 * SEO & Meta Tags Utility — Wasel | واصل
 * Best practices for search engine optimization
 * Dynamic meta tags, Open Graph, Twitter Cards, structured data
 */

export interface SEOConfig {
  title: string;
  titleAr?: string;
  description: string;
  descriptionAr?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  noindex?: boolean;
  nofollow?: boolean;
  canonical?: string;
}

/**
 * Set document title with brand suffix
 */
export function setPageTitle(title: string, language: 'en' | 'ar' = 'en'): void {
  const brandSuffix = language === 'ar' ? 'واصل | Wasel' : 'Wasel | واصل';
  document.title = `${title} | ${brandSuffix}`;
}

/**
 * Update or create meta tag
 */
function setMetaTag(name: string, content: string, attribute: 'name' | 'property' = 'name'): void {
  let element = document.querySelector(`meta[${attribute}="${name}"]`);
  
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, name);
    document.head.appendChild(element);
  }
  
  element.setAttribute('content', content);
}

/**
 * Apply comprehensive SEO configuration
 */
export function applySEO(config: SEOConfig, language: 'en' | 'ar' = 'en'): void {
  const {
    title,
    titleAr,
    description,
    descriptionAr,
    keywords = [],
    image = 'https://wasel.jo/og-image.png',
    url = window.location.href,
    type = 'website',
    author,
    publishedTime,
    modifiedTime,
    noindex = false,
    nofollow = false,
    canonical,
  } = config;

  // Set document title
  const finalTitle = language === 'ar' && titleAr ? titleAr : title;
  setPageTitle(finalTitle, language);

  // Basic meta tags
  const finalDescription = language === 'ar' && descriptionAr ? descriptionAr : description;
  setMetaTag('description', finalDescription);
  
  if (keywords.length > 0) {
    setMetaTag('keywords', keywords.join(', '));
  }

  if (author) {
    setMetaTag('author', author);
  }

  // Robots meta
  const robotsContent = [
    noindex ? 'noindex' : 'index',
    nofollow ? 'nofollow' : 'follow',
  ].join(', ');
  setMetaTag('robots', robotsContent);

  // Canonical URL
  if (canonical) {
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'canonical';
      document.head.appendChild(link);
    }
    link.href = canonical;
  }

  // Open Graph tags
  setMetaTag('og:title', finalTitle, 'property');
  setMetaTag('og:description', finalDescription, 'property');
  setMetaTag('og:image', image, 'property');
  setMetaTag('og:url', url, 'property');
  setMetaTag('og:type', type, 'property');
  setMetaTag('og:site_name', 'Wasel | واصل', 'property');
  setMetaTag('og:locale', language === 'ar' ? 'ar_JO' : 'en_US', 'property');
  setMetaTag('og:locale:alternate', language === 'ar' ? 'en_US' : 'ar_JO', 'property');

  // Twitter Card tags
  setMetaTag('twitter:card', 'summary_large_image');
  setMetaTag('twitter:title', finalTitle);
  setMetaTag('twitter:description', finalDescription);
  setMetaTag('twitter:image', image);
  setMetaTag('twitter:site', '@WaselJordan');

  // Article meta tags (if applicable)
  if (type === 'article') {
    if (publishedTime) {
      setMetaTag('article:published_time', publishedTime, 'property');
    }
    if (modifiedTime) {
      setMetaTag('article:modified_time', modifiedTime, 'property');
    }
    if (author) {
      setMetaTag('article:author', author, 'property');
    }
  }

  // Mobile web app meta tags
  setMetaTag('mobile-web-app-capable', 'yes');
  setMetaTag('apple-mobile-web-app-capable', 'yes');
  setMetaTag('apple-mobile-web-app-status-bar-style', 'black-translucent');
  setMetaTag('apple-mobile-web-app-title', 'Wasel');
  setMetaTag('theme-color', '#00C8E8');
  setMetaTag('msapplication-TileColor', '#00C8E8');
  setMetaTag('msapplication-TileImage', '/icon-512.png');
}

/**
 * Generate JSON-LD structured data for rich snippets
 */
export function generateStructuredData(type: 'Organization' | 'WebSite' | 'MobileApplication' | 'Article', data?: any): string {
  const baseUrl = 'https://wasel.jo';

  const schemas: Record<string, any> = {
    Organization: {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Wasel | واصل',
      alternateName: 'Wasel',
      url: baseUrl,
      logo: `${baseUrl}/icon-512.png`,
      description: 'Intercity carpooling and package delivery platform for Jordan. Share the journey, share the cost.',
      foundingDate: '2026',
      founders: [
        {
          '@type': 'Person',
          name: 'Wasel Team',
        },
      ],
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'JO',
        addressLocality: 'Amman',
      },
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'Customer Service',
        email: 'support@wasel.jo',
        availableLanguage: ['English', 'Arabic'],
      },
      sameAs: [
        'https://facebook.com/WaselJordan',
        'https://twitter.com/WaselJordan',
        'https://instagram.com/WaselJordan',
        'https://linkedin.com/company/wasel',
      ],
    },

    WebSite: {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Wasel | واصل',
      url: baseUrl,
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${baseUrl}/carpooling/search?from={origin}&to={destination}`,
        },
        'query-input': 'required name=origin, required name=destination',
      },
    },

    MobileApplication: {
      '@context': 'https://schema.org',
      '@type': 'MobileApplication',
      name: 'Wasel | واصل',
      operatingSystem: 'Web',
      applicationCategory: 'TravelApplication',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'JOD',
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.8',
        ratingCount: '2400',
        bestRating: '5',
        worstRating: '1',
      },
    },

    Article: {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: data?.title || '',
      description: data?.description || '',
      image: data?.image || `${baseUrl}/og-image.png`,
      datePublished: data?.publishedTime || new Date().toISOString(),
      dateModified: data?.modifiedTime || new Date().toISOString(),
      author: {
        '@type': 'Organization',
        name: 'Wasel',
      },
      publisher: {
        '@type': 'Organization',
        name: 'Wasel',
        logo: {
          '@type': 'ImageObject',
          url: `${baseUrl}/icon-512.png`,
        },
      },
    },
  };

  return JSON.stringify(schemas[type]);
}

/**
 * Inject structured data script into document head
 */
export function injectStructuredData(type: 'Organization' | 'WebSite' | 'MobileApplication' | 'Article', data?: any): void {
  // Remove existing structured data of this type
  const existingScript = document.querySelector(`script[type="application/ld+json"][data-type="${type}"]`);
  if (existingScript) {
    existingScript.remove();
  }

  // Create and inject new structured data
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.setAttribute('data-type', type);
  script.textContent = generateStructuredData(type, data);
  document.head.appendChild(script);
}

/**
 * SEO presets for common pages
 */
export const SEO_PRESETS = {
  home: {
    title: 'Intercity Carpooling & Package Delivery',
    titleAr: 'مشاركة الرحلات وتوصيل الطرود بين المدن',
    description: 'Share rides and save money on intercity trips in Jordan. Carpooling from Amman to Aqaba, Irbid, Dead Sea. Cultural features: prayer stops, gender preferences, Ramadan mode.',
    descriptionAr: 'شارك الرحلات ووفّر المصاري في رحلات بين المدن في الأردن. مشاركة رحلات من عمّان للعقبة، إربد، البحر الميت. ميزات ثقافية: وقفات صلاة، تفضيلات جنس، وضع رمضان.',
    keywords: ['carpooling jordan', 'ride sharing amman', 'intercity travel', 'مشاركة رحلات', 'تنقل بين المدن', 'عمان العقبة', 'wasel', 'awasel', 'package delivery'],
    type: 'website' as const,
  },

  search: {
    title: 'Search Rides',
    titleAr: 'ابحث عن رحلة',
    description: 'Find affordable carpools between cities in Jordan. Search rides from Amman to Aqaba, Irbid, Dead Sea, Petra, Wadi Rum. Save up to 70% on travel costs.',
    descriptionAr: 'دور على مشاركة رحلات بين المدن في الأردن. ابحث عن رحلات من عمّان للعقبة، إربد، البحر الميت، البتراء، وادي رم. وفّر لحد 70% من تكاليف السفر.',
    keywords: ['search rides jordan', 'find carpool', 'amman aqaba', 'ابحث رحلة', 'مشاركة رحلات'],
    type: 'website' as const,
  },

  auth: {
    title: 'Sign In / Sign Up',
    titleAr: 'تسجيل الدخول / إنشاء حساب',
    description: 'Join Wasel community. Sign up to share rides, send packages, and save money on intercity travel in Jordan.',
    descriptionAr: 'انضم لمجتمع واصل. سجّل لمشاركة الرحلات، إرسال الطرود، والتوفير في السفر بين المدن.',
    keywords: ['wasel login', 'sign up jordan', 'تسجيل دخول', 'إنشاء حساب'],
    noindex: false,
    type: 'website' as const,
  },

  packages: {
    title: 'Send Packages | Awasel',
    titleAr: 'أرسل طرود | أواصل',
    description: 'Send packages between cities with travelers already going there. Fast, affordable, insured delivery across Jordan.',
    descriptionAr: 'أرسل طرود بين المدن مع مسافرين رايحين هناك. توصيل سريع، رخيص، ومؤمّن في كل الأردن.',
    keywords: ['package delivery jordan', 'awasel', 'send parcel', 'إرسال طرود', 'توصيل سريع'],
    type: 'website' as const,
  },
};

/**
 * Apply default SEO for the entire app
 */
export function applyDefaultSEO(language: 'en' | 'ar' = 'en'): void {
  applySEO(SEO_PRESETS.home, language);
  injectStructuredData('Organization');
  injectStructuredData('WebSite');
  injectStructuredData('MobileApplication');
}
