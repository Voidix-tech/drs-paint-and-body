import { Header, Footer } from "@/components/shell";
import { PublicMotion } from "@/components/public-motion";
import { getPublicContent } from "@/lib/public-content";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const { services } = await getPublicContent();
  return <><a className="skip-link" href="#main">Skip to content</a><Header services={services}/><PublicMotion>{children}</PublicMotion><Footer/></>;
}
