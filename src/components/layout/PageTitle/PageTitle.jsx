import styles from './PageTitle.module.css'

export default function PageTitle({ children }) {
  return (
    <div className={styles.PageTitle}>
    {children}   {/* 每个页面不同的部分 */}
    </div>
  );
}