import Link from "next/link";
import { publicContent } from "@/lib/store";
import { WorkGrid } from "@/components/work-grid";
import { Contact } from "@/components/contact";
export const dynamic = "force-dynamic";
export const metadata = { title: "Virtual showroom" };
export default async function Showroom() { const { services,work } = await publicContent(); const sales = services.filter(s => s.type === "showroom"); return <><section className="container page-intro"><p className="breadcrumb"><Link href="/">Home</Link> / Showroom</p><h1>A NEW CHAPTER.<br/><span>A NEW RIDE.</span></h1><p>Browse the virtual showroom. Call to confirm vehicle details and availability.</p></section><section className="container gallery-section"><WorkGrid items={work.filter(w => sales.some(s => s.id === w.serviceId))} services={services} showroom/><p className="showroom-disclaimer">This is a demo showroom. Sample vehicles, prices, and mileage are illustrative and do not represent actual inventory.</p></section><Contact services={services} selectedService={sales[0]?.id}/></>; }
