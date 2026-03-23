'use client';

import Link from 'next/link';
import { createPortal } from 'react-dom';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { AnimatePresence, motion } from 'framer-motion';
import { FaArrowLeft, FaCalendar, FaCheck, FaCopy, FaEye, FaTag, FaThumbsDown, FaThumbsUp, FaUser } from 'react-icons/fa';

import Body from '../../src/components/layout/Body/Body.jsx';
import PageContainer from '../../src/components/layout/PageContainer/PageContainer.jsx';
import PageWrapper from '../../src/components/layout/PageWrapper/PageWrapper.jsx';
import CommentSection from '../../src/components/features/blog/CommentSection.jsx';
import HighlightedCode from '../../src/components/features/blog/HighlightedCode.jsx';
import { useToast } from '../../src/context/useToast.js';
import { getPost, reactPost } from '../../src/services/blogService.js';
import styles from '../../src/legacy-pages/BlogDetail/BlogDetail.module.css';
import { transformImageUri } from '../../lib/assets.js';

function MarkdownImage({ src, alt, post, onOpen }) {
  const [loaded, setLoaded] = useState(false);
  const resolvedSrc = useMemo(() => transformImageUri(src, post), [post, src]);

  return (
    <button type="button" className="image-shell" data-loaded={loaded} onClick={() => onOpen(resolvedSrc)}>
      <img src={resolvedSrc} alt={alt || 'blog image'} onLoad={() => setLoaded(true)} loading="lazy" />
    </button>
  );
}

export default function BlogDetailPage({ initialPost, slug }) {
  const [post, setPost] = useState(initialPost);
  const [selectedImage, setSelectedImage] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const hasIncrementedView = useRef(false);
  const toast = useToast();

  useEffect(() => {
    if (selectedImage) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedImage]);

  useEffect(() => {
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

    const loadPrism = async () => {
      if (!document.getElementById('prism-core')) {
        const script = document.createElement('script');
        script.id = 'prism-core';
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js';
        script.dataset.manual = 'true';
        document.body.appendChild(script);
        await new Promise((resolve) => {
          script.onload = resolve;
          script.onerror = resolve;
        });
      }

      const langs = ['javascript', 'css', 'markup', 'python', 'bash', 'json', 'typescript', 'sql', 'yaml'];
      const currentLangs = window.Prism ? Object.keys(window.Prism.languages) : [];

      await Promise.all(langs.map((lang) => {
        if (currentLangs.includes(lang) || document.getElementById(`prism-lang-${lang}`)) {
          return Promise.resolve();
        }
        return new Promise((resolve) => {
          const langScript = document.createElement('script');
          langScript.id = `prism-lang-${lang}`;
          langScript.src = `https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-${lang}.min.js`;
          langScript.onload = resolve;
          langScript.onerror = resolve;
          document.head.appendChild(langScript);
        });
      }));

      if (window.Prism) {
        window.Prism.highlightAll();
      }
    };

    loadPrism();
    return () => observer.disconnect();
  }, []);

  const refreshPost = useCallback(async (skipView = true) => {
    try {
      const data = await getPost(slug, skipView);
      setPost(data);
      if (window.Prism) {
        window.setTimeout(() => window.Prism.highlightAll(), 50);
      }
    } catch (error) {
      toast.error(error.message || '获取文章失败');
    }
  }, [slug, toast]);

  useEffect(() => {
    if (hasIncrementedView.current) return;
    hasIncrementedView.current = true;
    refreshPost(false);
  }, [refreshPost]);

  const handleCopy = async (code, id) => {
    await navigator.clipboard.writeText(code);
    setCopiedId(id);
    toast.success('代码已复制');
    window.setTimeout(() => setCopiedId(null), 1800);
  };

  const handleReact = async (value) => {
    try {
      const newValue = post.user_reaction === value ? 0 : value;
      await reactPost(post.id, newValue);
      await refreshPost(true);
      if (newValue === 1) toast.success('已点赞');
      else if (newValue === -1) toast.info('已点踩');
      else toast.info('已取消评价');
    } catch (error) {
      toast.error(error.message || '操作失败');
    }
  };

  return (
    <PageWrapper>
      <Body>
        <PageContainer>
          <Link href="/blog" className={styles.backBtn}>
            <FaArrowLeft /> 返回列表
          </Link>

          <article className={`glass blur ${styles.detailCard} content-fade-in`}>
            <header className={styles.header}>
              <h1 className={styles.title}>{post.title}</h1>
              <div className={styles.meta}>
                <span><FaUser /> {post.author.nickname}</span>
                <span><FaCalendar /> {new Date(post.created_at).toLocaleDateString()}</span>
                <span><FaEye /> {post.view_count} 次阅读</span>
              </div>
              {post.tags ? (
                <div className={styles.tags}>
                  <FaTag size={14} />
                  {post.tags.split(',').map((tag) => (
                    <span key={tag} className={styles.tagBadge}>#{tag.trim()}</span>
                  ))}
                </div>
              ) : null}
            </header>

            <div className={styles.content}>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  img: ({ node: _node, src, alt, ...props }) => (
                    <MarkdownImage {...props} src={src} alt={alt} post={post} onOpen={setSelectedImage} />
                  ),
                  pre: ({ children }) => <>{children}</>,
                  code({ className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    const isBlock = match || String(children).includes('\n');

                    if (isBlock) {
                      const codeString = String(children).replace(/\n$/, '');
                      const codeId = Math.random().toString(36).slice(2, 9);
                      const language = match ? match[1] : 'markup';

                      return (
                        <div className={styles.codeBlockContainer}>
                          <div className={styles.codeHeader}>
                            <span className={styles.codeLang}>{language}</span>
                            <button type="button" onClick={() => handleCopy(codeString, codeId)} className={styles.copyBtn} title="复制代码">
                              {copiedId === codeId ? <FaCheck style={{ color: '#10b981' }} /> : <FaCopy />}
                              <span>{copiedId === codeId ? '已复制' : '复制'}</span>
                            </button>
                          </div>
                          <pre className={`${className || ''} ${styles.pre}`}>
                            <HighlightedCode code={codeString} language={language} {...props} />
                          </pre>
                        </div>
                      );
                    }

                    return <code className={styles.inlineCode} {...props}>{children}</code>;
                  },
                }}
              >
                {post.content}
              </ReactMarkdown>
            </div>

            <div className={styles.postActions}>
              <button onClick={() => handleReact(1)} className={`${styles.reactBtn} ${post.user_reaction === 1 ? styles.reactBtnActiveLike : ''}`}>
                <FaThumbsUp size={18} /> <span>{post.like_count || 0}</span>
              </button>
              <button onClick={() => handleReact(-1)} className={`${styles.reactBtn} ${post.user_reaction === -1 ? styles.reactBtnActiveDislike : ''}`}>
                <FaThumbsDown size={18} /> <span>{post.dislike_count || 0}</span>
              </button>
            </div>
          </article>

          <CommentSection postId={post.id} />
        </PageContainer>
      </Body>

      {typeof document !== 'undefined' ? createPortal(
        <AnimatePresence>
          {selectedImage ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedImage(null)} className={styles.imageOverlay}>
              <motion.img initial={{ scale: 0.94, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.94, opacity: 0 }} src={selectedImage} alt="Zoomed" className={styles.zoomedImage} onClick={(event) => event.stopPropagation()} />
              <div className={styles.overlayClose}>点击任意处关闭</div>
            </motion.div>
          ) : null}
        </AnimatePresence>,
        document.body,
      ) : null}
    </PageWrapper>
  );
}
