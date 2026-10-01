"use client";

import { useRef, useState, type ReactNode, type TouchEvent } from "react";
import { IconArrowLeft, IconArrowRight } from "@tabler/icons-react";

export type CarouselSlide = { id: string; title: string; content: ReactNode };

export function OverlapCarousel({ slides, label, variant, initialIndex = 0, footerStart }: {
  slides: CarouselSlide[];
  label: string;
  variant: "services" | "projects";
  initialIndex?: number;
  footerStart?: ReactNode;
}) {
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const touchStartX = useRef<number | null>(null);
  const count = slides.length;
  if (count === 0) return null;
  const active = ((activeIndex % count) + count) % count;
  const change = (step: number) => setActiveIndex(index => (index + step + count) % count);

  function touchStart(event: TouchEvent<HTMLDivElement>) {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  }

  function touchEnd(event: TouchEvent<HTMLDivElement>) {
    if (touchStartX.current === null) return;
    const distance = event.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(distance) > 45) change(distance < 0 ? 1 : -1);
  }

  return <div className={`overlap-carousel overlap-carousel--${variant}`} role="region" aria-roledescription="carousel" aria-label={label}
    onKeyDown={event => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      change(event.key === "ArrowRight" ? 1 : -1);
    }}>
    <div className="carousel-stage" onTouchStart={touchStart} onTouchEnd={touchEnd}>
      {slides.map((slide, index) => {
        const distance = (index - active + count) % count;
        const position = distance === 0 ? "active" : distance === 1 ? "next" : distance === count - 1 ? "previous" : distance < count / 2 ? "hidden-right" : "hidden-left";
        return <div key={slide.id} className="carousel-slide" data-position={position} aria-hidden={position === "active" ? undefined : true} inert={position !== "active"}>
          {slide.content}
        </div>;
      })}
      {count > 2 && <>
        <button type="button" className="carousel-peek carousel-peek--previous" aria-label={`Show previous ${label.toLowerCase()}`} onClick={() => change(-1)} />
        <button type="button" className="carousel-peek carousel-peek--next" aria-label={`Show next ${label.toLowerCase()}`} onClick={() => change(1)} />
      </>}
    </div>
    {count > 1 && <div className="carousel-footer">
      <div className="carousel-footer-start">{footerStart}</div>
      <div className="carousel-dots" role="group" aria-label={`${label} slides`}>
        {slides.map((slide, index) => <button type="button" key={slide.id} className={index === active ? "is-active" : ""}
          aria-label={`Show ${slide.title}`} aria-current={index === active ? "true" : undefined} onClick={() => setActiveIndex(index)} />)}
      </div>
      <div className="carousel-arrows">
        <button type="button" aria-label={`Previous ${label.toLowerCase()}`} onClick={() => change(-1)}><IconArrowLeft size={21} aria-hidden="true" /></button>
        <button type="button" aria-label={`Next ${label.toLowerCase()}`} onClick={() => change(1)}><IconArrowRight size={21} aria-hidden="true" /></button>
      </div>
    </div>}
  </div>;
}
