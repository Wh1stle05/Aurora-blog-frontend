'use client';

import ProfileView from '../../src/legacy-pages/Profile/Profile.jsx';
import { useAuth } from '../../src/context/useAuth.js';

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  return <ProfileView user={user} onUserUpdate={setUser} />;
}
