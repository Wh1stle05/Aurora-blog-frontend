import ProfilePage from '../../components/pages/profile-page.jsx';
import { buildDefaultMetadata } from '../../lib/seo.js';

export const metadata = buildDefaultMetadata({
  title: '个人中心',
  description: '管理头像、昵称和绑定邮箱。',
  path: '/profile',
});

export default function ProfileRoute() {
  return <ProfilePage />;
}
