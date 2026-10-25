import Image from "next/image";
import { environments } from "@/data/site";
import { Reveal } from "@/components/effects/Reveal";
import { Arrow } from "@/components/ui/Arrow";
import styles from "./mission.module.css";

export function MissionSection() {
  return (
    <section id="mission" aria-labelledby="mission-title" className={styles.mission}>
      <div className={styles.image} aria-hidden="true"><Reveal kind="settle" className={styles.imageReveal}><Image src={environments.hostile.src} alt="" fill sizes="(max-width: 768px) 100vw, 60vw" /></Reveal></div>
      <div className={styles.wash} aria-hidden="true" />
      <div className={styles.content}>
        <div className={styles.sectionTop}><p><span /> MISSION BRIEFING <span className={styles.missionNumber}>{"// 001"}</span></p><span className={styles.transmission}>INCOMING TRANSMISSION</span></div>
        <div className={styles.main}>
          <Reveal><p className={styles.warning}>THE BOAZANIAN FORCES HAVE ARRIVED.</p><h2 id="mission-title">EARTH IS<br />UNDER <span>ATTACK.</span></h2></Reveal>
          <div className={styles.brief}><span className={styles.redLine} aria-hidden="true" /><p>Five machines.<br />Five pilots.<br /><strong>One mission.</strong></p><p className={styles.body}>When our world is on the line,<br />the only way forward is together.</p><a href="#machines">MEET THE MACHINES <Arrow direction="right" /></a></div>
        </div>
        <div className={styles.bottom}><span>EARTH DEFENSE / OPERATION STRIKE</span><span>THE FORMATION STARTS WITH YOU <span aria-hidden="true">↘</span></span></div>
      </div>
    </section>
  );
}
