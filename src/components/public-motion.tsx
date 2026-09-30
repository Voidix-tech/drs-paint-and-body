"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export function PublicMotion({ children }: { children: React.ReactNode }) {
  const root = useRef<HTMLElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (!root.current) return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches) return;
    const animations: Animation[] = [];
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        if (!media.matches) animations.push(entry.target.animate(
          [{ opacity: 0.7, transform: "translateY(14px)" }, { opacity: 1, transform: "none" }],
          { duration: 450, easing: "cubic-bezier(.2,.7,.2,1)" },
        ));
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.05 });
    root.current.querySelectorAll(".section-heading, .service-tile, .work-card, .contact-form, .service-gallery-grid > article").forEach(element => observer.observe(element));
    const reduce = () => {
      if (media.matches) { observer.disconnect(); animations.forEach(animation => animation.cancel()); }
    };
    media.addEventListener("change", reduce);
    return () => { observer.disconnect(); animations.forEach(animation => animation.cancel()); media.removeEventListener("change", reduce); };
  }, [pathname]);

  return <main id="main" ref={root}>{children}</main>;
}
