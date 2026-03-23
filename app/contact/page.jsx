import ContactView from '../../src/legacy-pages/Contact/Contact.jsx';
import { buildDefaultMetadata } from '../../lib/seo.js';

export const metadata = buildDefaultMetadata({
  title: '联系',
  description: '通过联系页向 Aurora Blog 发送消息。',
  path: '/contact',
});

export default function ContactRoute() {
  return <ContactView />;
}
