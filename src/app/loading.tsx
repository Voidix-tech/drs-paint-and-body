export default function Loading() {
  return <div className="container page-loading" role="status" aria-label="Loading page">
    <div className="skeleton loading-title" /><div className="skeleton loading-subtitle" />
    <div className="loading-grid"><div className="skeleton loading-card" /><div className="skeleton loading-card" /><div className="skeleton loading-card" /></div>
    <span className="sr-only">Loading page</span>
  </div>;
}
