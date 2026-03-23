import About from '../../src/legacy-pages/About/About.jsx';
import { buildDefaultMetadata } from '../../lib/seo.js';
import { getAboutContent } from '../../lib/posts.js';

export const revalidate = 300;
export const metadata = buildDefaultMetadata({
  title: '关于',
  description: '了解 Aurora Blog 与作者。',
  path: '/about',
  image: 'images/background.webp',
});

export default async function AboutRoute() {
  const content = await getAboutContent();
  return <About initialContent={content?.content || ''} />;
}
