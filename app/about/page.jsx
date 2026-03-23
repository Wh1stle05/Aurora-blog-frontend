import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import Body from '../../src/components/layout/Body/Body.jsx';
import PageContainer from '../../src/components/layout/PageContainer/PageContainer.jsx';
import PageTitle from '../../src/components/layout/PageTitle/PageTitle.jsx';
import PageWrapper from '../../src/components/layout/PageWrapper/PageWrapper.jsx';
import styles from '../../src/legacy-pages/About/About.module.css';
import { getAboutContent } from '../../lib/posts.js';
import { buildDefaultMetadata } from '../../lib/seo.js';

export const revalidate = 300;
export const metadata = buildDefaultMetadata({
  title: '关于',
  description: '关于 Aurora Blog 和作者的背景、技术方向与站点定位。',
  path: '/about',
});

export default async function AboutRoute() {
  const data = await getAboutContent().catch(() => ({ content: '内容暂不可用。' }));

  return (
    <PageWrapper>
      <Body>
        <PageContainer>
          <PageTitle>关于</PageTitle>
          <div className={`glass blur ${styles.aboutCard}`}>
            <div className={styles.markdownContainer}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{data.content || '内容暂不可用。'}</ReactMarkdown>
            </div>
          </div>
        </PageContainer>
      </Body>
    </PageWrapper>
  );
}
