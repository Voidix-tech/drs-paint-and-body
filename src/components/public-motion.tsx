"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePathname } from "next/navigation";

gsap.registerPlugin(ScrollTrigger);

export function PublicMotion({ children }: { children: React.ReactNode }) {
  const root = useRef<HTMLElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (!root.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const context = gsap.context(() => {
      const targets = gsap.utils.toArray<HTMLElement>(
        ".section-heading, .service-tile, .work-card, .showroom-feature, .contact-copy, .contact-form, .page-intro h1, .page-intro>p:last-child, .service-gallery-grid>article, .gallery-section .work-card",
        root.current
      );
      targets.forEach(element => {
        gsap.fromTo(element,
          { autoAlpha: 0, y: 36 },
          {
            autoAlpha: 1, y: 0, duration: 0.85, ease: "power3.out",
            scrollTrigger: { trigger: element, start: "top 92%", once: true },
            clearProps: "all",
          }
        );
      });
    }, root);
    ScrollTrigger.refresh();
    return () => context.revert();
  }, [pathname]);

  return <main id="main" ref={root}>{children}</main>;
}
