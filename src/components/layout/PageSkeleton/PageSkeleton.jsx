import styles from "./PageSkeleton.module.css";

export default function PageSkeleton({ message = "加载中..." }) {
  return (
    <div className={styles.root}>
      <div className={styles.inner}>
        <div className="skeleton" style={{ width: "140px", height: "14px" }}></div>
        <div className={styles.label}>{message}</div>
      </div>
    </div>
  );
}
