import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="page-content-root not-found-shell">
      <div className="glass blur not-found-card">
        <span className="eyebrow">404</span>
        <h1>页面不存在</h1>
        <p>你访问的内容可能已经移动，或者链接本身就是错的。</p>
        <Link className="btn" href="/blog">回到博客</Link>
      </div>
    </div>
  );
}
