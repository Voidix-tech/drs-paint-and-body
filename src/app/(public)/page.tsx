import Link from "next/link";
import { Hero } from "@/components/hero";
import { IconArrowUpRight, IconMapPin, IconPhone, IconArrowRight, IconTools } from "@tabler/icons-react";
import { getPublicContent as publicContent } from "@/lib/public-content";
import { BUSINESS } from "@/lib/types";
import { Contact } from "@/components/contact";
import { WorkGrid } from "@/components/work-grid";

export const dynamic = "force-dynamic";

export default async function Home({ searchParams }: { searchParams: Promise<{ service?: string; vehicle?: string }> }) {
  const [{ services, work }, query] = await Promise.all([publicContent(), searchParams]);
  const showroomIds = new Set(services.filter(s => s.type === "showroom").map(s => s.id));
  const repairWork = work.filter(w => !showroomIds.has(w.serviceId));
  const vehicle = work.find(w => showroomIds.has(w.serviceId));

  return <>
    <Hero />
    <div className="location-strip"><div className="container">
      <a className="location-strip-item" href={BUSINESS.directions} target="_blank" rel="noreferrer"><span className="location-strip-icon" aria-hidden="true"><IconMapPin size={32} /></span><span><small>Right here in Suffolk</small><strong>220 Jackson St, Suffolk, VA</strong></span></a>
      <div className="location-strip-item"><span className="location-strip-icon" aria-hidden="true"><IconTools size={32} /></span><span><small>Paint. Bodywork. Repairs.</small><strong>One local shop.</strong></span></div>
      <a className="location-strip-item" href={`tel:${BUSINESS.tel}`}><span className="location-strip-icon" aria-hidden="true"><IconPhone size={32} /></span><span><small>Let’s talk about your vehicle</small><strong>{BUSINESS.phone}</strong></span></a>
    </div></div>
    <section id="services" className="section services-section" aria-labelledby="services-title"><div className="container">
      <div className="service-list">
        <div className="services-intro">
          <p className="eyebrow services-eyebrow">Our services</p>
          <h2 id="services-title">A little damage.<br /><span>A lot of possibilities<span className="services-period">.</span></span></h2>
          <p className="services-lead">Find the right help for your vehicle, all in one place.</p>
          <p className="services-description">From minor repairs to fresh paint, we’re here to help get your vehicle back on the road.</p>
          <Link href="/services" className="button services-button">Explore all services<IconArrowRight size={19} aria-hidden="true" /></Link>
        </div>
        {services.map((service, index) => {
        const photo = service.coverImage || work.find(w => w.serviceId === service.id)?.images[0];
        const bannerPhoto = service.type === "showroom" && photo === "/images/sales-1.webp" ? "/images/hero-corvette.webp" : photo;
        return <Link className={`service-tile${service.slug === "wheelchair-lift-repair" ? " service-tile-reverse" : ""}`} data-service={service.slug} key={service.id} href={`/services/${service.slug}`}>
          <div className="service-tile-photo">{bannerPhoto && <img src={bannerPhoto} alt="" loading="lazy" width="1600" height="900" />}</div>
          <div className="service-tile-copy">
            <span className="service-number">{String(index + 1).padStart(2, "0")}</span>
            <h3>{service.title}</h3>
            <p>{service.description.split(".")[0]}.</p>
            <div className="service-tile-footer"><span className="service-tile-link">{service.type === "showroom" ? "Browse vehicles" : "Explore service"}<IconArrowRight size={16} aria-hidden="true" /></span><span className="service-tile-arrow" aria-hidden="true"><IconArrowUpRight size={21} /></span></div>
          </div>
        </Link>;
      })}</div>
      {services.length === 0 && <div className="empty-state"><h3>Start with a conversation.</h3><p>Call {BUSINESS.phone} to ask about your vehicle.</p></div>}
    </div></section>
    <section className="section work-section"><div className="container">
      <div className="section-heading"><h2>Every vehicle has a story.</h2><p>Take a closer look at the bodywork, paint, and repairs in our project galleries.</p></div>
      <WorkGrid items={repairWork.slice(0, 3)} services={services} />
      <Link href="/services" className="text-link section-more">Explore all services<IconArrowUpRight size={18} /></Link>
    </div></section>
    <section className="section process-section"><div className="container process-layout">
      <div className="section-heading"><h2>Let’s take the<br />next step together.</h2><p>You don’t need to know what’s wrong before you get in touch.</p><a href="#contact" className="text-link">Talk to the shop<IconArrowUpRight size={18} /></a></div>
      <ol className="process-list">
        <li><span>01</span><div><h3>Tell us what happened</h3><p>Give us a call or leave your details. A year, make, model, and a few words are a good start.</p></div></li>
        <li><span>02</span><div><h3>Talk through the options</h3><p>Discuss the work your vehicle needs and confirm the next steps with the shop.</p></div></li>
        <li><span>03</span><div><h3>Plan your visit</h3><p>Arrange a time to bring your vehicle to our shop on Jackson Street in Suffolk.</p></div></li>
      </ol>
    </div></section>
    {vehicle && <section className="section showroom-section"><div className="container showroom-feature">
      <div className="showroom-feature-photo"><img src={vehicle.images[0]} alt={vehicle.title} width="1000" height="650" loading="lazy" /></div>
      <div className="showroom-feature-copy"><p className="eyebrow">The virtual showroom</p><h2>Your next<br />set of keys.</h2><p>A new chapter starts with the right vehicle. Browse the showroom, then call to ask about the details.</p><Link className="button secondary" href="/showroom">Browse showroom<IconArrowUpRight size={18} /></Link><p className="demo-label">Demo vehicles shown for illustration.</p></div>
    </div></section>}
    <Contact services={services} selectedService={services.some(s => s.id === query.service) ? query.service : undefined} vehicle={query.vehicle?.slice(0, 120)} />
  </>;
}
