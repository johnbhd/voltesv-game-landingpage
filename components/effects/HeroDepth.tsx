"use client";

import { useEffect, useRef, type ReactNode } from "react";
import styles from "./effects.module.css";

export function HeroDepth({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const pointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    let frame = 0;
    const reset = () => {
      element.style.setProperty("--pointer-x", "0");
      element.style.setProperty("--pointer-y", "0");
      element.style.setProperty("--hero-scroll", "0px");
    };
    const move = (event: PointerEvent) => {
      if (preference.matches || !pointer.matches || event.pointerType === "touch") return;
      const bounds = element.getBoundingClientRect();
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        element.style.setProperty("--pointer-x", String((event.clientX - bounds.left) / bounds.width * 2 - 1));
        element.style.setProperty("--pointer-y", String((event.clientY - bounds.top) / bounds.height * 2 - 1));
      });
    };
    const scroll = () => {
      if (preference.matches || !pointer.matches) return;
      const bounds = element.getBoundingClientRect();
      if (bounds.bottom < 0 || bounds.top > window.innerHeight) return;
      element.style.setProperty("--hero-scroll", `${Math.min(60, Math.max(0, -bounds.top) * .08)}px`);
    };
    const preferencesChanged = () => { if (preference.matches || !pointer.matches) reset(); };
    element.addEventListener("pointermove", move);
    element.addEventListener("pointerleave", reset);
    window.addEventListener("scroll", scroll, { passive: true });
    preference.addEventListener("change", preferencesChanged);
    pointer.addEventListener("change", preferencesChanged);
    return () => {
      cancelAnimationFrame(frame);
      element.removeEventListener("pointermove", move);
      element.removeEventListener("pointerleave", reset);
      window.removeEventListener("scroll", scroll);
      preference.removeEventListener("change", preferencesChanged);
      pointer.removeEventListener("change", preferencesChanged);
    };
  }, []);
  return <div ref={root} className={styles.depth}>{children}</div>;
}
