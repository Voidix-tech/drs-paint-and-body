import { Header, Footer } from "@/components/shell";
import { PublicMotion } from "@/components/public-motion";
export default function PublicLayout({ children }: { children: React.ReactNode }) { return <><a className="skip-link" href="#main">Skip to content</a><Header/><PublicMotion>{children}</PublicMotion><Footer/></>; }
