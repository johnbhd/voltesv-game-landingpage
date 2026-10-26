import type { Metadata } from "next";
import { MotionToggle } from "@/components/effects/MotionToggle";
import "./globals.css";

const motionPreferenceScript = `
(() => {
  let savedSetting = null;

  try {
    savedSetting = localStorage.getItem("voltes-motion");
  } catch {
    savedSetting = null;
  }

  const reducedBySystem = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const setting = savedSetting === "full" || savedSetting === "reduce"
    ? savedSetting
    : reducedBySystem ? "reduce" : "full";

  document.documentElement.dataset.motion = setting;
})();
`;

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: "Voltes V Strike — Five Machines. One Mission.",
  description: "Five machines. Five pilots. One mission. Discover Voltes V Strike, an unofficial Android arcade action fan project.",
  applicationName: "Voltes V Strike",
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: motionPreferenceScript }} />
      </head>
      <body id="top">
        <a className="skip-link" href="#main-content">Skip to content</a>
        {children}
        <MotionToggle />
      </body>
    </html>
  );
}
