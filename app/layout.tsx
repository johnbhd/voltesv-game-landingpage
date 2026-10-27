import type { Metadata } from "next";
import { SmoothScroll } from "@/components/effects/SmoothScroll";
import "lenis/dist/lenis.css";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: "Voltes V Strike — Five Machines. One Mission.",
  description: "Five machines. Five pilots. One mission. Discover Voltes V Strike, an unofficial Android arcade action fan project.",
  applicationName: "Voltes V Strike",
  icons: {
    icon: "/images/game/social.webp",
    shortcut: "/images/game/social.webp",
  },
  openGraph: {
    title: "Voltes V Strike",
    description: "Take flight. Strike back. Defend our world.",
    type: "website",
    images: [{ url: "/images/game/social.webp", width: 1000, height: 1000, alt: "Voltes V Strike game artwork" }],
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-motion="full">
      <body id="top">
        <SmoothScroll />
        <a className="skip-link" href="#main-content" data-scroll-instant>Skip to content</a>
        {children}
      </body>
    </html>
  );
}
