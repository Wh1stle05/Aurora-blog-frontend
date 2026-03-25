import { render, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { ToastContext } from './ToastContextBase.js';
import { AuthProvider } from './AuthContext.jsx';
import { useAuth } from './useAuth.js';

function Probe() {
  const { user } = useAuth();
  return <div>{user ? user.nickname : 'guest'}</div>;
}

it('clears auth state when auth-expired event is dispatched', async () => {
  localStorage.setItem('access_token', 'token');
  localStorage.setItem('user', JSON.stringify({ id: 1, nickname: 'Wh1stle' }));
  global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ id: 1, nickname: 'Wh1stle' }) });
  const toast = { success: vi.fn(), error: vi.fn(), info: vi.fn() };

  const { getByText } = render(
    <ToastContext.Provider value={toast}>
      <AuthProvider>
        <Probe />
      </AuthProvider>
    </ToastContext.Provider>,
  );

  await waitFor(() => getByText('Wh1stle'));
  window.dispatchEvent(new CustomEvent('aurora:auth-expired'));

  await waitFor(() => getByText('guest'));
  expect(localStorage.getItem('access_token')).toBeNull();
  expect(toast.info).toHaveBeenCalledWith('登录已过期，请重新登录');
});
