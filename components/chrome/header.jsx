'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaGithub, FaMoon, FaSignOutAlt, FaSun, FaUser } from 'react-icons/fa';
import { motion, useMotionValueEvent, useScroll, useSpring } from 'framer-motion';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

import styles from '../../src/components/layout/Header/Header.module.css';
import { resolveAssetUrl } from '../../lib/assets.js';

export default function Header({ theme, onToggleTheme, onLoginClick, user, onLogout, onNavigate, routeTransitioning = false, transitionTargetPath = null }) {
  const pathname = usePathname();
  const [hidden, setHidden] = useState(false);
  const [isLogoHovered, setIsLogoHovered] = useState(false);
  const [indicator, setIndicator] = useState({ left: 0, width: 0, opacity: 0 });
  const { scrollY, scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });
  const lastY = useRef(0);
  const navRefs = useRef({});
  const activePath = transitionTargetPath || pathname;

  useEffect(() => {
    if (!routeTransitioning) return;
    setHidden(false);
    lastY.current = 0;
  }, [routeTransitioning]);

  useMotionValueEvent(scrollY, 'change', (latest) => {
    if (routeTransitioning) {
      lastY.current = latest;
      return;
    }
    const diff = latest - lastY.current;
    if (diff > 5 && latest > 150) {
      setHidden(true);
    } else if (diff < -5) {
      setHidden(false);
    }
    lastY.current = latest;
  });

  const navItems = useMemo(() => [
    { path: '/', label: '首页' },
    { path: '/blog', label: '博客' },
    { path: '/about', label: '关于' },
    { path: '/contact', label: '联系' },
  ], []);

  const isActive = (path) => activePath === path || (path !== '/' && activePath?.startsWith(path));

  const syncIndicatorToPath = (path) => {
    const node = navRefs.current[path];
    if (!node) return;
    setIndicator({
      left: node.offsetLeft,
      width: node.offsetWidth,
      opacity: 1,
    });
  };

  useLayoutEffect(() => {
    syncIndicatorToPath(activePath);
  }, [activePath]);

  useEffect(() => {
    const handleResize = () => syncIndicatorToPath(activePath);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [activePath]);

  const handleInternalNavigation = (event, path) => {
    if (!onNavigate) return;
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }
    event.preventDefault();
    syncIndicatorToPath(path);
    onNavigate(path);
  };

  const getLetterAnimation = (index) => ({
    animate: isLogoHovered
      ? {
          y: [0, -6, 2, -4, 1, 0],
          transition: {
            duration: 1.2,
            repeat: Infinity,
            repeatType: 'loop',
            ease: 'easeInOut',
            delay: index * 0.05,
          },
        }
      : {
          y: 0,
          transition: { duration: 0.2, ease: 'easeOut' },
        },
  });

  return (
    <>
      <motion.header
        initial={{ top: 0 }}
        animate={{ top: hidden ? -100 : 0 }}
        transition={{ type: 'spring', stiffness: 250, damping: 30 }}
        className={`glass blur ${styles.header}`}
        style={{ position: 'fixed', left: 0, right: 0 }}
      >
        <div className={styles.navContainer}>
          <Link
            href="/"
            className={styles.logoWrapper}
            onMouseEnter={() => setIsLogoHovered(true)}
            onMouseLeave={() => setIsLogoHovered(false)}
            onClick={(event) => handleInternalNavigation(event, '/')}
          >
            <div className={styles.logo}>
              {'Aurora'.split('').map((letter, index) => (
                <motion.span
                  key={`${letter}-${index}`}
                  {...getLetterAnimation(index)}
                  className={styles.logoLetter}
                  style={{ display: 'inline-block' }}
                >
                  {letter}
                </motion.span>
              ))}
              <motion.div
                className={styles.logoDot}
                animate={{
                  opacity: [0.4, 1, 0.4],
                  scale: [1, 1.3, 1],
                  filter: ['blur(0px)', 'blur(2px)', 'blur(0px)'],
                }}
                transition={{ duration: 2.5, repeat: Infinity }}
              />
            </div>
          </Link>

          <nav className={styles.navLinks}>
            <motion.div
              data-testid="nav-indicator"
              className={styles.activePill}
              animate={{ x: indicator.left, width: indicator.width, opacity: indicator.opacity }}
              transition={{ type: 'spring', stiffness: 350, damping: 32 }}
            />
            {navItems.map((item) => {
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  ref={(node) => {
                    navRefs.current[item.path] = node;
                  }}
                  className={`${styles.navButton} ${active ? styles.active : ''}`}
                  onClick={(event) => handleInternalNavigation(event, item.path)}
                >
                  <span className={styles.navLabel}>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className={styles.navActions}>
            <button className="theme-toggle" onClick={onToggleTheme} title="切换主题">
              {theme === 'dark' ? <FaMoon /> : <FaSun />}
            </button>

            {user ? (
              <div className={styles.userSection}>
                <Link href="/profile" className={styles.avatarWrapper} title="个人中心">
                  {user.avatar ? (
                    <img src={resolveAssetUrl(user.avatar)} alt="avatar" className={styles.avatar} />
                  ) : (
                    <div className={styles.avatarPlaceholder}><FaUser /></div>
                  )}
                  <div className={styles.avatarOverlay}><FaUser size={12} /></div>
                </Link>
                <span className={styles.userName}>{user.nickname}</span>
                <button className="icon-btn" onClick={onLogout} title="退出登录">
                  <FaSignOutAlt />
                </button>
              </div>
            ) : (
              <button className="icon-btn" onClick={onLoginClick} title="登录 / 注册">
                <FaUser />
              </button>
            )}

            <a href="https://github.com/Wh1stle05/Aurora-Blog" target="_blank" rel="noopener noreferrer" className="icon-btn" title="GitHub 仓库">
              <FaGithub />
            </a>
          </div>
        </div>
      </motion.header>

      <motion.div
        className={styles.progressBar}
        style={{ scaleX, originX: 0, position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1001 }}
      />
    </>
  );
}
