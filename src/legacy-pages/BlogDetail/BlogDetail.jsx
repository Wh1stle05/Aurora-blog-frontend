'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import styles from './BlogDetail.module.css';
import PageContainer from '../../components/layout/PageContainer/PageContainer.jsx';
import Body from '../../components/layout/Body/Body.jsx';
import PageWrapper from '../../components/layout/PageWrapper/PageWrapper.jsx';
import { getPost, reactPost } from '../../services/blogService.js';
import { Link, useParams } from '../../router/compat.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import CommentSection from '../../components/features/blog/CommentSection.jsx';
import HighlightedCode from '../../components/features/blog/HighlightedCode.jsx';
import { useToast } from '../../context/useToast.js';
import { FaCalendar, FaUser, FaArrowLeft, FaEye, FaTag, FaThumbsUp, FaThumbsDown, FaCopy, FaCheck } from 'react-icons/fa';
import { resolveAssetUrl } from '../../utils/assets.js';
import { transformImageUri } from './imageTransform.js';

function BlogDetail({ initialPost = null, routeParam = null }) {
  const params = useParams();
  const id = routeParam || params?.slug || params?.id;
  const [post, setPost] = useState(initialPost);
  const [loading, setLoading] = useState(!initialPost);
  const [selectedImage, setSelectedImage] = useState(null);
  const hasIncrementedView = useRef(false);
  const toast = useToast();
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    if (selectedImage) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [selectedImage]);

  useEffect(() => {
    // 监听主题变化，动态更换 Prism 样式
    const updatePrismTheme = () => {
      const theme = document.documentElement.getAttribute('data-theme') || 'dark';
      let link = document.getElementById('prism-theme');
      
      if (!link) {
        link = document.createElement('link');
        link.id = 'prism-theme';
        link.rel = 'stylesheet';
        document.head.appendChild(link);
      }
      
      const themeUrl = theme === 'dark' 
        ? 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css'
        : 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism.min.css';
      
      if (link.href !== themeUrl) {
        link.href = themeUrl;
      }
    };

    updatePrismTheme();

    const observer = new MutationObserver(updatePrismTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    
    // 异步加载 Prism 脚本及其语言包
    const loadPrism = async () => {
      if (!document.getElementById('prism-core')) {
        const script = document.createElement('script');
        script.id = 'prism-core';
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js';
        script.dataset.manual = "true";
        document.body.appendChild(script);
        await new Promise(r => script.onload = r);
      }

      // 仅加载尚未加载过的语言包
      const langs = ['javascript', 'css', 'markup', 'python', 'bash', 'json', 'typescript', 'sql', 'yaml'];
      const currentLangs = window.Prism ? Object.keys(window.Prism.languages) : [];
      
      await Promise.all(langs.map(lang => {
        if (currentLangs.includes(lang) || document.getElementById(`prism-lang-${lang}`)) return Promise.resolve();
        return new Promise(resolve => {
          const langScript = document.createElement('script');
          langScript.id = `prism-lang-${lang}`;
          langScript.src = `https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-${lang}.min.js`;
          langScript.onload = resolve;
          langScript.onerror = resolve; 
          document.head.appendChild(langScript);
        });
      }));

      if (window.Prism) window.Prism.highlightAll();
    };

    loadPrism();
    return () => observer.disconnect();
  }, []);

  // 删掉之前的全局 highlight useEffect，因为现在由 HighlightedCode 组件自己负责了

  const loadPost = useCallback((skipView = false) => {
    getPost(id, skipView)
      .then(data => {
        setPost(data);
        if (window.Prism) {
          setTimeout(() => window.Prism.highlightAll(), 50);
        }
      })
      .catch(err => toast.error(err.message || '获取文章失败'))
      .finally(() => setLoading(false));
  }, [id, toast]);

  const handleCopy = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    toast.success('代码已复制');
    setTimeout(() => setCopiedId(null), 2000);
  };

  useEffect(() => {
    setPost(initialPost);
    setLoading(!initialPost);
    hasIncrementedView.current = false;
  }, [id, initialPost]);

  useEffect(() => {
    if (!hasIncrementedView.current) {
      hasIncrementedView.current = true;
      if (!initialPost) {
        loadPost(false);
      }
    } else {
      loadPost(true);
    }
  }, [id, initialPost, loadPost]);

  const handleReact = async (value) => {
    try {
      const newValue = post.user_reaction === value ? 0 : value;
      await reactPost(post.id, newValue);
      loadPost(true);
      
      if (newValue === 1) toast.success('已点赞');
      else if (newValue === -1) toast.info('已点踩');
      else toast.info('已取消评价');
    } catch (err) {
      toast.error(err.message || '操作失败');
    }
  };

  if (loading) {
    return (
      <PageWrapper>
        <Body>
          <PageContainer>
            <div className={`glass blur ${styles.detailCard}`}>
              <header className={styles.header}>
                <div className="skeleton" style={{ height: '40px', width: '70%', marginBottom: '1.5rem', borderRadius: '8px' }}></div>
                <div className={styles.meta} style={{ border: 'none' }}>
                  <div className="skeleton" style={{ height: '20px', width: '100px', borderRadius: '4px' }}></div>
                  <div className="skeleton" style={{ height: '20px', width: '120px', borderRadius: '4px' }}></div>
                  <div className="skeleton" style={{ height: '20px', width: '80px', borderRadius: '4px' }}></div>
                </div>
              </header>
              <div className={styles.content}>
                <div className="skeleton" style={{ height: '20px', width: '100%', marginBottom: '12px', borderRadius: '4px' }}></div>
                <div className="skeleton" style={{ height: '20px', width: '100%', marginBottom: '12px', borderRadius: '4px' }}></div>
                <div className="skeleton" style={{ height: '20px', width: '90%', marginBottom: '12px', borderRadius: '4px' }}></div>
                <div className="skeleton" style={{ height: '200px', width: '100%', marginBottom: '12px', borderRadius: '12px', marginTop: '24px' }}></div>
                <div className="skeleton" style={{ height: '20px', width: '100%', marginBottom: '12px', borderRadius: '4px', marginTop: '24px' }}></div>
                <div className="skeleton" style={{ height: '20px', width: '85%', marginBottom: '12px', borderRadius: '4px' }}></div>
              </div>
            </div>
          </PageContainer>
        </Body>
      </PageWrapper>
    );
  }

  if (!post) return <div className="error-msg">文章不存在</div>;

  return (
    <PageWrapper>
      <Body>
        <PageContainer>
          <Link to="/blog" className={styles.backBtn}>
            <FaArrowLeft /> 返回列表
          </Link>
          <article className={`glass blur ${styles.detailCard}`}>
            <header className={styles.header}>
              <h1 className={styles.title}>{post.title}</h1>
              <div className={styles.meta}>
                <span><FaUser /> {post.author.nickname}</span>
                <span><FaCalendar /> {new Date(post.created_at).toLocaleDateString()}</span>
                <span><FaEye /> {post.view_count} 次阅读</span>
              </div>
              {post.tags && (
                <div className={styles.tags}>
                  <FaTag size={14} />
                  {post.tags.split(',').map(tag => (
                    <span key={tag} className={styles.tagBadge}>#{tag.trim()}</span>
                  ))}
                </div>
              )}
            </header>
            
            <div className={styles.content}>
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  img: ({ node: _node, src, alt, ...props }) => {
                    const resolvedSrc = transformImageUri(src, post, resolveAssetUrl);
                    return (
                    <img
                      style={{ 
                        maxWidth: '100%', 
                        borderRadius: '12px', 
                        margin: '20px 0', 
                        boxShadow: 'var(--shadow)',
                        cursor: 'zoom-in'
                      }} 
                      {...props}
                      src={resolvedSrc}
                      alt={alt || 'blog image'}
                      onClick={() => setSelectedImage(resolvedSrc)}
                    />
                    );
                  },
                  pre: ({ children }) => <>{children}</>,
                  code({ className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    const isBlock = match || String(children).includes('\n');
                    
                    if (isBlock) {
                      const codeString = String(children).replace(/\n$/, '');
                      const codeId = Math.random().toString(36).substring(2, 9);
                      const language = match ? match[1] : 'markup';
                      
                      return (
                        <div className={styles.codeBlockContainer}>
                          <div className={styles.codeHeader}>
                            <span className={styles.codeLang}>{language}</span>
                            <button 
                              type="button"
                              onClick={() => handleCopy(codeString, codeId)}
                              className={styles.copyBtn}
                              title="复制代码"
                            >
                              {copiedId === codeId ? <FaCheck style={{ color: '#10b981' }} /> : <FaCopy />}
                              <span>{copiedId === codeId ? '已复制' : '复制'}</span>
                            </button>
                          </div>
                          <pre className={`${className || ''} ${styles.pre}`}>
                            <HighlightedCode 
                              code={codeString} 
                              language={language} 
                              {...props} 
                            />
                          </pre>
                        </div>
                      );
                    }
                    return <code className={styles.inlineCode} {...props}>{children}</code>;
                  }
                }}
              >
                {post.content}
              </ReactMarkdown>
            </div>

            <div className={styles.postActions}>
              <button 
                onClick={() => handleReact(1)} 
                className={`${styles.reactBtn} ${post.user_reaction === 1 ? styles.reactBtnActiveLike : ''}`}
              >
                <FaThumbsUp size={18} /> <span>{post.like_count || 0}</span>
              </button>
              <button 
                onClick={() => handleReact(-1)} 
                className={`${styles.reactBtn} ${post.user_reaction === -1 ? styles.reactBtnActiveDislike : ''}`}
              >
                <FaThumbsDown size={18} /> <span>{post.dislike_count || 0}</span>
              </button>
            </div>
          </article>

          <CommentSection postId={post.id} />
        </PageContainer>
      </Body>

      {createPortal(
        <AnimatePresence>
          {selectedImage && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedImage(null)}
              className={styles.imageOverlay}
            >
              <motion.img 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                src={selectedImage} 
                alt="Zoomed"
                className={styles.zoomedImage}
                onClick={(e) => e.stopPropagation()}
              />
              <div className={styles.overlayClose}>点击任意处关闭</div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </PageWrapper>
  );
}

export default BlogDetail;
