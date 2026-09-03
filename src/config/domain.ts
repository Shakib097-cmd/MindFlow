/**
 * MindFlow AI — Production Domain Configuration
 * 
 * Official Brand: MindFlow AI
 * Official Primary Domain: https://mindworkflow.in
 */

export const PRIMARY_DOMAIN = 'https://mindworkflow.in';
export const OFFICIAL_BRAND_NAME = 'MindFlow AI';

/**
 * Returns the effective base URL for the environment.
 * Preserves localhost during local development while using
 * the official production domain in production builds.
 */
export const getSiteUrl = (): string => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname.endsWith('.run.app') ||
      hostname.includes('googleusercontent.com') ||
      hostname.includes('webcontainer.io') ||
      hostname.includes('ngrok')
    ) {
      return window.location.origin;
    }
  }
  return PRIMARY_DOMAIN;
};

/**
 * Generates an absolute public mind map sharing URL.
 * Defaults to the official production domain.
 */
export const getShareUrl = (shareToken: string): string => {
  const base = getSiteUrl();
  return `${base}/#share-${shareToken}`;
};

/**
 * Generates canonical SEO URLs.
 */
export const getCanonicalUrl = (path = ''): string => {
  const cleanPath = path ? (path.startsWith('/') ? path : `/${path}`) : '/';
  return `${PRIMARY_DOMAIN}${cleanPath === '/' ? '/' : cleanPath}`;
};
