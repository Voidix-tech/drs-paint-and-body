import { Header, Footer } from "@/components/shell";
export default function PublicLayout({ children }: { children: React.ReactNode }) { return <><a className="skip-link" href="#main">Skip to content</a><Header/><main id="main">{children}</main><Footer/></>; }
