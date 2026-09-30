"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { IconArrowUpRight, IconX, IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import type { Work, Service } from "@/lib/types";

export const money = (value?: number) => value === undefined ? "Ask for price" : new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);

export function WorkGrid({ items, services, showroom = false }: { items: Work[]; services: Service[]; showroom?: boolean }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const photo = useRef<HTMLImageElement>(null);
  const closing = useRef(false);
  const [selected, setSelected] = useState<Work | null>(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const element = dialog.current;
    return () => {
      gsap.killTweensOf(element);
      gsap.killTweensOf(photo.current);
      if (element?.open) element.close();
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
      { autoAlpha: 1, y: 0, scale: 1, duration: 0.42, ease: "power3.out", clearProps: "all" }
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
      duration: 0.26,
      ease: "power2.in",
      onComplete: finish,
    });
  }

  function changePhoto(next: number) {
    if (!selected) return;
    setIndex((next + selected.images.length) % selected.images.length);
  }

  useEffect(() => {
    if (!selected || !photo.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const tween = gsap.fromTo(photo.current, { autoAlpha: 0.35, scale: 1.025 }, { autoAlpha: 1, scale: 1, duration: 0.35, ease: "power2.out" });
    return () => { tween.kill(); };
  }, [index, selected]);

  return <>
    <div className={showroom ? "work-grid vehicle-grid" : "work-grid"}>
      {items.map(item => <article key={item.id} className="work-card">
        <button className="image-button" onClick={() => open(item)} aria-label={`View ${item.title}`}>
          <img src={item.images[0]} alt={item.title} loading="lazy" width="900" height="600" />
          <span className="image-arrow"><IconArrowUpRight size={23} /></span>
        </button>
        <div className="work-card-info">
          {showroom && <p className="vehicle-meta">{item.availability === "sold" ? "Sold" : "Available"}{item.mileage !== undefined ? ` / ${item.mileage.toLocaleString("en-US")} miles` : ""}</p>}
          <h3><button onClick={() => open(item)}>{item.title}</button></h3>
          {showroom ? <p className="vehicle-price">{money(item.price)}</p> : <p>{services.find(service => service.id === item.serviceId)?.title}</p>}
          {!showroom && item.customerLabel && <p className="project-meta">{item.customerLabel}</p>}
          {item.demo && <p className="demo-label">{showroom ? "Demo listing, not actual inventory" : "Illustrative demo photo"}</p>}
        </div>
      </article>)}
    </div>
    {items.length === 0 && <div className="empty-state"><h3>{showroom ? "More vehicles coming soon." : "More work coming soon."}</h3><p>Contact the shop to discuss {showroom ? "current availability" : "your vehicle"}.</p></div>}
    <dialog ref={dialog} className="gallery-dialog" aria-label={selected ? `${selected.title} gallery` : "Photo gallery"} onCancel={event => { event.preventDefault(); close(); }} onClick={event => { if (event.target === event.currentTarget) close(); }}>
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
            {selected.demo && <p className="demo-label">Illustrative demo content. {showroom ? "This vehicle is not actual inventory." : "This is not a photo of the shop’s actual work."}</p>}
          </div>
          <a className="button primary gallery-cta" href={`/?service=${encodeURIComponent(selected.serviceId)}${showroom ? `&vehicle=${encodeURIComponent(selected.title)}` : ""}#contact`}>Request a callback<IconArrowUpRight size={18} /></a>
        </div>
        {selected.images.length > 1 && <div className="gallery-thumbnails" aria-label="Choose a photo">{selected.images.map((src, position) => <button key={`${src}-${position}`} className={position === index ? "is-active" : ""} onClick={() => changePhoto(position)} aria-label={`View photo ${position + 1}`} aria-current={position === index ? "true" : undefined}><img src={src} alt="" loading="lazy" /></button>)}</div>}
      </div>}
    </dialog>
  </>;
}
