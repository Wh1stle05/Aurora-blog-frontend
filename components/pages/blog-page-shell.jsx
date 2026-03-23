'use client';

import Blog from '../../src/legacy-pages/Blog/Blog.jsx';
import Body from '../../src/components/layout/Body/Body.jsx';
import PageContainer from '../../src/components/layout/PageContainer/PageContainer.jsx';
import PageTitle from '../../src/components/layout/PageTitle/PageTitle.jsx';
import PageWrapper from '../../src/components/layout/PageWrapper/PageWrapper.jsx';
import styles from '../../src/legacy-pages/Blog/Blog.module.css';

function SkeletonCard() {
  return (
    <div data-testid="blog-list-skeleton-card" className={`glass blur ${styles.blogCard}`}>
      <div className={styles.cardHeader}>
        <div className="skeleton" style={{ height: '38px', width: '50%', borderRadius: '8px' }}></div>
        <div className="skeleton" style={{ height: '24px', width: '15%', borderRadius: '6px' }}></div>
      </div>
      <div className="skeleton" style={{ height: '57px', width: '100%', marginBottom: '2rem', borderRadius: '8px' }}></div>
      <div className={styles.meta} style={{ borderTopColor: 'var(--glass-border)' }}>
        <div className={styles.metaLeft} style={{ gap: '15px' }}>
          <div className="skeleton" style={{ height: '20px', width: '60px', borderRadius: '4px' }}></div>
          <div className="skeleton" style={{ height: '20px', width: '100px', borderRadius: '4px' }}></div>
          <div className="skeleton" style={{ height: '20px', width: '40px', borderRadius: '4px' }}></div>
        </div>
        <div className={styles.metaRight} style={{ gap: '15px' }}>
          <div className="skeleton" style={{ height: '20px', width: '40px', borderRadius: '4px' }}></div>
          <div className="skeleton" style={{ height: '20px', width: '40px', borderRadius: '4px' }}></div>
          <div className="skeleton" style={{ height: '20px', width: '40px', borderRadius: '4px' }}></div>
        </div>
      </div>
    </div>
  );
}

export function BlogListSkeleton({ pageSize = 5 }) {
  return (
    <div className={styles.listContainer}>
      {Array.from({ length: pageSize }).map((_, index) => (
        <SkeletonCard key={`skeleton-${index}`} />
      ))}
    </div>
  );
}

export function BlogPageShell({ children }) {
  return (
    <PageWrapper>
      <Body>
        <PageContainer className="PageContainer">
          <PageTitle>技术博客</PageTitle>
          <div className={styles.blogList}>{children}</div>
        </PageContainer>
      </Body>
    </PageWrapper>
  );
}

export default function BlogPage(props) {
  return <Blog {...props} />;
}
