import Link from "next/link";
import { Hero } from "@/components/hero";
import { IconArrowUpRight, IconMapPin, IconPhone, IconArrowRight } from "@tabler/icons-react";
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
      <a href={BUSINESS.directions} target="_blank" rel="noreferrer"><IconMapPin size={20} /><span><strong>Right here in Suffolk</strong><small>220 Jackson St, Suffolk, VA</small></span><IconArrowUpRight size={18} /></a>
      <p>Paint. Bodywork. Repairs.<br /><strong>One local shop.</strong></p>
      <a href={`tel:${BUSINESS.tel}`}><IconPhone size={20} /><span><small>Let’s talk about your vehicle</small><strong>{BUSINESS.phone}</strong></span><IconArrowUpRight size={18} /></a>
    </div></div>
    <section className="section services-section"><div className="container">
      <div className="section-heading"><h2>A little damage.<br />A lot of possibilities.</h2><p>Find the right help for your vehicle, all in one place.</p></div>
      <div className="service-list">{services.map((service, index) => {
        const photo = service.coverImage || work.find(w => w.serviceId === service.id)?.images[0];
        return <Link className="service-tile" key={service.id} href={`/services/${service.slug}`}>
          <div className="service-tile-photo">{photo && <img src={photo} alt="" loading="lazy" width="240" height="180" />}</div>
          <div className="service-tile-copy"><span className="service-number">{String(index + 1).padStart(2, "0")}</span><h3>{service.title}</h3><p>{service.description.split(".")[0]}.</p><span className="service-tile-link">{service.type === "showroom" ? "Browse vehicles" : "Explore service"}<IconArrowRight size={16} /></span></div>
          <IconArrowUpRight className="service-tile-arrow" size={23} />
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
