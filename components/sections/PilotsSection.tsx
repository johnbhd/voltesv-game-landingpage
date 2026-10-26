import Image from "next/image";
import { machines } from "@/data/machines";
import { Reveal } from "@/components/effects/Reveal";
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
          <div
            id="pilot-roster"
            className={styles.gallery}
            role="region"
            aria-label="Voltes pilot roster"
            aria-describedby="pilot-roster-hint"
            tabIndex={0}
          >
            <ul className={styles.roster}>
              {machines.map((machine) => (
                <li key={machine.id} className={styles.rosterItem} data-unit={machine.number}>
                  <article id={"pilot-" + machine.id} className={styles.pilot}>
                    <p className={styles.unit}>PILOT // {machine.number}</p>
                    <div className={styles.figure}>
                      <Image
                        className={styles.artwork}
                        src={machine.pilot.fullBodyArtwork.src}
                        alt={machine.pilot.fullBodyArtwork.alt}
                        width={machine.pilot.fullBodyArtwork.width}
                        height={machine.pilot.fullBodyArtwork.height}
                        sizes="(max-width: 768px) calc(100vw - 48px), (max-width: 1100px) 28vw, 20vw"
                      />
                    </div>
                    <div className={styles.introduction}>
                      <h3>{machine.pilot.name}</h3>
                      <p className={styles.assignment}>{machine.name}</p>
                      <p className={styles.biography} data-pilot-intro>
                        {machine.pilot.description}
                      </p>
                    </div>
                  </article>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
        <p id="pilot-roster-hint" className={styles.rosterHint}>
          <span aria-hidden="true">↔</span>
          SCROLL TO MEET THE TEAM
        </p>
      </div>
    </section>
  );
}
