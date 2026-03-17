import styles from './PageContainer.module.css'

export default function PageContainer({ children, className = "", style }) {
  return (
    <div className={`${styles.PageContainer} ${className}`} style={style}>
      {children}
    </div>
  );
}
