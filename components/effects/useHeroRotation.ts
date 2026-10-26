"use client";

import { useEffect, useState, type RefObject } from "react";
import { machines } from "@/data/machines";
import { isMotionReduced } from "./motion-preference";
import { createRotationClock } from "./rotation-clock";

export function useHeroRotation(root: RefObject<HTMLElement | null>) {
  const [selection, setSelection] = useState({
    active: 0,
    previous: null as number | null,
  });

  useEffect(() => {
    const element = root.current;
    if (!element) {
      return;
    }

    const bounds = element.getBoundingClientRect();
    let visible = bounds.bottom > 0 && bounds.top < window.innerHeight;
    const clock = createRotationClock({
      now: () => performance.now(),
      schedule: (callback, delay) => window.setTimeout(callback, delay),
      cancel: (timer) => window.clearTimeout(timer),
      advance: () => {
        setSelection((value) => ({
          active: (value.active + 1) % machines.length,
          previous: isMotionReduced() ? null : value.active,
        }));
      },
    });

    function refresh() {
      clock.setRunning(visible && document.visibilityState === "visible");
    }

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting && entry.intersectionRect.height > 0;
      refresh();
    });

    observer.observe(element);
    document.addEventListener("visibilitychange", refresh);
    refresh();

    return () => {
      clock.dispose();
      observer.disconnect();
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [root]);

  useEffect(() => {
    if (selection.previous === null) {
      return;
    }
    const timer = window.setTimeout(() => {
      setSelection((value) => ({ ...value, previous: null }));
    }, 600);
    return () => window.clearTimeout(timer);
  }, [selection.active, selection.previous]);

  return selection;
}
