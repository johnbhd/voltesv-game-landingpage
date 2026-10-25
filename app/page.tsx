import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { HeroSection } from "@/components/sections/HeroSection";
import { MissionSection } from "@/components/sections/MissionSection";
import { MachinesSection } from "@/components/sections/MachinesSection";
import { ReleaseSection } from "@/components/sections/ReleaseSection";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main id="main-content" tabIndex={-1}>
        <HeroSection />
        <MissionSection />
        <MachinesSection />
        <ReleaseSection />
      </main>
      <SiteFooter />
    </>
  );
}
