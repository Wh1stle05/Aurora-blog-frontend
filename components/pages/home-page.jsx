'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  FaChartLine,
  FaCode,
  FaDatabase,
  FaDocker,
  FaReact,
  FaRocket,
  FaServer,
  FaTerminal,
  FaThumbsUp,
} from 'react-icons/fa';
import { SiFastapi, SiPostgresql, SiTypescript, SiVite } from 'react-icons/si';

import Body from '../../src/components/layout/Body/Body.jsx';
import PageContainer from '../../src/components/layout/PageContainer/PageContainer.jsx';
import PageWrapper from '../../src/components/layout/PageWrapper/PageWrapper.jsx';
import styles from '../../src/legacy-pages/Home/Home.module.css';
import { getPostHref } from '../../lib/posts.js';
import { formatUptimeDays } from '../../src/legacy-pages/Home/uptime.js';

const titleVariants = {
  hidden: { opacity: 0, y: 24, filter: 'blur(10px)' },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.9, ease: 'easeOut' },
  },
};

const techStack = [
  { icon: FaReact, name: 'React', color: '#61dafb' },
  { icon: SiVite, name: 'Vite', color: '#facc15' },
  { icon: SiFastapi, name: 'FastAPI', color: '#10b981' },
  { icon: FaDocker, name: 'Docker', color: '#38bdf8' },
  { icon: SiPostgresql, name: 'PostgreSQL', color: '#60a5fa' },
  { icon: SiTypescript, name: 'TypeScript', color: '#3b82f6' },
];

const miniStats = [
  { icon: FaCode, label: '文章', key: 'posts' },
  { icon: FaChartLine, label: '阅读', key: 'views' },
  { icon: FaThumbsUp, label: '点赞', key: 'likes' },
  { icon: FaRocket, label: '运行', key: 'uptime' },
];

