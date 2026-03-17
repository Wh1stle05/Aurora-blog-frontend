import React, { useState, useEffect } from 'react';
import styles from './Home.module.css';
import PageContainer from '../../components/layout/PageContainer/PageContainer.jsx';
import Body from '../../components/layout/Body/Body.jsx';
import { Link } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper/PageWrapper.jsx';
import { getPosts, getStats } from '../../services/blogService.js';
import { motion } from 'framer-motion';
import { 
  FaCode, FaRocket, FaChartLine, 
  FaReact, FaPython, FaDocker, FaDatabase, 
  FaServer, FaTerminal, FaThumbsUp 
} from 'react-icons/fa';
import { 
  SiFastapi, SiPostgresql, SiVite, SiTypescript 
} from 'react-icons/si';

const TechIcon = ({ icon: Icon, name, color }) => (
  <div className={styles.techIconItem}>
    {Icon ? <Icon className={styles.icon} style={{ color }} /> : <FaCode className={styles.icon} />}
    <span>{name}</span>
  </div>
);

const StatCard = ({ icon: Icon, label, value, delay }) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.9 }}
    whileInView={{ opacity: 1, scale: 1 }}
    whileHover={{ 
      borderColor: "rgba(59, 130, 246, 0.4)",
      boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15)",
      y: -5
    }}
    viewport={{ once: true }}
    transition={{ delay }}
    className={`glass blur ${styles.miniStatCard}`}
  >
    <div className={styles.miniStatIcon}><Icon size={14}/></div>
    <div className={styles.miniStatInfo}>
      <span className={styles.miniStatValue}>{value}</span>
      <span className={styles.miniStatLabel}>{label}</span>
    </div>
  </motion.div>
);

const titleVariants = {
  hidden: { opacity: 0, y: 30, filter: "blur(10px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 1, ease: "easeOut" }
  }
};

const buttonVariants = {
  hidden: { opacity: 0 },
  showLeft: { opacity: 1, transition: { duration: 0.5, delay: 0 } },
  showRight: { opacity: 1, transition: { duration: 0.5, delay: 0.4 } }
};

function Home() {
  const [latestPosts, setLatestPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postsError, setPostsError] = useState(false);
  const [stats, setStats] = useState({ posts: 0, views: 0, comments: 0, likes: 0 });
  const [heroReady, setHeroReady] = useState(false);

  useEffect(() => {
    getPosts(1, 3)
      .then(res => {
        if (res && res.data) {
          setLatestPosts(res.data);
        }
      })
      .catch(err => {
        console.error('获取最新文章失败:', err);
        setPostsError(true);
      });

    getStats()
      .then(res => {
        if (res && res.success) {
          setStats(res.data);
        }
      })
      .catch(err => console.error('获取统计数据失败:', err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!loading) {
      const id = window.setTimeout(() => setHeroReady(true), 1000);
      return () => window.clearTimeout(id);
    }
  }, [loading]);

  const postsState = postsError ? "error" : (loading ? "loading" : "ready");

  return (
    <PageWrapper>
      <Body>
        {/* 第一屏：Hero Section */}
        <div className={styles.heroSection}>
          <div className={styles.heroCenterer}>
            <div className={styles.heroContent}>
              <motion.div
                className={styles.heroText}
                variants={titleVariants}
                initial="hidden"
                animate="show"
              >
                <div className={styles.heroBadge}>
                  <span className={styles.pulse}></span>
                  Explore the edge of code
                </div>
                <h1 className={styles.heroTitle}>
                  欢迎来到 <span className={styles.accentText}>Aurora</span> 空间
                </h1>
                <p className={styles.heroSubtitle}>
                  
                </p>
              </motion.div>
              <div className={styles.heroActions}>
                <motion.div
                  variants={buttonVariants}
                  initial="hidden"
                  animate={heroReady ? "showLeft" : "hidden"}
                >
                  <Link to="/blog">
                    <button className={`${styles.heroButton} ${styles.primary}`}>
                      开始阅读
                    </button>
                  </Link>
                </motion.div>
                <motion.div
                  variants={buttonVariants}
                  initial="hidden"
                  animate={heroReady ? "showRight" : "hidden"}
                >
                  <Link to="/about">
                    <button className={`${styles.heroButton} ${styles.secondary}`}>
                      关于作者
                    </button>
                  </Link>
                </motion.div>
              </div>
            </div>
          </div>
          <div className={styles.auroraEffect}></div>
        </div>

        {/* 第二屏：ContentLeft 和 ContentRight 结构同步 */}
        <div className={styles.secondContainerWrapper}>
          <PageContainer>
            <div className={styles.mainGrid}>
              {/* 左侧：ContentLeft */}
              <div className={styles.ContentLeft}>
                <div className={styles.sectionHeader}>
                  <h2 className={styles.sectionTitle}><FaRocket /> 最新发布</h2>
                  <Link to="/blog" className={styles.viewMore}>查看全部</Link>
                </div>
                
                <div className={styles.latestPosts} data-state={postsState}>
                  {postsError ? (
                    <div className={styles.loadError}>最新文章加载失败</div>
                  ) : (
                    latestPosts.map((post, idx) => (
                      <motion.div
                        key={post.id}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        whileHover={{ y: -5 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.1 }}
                      >
                        <Link to={`/blog/${post.id}`} className={`glass blur ${styles.homeBlogCard}`}>
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
              </div>

              {/* 右侧：ContentRight */}
              <div className={styles.ContentRight}>
                <div className={styles.sectionHeader}>
                  <h2 className={styles.sectionTitle}><FaCode /> 关于本站</h2>
                  <div style={{ height: '24px' }}></div>
                </div>

                <motion.div 
                  whileHover={{ y: -5, borderColor: "rgba(59, 130, 246, 0.4)" }}
                  className={`glass blur ${styles.sideCard}`}
                >
                  <h3 className={styles.sideTitle}>核心技术栈</h3>
                  <div className={styles.techGrid}>
                    <TechIcon icon={FaReact} name="React" color="#61DAFB" />
                    <TechIcon icon={SiTypescript} name="TS" color="#3178C6" />
                    <TechIcon icon={SiVite} name="Vite" color="#646CFF" />
                    <TechIcon icon={SiFastapi} name="FastAPI" color="#05998B" />
                    <TechIcon icon={FaPython} name="Python" color="#3776AB" />
                    <TechIcon icon={SiPostgresql} name="Postgres" color="#4169E1" />
                    <TechIcon icon={FaDocker} name="Docker" color="#2496ED" />
                    <TechIcon icon={FaServer} name="Linux" color="#FCC624" />
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ y: -5, borderColor: "rgba(59, 130, 246, 0.4)" }}
                  className={`glass blur ${styles.sideCard}`}
                >
                  <h3 className={styles.sideTitle}><FaTerminal /> 关于空间</h3>
                  <div className={styles.aboutText}>
                    <p style={{ marginBottom: '0.8rem' }}>这里是我的博客，记录着技术学习和感悟。</p>
                  </div>
                </motion.div>
                <div className={styles.statsGrid}>
                  <StatCard icon={FaTerminal} label="文章总数" value={stats.posts} delay={0.1} />
                  <StatCard icon={FaChartLine} label="全站阅读" value={stats.views} delay={0.2} />
                  <StatCard icon={FaThumbsUp} label="获得点赞" value={stats.likes} delay={0.3} />
                  <StatCard icon={FaRocket} label="运行时间" value="365d+" delay={0.4} />
                </div>
              </div>
            </div>
          </PageContainer>
        </div>
      </Body>
    </PageWrapper>
  );
}

export default Home;
