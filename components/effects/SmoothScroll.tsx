"use client";

import Lenis from "lenis";
import { useEffect } from "react";

const SCROLL_DURATION = 2.5;
const NATIVE_SCROLL_KEYS = new Set([
  "ArrowDown",
  "ArrowUp",
  "End",
  "Home",
  "PageDown",
  "PageUp",
  " ",
]);

function cinematicEase(progress: number) {
  return Math.min(1, 1.001 - Math.pow(2, -10 * progress));
}

function focusTarget(target: HTMLElement) {
  const hadTabIndex = target.hasAttribute("tabindex");

  if (!hadTabIndex) {
    target.setAttribute("tabindex", "-1");
  }

  target.focus({ preventScroll: true });

  if (!hadTabIndex) {
    target.addEventListener(
      "blur",
      () => target.removeAttribute("tabindex"),
      { once: true },
    );
  }
}

export function SmoothScroll() {
  useEffect(() => {
    const lenis = new Lenis({
      allowNestedScroll: true,
      autoRaf: true,
      duration: SCROLL_DURATION,
      easing: cinematicEase,
      gestureOrientation: "vertical",
      orientation: "vertical",
      respectReducedMotion: false,
      smoothWheel: true,
      syncTouch: true,
      touchMultiplier: 1.5,
      wheelMultiplier: 0.8,
    });

    const cancelSmoothScroll = () => {
      lenis.scrollTo(window.scrollY, {
        force: true,
        immediate: true,
      });
    };

    const onClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented
        || event.button !== 0
        || event.metaKey
        || event.ctrlKey
        || event.shiftKey
        || event.altKey
        || !(event.target instanceof Element)
      ) {
        return;
      }

      const anchor = event.target.closest<HTMLAnchorElement>("a[href]");

      if (
        !anchor
        || anchor.hasAttribute("download")
        || (anchor.target && anchor.target !== "_self")
      ) {
        return;
      }

      if (anchor.hasAttribute("data-scroll-instant")) {
        cancelSmoothScroll();
        return;
      }

      const destination = new URL(anchor.href, window.location.href);

      if (
        destination.origin !== window.location.origin
        || destination.pathname !== window.location.pathname
        || destination.search !== window.location.search
        || !destination.hash
      ) {
        return;
      }

      let targetId: string;

      try {
        targetId = decodeURIComponent(destination.hash.slice(1));
      } catch {
        return;
      }

      const target = document.getElementById(targetId);

      if (!target) {
        return;
      }

      event.preventDefault();

      const shouldFocus = event.detail === 0;

      window.history.pushState(null, "", destination.hash);
      lenis.scrollTo(target, {
        duration: SCROLL_DURATION,
        easing: cinematicEase,
        onComplete: () => {
          if (shouldFocus) {
            focusTarget(target);
          }
        },
      });
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (!event.defaultPrevented && NATIVE_SCROLL_KEYS.has(event.key)) {
        cancelSmoothScroll();
      }
    };

    document.addEventListener("click", onClick);
    window.addEventListener("hashchange", cancelSmoothScroll);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("popstate", cancelSmoothScroll);

    return () => {
      document.removeEventListener("click", onClick);
      window.removeEventListener("hashchange", cancelSmoothScroll);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("popstate", cancelSmoothScroll);
      lenis.destroy();
    };
  }, []);

  return null;
}
