import Image from "next/image";
import Link from "next/link";
import { IconArrowUpRight, IconArrowRight } from "@tabler/icons-react";

export function Hero() {
  return <section className="hero hero-noir" aria-labelledby="hero-title">
    <Image className="hero-noir-image" src="/images/hero-noir-garage.webp" alt="" fill preload sizes="100vw" />
    <div className="hero-noir-shade" aria-hidden="true" />
    <div className="container hero-noir-inner">
      <div className="hero-noir-copy">
        <p className="hero-noir-kicker"><span aria-hidden="true" />DR&apos;S PAINT & BODY <b>/</b> SUFFOLK, VIRGINIA</p>
        <h1 id="hero-title">YOUR CAR.<br /><span>BACK IN FORM.</span></h1>
        <p className="hero-noir-description">Bodywork, paint, and repairs from your local Suffolk shop. Tell us what your vehicle needs.</p>
        <div className="hero-noir-actions">
          <a href="#contact" className="button primary">Request a callback<IconArrowUpRight size={19} /></a>
          <Link href="/services" className="hero-noir-secondary">Explore services<IconArrowRight size={19} /></Link>
        </div>
      </div>
    </div>
    <p className="hero-noir-caption">Illustrative garage imagery</p>
  </section>;
}
