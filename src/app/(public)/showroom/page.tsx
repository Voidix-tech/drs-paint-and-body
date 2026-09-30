import Link from "next/link";
import { getPublicContent as publicContent } from "@/lib/public-content";
import { WorkGrid } from "@/components/work-grid";
import { Contact } from "@/components/contact";

export const dynamic = "force-dynamic";
export const metadata = { title: "Virtual showroom" };

export default async function Showroom() {
  const { services, work } = await publicContent();
  const sales = services.filter(s => s.type === "showroom");
  return <>
    <section className="container page-intro"><p className="breadcrumb"><Link href="/">Home</Link><span>/</span>Showroom</p><h1>A new chapter.<br /><span>A new ride.</span></h1><p>Find something that feels like you. Browse vehicle photos and details, then call to confirm availability.</p></section>
    <section className="container gallery-section"><div className="showroom-notice"><strong>A preview of the showroom</strong><p>This is a demo showroom. Sample vehicles, prices, and mileage are illustrative and do not represent actual inventory.</p></div><WorkGrid items={work.filter(w => sales.some(s => s.id === w.serviceId))} services={services} showroom /></section>
    <Contact services={services} selectedService={sales[0]?.id} />
  </>;
}
