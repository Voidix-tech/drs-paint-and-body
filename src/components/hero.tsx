import Image from "next/image";
import Link from "next/link";
import { IconArrowRight } from "@tabler/icons-react";

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
          <a href="#contact" className="button primary"><span>Request a callback</span><IconArrowRight size={26} aria-hidden="true" /></a>
          <Link href="/services" className="button hero-noir-secondary"><span>Explore services</span><IconArrowRight size={26} aria-hidden="true" /></Link>
        </div>
      </div>
    </div>
  </section>;
}
