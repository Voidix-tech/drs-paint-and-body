"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { IconArrowUpRight, IconPhone, IconMenu2, IconX, IconBrandFacebook, IconMapPin } from "@tabler/icons-react";
import { BUSINESS, type Service } from "@/lib/types";
import { InquiryForm } from "@/components/contact";

const navigation = [["Home", "/"], ["Services", "/services"], ["Showroom", "/showroom"], ["Contact", "#contact"]];

export function Header({ services }: { services: Service[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [contactVisible, setContactVisible] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const callbackDialog = useRef<HTMLDialogElement>(null);
  const callbackTrigger = useRef<HTMLElement | null>(null);
  const [callbackOpen, setCallbackOpen] = useState(false);
  const selectedService = pathname === "/showroom" ? services.find(service => service.type === "showroom")?.id : services.find(service => pathname === `/services/${service.slug}`)?.id;

  useEffect(() => {
    if (callbackOpen) callbackDialog.current?.querySelector<HTMLInputElement>('input[name="name"]')?.focus();
  }, [callbackOpen]);

  useEffect(() => () => { callbackDialog.current?.close(); }, []);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    if (window.matchMedia("(max-width: 600px)").matches) document.body.style.overflow = "hidden";
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setOpen(false); menuButton.current?.focus(); }
    };
    const media = window.matchMedia("(max-width: 600px)");
    const resize = () => { if (!media.matches) setOpen(false); };
    document.addEventListener("keydown", escape);
    media.addEventListener("change", resize);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", escape);
      media.removeEventListener("change", resize);
    };
  }, [open]);

  useEffect(() => {
    const observer = new IntersectionObserver(entries => setContactVisible(entries.some(entry => entry.isIntersecting)), { threshold: 0 });
    const observe = () => {
      const section = document.getElementById("contact");
      if (section) observer.observe(section);
    };
    observe();
    const mutations = new MutationObserver(observe);
    mutations.observe(document.getElementById("main") || document.body, { childList: true, subtree: true });
    return () => { observer.disconnect(); mutations.disconnect(); };
  }, [pathname]);

  function navigate(href: string) {
    setOpen(false);
    if (href === pathname) window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  }

  function openCallback() {
    callbackTrigger.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setOpen(false);
    setCallbackOpen(true);
    callbackDialog.current?.showModal();
  }

  function closeCallback() {
    callbackDialog.current?.close();
    setCallbackOpen(false);
    requestAnimationFrame(() => {
      if (callbackTrigger.current?.getClientRects().length) callbackTrigger.current.focus();
      else menuButton.current?.focus();
    });
  }

  function navigationLink([label, href]: string[]) {
    const active = href === "/" ? pathname === "/" : !href.includes("#") && pathname.startsWith(href);
    return <Link key={href} href={href} className={active ? "active" : ""} aria-current={active ? "page" : undefined} onClick={() => navigate(href)}>{label}</Link>;
  }

  return <>
    <header className="site-header">
      <div className="container header-inner">
        <Link href="/" className="brand" aria-label="DR's Paint and Body home" onClick={() => navigate("/")}>
          <Image src="/images/logo-white-edge.webp" alt="DRS Paint Body and Repairs" width={64} height={64} />
        </Link>
        <nav id="main-navigation" className={open ? "navigation is-open" : "navigation"} aria-label="Main navigation">
          <div className="navigation-left">{navigation.slice(0, 2).map(navigationLink)}</div>
          <div className="navigation-right">
            {navigation.slice(2).map(navigationLink)}
          </div>
        </nav>
        <button ref={menuButton} type="button" className="menu-button" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} aria-controls="main-navigation" onClick={() => setOpen(!open)}>{open ? <IconX size={22} /> : <IconMenu2 size={22} />}</button>
      </div>
    </header>
    <nav className={contactVisible || open || callbackOpen ? "mobile-actions is-hidden" : "mobile-actions"} aria-label="Quick contact">
      <a href={`tel:${BUSINESS.tel}`}><IconPhone size={17} />Call the shop</a>
      <button type="button" className="button primary" onClick={openCallback}>Request a callback<IconArrowUpRight size={17} /></button>
    </nav>
    <dialog ref={callbackDialog} className="gallery-dialog inquiry-dialog" aria-label="Request a callback" onCancel={event => { event.preventDefault(); closeCallback(); }} onClick={event => { if (event.target === event.currentTarget) closeCallback(); }}>
      <div className="gallery-topline"><span>REQUEST A CALLBACK</span><button type="button" className="close" aria-label="Close callback form" onClick={closeCallback}><IconX size={23} /></button></div>
      {callbackOpen && <InquiryForm services={services} selectedService={selectedService} />}
    </dialog>
  </>;
}

export function Footer() {
  return <footer className="site-footer">
    <div className="container footer-top">
      <Link href="/" className="footer-brand"><Image src="/images/logo-white-edge.webp" alt="" width={55} height={55} /><span>DR’S<small>PAINT & BODY</small></span></Link>
      <p>Good work. Local people.<br />Right here in Suffolk.</p>
      <div className="footer-links">
        <a href={`tel:${BUSINESS.tel}`}><IconPhone size={18} />{BUSINESS.phone}</a>
        <a href={BUSINESS.directions} target="_blank" rel="noreferrer"><IconMapPin size={18} />{BUSINESS.address}<IconArrowUpRight size={15} /></a>
        <a href={BUSINESS.facebook} target="_blank" rel="noreferrer"><IconBrandFacebook size={18} />Find us on Facebook<IconArrowUpRight size={15} /></a>
      </div>
    </div>
    <div className="container footer-bottom">
      <span>© {new Date().getFullYear()} DR’s Paint and Body</span>
      <span>Demo website. Photos and vehicle listings are illustrative.</span>
      <Link href="/admin">Manage content<IconArrowUpRight size={14} /></Link>
    </div>
  </footer>;
}
