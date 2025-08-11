import type { Metadata } from 'next';

const SITE_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'ECE NTUA Portal';
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');

function buildOgUrl(params: Record<string,string | undefined>) {
  const query = Object.entries(params).filter(([,v])=> v).map(([k,v])=> `${k}=${encodeURIComponent(v!)}`).join('&');
  return `${SITE_URL}/api/og${query?`?${query}`:''}`;
}

export interface SeoOgParams {
  type?: string; // profile|course|project|faculty|dept|generic
  titleOverride?: string; // override displayed OG title
  subtitle?: string;
  code?: string; // course code
  slug?: string; // project/dept slug
  username?: string; // profile/faculty
}

export function seo(title: string, description?: string, og?: SeoOgParams): Metadata {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  const ogImage = buildOgUrl({
    type: og?.type || 'generic',
    title: og?.titleOverride || title || SITE_NAME,
    subtitle: og?.subtitle,
    code: og?.code,
    slug: og?.slug,
    username: og?.username
  });
  return {
    title: fullTitle,
    description,
    openGraph: {
      title: fullTitle,
      description,
      siteName: SITE_NAME,
      url: SITE_URL,
      type: 'website',
      images: [{ url: ogImage }]
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [ogImage]
    },
    alternates: {
      canonical: SITE_URL
    }
  };
}

export function dynamicOg(partial: Omit<SeoOgParams,'titleOverride'> & { title: string; description?: string; }): Metadata {
  return seo(partial.title, partial.description, partial as SeoOgParams);
}
