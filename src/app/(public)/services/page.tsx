import Link from "next/link";
import { IconArrowUpRight } from "@tabler/icons-react";
import { getPublicContent as publicContent } from "@/lib/public-content";
import { Contact } from "@/components/contact";

export const dynamic = "force-dynamic";
export const metadata = { title: "Services" };

export default async function Services() {
  const { services, work } = await publicContent();
  return <>
    <section className="container page-intro"><p className="breadcrumb"><Link href="/">Home</Link><span>/</span>Services</p><h1>Good work.<br /><span>From every angle.</span></h1><p>Bodywork, paint, and repairs. Explore the services that help get your vehicle back to its best.</p></section>
    <section className="container services-gallery" aria-label="Our services"><div className="service-gallery-grid">{services.map((service, index) => {
      const photo = service.coverImage || work.find(w => w.serviceId === service.id)?.images[0];
      return <article key={service.id}>
        <Link href={`/services/${service.slug}`} className="service-cover" aria-label={`${service.title} service`}>{photo && <img src={photo} alt={`Illustrative ${service.title.toLowerCase()} photography`} width="1000" height="650" loading="lazy" />}</Link>
        <div className="service-cover-description"><span className="service-number">{String(index + 1).padStart(2, "0")}</span><h2><Link href={`/services/${service.slug}`}>{service.title}</Link></h2><p>{service.description}</p><Link className="text-link" href={`/services/${service.slug}`}>{service.type === "showroom" ? "View vehicles" : "Explore service & gallery"}<IconArrowUpRight size={18} /></Link></div>
      </article>;
    })}</div>{services.length === 0 && <div className="empty-state"><h2>Ask us about your vehicle.</h2><p>Call 757-717-3940 to discuss available services.</p></div>}</section>
    <Contact services={services} />
  </>;
}
