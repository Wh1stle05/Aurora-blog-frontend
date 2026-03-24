import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, expect, test, vi } from 'vitest';

import Contact from './Contact.jsx';
import { ToastContext } from '../../context/ToastContextBase.js';
import { apiUrl } from '../../utils/api.js';

vi.mock('../../components/common/Modal/Modal.jsx', () => ({
  default: ({ open, children }) => (open ? <div data-testid="turnstile-modal">{children}</div> : null),
}));

vi.mock('../../components/common/TurnstileWidget.jsx', () => ({
  default: ({ onVerify }) => (
    <button type="button" onClick={() => onVerify('turnstile-ok')}>完成人机验证</button>
  ),
}));

function renderContact(toastValue) {
  return render(
    <ToastContext.Provider value={toastValue}>
      <Contact />
    </ToastContext.Provider>
  );
}

beforeEach(() => {
  global.fetch = vi.fn();
});

test('opens turnstile modal before sending contact form and submits only after verification', async () => {
  const success = vi.fn();
  global.fetch.mockResolvedValue({
    ok: true,
    json: async () => ({ ok: true }),
  });

  renderContact({ success, error: vi.fn(), info: vi.fn() });

  fireEvent.change(screen.getByLabelText('姓名'), { target: { value: 'Alice' } });
  fireEvent.change(screen.getByLabelText('邮箱'), { target: { value: 'alice@example.com' } });
  fireEvent.change(screen.getByLabelText('消息'), { target: { value: 'Hello' } });
  fireEvent.click(screen.getByRole('button', { name: /发送消息/i }));

  expect(global.fetch).not.toHaveBeenCalled();
  expect(screen.getByTestId('turnstile-modal')).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: '完成人机验证' }));
  fireEvent.click(screen.getByRole('button', { name: '确认发送' }));

  await waitFor(() => expect(global.fetch).toHaveBeenCalled());
  expect(global.fetch).toHaveBeenCalledWith(
    apiUrl('/api/contact'),
    expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({
        nickname: 'Alice',
        email: 'alice@example.com',
        content: 'Hello',
        turnstile_token: 'turnstile-ok',
      }),
    }),
  );
  await waitFor(() => expect(success).toHaveBeenCalledWith('消息已发送！我会尽快回复你。'));
  expect(screen.queryByText('消息已发送！我会尽快回复你。')).not.toBeInTheDocument();
});
