import styles from "./PageSkeleton.module.css";

export default function PageSkeleton({ message = "加载中..." }) {
  return (
    <div className={styles.root}>
      <div className={`glass blur ${styles.frame}`}>
        <div className={styles.headerRow}>
          <div className="skeleton" style={{ width: "120px", height: "14px" }}></div>
          <div className="skeleton" style={{ width: "84px", height: "14px" }}></div>
        </div>
        <div className={styles.heroBlock}>
          <div className="skeleton" style={{ width: "46%", height: "44px" }}></div>
          <div className="skeleton" style={{ width: "82%", height: "18px" }}></div>
          <div className="skeleton" style={{ width: "68%", height: "18px" }}></div>
        </div>
        <div className={styles.grid}>
          <div className={styles.column}>
            <div className="skeleton" style={{ width: "100%", height: "120px" }}></div>
            <div className="skeleton" style={{ width: "100%", height: "120px" }}></div>
          </div>
          <div className={styles.column}>
            <div className="skeleton" style={{ width: "100%", height: "120px" }}></div>
            <div className="skeleton" style={{ width: "100%", height: "120px" }}></div>
          </div>
        </div>
        <div className={styles.label}>{message}</div>
      </div>
    </div>
  );
}
