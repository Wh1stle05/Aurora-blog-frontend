import styles from "./PageSkeleton.module.css";

export default function PageSkeleton({ message = "加载中..." }) {
  return (
    <div className={styles.root}>
      <div data-testid="page-skeleton-inner" className={styles.inner}>
        <div className="skeleton" style={{ width: "180px", height: "16px", borderRadius: "999px" }}></div>
        <div className="skeleton" style={{ width: "320px", maxWidth: "76vw", height: "18px", borderRadius: "999px" }}></div>
        <div className="skeleton" style={{ width: "240px", maxWidth: "62vw", height: "18px", borderRadius: "999px" }}></div>
        <div className={styles.label}>{message}</div>
      </div>
    </div>
  );
}
