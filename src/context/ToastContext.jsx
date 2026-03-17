import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheckCircle, FaExclamationCircle, FaTimes } from 'react-icons/fa';
import styles from '../components/layout/Toast/Toast.module.css';
import { ToastContext } from './ToastContextBase.js';

const ToastItem = ({ toast, onRemove }) => {
  const icons = {
    success: <FaCheckCircle style={{ color: '#10b981' }} />,
    error: <FaExclamationCircle style={{ color: '#ef4444' }} />,
    info: <FaCheckCircle style={{ color: '#3b82f6' }} />, // 之前用的是 FaInfoCircle，保持一致性
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.9, filter: 'blur(10px)' }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, scale: 0.9, filter: 'blur(10px)', transition: { duration: 0.2 } }}
      className={`glass blur ${styles.toastItem}`}
    >
      <div style={{ fontSize: '18px', display: 'flex' }}>{icons[toast.type]}</div>
      <div className={styles.toastContent}>
        {toast.message}
      </div>
      <button 
        onClick={() => onRemove(toast.id)}
        className={styles.closeBtn}
      >
        <FaTimes size={14} />
      </button>
      
      <motion.div 
        initial={{ width: '100%' }}
        animate={{ width: 0 }}
        transition={{ duration: toast.duration / 1000, ease: 'linear' }}
        className={styles.progressBar}
      />
    </motion.div>
  );
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type, duration }]);

    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, [removeToast]);

  const toast = {
    success: (msg, dur) => addToast(msg, 'success', dur),
    error: (msg, dur) => addToast(msg, 'error', dur),
    info: (msg, dur) => addToast(msg, 'info', dur),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className={styles.toastContainer}>
        <AnimatePresence>
          {toasts.map((t) => (
            <ToastItem key={t.id} toast={t} onRemove={removeToast} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};
