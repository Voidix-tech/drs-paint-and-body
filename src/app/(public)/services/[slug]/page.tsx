import Link from "next/link";
import { notFound } from "next/navigation";
import { IconArrowUpRight, IconArrowLeft } from "@tabler/icons-react";
import { getPublicContent as publicContent } from "@/lib/public-content";
import { Contact } from "@/components/contact";
import { WorkGrid } from "@/components/work-grid";
import { BUSINESS } from "@/lib/types";

export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { services } = await publicContent();
  const service = services.find(s => s.slug === slug);
  return { title: service?.title || "Service", description: service?.description };
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { services, work } = await publicContent();
  const service = services.find(s => s.slug === slug);
  if (!service) notFound();
  const items = work.filter(w => w.serviceId === service.id);
  return <>
    <section className="container page-intro service-intro">
      <p className="breadcrumb"><Link href="/">Home</Link><span>/</span><Link href="/#services">Services</Link><span>/</span>{service.title}</p>
      <h1>{service.title}<span className="title-underline" /></h1><p>{service.description}</p>
      <div className="page-intro-actions"><a href="#contact" className="button primary">Ask about this service<IconArrowUpRight size={18} /></a><a href={`tel:${BUSINESS.tel}`} className="text-link">Call {BUSINESS.phone}<IconArrowUpRight size={17} /></a></div>
    </section>
    <section className="container gallery-section"><div className="gallery-section-heading"><h2>{service.type === "showroom" ? "Explore the showroom" : "A closer look at the work"}</h2><p>{items.length} {items.length === 1 ? "project" : "projects"} · Select a vehicle to view its photos and story.</p></div><WorkGrid items={items} services={services} showroom={service.type === "showroom"} /><Link href="/#services" className="text-link section-more"><IconArrowLeft size={17} />All services</Link></section>
    <Contact services={services} selectedService={service.id} />
  </>;
}
