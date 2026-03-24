import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Link, useLocation } from '../../../router/compat.jsx';
import styles from './Header.module.css';
import { FaGithub, FaSun, FaMoon, FaUser, FaSignOutAlt } from 'react-icons/fa';
import { motion, useScroll, useMotionValueEvent, LayoutGroup, useSpring } from 'framer-motion';
import { resolveAssetUrl } from '../../../utils/assets.js';

const Header = ({ theme, onToggleTheme, onLoginClick, user, onLogout }) => {
  const [hidden, setHidden] = useState(false);
  const location = useLocation();
  const { scrollY, scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });
  const lastY = useRef(0);
  const [isLogoHovered, setIsLogoHovered] = useState(false);

  useEffect(() => {
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const diff = latest - lastY.current;
    if (diff > 5 && latest > 150) {
      setHidden(true);
    } else if (diff < -5) {
      setHidden(false);
    }
    lastY.current = latest;
  });

  const navItems = [
    { path: '/', label: '首页' },
    { path: '/blog', label: '博客' },
    { path: '/about', label: '关于' },
    { path: '/contact', label: '联系' },
  ];

  // 修复：优化 Logo 字母跳动动画，确保移出时立即归位
  const getLetterAnimation = (i) => ({
    animate: isLogoHovered ? {
      y: [0, -6, 2, -4, 1, 0],
      transition: {
        duration: 1.2,
        repeat: Infinity,
        repeatType: "loop",
        ease: "easeInOut",
        delay: i * 0.05
      }
    } : {
      y: 0,
      transition: {
        duration: 0.2, // 移出时快速归位
        ease: "easeOut"
      }
    }
  });

  return (
    <>
      <motion.header 
        initial={{ top: 0 }}
        animate={{ top: hidden ? -100 : 0 }}
        transition={{ 
          type: "spring", 
          stiffness: 250, 
          damping: 30
        }}
        className={`glass blur ${styles.header}`}
        style={{ position: 'fixed', left: 0, right: 0 }}
      >
        <div className={styles.navContainer}>
          <Link 
            to="/" 
            className={styles.logoWrapper}
            onMouseEnter={() => setIsLogoHovered(true)}
            onMouseLeave={() => setIsLogoHovered(false)}
          >
            <div className={styles.logo}>
              {"Aurora".split("").map((letter, i) => (
                <motion.span
                  key={i}
                  {...getLetterAnimation(i)}
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
                  filter: ["blur(0px)", "blur(2px)", "blur(0px)"]
                }}
                transition={{ duration: 2.5, repeat: Infinity }}
              />
            </div>
          </Link>

          <LayoutGroup id="nav-group">
            <nav className={styles.navLinks}>
              {navItems.map((item) => (
                <NavLink 
                  key={item.path}
                  to={item.path} 
                  className={({ isActive }) => `${styles.navButton} ${isActive ? styles.active : ''}`}
                >
                  {({ isActive }) => (
                    <>
                      <span className={styles.navLabel}>{item.label}</span>
                      {isActive && (
                        <motion.div 
                          layoutId="nav-pill"
                          className={styles.activePill}
                          initial={false}
                          transition={{ type: "spring", stiffness: 350, damping: 30 }}
                        />
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </nav>
          </LayoutGroup>

          <div className={styles.navActions}>
            <button className="theme-toggle" onClick={onToggleTheme} title="切换主题">
              {theme === "dark" ? <FaMoon /> : <FaSun />}
            </button>
            
            {user ? (
              <div className={styles.userSection}>
                <Link to="/profile" className={styles.avatarWrapper} title="个人中心">
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

            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="icon-btn" title="GitHub 仓库">
              <FaGithub />
            </a>
          </div>
        </div>
      </motion.header>

      <motion.div 
        className={styles.progressBar} 
        style={{ 
          scaleX, 
          originX: 0,
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1001 
        }} 
      />
    </>
  );
};

export default Header;
