import Link from "next/link";
import { getPublicContent as publicContent } from "@/lib/public-content";
import { WorkGrid } from "@/components/work-grid";
import { Contact } from "@/components/contact";
import { IconCar } from "@tabler/icons-react";

export const dynamic = "force-dynamic";
export const metadata = { title: "Virtual showroom" };

export default async function Showroom() {
  const { services, work } = await publicContent();
  const sales = services.filter(s => s.type === "showroom");
  return <>
    <div className="showroom-page">
      <section className="container page-intro showroom-intro"><p className="breadcrumb"><Link href="/">Home</Link><span>/</span>Showroom</p><h1>A new chapter.<br /><span>A new <em>ride.</em></span></h1><p>Find something that feels like you. Browse vehicle photos and details, then call to confirm availability.</p></section>
      <section className="container gallery-section showroom-gallery"><div className="showroom-notice"><IconCar size={43} stroke={1.5} aria-hidden="true" /><div><strong>A preview of the showroom</strong><p>This is a demo showroom. Sample vehicles, prices, and mileage are illustrative and do not represent actual inventory.</p></div></div><WorkGrid items={work.filter(w => sales.some(s => s.id === w.serviceId))} services={services} showroom /></section>
    </div>
    <Contact services={services} selectedService={sales[0]?.id} />
  </>;
}
