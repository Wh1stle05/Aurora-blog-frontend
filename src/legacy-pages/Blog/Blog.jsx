import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './Blog.module.css';
import PageContainer from '../../components/layout/PageContainer/PageContainer.jsx';
import PageTitle from '../../components/layout/PageTitle/PageTitle.jsx';
import Body from '../../components/layout/Body/Body.jsx';
import PageWrapper from '../../components/layout/PageWrapper/PageWrapper.jsx';
import { getPosts, getTags } from '../../services/blogService.js';
import { Link } from 'react-router-dom';
import { FaCalendar, FaUser, FaChevronLeft, FaChevronRight, FaSearch, FaTag, FaEye, FaThumbsUp, FaThumbsDown, FaComment, FaSortAmountDown, FaTimes } from 'react-icons/fa';

const SkeletonCard = () => (
  <div className={`glass blur ${styles.blogCard}`}>
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

function Blog() {
  const [posts, setPosts] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [sortBy, setSortBy] = useState('created_at');
  const [showTagPopup, setShowTagPopup] = useState(false);
  const [direction, setDirection] = useState(0); // 1 为右（下一页），-1 为左（上一页）
  const tagPopupRef = useRef(null);

  // 获取可用标签
  useEffect(() => {
    getTags().then(setAvailableTags).catch(console.error);
  }, []);

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      const tagsString = selectedTags.join(',');
      getPosts(page, pageSize, search, tagsString, sortBy)
        .then(data => {
          setPosts(data.data);
          setTotalPages(data.total_pages);
        })
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [page, pageSize, search, selectedTags, sortBy]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (tagPopupRef.current && !tagPopupRef.current.contains(event.target)) {
        setShowTagPopup(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setDirection(newPage > page ? 1 : -1);
      setPage(newPage);
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 50);
    }
  };

  const toggleTag = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
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
    enter: (dir) => ({
      x: dir > 0 ? 100 : dir < 0 ? -100 : 0,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.25, ease: "easeOut" }
    },
    exit: (dir) => ({
      x: dir > 0 ? -100 : dir < 0 ? 100 : 0,
      opacity: 0,
      transition: { duration: 0.2, ease: "easeIn" }
    })
  };

  const itemVariants = {
    hover: { y: -6, scale: 1.01, transition: { duration: 0.2 } }
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
                onChange={(e) => { setSearch(e.target.value); setPage(1); setDirection(0); }}
              />
            </div>

            <div className={styles.filterGroup}>
              <div className={styles.tagSelectorWrapper} ref={tagPopupRef}>
                <button 
                  className={`${styles.toolBtn} ${selectedTags.length > 0 ? styles.activeBtn : ''}`}
                  onClick={() => setShowTagPopup(!showTagPopup)}
                >
                  <FaTag /> 
                  {selectedTags.length === 0 ? "全部标签" : `已选 ${selectedTags.length}`}
                </button>
                
                <AnimatePresence>
                  {showTagPopup && (
                    <motion.div 
                      className={`glass blur ${styles.tagPopup}`}
                      initial={{ opacity: 0, y: -20, scale: 0.95 }} // 改为从上往下 (-20 -> 0)
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    >
                      <div className={styles.tagPopupHeader}>
                        <span>选择标签</span>
                        <button onClick={() => setShowTagPopup(false)}><FaTimes /></button>
                      </div>
                      <div className={styles.tagGrid}>
                        {availableTags.map(tag => (
                          <button 
                            key={tag.id}
                            className={`${styles.tagOption} ${selectedTags.includes(tag.name) ? styles.tagSelected : ''}`}
                            onClick={() => toggleTag(tag.name)}
                          >
                            {tag.name}
                          </button>
                        ))}
                      </div>
                      {selectedTags.length > 0 && (
                        <button className={styles.clearTags} onClick={() => setSelectedTags([])}>
                          清空选择
                        </button>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button className={styles.toolBtn} onClick={cycleSort}>
                <FaSortAmountDown /> {
                  sortBy === 'created_at' ? "最新发布" : 
                  sortBy === 'view_count' ? "最多阅读" : "最多点赞"
                }
              </button>
            </div>
          </div>
          
          <div className={styles.blogList}>
            <AnimatePresence mode="wait" custom={direction}>
              {loading ? (
                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={styles.listContainer}>
                  {Array.from({ length: pageSize }).map((_, i) => <SkeletonCard key={`skeleton-${i}`} />)}
                </motion.div>
              ) : (
                <motion.div 
                  key={`${page}-${search}-${selectedTags.join('-')}-${sortBy}`}
                  custom={direction}
                  variants={listVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className={styles.listContainer}
                >
                  {posts.length === 0 ? (
                    <div className={styles.noResults}>未找到相关文章</div>
                  ) : (
                    posts.map((post) => (
                      <motion.div 
                        key={post.id} 
                        whileHover="hover"
                        variants={itemVariants}
                      >
                        <Link to={`/blog/${post.id}`} className={`glass blur ${styles.blogCard}`}>
                          <div className={styles.cardHeader}>
                            <h2 className={styles.postTitle}>{post.title}</h2>
                            {post.tags && (
                              <div className={styles.tags}>
                                {post.tags.split(',').map(tag => (
                                  <span key={tag} className={styles.tagBadge}>#{tag.trim()}</span>
                                ))}
                              </div>
                            )}
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
              <button 
                className={styles.pageBtn} 
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
              >
                <FaChevronLeft />
              </button>
              <span className={styles.pageInfo}>第 {page} / {totalPages} 页</span>
              <button 
                className={styles.pageBtn} 
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
              >
                <FaChevronRight />
              </button>
            </div>

            <div className={styles.pageSizeControl}>
              <span>每页显示:</span>
              <select value={pageSize} onChange={(e) => { 
                setPageSize(Number(e.target.value)); 
                setPage(1); 
                setDirection(0); 
                setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 50); 
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

export default Blog;
