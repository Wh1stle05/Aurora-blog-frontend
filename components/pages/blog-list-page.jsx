'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  FaCalendar,
  FaChevronLeft,
  FaChevronRight,
  FaComment,
  FaEye,
  FaSearch,
  FaSortAmountDown,
  FaTag,
  FaThumbsDown,
  FaThumbsUp,
  FaTimes,
  FaUser,
} from 'react-icons/fa';

import Body from '../../src/components/layout/Body/Body.jsx';
import PageContainer from '../../src/components/layout/PageContainer/PageContainer.jsx';
import PageTitle from '../../src/components/layout/PageTitle/PageTitle.jsx';
import PageWrapper from '../../src/components/layout/PageWrapper/PageWrapper.jsx';
import styles from '../../src/legacy-pages/Blog/Blog.module.css';
import { getPosts, getTags } from '../../src/services/blogService.js';
import { getPostHref } from '../../lib/posts.js';

export const BlogListSkeleton = ({ pageSize = 5 }) => (
  <motion.div key={`loading-${pageSize}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={styles.listContainer}>
    {Array.from({ length: pageSize }).map((_, index) => (
      <div data-testid="blog-list-skeleton-card" key={`skeleton-${index}`} className={`glass blur ${styles.blogCard}`}>
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
    ))}
  </motion.div>
);

export default function BlogListPage({ initialPosts, initialTags, initialPageSize = 5, initialPage = 1, initialTotalPages = 1 }) {
  const [posts, setPosts] = useState(initialPosts);
  const [availableTags, setAvailableTags] = useState(initialTags);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [search, setSearch] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [sortBy, setSortBy] = useState('created_at');
  const [showTagPopup, setShowTagPopup] = useState(false);
  const [direction, setDirection] = useState(0);
  const tagPopupRef = useRef(null);

  useEffect(() => {
    if (!availableTags.length) {
      getTags().then(setAvailableTags).catch(console.error);
    }
  }, [availableTags.length]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (tagPopupRef.current && !tagPopupRef.current.contains(event.target)) {
        setShowTagPopup(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const hasChanged = page !== initialPage || pageSize !== initialPageSize || search || selectedTags.length > 0 || sortBy !== 'created_at';
    if (!hasChanged) return;

    setLoading(true);
    const timer = window.setTimeout(() => {
      getPosts(page, pageSize, search, selectedTags.join(','), sortBy)
        .then((data) => {
          setPosts(data.data);
          setTotalPages(data.total_pages);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }, 250);

    return () => window.clearTimeout(timer);
  }, [initialPage, initialPageSize, page, pageSize, search, selectedTags, sortBy]);

  const handlePageChange = (nextPage) => {
    if (nextPage < 1 || nextPage > totalPages) return;
    setDirection(nextPage > page ? 1 : -1);
    setPage(nextPage);
    window.setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 50);
  };

  const toggleTag = (tag) => {
    setSelectedTags((current) => current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag]);
    setDirection(0);
    setPage(1);
  };

  const cycleSort = () => {
    const modes = ['created_at', 'view_count', 'like_count'];
    const nextIndex = (modes.indexOf(sortBy) + 1) % modes.length;
    setSortBy(modes[nextIndex]);
    setDirection(0);
    setPage(1);
  };

  const listVariants = {
    enter: (dir) => ({ x: dir > 0 ? 100 : dir < 0 ? -100 : 0, opacity: 0 }),
    center: { x: 0, opacity: 1, transition: { duration: 0.38, ease: 'easeOut' } },
    exit: (dir) => ({ x: dir > 0 ? -100 : dir < 0 ? 100 : 0, opacity: 0, transition: { duration: 0.3, ease: 'easeIn' } }),
  };

  return (
    <PageWrapper>
      <Body>
        <PageContainer>
          <PageTitle>技术博客</PageTitle>

          <div className={styles.toolbar}>
            <div className={styles.searchBox}>
              <FaSearch className={styles.searchIcon} />
              <input
                type="text"
                placeholder="搜索标题或内容..."
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                  setDirection(0);
                }}
              />
            </div>

            <div className={styles.filterGroup}>
              <div className={styles.tagSelectorWrapper} ref={tagPopupRef}>
                <button className={`${styles.toolBtn} ${selectedTags.length > 0 ? styles.activeBtn : ''}`} onClick={() => setShowTagPopup((current) => !current)}>
                  <FaTag />
                  {selectedTags.length === 0 ? '全部标签' : `已选 ${selectedTags.length}`}
                </button>

                <AnimatePresence>
                  {showTagPopup ? (
                    <motion.div className={`glass blur ${styles.tagPopup}`} initial={{ opacity: 0, y: -20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -20, scale: 0.95 }}>
                      <div className={styles.tagPopupHeader}>
                        <span>选择标签</span>
                        <button onClick={() => setShowTagPopup(false)}><FaTimes /></button>
                      </div>
                      <div className={styles.tagGrid}>
                        {availableTags.map((tag) => (
                          <button key={tag.id} className={`${styles.tagOption} ${selectedTags.includes(tag.name) ? styles.tagSelected : ''}`} onClick={() => toggleTag(tag.name)}>
                            {tag.name}
                          </button>
                        ))}
                      </div>
                      {selectedTags.length > 0 ? (
                        <button className={styles.clearTags} onClick={() => setSelectedTags([])}>清空选择</button>
                      ) : null}
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>

              <button className={styles.toolBtn} onClick={cycleSort}>
                <FaSortAmountDown />
                {sortBy === 'created_at' ? '最新发布' : sortBy === 'view_count' ? '最多阅读' : '最多点赞'}
              </button>
            </div>
          </div>

          <div className={styles.blogList}>
            <AnimatePresence mode="wait" custom={direction}>
              {loading ? (
                <BlogListSkeleton pageSize={pageSize} />
              ) : (
                <motion.div key={`${page}-${search}-${selectedTags.join('-')}-${sortBy}`} custom={direction} variants={listVariants} initial="enter" animate="center" exit="exit" className={styles.listContainer}>
                  {posts.length === 0 ? (
                    <div className={styles.noResults}>未找到相关文章</div>
                  ) : (
                    posts.map((post) => (
                      <motion.div key={post.id} whileHover={{ y: -6, scale: 1.01, transition: { duration: 0.2 } }}>
                        <Link href={getPostHref(post)} className={`glass blur ${styles.blogCard}`}>
                          <div className={styles.cardHeader}>
                            <h2 className={styles.postTitle}>{post.title}</h2>
                            {post.tags ? (
                              <div className={styles.tags}>
                                {post.tags.split(',').map((tag) => (
                                  <span key={tag} className={styles.tagBadge}>#{tag.trim()}</span>
                                ))}
                              </div>
                            ) : null}
                          </div>
                          <p className={styles.excerpt}>{post.summary}</p>
                          <div className={styles.meta}>
                            <div className={styles.metaLeft}>
                              <span><FaUser /> {post.author}</span>
                              <span><FaCalendar /> {new Date(post.created_at).toLocaleDateString()}</span>
                              <span><FaEye /> {post.view_count}</span>
                            </div>
                            <div className={styles.metaRight}>
                              <span><FaThumbsUp /> {post.like_count}</span>
                              <span><FaThumbsDown /> {post.dislike_count}</span>
                              <span><FaComment /> {post.comment_count}</span>
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    ))
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className={styles.paginationBar}>
            <div className={styles.pageNav}>
              <button className={styles.pageBtn} onClick={() => handlePageChange(page - 1)} disabled={page === 1}>
                <FaChevronLeft />
              </button>
              <span className={styles.pageInfo}>第 {page} / {totalPages} 页</span>
              <button className={styles.pageBtn} onClick={() => handlePageChange(page + 1)} disabled={page === totalPages}>
                <FaChevronRight />
              </button>
            </div>

            <div className={styles.pageSizeControl}>
              <span>每页显示:</span>
              <select value={pageSize} onChange={(event) => {
                setPageSize(Number(event.target.value));
                setPage(1);
                setDirection(0);
                window.setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 50);
              }}>
                <option value={5}>5 条</option>
                <option value={10}>10 条</option>
              </select>
            </div>
          </div>
        </PageContainer>
      </Body>
    </PageWrapper>
  );
}
