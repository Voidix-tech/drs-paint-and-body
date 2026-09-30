import Link from "next/link";
export default function NotFound() { return <main className="container section error-page"><h1>Page not found.</h1><p>This service may have been removed or hidden.</p><Link className="button primary" href="/services">Browse services</Link></main>; }
