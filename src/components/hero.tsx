"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { IconArrowUpRight, IconArrowRight } from "@tabler/icons-react";

export function Hero() {
  const introUrl = process.env.NEXT_PUBLIC_HERO_VIDEO_URL || "";
  const idleUrl = process.env.NEXT_PUBLIC_HERO_IDLE_VIDEO_URL || "";
  const content = useRef<HTMLDivElement>(null);
  const intro = useRef<HTMLVideoElement>(null);
  const animation = useRef<gsap.core.Timeline | null>(null);
  const context = useRef<gsap.Context | null>(null);
  const revealed = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [settled, setSettled] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [idleReady, setIdleReady] = useState(false);

  const reveal = useCallback(() => {
    if (revealed.current) return;
    revealed.current = true;
    clearTimeout(timer.current);
    setSettled(true);
    if (!content.current) return;
    const run = () => {
      gsap.set(content.current, { autoAlpha: 1 });
      animation.current = gsap.timeline().fromTo(
        Array.from(content.current!.children),
        { autoAlpha: 0, y: 34 },
        { autoAlpha: 1, y: 0, duration: 1.25, stagger: 0.23, ease: "power2.out", clearProps: "all" }
      );
    };
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(content.current, { clearProps: "all" });
    } else if (context.current) context.current.add(run);
    else run();
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(media.matches);
    revealed.current = false;
    setSettled(false);
    setIdleReady(false);
    context.current = gsap.context(() => {}, content);
    if (introUrl && !media.matches) {
      gsap.set(content.current, { autoAlpha: 0 });
      // Autoplay failures must not leave the site's contact controls inaccessible.
      intro.current?.play().catch(reveal);
      timer.current = setTimeout(reveal, 25000);
    } else reveal();
    const motionChange = () => {
      setReduced(media.matches);
      if (media.matches) {
        intro.current?.pause();
        animation.current?.kill();
        if (content.current) {
          gsap.set(content.current, { clearProps: "all" });
          gsap.set(Array.from(content.current.children), { clearProps: "all" });
        }
        reveal();
      }
    };
    media.addEventListener("change", motionChange);
    return () => {
      clearTimeout(timer.current);
      media.removeEventListener("change", motionChange);
      animation.current?.kill();
      context.current?.revert();
    };
  }, [introUrl, reveal]);

  return (
    <section className="hero">
      <Image className="hero-photo" src="/images/autobody-1.webp" alt="Illustrative restored red sports coupe in an automotive workshop" fill priority sizes="100vw" />
      {introUrl && !reduced && <video ref={intro} className="hero-video" src={introUrl} muted playsInline preload="auto" aria-hidden="true" hidden={idleReady} onEnded={reveal} onError={event => { event.currentTarget.hidden = true; reveal(); }} />}
      {settled && idleUrl && !reduced && <video className="hero-video" src={idleUrl} autoPlay loop muted playsInline preload="auto" aria-hidden="true" style={{opacity:idleReady ? 1 : 0}} onPlaying={() => setIdleReady(true)} onError={event => { event.currentTarget.hidden = true; }} />}
      <div className="hero-shade" />
      <div ref={content} className="container hero-content">
        <p className="eyebrow">SUFFOLK, VIRGINIA</p>
        <h1>MAKE IT<br /><span>NEW AGAIN.</span></h1>
        <p>Bodywork, paint, and repairs.<br />Local care for whatever you drive.</p>
        <div className="hero-actions">
          <a href="#contact" className="button primary">Request a callback<IconArrowUpRight size={20} /></a>
          <Link href="/services" className="hero-service-link">Explore services<IconArrowRight size={19} /></Link>
        </div>
      </div>
      {introUrl && !settled && !reduced && <button className="skip-intro" onClick={() => { if (intro.current) { intro.current.pause(); if (Number.isFinite(intro.current.duration)) intro.current.currentTime = Math.max(0,intro.current.duration - 0.05); else intro.current.hidden = true; } reveal(); }}>Skip intro</button>}
      <div className="hero-caption">Illustrative demo visuals</div>
    </section>
  );
}
