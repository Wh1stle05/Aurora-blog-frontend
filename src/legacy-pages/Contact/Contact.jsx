'use client';

import React, { useState } from 'react';
import { FaPaperPlane, FaGithub, FaTwitter, FaEnvelope } from 'react-icons/fa';

import TurnstileChallengeModal from '../../components/common/TurnstileChallengeModal.jsx';
import Body from '../../components/layout/Body/Body.jsx';
import PageContainer from '../../components/layout/PageContainer/PageContainer.jsx';
import PageTitle from '../../components/layout/PageTitle/PageTitle.jsx';
import PageWrapper from '../../components/layout/PageWrapper/PageWrapper.jsx';
import { useToast } from '../../context/useToast.js';
import { apiUrl } from '../../utils/api.js';
import styles from './Contact.module.css';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', content: '' });
  const [sending, setSending] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const toast = useToast();

  const submitContact = async (turnstileToken) => {
    setSending(true);
    try {
      const res = await fetch(apiUrl('/api/contact'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nickname: form.name,
          email: form.email,
          content: form.content,
          turnstile_token: turnstileToken,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.detail || '消息发送失败');
      }

      toast.success('消息已发送！我会尽快回复你。');
      setForm({ name: '', email: '', content: '' });
      setShowVerifyModal(false);
    } catch (error) {
      toast.error(error.message || '消息发送失败');
    } finally {
      setSending(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.content.trim()) {
      toast.error('请完整填写联系信息');
      return;
    }
    setShowVerifyModal(true);
  };

  return (
    <PageWrapper>
      <Body>
        <PageContainer>
          <PageTitle>联系</PageTitle>

          <div className={styles.contactGrid}>
            <div className={`glass blur ${styles.infoSection}`}>
              <h3>联系我</h3>
              <p>如果你有任何问题、建议或者想和我交流技术，欢迎通过以下方式联系我。</p>

              <div className={styles.contactMethods}>
                <div className={styles.method}>
                  <FaEnvelope /> <span>@example.com</span>
                </div>
                <div className={styles.method}>
                  <FaGithub /> <span>github.com/aurora</span>
                </div>
                <div className={styles.method}>
                  <FaTwitter /> <span>@aurora_dev</span>
                </div>
              </div>
            </div>

            <div className={`glass blur ${styles.formSection}`}>
              <form className={styles.contactForm} onSubmit={handleSubmit}>
                <div className={styles.formGroup}>
                  <label htmlFor="contact-name">姓名</label>
                  <input
                    id="contact-name"
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="contact-email">邮箱</label>
                  <input
                    id="contact-email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="contact-content">消息</label>
                  <textarea
                    id="contact-content"
                    value={form.content}
                    onChange={(e) => setForm({ ...form, content: e.target.value })}
                    required
                  />
                </div>
                <button className="btn" type="submit" disabled={sending}>
                  {sending ? '发送中...' : (
                    <>
                      <FaPaperPlane /> <span>发送消息</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
          <TurnstileChallengeModal
            open={showVerifyModal}
            onClose={() => !sending && setShowVerifyModal(false)}
            onConfirm={submitContact}
            loading={sending}
            confirmLabel="确认发送"
          />
        </PageContainer>
      </Body>
    </PageWrapper>
  );
}
