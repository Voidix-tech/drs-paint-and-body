"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { IconArrowUpRight, IconX, IconChevronLeft, IconChevronRight, IconSearch } from "@tabler/icons-react";
import type { Work, Service } from "@/lib/types";
import { InquiryForm } from "./contact";
import Link from "next/link";
import { OverlapCarousel } from "./overlap-carousel";

export const money = (value?: number) => value === undefined ? "Ask for price" : new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);

export function WorkGrid({ items, services, showroom = false, carousel = false }: { items: Work[]; services: Service[]; showroom?: boolean; carousel?: boolean }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const inquiryDialog = useRef<HTMLDialogElement>(null);
  const photo = useRef<HTMLImageElement>(null);
  const closing = useRef(false);
  const [selected, setSelected] = useState<Work | null>(null);
  const [inquiryWork, setInquiryWork] = useState<Work | null>(null);
  const [index, setIndex] = useState(0);
  const [availability, setAvailability] = useState("all");
  const [search, setSearch] = useState("");
  const visibleItems = showroom ? items.filter(item =>
    (availability === "all" || (item.availability || "available") === availability) &&
    `${item.title} ${item.vehicle || ""} ${item.description}`.toLowerCase().includes(search.trim().toLowerCase())
  ) : items;
  const projectCards = visibleItems.map((item, position) => ({
    id: String(item.id),
    title: item.title,
    content: <article key={item.id} className={carousel ? "work-card work-carousel-card" : "work-card"}>
      <button className="image-button" onClick={() => open(item)} aria-label={`View ${item.title}`}>
        <img src={item.images[0]} alt={item.title} loading="lazy" width="900" height="600" />
        {!carousel && <span className="image-arrow"><IconArrowUpRight size={23} /></span>}
      </button>
      <div className="work-card-info">
        {carousel && <span className="work-card-index"><span aria-hidden="true" />{String(position + 1).padStart(2, "0")}</span>}
        {showroom && <p className="vehicle-meta"><span className={item.availability === "sold" ? "availability sold" : "availability"}>{item.availability === "sold" ? "Sold" : "Available"}</span>{item.mileage !== undefined && <span>{item.mileage.toLocaleString("en-US")} miles</span>}</p>}
        <h3><button onClick={() => open(item)}>{item.title}</button></h3>
        {showroom ? <p className="vehicle-price">{money(item.price)}</p> : <p>{services.find(service => service.id === item.serviceId)?.title}</p>}
        {carousel && <p className="work-card-description">{item.description.split(".")[0]}.</p>}
        {!showroom && !carousel && item.customerLabel && <p className="project-meta">{item.customerLabel}</p>}
        {item.demo && <p className="demo-label">{showroom ? "Demo listing, not actual inventory" : "Illustrative demo photo"}</p>}
        {carousel && <button type="button" className="work-card-arrow" onClick={() => open(item)} aria-label={`Open ${item.title} gallery`}><IconArrowUpRight size={22} aria-hidden="true" /></button>}
      </div>
    </article>,
  }));

  useEffect(() => {
    if (selected) dialog.current?.querySelector<HTMLButtonElement>(".dialog-close")?.focus();
  }, [selected]);

  useEffect(() => {
    if (inquiryWork) inquiryDialog.current?.querySelector<HTMLInputElement>('input[name="name"]')?.focus();
  }, [inquiryWork]);

  useEffect(() => {
    const element = dialog.current;
    const inquiry = inquiryDialog.current;
    return () => {
      gsap.killTweensOf(element);
      gsap.killTweensOf(photo.current);
      if (element?.open) element.close();
      if (inquiry?.open) inquiry.close();
    };
  }, []);

  function open(item: Work) {
    setSelected(item);
    setIndex(0);
    dialog.current?.showModal();
    const element = dialog.current;
    if (!element || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.fromTo(element,
      { autoAlpha: 0, y: window.matchMedia("(max-width: 600px)").matches ? 70 : 24, scale: 0.985 },
      { autoAlpha: 1, y: 0, scale: 1, duration: 0.6, ease: "power2.out", clearProps: "all" }
    );
  }

  function close() {
    const element = dialog.current;
    if (!element || closing.current) return;
    const finish = () => {
      element.close();
      gsap.set(element, { clearProps: "all" });
      closing.current = false;
      setSelected(null);
    };
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return finish();
    closing.current = true;
    gsap.to(element, {
      autoAlpha: 0,
      y: window.matchMedia("(max-width: 600px)").matches ? 70 : 16,
      duration: 0.35,
      ease: "power2.in",
      onComplete: finish,
    });
  }

  function changePhoto(next: number) {
    if (!selected) return;
    setIndex((next + selected.images.length) % selected.images.length);
  }

  function requestCallback(item: Work) {
    gsap.killTweensOf(dialog.current);
    gsap.set(dialog.current, { clearProps: "all" });
    closing.current = false;
    dialog.current?.close();
    setSelected(null);
    setInquiryWork(item);
    inquiryDialog.current?.showModal();
  }

  function closeInquiry() {
    inquiryDialog.current?.close();
    setInquiryWork(null);
  }

  function callbackMessage(item: Work) {
    if (!showroom) return `I'd like to discuss ${services.find(service => service.id === item.serviceId)?.title || "this service"} for my vehicle.\nI was viewing the ${item.title} project.\nPlease contact me with more information.`;
    if (item.availability === "sold") return `I'm interested in other vehicles similar to ${item.title}. Please contact me about current availability.`;
    return [
      `I'm interested in ${item.title}.`,
      item.price !== undefined ? `Listed price: ${money(item.price)}` : "",
      item.mileage !== undefined ? `Mileage: ${item.mileage.toLocaleString("en-US")} miles` : "",
      "Please contact me with more information.",
    ].filter(Boolean).join("\n");
  }

  useEffect(() => {
    if (!selected || !photo.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const tween = gsap.fromTo(photo.current, { autoAlpha: 0.35, scale: 1.025 }, { autoAlpha: 1, scale: 1, duration: 0.35, ease: "power2.out" });
    return () => { tween.kill(); };
  }, [index, selected]);

  return <>
    {showroom && items.length > 0 && <div className="showroom-toolbar">
      <div className="showroom-filters" role="group" aria-label="Vehicle availability">
        {[["all", "All vehicles"], ["available", "Available"], ["sold", "Sold"]].map(([value, label]) => <button type="button" key={value} aria-pressed={availability === value} onClick={() => setAvailability(value)}>{label}</button>)}
      </div>
      <label className="showroom-search"><IconSearch size={18} /><span className="sr-only">Search vehicles</span><input type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Search vehicles" /></label>
    </div>}
    {carousel && !showroom
      ? <OverlapCarousel label="Project galleries" variant="projects" initialIndex={Math.min(1, projectCards.length - 1)} slides={projectCards}
          footerStart={<Link href="/services" className="text-link work-carousel-more">Explore all services<IconArrowUpRight size={18} aria-hidden="true" /></Link>} />
      : <div className={showroom ? "work-grid vehicle-grid" : "work-grid"}>{projectCards.map(card => card.content)}</div>}
    {items.length === 0 && <div className="empty-state"><h3>{showroom ? "More vehicles coming soon." : "More work coming soon."}</h3><p>Contact the shop to discuss {showroom ? "current availability" : "your vehicle"}.</p></div>}
    {showroom && items.length > 0 && visibleItems.length === 0 && <div className="empty-state"><h3>No vehicles match your search.</h3><p>Try a different vehicle name or show all vehicles.</p><button type="button" className="button secondary" onClick={() => { setSearch(""); setAvailability("all"); }}>Clear filters</button></div>}
    {showroom && items.length > 0 && <p className="showroom-results" role="status">{visibleItems.length} of {items.length} vehicles shown</p>}
    <dialog ref={dialog} className="gallery-dialog" aria-label={selected ? `${selected.title} gallery` : "Photo gallery"} onKeyDown={event => { if (selected && selected.images.length > 1 && (event.key === "ArrowLeft" || event.key === "ArrowRight")) { event.preventDefault(); changePhoto(index + (event.key === "ArrowRight" ? 1 : -1)); } }} onCancel={event => { event.preventDefault(); close(); }} onClick={event => { if (event.target === event.currentTarget) close(); }}>
      {selected && <div className="gallery-dialog-content">
        <div className="gallery-topline"><span>{showroom ? "VIRTUAL SHOWROOM" : "CUSTOMER PROJECT"}</span><button className="dialog-close" onClick={close} aria-label="Close photo gallery"><IconX size={21} /></button></div>
        <div className="gallery-image">
          <img ref={photo} src={selected.images[index]} alt={`${selected.title}, photo ${index + 1} of ${selected.images.length}`} />
          {selected.images.length > 1 && <>
            <button className="gallery-prev" aria-label="Previous photo" onClick={() => changePhoto(index - 1)}><IconChevronLeft /></button>
            <button className="gallery-next" aria-label="Next photo" onClick={() => changePhoto(index + 1)}><IconChevronRight /></button>
            <p className="image-count" aria-live="polite">{String(index + 1).padStart(2, "0")} / {String(selected.images.length).padStart(2, "0")}</p>
          </>}
        </div>
        <div className="gallery-details">
          <div className="gallery-description">
            <h2>{selected.title}</h2>
            {!showroom && (selected.customerLabel || selected.vehicle) && <p className="project-meta">{[selected.customerLabel, selected.vehicle !== selected.title ? selected.vehicle : ""].filter(Boolean).join(" · ")}</p>}
            <p>{selected.description}</p>
            {showroom && <p className="vehicle-price">{money(selected.price)}{selected.mileage !== undefined && <span> / {selected.mileage.toLocaleString("en-US")} miles</span>}</p>}
            {showroom && selected.availability === "sold" && <p>This vehicle is marked as sold. Contact the shop to ask about other options.</p>}
            {selected.demo && <p className="demo-label">Illustrative demo content. {showroom ? "This vehicle is not actual inventory." : "This is not a photo of the shop’s actual work."}</p>}
          </div>
          <button type="button" className="button primary gallery-cta" onClick={() => requestCallback(selected)}>{showroom && selected.availability === "sold" ? "Ask about other vehicles" : "Request a callback"}<IconArrowUpRight size={18} /></button>
        </div>
        {selected.images.length > 1 && <div className="gallery-thumbnails" aria-label="Choose a photo">{selected.images.map((src, position) => <button key={`${src}-${position}`} className={position === index ? "is-active" : ""} onClick={() => changePhoto(position)} aria-label={`View photo ${position + 1}`} aria-current={position === index ? "true" : undefined}><img src={src} alt="" loading="lazy" /></button>)}</div>}
      </div>}
    </dialog>
    <dialog ref={inquiryDialog} className="gallery-dialog inquiry-dialog" aria-label={inquiryWork ? `Request a callback about ${inquiryWork.title}` : "Request a callback"} onCancel={event => { event.preventDefault(); closeInquiry(); }} onClick={event => { if (event.target === event.currentTarget) closeInquiry(); }}>
      {inquiryWork && <>
        <div className="gallery-topline"><span>REQUEST A CALLBACK</span><button type="button" className="dialog-close" onClick={closeInquiry} aria-label="Close callback form"><IconX size={21} /></button></div>
        <div className="inquiry-vehicle-summary"><img src={inquiryWork.images[0]} alt={inquiryWork.title} width="120" height="90" /><div><h2>{inquiryWork.title}</h2><p>{showroom ? <>{money(inquiryWork.price)}{inquiryWork.mileage !== undefined && ` · ${inquiryWork.mileage.toLocaleString("en-US")} miles`}</> : services.find(service => service.id === inquiryWork.serviceId)?.title}</p>{inquiryWork.demo && <p className="demo-label">{showroom ? "Demo listing, not actual inventory" : "Illustrative demo project"}</p>}</div></div>
        <InquiryForm key={inquiryWork.id} services={services} selectedService={inquiryWork.serviceId} initialMessage={callbackMessage(inquiryWork)} heading="Your contact details" />
      </>}
    </dialog>
  </>;
}
