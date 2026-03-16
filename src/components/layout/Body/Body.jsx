import styles from './Body.module.css'

export default function MainBody({ children }) {
  return (
    <div className={styles.Body}>
    {children}   {/* 每个页面不同的部分 */}
    </div>
  );
}