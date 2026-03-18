import React from 'react';
import styles from './Footer.module.css';
import { FaGithub } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className={`glass blur ${styles.footer}`}>
      <div className={styles.footerInner}>
        <div className={styles.copyright}>
          © 2026 Aurora Blog. All rights reserved.
        </div>
        <div className={styles.links}>
          <a 
            href="https://github.com/Wh1stle05/Aurora-Blog" 
            target="_blank" 
            rel="noopener noreferrer" 
            className={styles.footerLink}
          >
            <FaGithub size={18} />
            <span>GitHub 仓库</span>
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
