"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
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

  useEffect(() => {
    const node = element.current;
    if (
      !node
      || !window.IntersectionObserver
      || window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    // Only hide below-fold content after hydration. Server-rendered content is always readable.
    if (node.getBoundingClientRect().top <= window.innerHeight) {
      return;
    }

    const frame = requestAnimationFrame(() => setHidden(true));
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setHidden(false);
        observer.disconnect();
      }
    }, { rootMargin: "0px 0px -40px 0px", threshold: 0 });
    observer.observe(node);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, []);

  const revealStyle = {
    "--reveal-delay": `${Math.min(400, Math.max(0, delay))}ms`,
  } as CSSProperties;

  return (
    <div
      ref={element}
      className={`${styles.reveal} ${styles[kind]} ${hidden ? styles.hidden : ""} ${className}`}
      data-scroll-reveal
      data-reveal-kind={kind}
      style={revealStyle}
    >
      {children}
    </div>
  );
}
