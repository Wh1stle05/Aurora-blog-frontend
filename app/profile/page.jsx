import Profile from '../../src/legacy-pages/Profile/Profile.jsx';
import { buildDefaultMetadata } from '../../lib/seo.js';

export const metadata = buildDefaultMetadata({
  title: '个人中心',
  description: '管理账号资料与头像。',
  path: '/profile',
  image: 'images/background.webp',
});

export default function ProfileRoute() {
  return <Profile />;
}
