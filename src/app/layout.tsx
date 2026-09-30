import type { Metadata } from "next";
import { Barlow, Barlow_Condensed } from "next/font/google";
import "./globals.css";
import "./public-ui.css";
const body = Barlow({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-body" });
const display = Barlow_Condensed({ subsets: ["latin"], weight: ["600", "700", "800"], variable: "--font-display" });
export const metadata: Metadata = { title: { default: "DR's Paint and Body | Suffolk, VA", template: "%s | DR's Paint and Body" }, description: "Autobody, collision repair, painting, auto repair, wheelchair lift repair, and car sales in Suffolk, Virginia. Call 757-717-3940.", icons: { icon: "/favicon.svg" } };
export default function RootLayout({ children }: { children: React.ReactNode }) { return <html lang="en" className={`${body.variable} ${display.variable}`}><body>{children}</body></html>; }
