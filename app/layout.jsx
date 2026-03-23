import 'react-image-crop/dist/ReactCrop.css';
import { Noto_Sans_SC } from 'next/font/google';

import './globals.css';
import { resolveAssetUrl } from '../lib/assets.js';
import { buildDefaultMetadata } from '../lib/seo.js';
import { PUBLIC_SITE_URL } from '../lib/env.js';
import { AppProviders } from '../components/providers/app-providers.jsx';
import { SiteShell } from '../components/chrome/site-shell.jsx';

const notoSans = Noto_Sans_SC({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700', '900'],
  display: 'swap',
});

export const metadata = buildDefaultMetadata({
  description: '一个聚焦开发、部署与实践记录的技术博客。',
  path: '/',
});
metadata.metadataBase = new URL(PUBLIC_SITE_URL);

function ThemeBootScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `(function(){try{var theme=localStorage.getItem('theme')||'dark';document.documentElement.setAttribute('data-theme',theme);}catch(e){document.documentElement.setAttribute('data-theme','dark');}})();`,
      }}
    />
  );
}

export default function RootLayout({ children }) {
  const backgroundImage = resolveAssetUrl('images/background.webp');

  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body
        className={notoSans.className}
        style={{ '--global-bg-image': `url(${backgroundImage})` }}
        suppressHydrationWarning
      >
        <ThemeBootScript />
        <AppProviders>
          <SiteShell>{children}</SiteShell>
        </AppProviders>
      </body>
    </html>
  );
}
