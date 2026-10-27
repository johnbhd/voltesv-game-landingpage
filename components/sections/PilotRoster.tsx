"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Arrow } from "@/components/ui/Arrow";
import { machines } from "@/data/machines";
import styles from "./pilots.module.css";

function formatPilotNumber(index: number) {
  return `${String(index + 1).padStart(2, "0")} / ${String(machines.length).padStart(2, "0")}`;
}

export function PilotRoster() {
  const galleryRef = useRef<HTMLDivElement>(null);
  const rosterItemsRef = useRef<(HTMLLIElement | null)[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const activeIndexRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [enhanced, setEnhanced] = useState(false);

  useEffect(() => {
    const gallery = galleryRef.current;

    if (!gallery) {
      return;
    }

    setEnhanced(true);

    const syncActivePilot = () => {
      animationFrameRef.current = null;
      const galleryBounds = gallery.getBoundingClientRect();
      const paddingLeft = Number.parseFloat(getComputedStyle(gallery).paddingLeft) || 0;
      const targetLeft = galleryBounds.left + paddingLeft;
      let closestIndex = 0;
      let closestDistance = Number.POSITIVE_INFINITY;

      rosterItemsRef.current.forEach((item, index) => {
        if (!item) {
          return;
        }

        const distance = Math.abs(item.getBoundingClientRect().left - targetLeft);

        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });

      activeIndexRef.current = closestIndex;
      setActiveIndex((current) => current === closestIndex ? current : closestIndex);
    };

    const scheduleSync = () => {
      if (animationFrameRef.current !== null) {
        return;
      }

      animationFrameRef.current = window.requestAnimationFrame(syncActivePilot);
    };

    gallery.addEventListener("scroll", scheduleSync, { passive: true });
    window.addEventListener("resize", scheduleSync);

    const resizeObserver = typeof ResizeObserver === "undefined"
      ? null
      : new ResizeObserver(scheduleSync);
    resizeObserver?.observe(gallery);
    scheduleSync();

    return () => {
      gallery.removeEventListener("scroll", scheduleSync);
      window.removeEventListener("resize", scheduleSync);
      resizeObserver?.disconnect();

      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, []);

  function showPilot(index: number) {
    const gallery = galleryRef.current;
    const item = rosterItemsRef.current[index];

    if (!gallery || !item) {
      return;
    }

    const galleryBounds = gallery.getBoundingClientRect();
    const itemBounds = item.getBoundingClientRect();
    const paddingLeft = Number.parseFloat(getComputedStyle(gallery).paddingLeft) || 0;
    const requestedLeft = itemBounds.left - galleryBounds.left + gallery.scrollLeft - paddingLeft;
    const maximumLeft = gallery.scrollWidth - gallery.clientWidth;
    const targetLeft = Math.max(0, Math.min(requestedLeft, maximumLeft));

    activeIndexRef.current = index;
    setActiveIndex(index);
    gallery.scrollTo({
      left: targetLeft,
      behavior: "smooth",
    });
  }

  function showNextPilot() {
    showPilot((activeIndexRef.current + 1) % machines.length);
  }

  const nextIndex = (activeIndex + 1) % machines.length;
  const nextPilot = machines[nextIndex].pilot.name.toUpperCase();

  return (
    <>
      <div
        id="pilot-roster"
        ref={galleryRef}
        className={styles.gallery}
        role="region"
        aria-label="Voltes pilot roster"
        aria-describedby="pilot-roster-hint"
        tabIndex={0}
      >
        <ul className={styles.roster}>
          {machines.map((machine, index) => (
            <li
              key={machine.id}
              ref={(element) => {
                rosterItemsRef.current[index] = element;
              }}
              className={styles.rosterItem}
              data-unit={machine.number}
            >
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
      <div
        className={styles.pilotControls}
        data-pilot-controls
        data-pilot-enhanced={enhanced ? "true" : undefined}
      >
        <span className={styles.pilotCounter} data-pilot-counter>
          {formatPilotNumber(activeIndex)}
        </span>
        <span className={styles.srOnly} aria-live="polite">
          Showing pilot {machines[activeIndex].pilot.name}
        </span>
        <button
          className={styles.nextPilot}
          data-pilot-next
          type="button"
          aria-controls="pilot-roster"
          aria-label={`Show next pilot: ${machines[nextIndex].pilot.name}`}
          onClick={showNextPilot}
        >
          <span>NEXT // {nextPilot}</span>
          <Arrow direction="right" />
        </button>
      </div>
    </>
  );
}
