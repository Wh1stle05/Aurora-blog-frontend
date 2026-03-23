import 'react-image-crop/dist/ReactCrop.css';

import './globals.css';
import { AppProviders } from '../components/providers/app-providers.jsx';
import { SiteShell } from '../components/chrome/site-shell.jsx';
import { buildDefaultMetadata } from '../lib/seo.js';
import { PUBLIC_SITE_URL } from '../lib/env.js';

export const metadata = buildDefaultMetadata({
  title: 'Aurora Blog',
  description: '一个充满科技感的个人博客系统，记录技术与生活的每一个瞬间。',
  path: '/',
  image: 'images/background.webp',
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
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ThemeBootScript />
        <AppProviders>
          <SiteShell>{children}</SiteShell>
        </AppProviders>
      </body>
    </html>
  );
}
