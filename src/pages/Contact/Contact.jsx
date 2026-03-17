import React, { useState } from 'react';
import styles from './Contact.module.css';
import PageContainer from '../../components/layout/PageContainer/PageContainer.jsx';
import PageTitle from '../../components/layout/PageTitle/PageTitle.jsx';
import Body from '../../components/layout/Body/Body.jsx';
import PageWrapper from '../../components/layout/PageWrapper/PageWrapper.jsx';
import { FaPaperPlane, FaGithub, FaTwitter, FaEnvelope } from 'react-icons/fa';
import { useToast } from '../../context/useToast.js';

function Contact() {
  const [form, setForm] = useState({ name: '', email: '', content: '' });
  const [status, setStatus] = useState(null);
  const toast = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus('sending');
    // 模拟发送
    setTimeout(() => {
      setStatus('success');
      toast.success('消息已发送！我会尽快回复你。');
      setForm({ name: '', email: '', content: '' });
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
                  <label>姓名</label>
                  <input 
                    type="text" 
                    value={form.name}
                    onChange={(e) => setForm({...form, name: e.target.value})}
                    required 
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>邮箱</label>
                  <input 
                    type="email" 
                    value={form.email}
                    onChange={(e) => setForm({...form, email: e.target.value})}
                    required 
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>消息</label>
                  <textarea 
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
