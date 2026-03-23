import { PUBLIC_SITE_URL } from '../lib/env.js';

export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/profile'],
      },
    ],
    sitemap: `${PUBLIC_SITE_URL.replace(/\/+$/, '')}/sitemap.xml`,
    host: PUBLIC_SITE_URL,
  };
}
