import { useState, useEffect, lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { HelmetProvider, Helmet } from 'react-helmet-async'

// Layout Components
import Header from './components/layout/Header/Header.jsx'
import Footer from './components/layout/Footer/Footer.jsx'
import ErrorBoundary from './components/layout/ErrorBoundary.jsx'
import { ToastProvider } from './context/ToastContext.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { useAuth } from './context/useAuth.js'
import PageSkeleton from './components/layout/PageSkeleton/PageSkeleton.jsx'

// Feature Components
import AuthModal from './components/features/auth/AuthModal.jsx'

// Pages
import Home from './pages/Home/Home.jsx'

// Lazy Pages
const Blog = lazy(() => import('./pages/Blog/Blog.jsx'))
const BlogDetail = lazy(() => import('./pages/BlogDetail/BlogDetail.jsx'))
const About = lazy(() => import('./pages/About/About.jsx'))
const Contact = lazy(() => import('./pages/Contact/Contact.jsx'))
const Profile = lazy(() => import('./pages/Profile/Profile.jsx'))

// Loading Fallback
const PageLoader = () => <PageSkeleton />;

import './App.css'

const pageVariants = {
  initial: { opacity: 0, y: 20, filter: "blur(8px)" },
  animate: {
    opacity: 1, y: 0, filter: "blur(0px)",
    transition: { type: "spring", stiffness: 260, damping: 25 }
  },
  exit: { opacity: 0, y: -20, filter: "blur(8px)", transition: { duration: 0.2 } }
};

const PageTransitionWrapper = ({ children, location }) => {
  const isPrerenderMode = typeof window !== 'undefined'
    && window.__AURORA_PRERENDER__?.proxyApi;

  if (isPrerenderMode) {
    return (
      <Suspense fallback={<PageLoader />}>
        <Routes location={location}>
          {children}
        </Routes>
      </Suspense>
    );
  }

  return (
    <AnimatePresence 
      mode="wait" 
      onExitComplete={() => window.scrollTo({ top: 0, left: 0, behavior: 'instant' })}
    >
      <motion.div
        key={location.pathname}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="page-transition-wrapper"
      >
        <Suspense fallback={<PageLoader />}>
          <Routes location={location}>
            {children}
          </Routes>
        </Suspense>
      </motion.div>
    </AnimatePresence>
  );
}

function AppContent() {
  const location = useLocation();
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark");
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const { user, setUser, logout, loading } = useAuth();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === "dark" ? "light" : "dark"));
  };

  if (loading) {
    return (
      <div style={{ 
        height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: theme === 'dark' ? '#0f172a' : '#f8fafc',
        color: theme === 'dark' ? '#94a3b8' : '#64748b'
      }}>
        <div className="skeleton" style={{ width: '150px', height: '10px' }}></div>
      </div>
    );
  }

  return (
    <div className="app-root">
      <Header 
        theme={theme} 
        onToggleTheme={toggleTheme} 
        onLoginClick={() => setIsAuthOpen(true)}
        user={user}
        onLogout={logout}
      />
      <main className="page-shell">
        <PageTransitionWrapper location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogDetail />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/profile" element={<Profile user={user} onUserUpdate={setUser} />} />
        </PageTransitionWrapper>
      </main>
      <Footer />
      
      <AnimatePresence>
        {isAuthOpen && (
          <AuthModal 
            onClose={() => setIsAuthOpen(false)} 
            onAuth={(data) => setUser(data.user)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function App() {
  return (
    <HelmetProvider>
      <ErrorBoundary>
        <Router>
          <ToastProvider>
            <AuthProvider>
              <Helmet>
                <title>Aurora Blog</title>
                <meta name="description" content="一个充满科技感的个人博客系统，记录技术与生活的每一个瞬间。" />
                <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
              </Helmet>
              <AppContent />
            </AuthProvider>
          </ToastProvider>
        </Router>
      </ErrorBoundary>
    </HelmetProvider>
  )
}

export default App
