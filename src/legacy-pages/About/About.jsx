'use client';

import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import Body from '../../components/layout/Body/Body.jsx';
import PageContainer from '../../components/layout/PageContainer/PageContainer.jsx';
import PageTitle from '../../components/layout/PageTitle/PageTitle.jsx';
import PageWrapper from '../../components/layout/PageWrapper/PageWrapper.jsx';
import { getAbout } from '../../services/blogService.js';
import styles from './About.module.css';

export default function About({ initialContent = '' }) {
  const [content, setContent] = useState(initialContent);
  const [loading, setLoading] = useState(!initialContent);

  useEffect(() => {
    if (initialContent) {
      setLoading(false);
      return;
    }

    getAbout()
      .then((data) => setContent(data.content))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [initialContent]);

  return (
    <PageWrapper>
      <Body>
        <PageContainer>
          <PageTitle>关于</PageTitle>
          <div className={`glass blur ${styles.aboutCard}`}>
            <div className={styles.markdownContainer}>
              {loading ? (
                <p>加载中...</p>
              ) : (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
              )}
            </div>
          </div>
        </PageContainer>
      </Body>
    </PageWrapper>
  );
}
