"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { enemies } from "@/data/hostiles";
import { Reveal } from "@/components/effects/Reveal";
import { Arrow } from "@/components/ui/Arrow";
import styles from "./hostiles.module.css";

function wrapEnemy(index: number) {
  return (index + enemies.length) % enemies.length;
}

export function HostilesSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [previousIndex, setPreviousIndex] = useState<number | null>(null);
  const [failedImages, setFailedImages] = useState<ReadonlySet<string>>(new Set());
  const transitionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeEnemy = enemies[activeIndex];
  const previousEnemy = enemies[wrapEnemy(activeIndex - 1)];
  const nextEnemy = enemies[wrapEnemy(activeIndex + 1)];

  useEffect(() => {
    return () => {
      if (transitionTimer.current) {
        clearTimeout(transitionTimer.current);
      }
    };
  }, []);

  function selectEnemy(nextIndex: number) {
    const wrappedIndex = wrapEnemy(nextIndex);
    if (wrappedIndex === activeIndex) {
      return;
    }

    if (transitionTimer.current) {
      clearTimeout(transitionTimer.current);
    }
    setPreviousIndex(activeIndex);
    setActiveIndex(wrappedIndex);
    transitionTimer.current = setTimeout(() => {
      setPreviousIndex(null);
      transitionTimer.current = null;
    }, 350);
  }

  function markFailed(id: string) {
    setFailedImages((current) => new Set(current).add(id));
  }

  return (
    <section id="hostiles" className={styles.hostiles} aria-labelledby="hostiles-title">
      <div className={styles.grid} aria-hidden="true" />
      <div className={styles.inner}>
        <Reveal kind="clip">
          <header className={styles.heading}>
            <p className={styles.eyebrow}>
              <span /> ENEMY INTELLIGENCE <span>{"// 004"}</span>
            </p>
            <div className={styles.headingRow}>
              <h2 id="hostiles-title">
                ENEMY{" "}<br />
                <span>FORCES</span>
              </h2>
              <p>
                Identify the machines standing between the Voltes team and Earth’s
                survival.
              </p>
            </div>
          </header>
        </Reveal>

        <Reveal kind="rise" delay={80} className={styles.scannerReveal}>
          <div id="hostile-scanner" className={styles.scanner}>
            <div className={styles.scanWindow} data-hostile-stage>
              <div className={styles.reticle} aria-hidden="true" />
              <div className={styles.scanLine} aria-hidden="true" />
              <div className={styles.artworkStack}>
                {enemies.map((enemy, index) => {
                  const active = index === activeIndex;
                  const leaving = index === previousIndex;

                  return (
                    <div
                      key={enemy.id}
                      className={styles.hostileArtwork}
                      data-hostile-art={enemy.id}
                      data-active={active}
                      data-leaving={leaving}
                      aria-hidden={!active}
                    >
                      {failedImages.has(enemy.id) ? (
                        <p className={styles.unavailable}>ARTWORK UNAVAILABLE</p>
                      ) : (
                        <Image
                          src={enemy.artwork.src}
                          alt={active ? enemy.artwork.alt : ""}
                          width={enemy.artwork.width}
                          height={enemy.artwork.height}
                          sizes="(max-width: 768px) calc(100vw - 48px), 58vw"
                          onError={() => markFailed(enemy.id)}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
              <p className={styles.scanStatus}>
                TARGET LOCKED <span>●</span>
              </p>
            </div>

            <div className={styles.dossier}>
              <div
                id="hostile-status"
                className={styles.identity}
                aria-live="polite"
                aria-atomic="true"
              >
                <p>HOSTILE // {activeEnemy.number}</p>
                <h3 id="hostile-name">{activeEnemy.name}</h3>
                <span>{activeEnemy.number} / {String(enemies.length).padStart(2, "0")}</span>
              </div>

              <div className={styles.selectors} aria-label="Select a hostile unit">
                {enemies.map((enemy, index) => (
                  <button
                    key={enemy.id}
                    type="button"
                    className={styles.selector}
                    data-enemy-selector={enemy.id}
                    aria-pressed={index === activeIndex}
                    aria-label={`Select ${enemy.name}`}
                    onClick={() => selectEnemy(index)}
                  >
                    <span className={styles.selectorNumber}>{enemy.number}</span>
                    <span className={styles.thumbnail} aria-hidden="true">
                      <Image
                        src={enemy.artwork.src}
                        alt=""
                        width={96}
                        height={96}
                        sizes="72px"
                      />
                    </span>
                    <span className={styles.selectorName}>{enemy.name}</span>
                    <span className={styles.selectorMark} aria-hidden="true" />
                  </button>
                ))}
              </div>

              <nav className={styles.controls} aria-label="Hostile database navigation">
                <button
                  type="button"
                  aria-label={`Previous enemy: ${previousEnemy.name}`}
                  onClick={() => selectEnemy(activeIndex - 1)}
                >
                  <Arrow direction="left" />
                  <span><small>PREVIOUS</small>{previousEnemy.name}</span>
                </button>
                <button
                  type="button"
                  aria-label={`Next enemy: ${nextEnemy.name}`}
                  onClick={() => selectEnemy(activeIndex + 1)}
                >
                  <span><small>NEXT</small>{nextEnemy.name}</span>
                  <Arrow direction="right" />
                </button>
              </nav>
            </div>
          </div>
        </Reveal>

        <footer className={styles.footer}>
          <span>BOAZANIAN FORCES / ARCHIVE ACCESS</span>
          <span>SCAN STATUS // ACTIVE</span>
        </footer>
      </div>
    </section>
  );
}
