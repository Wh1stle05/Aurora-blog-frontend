import Contact from '../../src/legacy-pages/Contact/Contact.jsx';
import { buildDefaultMetadata } from '../../lib/seo.js';

export const metadata = buildDefaultMetadata({
  title: '联系',
  description: '通过 Aurora Blog 联系作者。',
  path: '/contact',
  image: 'images/background.webp',
});

export default function ContactRoute() {
  return <Contact />;
}
