import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, expect, test, vi } from 'vitest';

import CommentSection from './CommentSection.jsx';
import { ToastContext } from '../../../context/ToastContextBase.js';

const serviceMocks = vi.hoisted(() => ({
  getComments: vi.fn(),
  createComment: vi.fn(),
  reactComment: vi.fn(),
  deleteComment: vi.fn(),
}));

vi.mock('../../../services/blogService.js', () => serviceMocks);
vi.mock('../../common/Modal/Modal.jsx', () => ({
  default: ({ open, children }) => (open ? <div data-testid="turnstile-modal">{children}</div> : null),
}));
vi.mock('../../common/TurnstileWidget.jsx', () => ({
  default: ({ onVerify }) => (
    <button type="button" onClick={() => onVerify('turnstile-ok')}>完成人机验证</button>
  ),
}));

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem('user', JSON.stringify({ id: 1, nickname: 'Wh1stle' }));
  localStorage.setItem('access_token', 'token');
  serviceMocks.getComments.mockReset();
  serviceMocks.createComment.mockReset();
  serviceMocks.reactComment.mockReset();
  serviceMocks.deleteComment.mockReset();
  serviceMocks.getComments.mockResolvedValue([]);
  serviceMocks.createComment.mockResolvedValue({ ok: true });
});

test('opens turnstile modal before posting a comment and sends token after verification', async () => {
  const success = vi.fn();
  render(
    <ToastContext.Provider value={{ success, error: vi.fn(), info: vi.fn() }}>
      <CommentSection postId={1} />
    </ToastContext.Provider>,
  );

  await waitFor(() => expect(serviceMocks.getComments).toHaveBeenCalledWith(1));

  fireEvent.change(screen.getByPlaceholderText('写下你的评论...'), { target: { value: 'Nice post' } });
  fireEvent.click(screen.getByRole('button', { name: '发表评论' }));

  expect(serviceMocks.createComment).not.toHaveBeenCalled();
  expect(screen.getByTestId('turnstile-modal')).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: '完成人机验证' }));
  fireEvent.click(screen.getByRole('button', { name: '确认发送' }));

  await waitFor(() => {
    expect(serviceMocks.createComment).toHaveBeenCalledWith(1, 'Nice post', null, 'turnstile-ok');
  });
  await waitFor(() => expect(success).toHaveBeenCalledWith('评论发表成功'));
});
