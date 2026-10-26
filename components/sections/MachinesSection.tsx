"use client";

import Image from "next/image";
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type TouchEvent,
} from "react";
import { machines, machineAt } from "@/data/machines";
import { Arrow } from "@/components/ui/Arrow";
import { Reveal } from "@/components/effects/Reveal";
import { MachineDetails } from "./MachineDetails";
import styles from "./machines.module.css";

type Direction = 1 | -1;

type Selection = {
  active: number;
  previous: number | null;
  direction: Direction;
};

export function MachinesSection() {
  const [selection, setSelection] = useState<Selection>({
    active: 0,
    previous: null,
    direction: 1,
  });
  const [failedArtwork, setFailedArtwork] = useState<string | null>(null);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const machine = machineAt(selection.active);
  const previousMachine = machineAt(selection.active - 1);
  const nextMachine = machineAt(selection.active + 1);

  useEffect(() => {
    if (selection.previous === null) {
      return;
    }
    const timer = window.setTimeout(() => {
      setSelection((value) => ({ ...value, previous: null }));
    }, 360);
    return () => window.clearTimeout(timer);
  }, [selection.active, selection.previous]);

  function select(index: number, focus = false, direction?: Direction) {
    const target = ((index % machines.length) + machines.length) % machines.length;

    setSelection((value) => {
      if (value.active === target) {
        return value;
      }
      return {
        active: target,
        previous: value.active,
        direction: direction ?? (target > value.active ? 1 : -1),
      };
    });

    if (focus) {
      tabs.current[target]?.focus({ preventScroll: true });
    }

    const tab = tabs.current[target];
    const selector = tab?.parentElement;
    if (tab && selector) {
      const bounds = selector.getBoundingClientRect();
      const targetBounds = tab.getBoundingClientRect();
      // Adjust only the horizontal selector; never scroll the document.
      const delta = targetBounds.left < bounds.left
        ? targetBounds.left - bounds.left
        : Math.max(0, targetBounds.right - bounds.right);

      if (delta) {
        selector.scrollBy({ left: delta, behavior: "instant" });
      }
    }
  }

  function onKey(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const target = {
      ArrowRight: index + 1,
      ArrowLeft: index - 1,
      Home: 0,
      End: machines.length - 1,
    }[event.key];

    if (target !== undefined) {
      event.preventDefault();
      const direction = event.key === "ArrowLeft" || event.key === "Home" ? -1 : 1;
      select(target, true, direction);
    }
  }

  function endTouch(event: TouchEvent<HTMLDivElement>) {
    if (!touch.current) {
      return;
    }
    const deltaX = event.changedTouches[0].clientX - touch.current.x;
    const deltaY = event.changedTouches[0].clientY - touch.current.y;
    if (Math.abs(deltaX) >= 50 && Math.abs(deltaX) > Math.abs(deltaY) * 1.4) {
      const direction = deltaX < 0 ? 1 : -1;
      select(selection.active + direction, false, direction);
    }
    touch.current = null;
  }

  return (
    <section
      id="machines"
      aria-labelledby="machines-title"
      className={styles.machines}
      data-direction={selection.direction}
      style={{ "--machine-accent": machine.accent } as CSSProperties}
    >
      <div className={styles.inner}>
        <div className={styles.sectionTop}>
          <p><span /> THE VOLT FORMATION <span>{"// 002"}</span></p>
          <span>FIVE MACHINES. ONE FORCE.</span>
        </div>
        <div className={styles.headingRow}>
          <Reveal>
            <h2 id="machines-title">CHOOSE YOUR<br /><span>MACHINE.</span></h2>
          </Reveal>
          <p>Five machines. Five pilots.<br />Find your place in the formation.</p>
        </div>
        <div className={styles.selector} role="tablist" aria-label="Choose a Volt machine">
          {machines.map((item, index) => (
            <button
              key={item.id}
              ref={(element) => {
                tabs.current[index] = element;
              }}
              type="button"
              role="tab"
              id={"tab-" + item.id}
              aria-label={"Select " + item.name}
              aria-controls="machine-panel"
              aria-selected={index === selection.active}
              tabIndex={index === selection.active ? 0 : -1}
              onClick={() => select(index)}
              onKeyDown={(event) => onKey(event, index)}
            >
              <span>{item.number}</span>
              <span>{item.name.replace("Volt ", "")}</span>
              <i aria-hidden="true" />
            </button>
          ))}
        </div>
        <Reveal kind="rise" delay={120}>
          <div
            className={styles.showcase}
            id="machine-panel"
            role="tabpanel"
            aria-labelledby={"tab-" + machine.id}
            tabIndex={0}
          >
            <div
              className={styles.stage}
              onTouchStart={(event) => {
                touch.current = {
                  x: event.touches[0].clientX,
                  y: event.touches[0].clientY,
                };
              }}
              onTouchEnd={endTouch}
              onTouchCancel={() => {
                touch.current = null;
              }}
            >
              <div className={styles.stageGrid} aria-hidden="true" />
              <span className={styles.bigNumber} aria-hidden="true">{machine.number}</span>
              <div className={styles.stageRing} aria-hidden="true" />
              <span className={styles.crosshairA} aria-hidden="true">+</span>
              <span className={styles.crosshairB} aria-hidden="true">+</span>
              {selection.previous !== null && (
                <div
                  key={"out-" + selection.previous}
                  className={[styles.artwork, styles.exiting].join(" ")}
                  aria-hidden="true"
                >
                  <Image
                    src={machineAt(selection.previous).artwork.src}
                    alt=""
                    width={1254}
                    height={1254}
                    sizes="(max-width: 768px) 85vw, 50vw"
                  />
                </div>
              )}
              <div
                key={machine.id}
                className={[styles.artwork, styles.entering].join(" ")}
              >
                {failedArtwork === machine.id ? (
                  <p className={styles.unavailable}>
                    Artwork unavailable.<br />{machine.name}
                  </p>
                ) : (
                  <Image
                    src={machine.artwork.src}
                    alt={machine.artwork.alt}
                    width={1254}
                    height={1254}
                    sizes="(max-width: 768px) 85vw, 50vw"
                    onError={() => setFailedArtwork(machine.id)}
                  />
                )}
              </div>
              <div className={styles.stageBottom}>
                <span>UNIT {machine.number} / 05</span>
                <span>VOLT SYSTEMS <span className={styles.statusDot} /></span>
              </div>
            </div>
            <div className={styles.detailsStack}>
              {machines.map((item, index) => (
                <MachineDetails
                  key={item.id}
                  machine={item}
                  active={index === selection.active}
                />
              ))}
            </div>
          </div>
        </Reveal>
        <div className={styles.showcaseFooter}>
          <p><span aria-hidden="true">↔</span> SELECT A UNIT. FIND YOUR FORMATION.</p>
          <div className={styles.controls}>
            <p className={styles.controlCounter}>{machine.number}<span> / 05</span></p>
            <div className={styles.controlButtons}>
              <button
                type="button"
                aria-label={"Previous machine: " + previousMachine.name}
                title={"Previous: " + previousMachine.name}
                onClick={() => select(selection.active - 1, false, -1)}
              >
                <Arrow direction="left" />
                <span>{previousMachine.name.replace("Volt ", "")}</span>
              </button>
              <button
                type="button"
                aria-label={"Next machine: " + nextMachine.name}
                title={"Next: " + nextMachine.name}
                className={styles.nextControl}
                onClick={() => select(selection.active + 1, false, 1)}
              >
                <span>{nextMachine.name.replace("Volt ", "")}</span>
                <Arrow direction="right" />
              </button>
            </div>
          </div>
        </div>
        <p className={styles.announcement} role="status" aria-live="polite" aria-atomic="true">
          {machine.name} selected. Pilot: {machine.pilot.name}.
          Special ability: {machine.specialAbility.name}.
        </p>
      </div>
    </section>
  );
}
