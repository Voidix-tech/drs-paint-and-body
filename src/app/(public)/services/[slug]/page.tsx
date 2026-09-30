import Link from "next/link";
import { notFound } from "next/navigation";
import { publicContent } from "@/lib/store";
import { Contact } from "@/components/contact";
import { WorkGrid } from "@/components/work-grid";
export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; const { services } = await publicContent(); return { title: services.find(s => s.slug === slug)?.title || "Service" }; }
export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; const { services,work } = await publicContent(); const service = services.find(s => s.slug === slug); if (!service) notFound(); return <><section className="container page-intro service-intro"><p className="breadcrumb"><Link href="/">Home</Link> / <Link href="/services">Services</Link> / {service.title}</p><h1>{service.title.toUpperCase()}<span className="title-underline"/></h1><p>{service.description}</p></section><section className="container gallery-section"><WorkGrid items={work.filter(w => w.serviceId === service.id)} services={services} showroom={service.type === "showroom"}/></section><Contact services={services} selectedService={service.id}/></>; }
