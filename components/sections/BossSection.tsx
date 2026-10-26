"use client";

import Image from "next/image";
import { useState } from "react";
import { Reveal } from "@/components/effects/Reveal";
import { finalBoss } from "@/data/hostiles";
import styles from "./boss.module.css";

export function BossSection() {
  const [artworkFailed, setArtworkFailed] = useState(false);

  return (
    <section id="boss" className={styles.boss} aria-labelledby="boss-title">
      <div className={styles.warningGlow} aria-hidden="true" />
      <div className={styles.inner}>
        <div className={styles.warningLine}>
          <span />
          <p>WARNING</p>
          <span />
        </div>
        <Reveal kind="settle" className={styles.reveal}>
          <div data-boss-reveal className={styles.encounter}>
            <p className={styles.eyebrow}>FINAL ENCOUNTER</p>
            <h2 id="boss-title">SKULL<br /><span>FORTRESS.</span></h2>
            <div className={styles.artwork} data-boss-artwork>
              <div className={styles.targetRing} aria-hidden="true" />
              {artworkFailed ? (
                <p className={styles.unavailable}>FORTRESS ARTWORK UNAVAILABLE</p>
              ) : (
                <Image
                  src={finalBoss.artwork.src}
                  alt={finalBoss.artwork.alt}
                  width={finalBoss.artwork.width}
                  height={finalBoss.artwork.height}
                  sizes="(max-width: 768px) 100vw, 82vw"
                  onError={() => setArtworkFailed(true)}
                />
              )}
            </div>
          </div>
        </Reveal>
        <div className={styles.footer}>
          <span>ENEMY COMMAND VESSEL // DESIGNATION UNKNOWN</span>
          <span>APPROACH WITH EXTREME CAUTION</span>
        </div>
      </div>
    </section>
  );
}