function TechIcon({ icon: Icon, name, color }) {
  return (
    <div className={styles.techIconItem}>
      <Icon className={styles.icon} style={{ color }} />
      <span>{name}</span>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      whileInView={{ opacity: 1, scale: 1 }}
      whileHover={{ borderColor: 'rgba(59, 130, 246, 0.4)', boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)', y: -5 }}
      viewport={{ once: true, margin: '-80% 0px 0px 0px' }}
      transition={{ delay }}
      className={`glass blur ${styles.miniStatCard}`}
    >
      <div className={styles.miniStatIcon}><Icon size={14} /></div>
      <div className={styles.miniStatInfo}>
        <span className={styles.miniStatValue}>{value}</span>
        <span className={styles.miniStatLabel}>{label}</span>
      </div>
    </motion.div>
  );
}

export default function HomePage({ latestPosts = [], stats = {} }) {
  const [heroReady, setHeroReady] = useState(false);
  const uptimeDays = formatUptimeDays();

  useEffect(() => {
    const timer = window.setTimeout(() => setHeroReady(true), 160);
    return () => window.clearTimeout(timer);
  }, []);

  const statValues = {
    posts: stats.posts || 0,
    views: stats.views || 0,
    likes: stats.likes || 0,
    uptime: `${uptimeDays}d`,
  };

  return (
    <PageWrapper>
      <Body>
        <div className={styles.heroSection}>
          <div className={styles.heroCenterer}>
            <div className={styles.heroContent}>
              <motion.div className={styles.heroText} variants={titleVariants} initial="hidden" animate="show">
                <div className={styles.heroBadge}>
                  <span className={styles.pulse}></span>
                  Explore the edge of code
                </div>
                <h1 className={styles.heroTitle}>
                  欢迎来到 <span className={styles.accentText}>Aurora</span> 空间
                </h1>
                <p className={styles.heroSubtitle}>
                  这里记录开发、部署、工具链和长期维护中的真实经验。不是模板站，而是一套持续迭代的工程现场。
                </p>
              </motion.div>

              <div className={styles.heroActions}>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={heroReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }} transition={{ duration: 0.45 }}>
                  <Link href="/blog">
                    <button className={`${styles.heroButton} ${styles.primary}`}>开始阅读</button>
                  </Link>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={heroReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }} transition={{ duration: 0.45, delay: 0.14 }}>
                  <Link href="/about">
                    <button className={`${styles.heroButton} ${styles.secondary}`}>关于作者</button>
                  </Link>
                </motion.div>
              </div>
            </div>
          </div>
          <div className={styles.auroraEffect}></div>
        </div>

        <div className={styles.secondContainerWrapper}>
          <PageContainer className={styles.secondContainer} style={{ maxWidth: '100%', width: '100%' }}>
            <div className={styles.mainGrid}>
              <section className={styles.latestSection}>
                <div className={styles.sectionHeader}>
                  <h2 className={styles.sectionTitle}><FaRocket /> 最新发布</h2>
                  <Link href="/blog" className={styles.viewMore}>查看全部</Link>
                </div>

                <div className={styles.latestPosts} data-state={latestPosts.length ? 'ready' : 'empty'}>
                  {latestPosts.length === 0 ? (
                    <div className={styles.loadError}>暂时还没有公开文章</div>
                  ) : (
                    latestPosts.map((post, index) => (
                      <motion.div
                        key={post.id}
                        initial={{ opacity: 0, x: -18 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        whileHover={{ y: -5 }}
                        viewport={{ once: true, margin: '-80% 0px 0px 0px' }}
                        transition={{ delay: index * 0.08 }}
                      >
                        <Link href={getPostHref(post)} className={`glass blur ${styles.homeBlogCard}`}>
                          <div className={styles.postCardContent}>
                            <h3 className={styles.postTitle}>{post.title}</h3>
                            <p className={styles.postExcerpt}>{post.summary}</p>
                            <div className={styles.postMeta}>
                              <span>{new Date(post.created_at).toLocaleDateString()}</span>
                              <span className={styles.dot}></span>
                              <span>{post.view_count} 阅读</span>
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    ))
                  )}
                </div>
              </section>

              <section className={styles.aboutSection}>
                <div className={styles.sectionHeader}>
                  <h2 className={styles.sectionTitle}><FaCode /> 关于本站</h2>
                  <div className={styles.sectionSpacer}></div>
                </div>

                <div className={styles.aboutGrid}>
                  <motion.div whileHover={{ y: -5, borderColor: 'rgba(59, 130, 246, 0.4)' }} className={`glass blur ${styles.sideCard}`}>
                    <h3 className={styles.sideTitle}>核心技术栈</h3>
                    <div className={styles.techGrid}>
                      {techStack.map((item) => <TechIcon key={item.name} {...item} />)}
                    </div>
                  </motion.div>

                  <motion.div whileHover={{ y: -5, borderColor: 'rgba(59, 130, 246, 0.4)' }} className={`glass blur ${styles.sideCard}`}>
                    <h3 className={styles.sideTitle}>站点定位</h3>
                    <div className={styles.aboutCopy}>
                      <p>专注工程实现，而不是泛泛而谈。每篇文章都围绕真实问题、部署取舍和可复用的解决方案展开。</p>
                      <p>前台内容面向公开阅读，后台继续承担发布、审核、历史修订和资源管理。</p>
                    </div>
                  </motion.div>
                </div>

                <div className={styles.statsGrid}>
                  {miniStats.map((item, index) => (
                    <StatCard
                      key={item.key}
                      icon={item.icon}
                      label={item.label}
                      value={statValues[item.key]}
                      delay={index * 0.08}
                    />
                  ))}
                </div>

                <div className={`glass blur ${styles.featurePanel}`}>
                  <div className={styles.featureItem}><FaTerminal /> 从本地开发到生产部署，保持一条清晰的工程链路</div>
                  <div className={styles.featureItem}><FaServer /> API、对象存储、前端静态站点分别解耦部署</div>
                  <div className={styles.featureItem}><FaDatabase /> 内容、版本和媒体资源按生产环境形态组织</div>
                </div>
              </section>
            </div>
          </PageContainer>
        </div>
      </Body>
    </PageWrapper>
  );
}
