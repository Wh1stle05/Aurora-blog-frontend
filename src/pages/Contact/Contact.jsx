import React, { useState } from 'react';
import styles from './Contact.module.css';
import PageContainer from '../../components/layout/PageContainer/PageContainer.jsx';
import PageTitle from '../../components/layout/PageTitle/PageTitle.jsx';
import Body from '../../components/layout/Body/Body.jsx';
import PageWrapper from '../../components/layout/PageWrapper/PageWrapper.jsx';
import { FaPaperPlane, FaGithub, FaEnvelope } from 'react-icons/fa';
import { useToast } from '../../context/useToast.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

function Contact() {
  const [form, setForm] = useState({ name: '', email: '', content: '' });
  const [status, setStatus] = useState(null);
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');

    try {
      const res = await fetch(`${API_BASE_URL}/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nickname: form.name,
          email: form.email,
          content: form.content
        })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.detail || '消息发送失败');
      }

      setStatus('success');
      toast.success('消息已发送！我会尽快回复你。');
      setForm({ name: '', email: '', content: '' });
    } catch (error) {
      setStatus(null);
      toast.error(error.message || '消息发送失败');
      return;
    }

    setTimeout(() => {
      setStatus(null);
    }, 1500);
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
                  <FaEnvelope />
                  <a className={styles.contactLink} href="mailto:a3165140148@outlook.com">
                    a3165140148@outlook.com
                  </a>
                </div>
                <div className={styles.method}>
                  <FaGithub />
                  <a
                    className={styles.contactLink}
                    href="https://github.com/Wh1stle05"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    github.com/Wh1stle05
                  </a>
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
                    onChange={(e) => setForm({...form, name: e.target.value})}
                    required 
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="contact-email">邮箱</label>
                  <input 
                    id="contact-email"
                    type="email" 
                    value={form.email}
                    onChange={(e) => setForm({...form, email: e.target.value})}
                    required 
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="contact-content">消息</label>
                  <textarea 
                    id="contact-content"
                    value={form.content}
                    onChange={(e) => setForm({...form, content: e.target.value})}
                    required 
                  />
                </div>
                <button className="btn" type="submit" disabled={status === 'sending'}>
                  {status === 'sending' ? '发送中...' : (
                    <>
                      <FaPaperPlane /> <span>发送消息</span>
                    </>
                  )}
                </button>
                {status === 'success' && <p className={styles.successMsg}>消息已发送！我会尽快回复你。</p>}
              </form>
            </div>
          </div>
        </PageContainer>
      </Body>
    </PageWrapper>
  );
}

export default Contact;
