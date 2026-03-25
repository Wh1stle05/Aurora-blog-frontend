import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import styles from './About.module.css';
import PageContainer from '../../components/layout/PageContainer/PageContainer.jsx';
import PageTitle from '../../components/layout/PageTitle/PageTitle.jsx';
import Body from '../../components/layout/Body/Body.jsx';
import PageWrapper from '../../components/layout/PageWrapper/PageWrapper.jsx';
import { getAbout } from '../../services/blogService.js';
import { Helmet } from 'react-helmet-async';
import { usePrerenderReady } from '../../hooks/usePrerenderReady.js';
import { buildDefaultMeta, buildSeoDescription } from '../../utils/seo.js';

function About() {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAbout()
      .then(data => setContent(data.content))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const meta = buildDefaultMeta({
    title: '关于 | Aurora Blog',
    description: buildSeoDescription(content || '了解 Aurora Blog 的作者与空间。'),
    path: '/about',
  });

  usePrerenderReady(!loading);

  return (
    <PageWrapper>
      <Helmet>
        <title>{meta.title}</title>
        <meta name="description" content={meta.description} />
        <link rel="canonical" href={meta.canonical} />
        <meta property="og:type" content={meta.type} />
        <meta property="og:title" content={meta.title} />
        <meta property="og:description" content={meta.description} />
        <meta property="og:url" content={meta.canonical} />
        <meta property="og:image" content={meta.imageUrl} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={meta.title} />
        <meta name="twitter:description" content={meta.description} />
        <meta name="twitter:image" content={meta.imageUrl} />
      </Helmet>
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
