"use client";

import { useEffect, useRef, type ReactNode } from "react";
import styles from "./effects.module.css";

export function HeroDepth({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = root.current;
    if (!element) {
      return;
    }

    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const pointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    let frame = 0;

    const resetPointer = () => {
      element.style.setProperty("--pointer-x", "0");
      element.style.setProperty("--pointer-y", "0");
    };

    const resetMotion = () => {
      resetPointer();
      element.style.setProperty("--hero-scroll", "0px");
      element.style.setProperty("--hero-scroll-progress", "0");
    };

    const move = (event: PointerEvent) => {
      if (preference.matches || !pointer.matches || event.pointerType === "touch") {
        return;
      }

      const bounds = element.getBoundingClientRect();
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        element.style.setProperty(
          "--pointer-x",
          String((event.clientX - bounds.left) / bounds.width * 2 - 1),
        );
        element.style.setProperty(
          "--pointer-y",
          String((event.clientY - bounds.top) / bounds.height * 2 - 1),
        );
      });
    };

    const updateScroll = () => {
      if (preference.matches) {
        resetMotion();
        return;
      }

      const bounds = element.getBoundingClientRect();
      if (bounds.bottom < 0 || bounds.top > window.innerHeight) {
        return;
      }

      const travel = Math.max(1, Math.min(bounds.height, window.innerHeight));
      const progress = Math.min(1, Math.max(0, -bounds.top / travel));
      element.style.setProperty("--hero-scroll-progress", progress.toFixed(4));
      element.style.setProperty("--hero-scroll", `${(progress * 60).toFixed(2)}px`);
    };

    const scheduleScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(updateScroll);
    };

    const preferencesChanged = () => {
      if (preference.matches) {
        resetMotion();
        return;
      }

      if (!pointer.matches) {
        resetPointer();
      }
      scheduleScroll();
    };

    element.addEventListener("pointermove", move);
    element.addEventListener("pointerleave", resetPointer);
    window.addEventListener("scroll", scheduleScroll, { passive: true });
    window.addEventListener("resize", scheduleScroll);
    preference.addEventListener("change", preferencesChanged);
    pointer.addEventListener("change", preferencesChanged);
    scheduleScroll();

    return () => {
      cancelAnimationFrame(frame);
      element.removeEventListener("pointermove", move);
      element.removeEventListener("pointerleave", resetPointer);
      window.removeEventListener("scroll", scheduleScroll);
      window.removeEventListener("resize", scheduleScroll);
      preference.removeEventListener("change", preferencesChanged);
      pointer.removeEventListener("change", preferencesChanged);
    };
  }, []);

  return (
    <div ref={root} className={styles.depth} data-hero-depth>
      {children}
    </div>
  );
}
