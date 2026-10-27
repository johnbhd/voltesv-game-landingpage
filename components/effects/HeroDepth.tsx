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

    const pointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    let pointerFrame = 0;
    let scrollFrame = 0;
    let disposed = false;
    let introTimer: ReturnType<typeof setTimeout> | undefined;

    // Start the entrance after the first machine can actually be seen.
    element.dataset.introReady = "pending";
    const artwork = element.querySelector<HTMLImageElement>("[data-hero-artwork]");
    const introDeadline = new Promise<void>((resolve) => {
      introTimer = setTimeout(resolve, 1600);
    });
    const artworkReady = artwork?.decode().catch(() => undefined) ?? Promise.resolve();
    void Promise.race([artworkReady, introDeadline]).then(() => {
      clearTimeout(introTimer);
      if (!disposed) {
        element.dataset.introReady = "true";
      }
    });

    const resetPointer = () => {
      cancelAnimationFrame(pointerFrame);
      pointerFrame = 0;
      element.style.setProperty("--pointer-x", "0");
      element.style.setProperty("--pointer-y", "0");
    };

    const move = (event: PointerEvent) => {
      if (!pointer.matches || event.pointerType === "touch") {
        return;
      }

      const bounds = element.getBoundingClientRect();
      cancelAnimationFrame(pointerFrame);
      pointerFrame = requestAnimationFrame(() => {
        pointerFrame = 0;
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
      scrollFrame = 0;
      const bounds = element.getBoundingClientRect();
      if (bounds.bottom < 0 || bounds.top > window.innerHeight) {
        return;
      }

      const travel = Math.max(1, Math.min(bounds.height, window.innerHeight));
      const progress = Math.min(1, Math.max(0, -bounds.top / travel));
      element.style.setProperty("--hero-scroll-progress", progress.toFixed(4));
      element.style.setProperty("--hero-scroll", `${(progress * 100).toFixed(2)}px`);
    };

    const scheduleScroll = () => {
      if (!scrollFrame) {
        scrollFrame = requestAnimationFrame(updateScroll);
      }
    };

    const preferencesChanged = () => {
      if (!pointer.matches) {
        resetPointer();
      }
      scheduleScroll();
    };

    element.addEventListener("pointermove", move);
    element.addEventListener("pointerleave", resetPointer);
    window.addEventListener("scroll", scheduleScroll, { passive: true });
    window.addEventListener("resize", scheduleScroll);
    pointer.addEventListener("change", preferencesChanged);
    scheduleScroll();

    return () => {
      disposed = true;
      clearTimeout(introTimer);
      cancelAnimationFrame(pointerFrame);
      cancelAnimationFrame(scrollFrame);
      element.removeEventListener("pointermove", move);
      element.removeEventListener("pointerleave", resetPointer);
      window.removeEventListener("scroll", scheduleScroll);
      window.removeEventListener("resize", scheduleScroll);
      pointer.removeEventListener("change", preferencesChanged);
    };
  }, []);

  return (
    <div ref={root} className={styles.depth} data-hero-depth>
      {children}
    </div>
  );
}
