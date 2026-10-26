"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { useReducedMotion } from "./motion-preference";
import styles from "./effects.module.css";

type RevealKind = "clip" | "settle" | "rise" | "slide-left" | "slide-right";

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  kind?: RevealKind;
};

export function Reveal({
  children,
  className = "",
  delay = 0,
  kind = "clip",
}: RevealProps) {
  const element = useRef<HTMLDivElement>(null);
  const [hidden, setHidden] = useState(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const node = element.current;
    if (
      !node
      || !window.IntersectionObserver
      || reducedMotion
    ) {
      const frame = requestAnimationFrame(() => setHidden(false));
      return () => cancelAnimationFrame(frame);
    }

    // Only hide below-fold content after hydration. Server-rendered content is always readable.
    if (node.getBoundingClientRect().top <= window.innerHeight) {
      return;
    }

    const frame = requestAnimationFrame(() => setHidden(true));
    const show = () => {
      cancelAnimationFrame(frame);
      setHidden(false);
      observer.disconnect();
    };
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        show();
      }
    }, { rootMargin: "0px 0px -12% 0px", threshold: 0 });
    const focused = () => show();
    observer.observe(node);
    node.addEventListener("focusin", focused);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      node.removeEventListener("focusin", focused);
    };
  }, [reducedMotion]);

  const revealStyle = {
    "--reveal-delay": `${Math.min(400, Math.max(0, delay))}ms`,
  } as CSSProperties;

  return (
    <div
      ref={element}
      className={`${styles.reveal} ${styles[kind]} ${hidden ? styles.hidden : ""} ${className}`}
      data-scroll-reveal
      data-reveal-kind={kind}
      data-reveal-state={hidden ? "waiting" : "visible"}
      style={revealStyle}
    >
      {children}
    </div>
  );
}
