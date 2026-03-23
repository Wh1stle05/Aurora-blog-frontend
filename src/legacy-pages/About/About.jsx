import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import styles from './About.module.css';
import PageContainer from '../../components/layout/PageContainer/PageContainer.jsx';
import PageTitle from '../../components/layout/PageTitle/PageTitle.jsx';
import Body from '../../components/layout/Body/Body.jsx';
import PageWrapper from '../../components/layout/PageWrapper/PageWrapper.jsx';
import { getAbout } from '../../services/blogService.js';

function About() {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAbout()
      .then(data => setContent(data.content))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

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
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {content}
                </ReactMarkdown>
              )}
            </div>
          </div>
        </PageContainer>
      </Body>
    </PageWrapper>
  );
}

export default About;
