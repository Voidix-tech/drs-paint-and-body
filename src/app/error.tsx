"use client";
import Link from "next/link";
import { IconArrowUpRight } from "@tabler/icons-react";
import { BUSINESS } from "@/lib/types";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return <main className="container section error-page"><p className="error-code">UNABLE TO LOAD THIS PAGE</p><h1>Something needs a second look.</h1><p>We couldn’t load the page. Please try again or get in touch with the shop.</p><div className="error-actions"><button className="button primary" onClick={reset}>Try again<IconArrowUpRight size={18} /></button><a className="text-link" href={`tel:${BUSINESS.tel}`}>Call {BUSINESS.phone}</a><Link className="text-link" href="/">Back to home</Link></div></main>;
}
