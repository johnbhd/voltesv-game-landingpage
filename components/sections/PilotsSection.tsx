import { Reveal } from "@/components/effects/Reveal";
import { PilotRoster } from "./PilotRoster";
import styles from "./pilots.module.css";

export function PilotsSection() {
  return (
    <section id="pilots" className={styles.pilots} aria-labelledby="pilots-title">
      <div className={styles.inner}>
        <div className={styles.sectionTop}>
          <p><span /> THE VOLTES TEAM <span>{"// 003"}</span></p>
          <span>THE PEOPLE BEHIND THE FORMATION</span>
        </div>
        <div className={styles.headingRow}>
          <Reveal>
            <h2 id="pilots-title">
              FIVE PILOTS.<br />
              <span>ONE MISSION.</span>
            </h2>
          </Reveal>
          <p>
            Behind every machine, a fighter.<br />
            Meet Earth’s last line of defense.
          </p>
        </div>
        <Reveal kind="rise" delay={80} className={styles.galleryReveal}>
          <PilotRoster />
        </Reveal>
        <p id="pilot-roster-hint" className={styles.rosterHint}>
          <span aria-hidden="true">↔</span>
          SCROLL TO MEET THE TEAM
        </p>
      </div>
    </section>
  );
}
