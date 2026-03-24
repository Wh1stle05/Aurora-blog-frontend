import React, { useEffect, useState } from 'react';

import { PUBLIC_TURNSTILE_SITE_KEY } from '../../../lib/env.js';
import { useToast } from '../../context/useToast.js';
import Modal from './Modal/Modal.jsx';
import TurnstileWidget from './TurnstileWidget.jsx';

export default function TurnstileChallengeModal({
  open,
  onClose,
  onConfirm,
  loading = false,
  title = '请完成人机验证',
  description = '完成验证后再继续提交。',
  confirmLabel = '确认发送',
}) {
  const [token, setToken] = useState('');
  const toast = useToast();

  useEffect(() => {
    if (!open) {
      setToken('');
    }
  }, [open]);

  const handleConfirm = async () => {
    if (!token) {
      toast.error('请先完成人机验证');
      return;
    }
    await onConfirm(token);
    setToken('');
  };

  return (
    <Modal
      open={open}
      onClose={loading ? undefined : onClose}
      contentClassName="modal-content"
      contentStyle={{ borderRadius: 'var(--radius)' }}
    >
      <div className="modal-header">
        <h3>{title}</h3>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.75rem' }}>{description}</p>
      </div>

      <div style={{ marginTop: '1.25rem' }}>
        <TurnstileWidget
          siteKey={PUBLIC_TURNSTILE_SITE_KEY}
          onVerify={setToken}
          onExpire={() => {
            setToken('');
            toast.error('验证已过期，请重新验证');
          }}
          onError={() => {
            setToken('');
            toast.error('验证服务不可用，请稍后再试');
          }}
        />
      </div>

      <div className="modal-actions" style={{ marginTop: '1.5rem' }}>
        <button type="button" className="btn ghost" onClick={onClose} disabled={loading}>
          取消
        </button>
        <button type="button" className="btn" onClick={handleConfirm} disabled={loading || !token}>
          {loading ? '提交中...' : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
