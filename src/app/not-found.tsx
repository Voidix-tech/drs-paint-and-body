import Link from "next/link";
import { IconArrowUpRight } from "@tabler/icons-react";
export default function NotFound() {
  return <main className="container section error-page">
    <p className="error-code">404 / PAGE NOT FOUND</p><h1>Let’s get you back on track.</h1>
    <p>This page may have moved, or this service is no longer available. Browse our services or head back home.</p>
    <div className="error-actions"><Link className="button primary" href="/#services">Browse services<IconArrowUpRight size={18} /></Link><Link className="text-link" href="/">Back to home</Link></div>
  </main>;
}
