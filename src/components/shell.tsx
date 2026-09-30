"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { IconArrowUpRight, IconPhone, IconMenu2, IconX, IconBrandFacebook, IconMapPin } from "@tabler/icons-react";
import { BUSINESS } from "@/lib/types";

const navigation = [["Home", "/"], ["Services", "/services"], ["Showroom", "/showroom"], ["Contact", "/#contact"]];

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const previousPath = useRef(pathname);
  const contactNavigation = useRef(false);

  useEffect(() => {
    if (previousPath.current !== pathname) {
      if (contactNavigation.current) {
        requestAnimationFrame(() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" }));
      } else {
        window.scrollTo({ top: 0, behavior: "instant" });
      }
      previousPath.current = pathname;
      contactNavigation.current = false;
    }
  }, [pathname]);

  function navigate(href: string) {
    setOpen(false);
    contactNavigation.current = href === "/#contact";
    if (href === pathname) window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return <header className="site-header">
    <div className="container header-inner">
      <Link href="/" className="brand" aria-label="DR's Paint and Body home" onClick={() => navigate("/")}>
        <Image src="/images/logo.png" alt="DRS Paint Body and Repairs" width={62} height={62} priority />
        <span>DR’S <small>PAINT & BODY</small></span>
      </Link>
      <nav className={open ? "navigation is-open" : "navigation"} aria-label="Main navigation">
        {navigation.map(([label, href]) => <Link key={href} href={href} scroll={href !== "/#contact"} className={pathname === href ? "active" : ""} onClick={() => navigate(href)}>{label}</Link>)}
        <a className="mobile-phone" href={`tel:${BUSINESS.tel}`}>{BUSINESS.phone}</a>
      </nav>
      <a className="header-phone" href={`tel:${BUSINESS.tel}`}><IconPhone size={18} />{BUSINESS.phone}</a>
      <button type="button" className="menu-button" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} onClick={() => setOpen(!open)}>{open ? <IconX /> : <IconMenu2 />}</button>
    </div>
  </header>;
}

export function Footer() {
  return <footer>
    <div className="container footer-top">
      <Link href="/" className="footer-brand">DR’S <span>PAINT & BODY</span></Link>
      <p>Good work. Local people.<br />Right here in Suffolk.</p>
      <div className="footer-links">
        <a href={`tel:${BUSINESS.tel}`}><IconPhone size={18} />{BUSINESS.phone}</a>
        <a href={BUSINESS.directions} target="_blank" rel="noreferrer"><IconMapPin size={18} />{BUSINESS.address}</a>
        <a href={BUSINESS.facebook} target="_blank" rel="noreferrer"><IconBrandFacebook size={18} />Find us on Facebook <IconArrowUpRight size={16} /></a>
      </div>
    </div>
    <div className="container footer-bottom">
      <span>© {new Date().getFullYear()} DR’s Paint and Body</span>
      <span>Demo website. Photos and vehicle listings are illustrative.</span>
      <Link href="/admin">Manage content <IconArrowUpRight size={14} /></Link>
    </div>
  </footer>;
}
