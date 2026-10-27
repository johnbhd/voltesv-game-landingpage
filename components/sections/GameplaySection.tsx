"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Reveal } from "@/components/effects/Reveal";
import { createRotationClock } from "@/components/effects/rotation-clock";
import { gameplayScenes } from "@/data/gameplay";
import styles from "./gameplay.module.css";

export function GameplaySection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const root = useRef<HTMLElement>(null);
  const tabs = useRef<Array<HTMLButtonElement | null>>([]);
  const activeScene = gameplayScenes[activeIndex];

  useEffect(() => {
    const section = root.current;
    if (!section) {
      return;
    }

    const bounds = section.getBoundingClientRect();
    let visible = bounds.bottom > 0 && bounds.top < window.innerHeight;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const clock = createRotationClock({
      now: () => performance.now(),
      schedule: (callback, delay) => window.setTimeout(callback, delay),
      cancel: (timer) => window.clearTimeout(timer),
      advance: () => {
        const nextIndex = (activeIndex + 1) % gameplayScenes.length;
        setActiveIndex(nextIndex);
        setFocusedIndex(nextIndex);
      },
    });

    function refresh() {
      const motionMode = document.documentElement.dataset.motion;
      const rotationEnabled = motionMode === "full"
        || (motionMode !== "reduce" && !reducedMotion.matches);

      clock.setRunning(
        visible
        && document.visibilityState === "visible"
        && rotationEnabled,
      );
    }

    const observer = typeof IntersectionObserver === "undefined"
      ? null
      : new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting && entry.intersectionRect.height > 0;
        refresh();
      });

    observer?.observe(section);
    document.addEventListener("visibilitychange", refresh);
    reducedMotion.addEventListener("change", refresh);
    refresh();

    return () => {
      clock.dispose();
      observer?.disconnect();
      document.removeEventListener("visibilitychange", refresh);
      reducedMotion.removeEventListener("change", refresh);
    };
  }, [activeIndex]);

  function navigateTabs(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let nextIndex: number;

    switch (event.key) {
      case "ArrowRight":
        nextIndex = (index + 1) % gameplayScenes.length;
        break;
      case "ArrowLeft":
        nextIndex = (index - 1 + gameplayScenes.length) % gameplayScenes.length;
        break;
      case "Home":
        nextIndex = 0;
        break;
      case "End":
        nextIndex = gameplayScenes.length - 1;
        break;
      default:
        return;
    }

    event.preventDefault();
    setFocusedIndex(nextIndex);
    tabs.current[nextIndex]?.focus({ preventScroll: true });
  }

  return (
    <section
      ref={root}
      id="gameplay"
      aria-labelledby="gameplay-title"
      className={styles.gameplay}
    >
      <Reveal kind="rise" className={styles.inner}>
        <div className={styles.showcase}>
          <div className={styles.heading}>
            <p className={styles.eyebrow}>GAMEPLAY</p>
            <h2 id="gameplay-title">
              TAKE FLIGHT.<br />
              <span>TAKE CONTROL.</span>
            </h2>
            <p className={styles.introduction}>
              Five machines. An ocean of enemies. Your mission starts here.
            </p>
          </div>

          <figure className={styles.capture}>
            <div className={styles.stage} data-gameplay-stage>
              {gameplayScenes.map((scene, index) => (
                <div
                  key={scene.id}
                  className={styles.screenshot}
                  data-gameplay-image={scene.id}
                  data-active={index === activeIndex}
                  aria-hidden={index !== activeIndex}
                >
                  <Image
                    src={scene.image.src}
                    width={scene.image.width}
                    height={scene.image.height}
                    alt={scene.image.alt}
                    sizes="(max-width: 420px) calc(100vw - 72px), 340px"
                  />
                </div>
              ))}
            </div>
            <figcaption>
              IN-GAME CAPTURE
              <span>{activeScene.label}</span>
            </figcaption>
          </figure>

          <div className={styles.tabs} role="tablist" aria-label="Gameplay scenes">
            {gameplayScenes.map((scene, index) => (
              <button
                key={scene.id}
                ref={(node) => {
                  tabs.current[index] = node;
                }}
                id={`gameplay-tab-${scene.id}`}
                type="button"
                role="tab"
                aria-controls={`gameplay-${scene.id}`}
                aria-selected={index === activeIndex}
                tabIndex={index === focusedIndex ? 0 : -1}
                onFocus={() => setFocusedIndex(index)}
                onKeyDown={(event) => navigateTabs(event, index)}
                onClick={() => {
                  setActiveIndex(index);
                  setFocusedIndex(index);
                }}
              >
                {scene.label}
              </button>
            ))}
          </div>

          <div className={styles.details}>
            {gameplayScenes.map((scene, index) => (
              <div
                key={scene.id}
                id={`gameplay-${scene.id}`}
                role="tabpanel"
                aria-labelledby={`gameplay-tab-${scene.id}`}
                tabIndex={0}
                className={styles.scene}
                hidden={index !== activeIndex}
              >
                <h3>{scene.title}</h3>
                <p>{scene.description}</p>
                <ul className={styles.features}>
                  {scene.features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
}
