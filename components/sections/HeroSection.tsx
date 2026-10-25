"use client";

import Image, { getImageProps } from "next/image";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { environments } from "@/data/site";
import { machineAt } from "@/data/machines";
import { HeroDepth } from "@/components/effects/HeroDepth";
import { ActionLink } from "@/components/ui/ActionLink";
import { Arrow } from "@/components/ui/Arrow";
import { useHeroRotation } from "@/components/effects/useHeroRotation";
import styles from "./hero.module.css";

export function HeroSection() {
  const root = useRef<HTMLElement>(null);
  const selection = useHeroRotation(root);
  const machine = machineAt(selection.active);
  const [failedArtwork, setFailedArtwork] = useState<string | null>(null);

  useEffect(() => {
    const next = machineAt(selection.active + 1);
    const { props } = getImageProps({
      src: next.artwork.src,
      alt: "",
      width: 1254,
      height: 1254,
      sizes: "(max-width: 768px) 90vw, 58vw",
    });
    const image = new window.Image();
    if (props.sizes) {
      image.sizes = props.sizes;
    }
    if (props.srcSet) {
      image.srcset = props.srcSet;
    }
    image.src = props.src;
  }, [selection.active]);

  return (
    <HeroDepth>
      <section
        ref={root}
        className={styles.hero}
        aria-labelledby="hero-title"
        data-hero-machine={machine.id}
        style={{ "--hero-accent": machine.accent } as CSSProperties}
      >
        <div className={styles.environment} aria-hidden="true">
          <Image src={environments.ocean.src} alt="" fill sizes="100vw" className={styles.map} />
        </div>
        <div className={styles.vignette} aria-hidden="true" />
        <div className={styles.topline} aria-hidden="true">
          <span>EARTH DEFENSE INITIATIVE</span>
          <span>35° N / 139° E</span>
        </div>
        <div className={styles.heroInner}>
          <div className={styles.copy}>
            <p className={styles.eyebrow}>
              <span /> ANDROID ARCADE ACTION <span className={styles.eyebrowLine} />
            </p>
            <h1 id="hero-title" className={styles.title}>
              VOLTES V
              <span>STRIKE<span className={styles.period}>.</span></span>
            </h1>
            <p className={styles.tagline}>FIVE MACHINES. ONE MISSION.</p>
            <p className={styles.description}>
              Earth is under attack.<br />
              Take flight. Strike back. Defend our world.
            </p>
            <div className={styles.actions}>
              <ActionLink href="#download">Android release</ActionLink>
              <ActionLink href="#gameplay" secondary>View gameplay</ActionLink>
            </div>
            <p className={styles.platform}>
              <span className={styles.platformIcon} aria-hidden="true">A</span>
              MADE FOR ANDROID
              <span className={styles.separator}>/</span>
              BUILT FOR THE FIGHT
            </p>
          </div>
          <div className={styles.visual}>
            <div className={styles.target} aria-hidden="true">
              <span className={styles.targetInner} />
              <span className={styles.targetCross} />
              <span className={styles.orbitText}>VOLT SYSTEMS / UNIT {machine.number}</span>
            </div>
            <div className={styles.aircraftDepth}>
              <div className={styles.aircraftIntro}>
                {selection.previous !== null && (
                  <div
                    key={`out-${selection.previous}`}
                    className={`${styles.aircraftLayer} ${styles.aircraftLeaving}`}
                    aria-hidden="true"
                  >
                    <Image
                      src={machineAt(selection.previous).artwork.src}
                      alt=""
                      width={1254}
                      height={1254}
                      sizes="(max-width: 768px) 90vw, 58vw"
                      className={styles.aircraft}
                    />
                  </div>
                )}
                <div
                  key={machine.id}
                  className={`${styles.aircraftLayer} ${selection.previous !== null ? styles.aircraftArriving : ""}`}
                >
                  {failedArtwork === machine.id ? (
                    <p className={styles.artworkUnavailable}>
                      {machine.name}<br />
                      Artwork unavailable.
                    </p>
                  ) : (
                    <Image
                      src={machine.artwork.src}
                      alt={machine.artwork.alt}
                      width={1254}
                      height={1254}
                      sizes="(max-width: 768px) 90vw, 58vw"
                      preload={machine.id === "crewzer"}
                      className={styles.aircraft}
                      onError={() => setFailedArtwork(machine.id)}
                    />
                  )}
                </div>
              </div>
            </div>
            <div className={styles.machineLabel}>
              <span className={styles.machineLabelLine} />
              <span>
                {machine.number} / {machine.name.toUpperCase()}
                <small>{machine.pilot.name.toUpperCase()}</small>
              </span>
            </div>
            <span className={styles.visualCorner} aria-hidden="true">+</span>
            <span className={styles.particleA} aria-hidden="true" />
            <span className={styles.particleB} aria-hidden="true" />
          </div>
        </div>
        <div className={styles.heroBottom}>
          <a href="#mission" className={styles.scroll}>
            SCROLL TO DEPLOY <span /><Arrow direction="down" />
          </a>
          <div className={styles.unitCount}>
            <span>{machine.number}</span>
            <i style={{ "--roster-progress": `${(selection.active + 1) * 20}%` } as CSSProperties} />
            05 <span className={styles.unitCaption}>VOLT MACHINES</span>
          </div>
          <p>
            FIVE PILOTS.<br />
            <span>ONE UNBREAKABLE FORMATION.</span>
          </p>
        </div>
      </section>
    </HeroDepth>
  );
}
