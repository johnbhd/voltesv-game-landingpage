"use client";

import { useEffect } from "react";

const SCROLL_DURATION = 1100;
const INTERRUPT_KEYS = new Set([
  "ArrowDown",
  "ArrowUp",
  "End",
  "Home",
  "PageDown",
  "PageUp",
  " ",
]);

function easeInOutCubic(progress: number) {
  return progress < .5
    ? 4 * progress * progress * progress
    : 1 - Math.pow(-2 * progress + 2, 3) / 2;
}

function focusTarget(target: HTMLElement) {
  const hadTabIndex = target.hasAttribute("tabindex");
  if (!hadTabIndex) {
    target.setAttribute("tabindex", "-1");
  }
  target.focus({ preventScroll: true });
  if (!hadTabIndex) {
    target.addEventListener("blur", () => target.removeAttribute("tabindex"), { once: true });
  }
}

export function AnchorScroll() {
  useEffect(() => {
    let animationFrame: number | null = null;

    const cancelScroll = () => {
      if (animationFrame !== null) {
        window.cancelAnimationFrame(animationFrame);
        animationFrame = null;
      }
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

      cancelScroll();
      if (anchor.hasAttribute("data-scroll-instant")) {
        return;
      }

      event.preventDefault();
      const startY = window.scrollY;
      const scrollPadding = targetId === "top"
        ? 0
        : Number.parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
      const maximumY = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      const destinationY = Math.min(
        maximumY,
        Math.max(0, target.getBoundingClientRect().top + startY - scrollPadding),
      );
      const distance = destinationY - startY;
      const startedAt = window.performance.now();
      const shouldFocus = event.detail === 0;

      window.history.pushState(null, "", destination.hash);

      const animate = (now: number) => {
        const progress = Math.min(1, (now - startedAt) / SCROLL_DURATION);
        window.scrollTo(0, startY + distance * easeInOutCubic(progress));

        if (progress < 1) {
          animationFrame = window.requestAnimationFrame(animate);
          return;
        }

        animationFrame = null;
        if (shouldFocus) {
          focusTarget(target);
        }
      };

      if (Math.abs(distance) < 1) {
        if (shouldFocus) {
          focusTarget(target);
        }
        return;
      }

      animationFrame = window.requestAnimationFrame(animate);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (INTERRUPT_KEYS.has(event.key)) {
        cancelScroll();
      }
    };

    document.addEventListener("click", onClick);
    window.addEventListener("wheel", cancelScroll, { passive: true });
    window.addEventListener("touchstart", cancelScroll, { passive: true });
    window.addEventListener("keydown", onKeyDown);

    return () => {
      cancelScroll();
      document.removeEventListener("click", onClick);
      window.removeEventListener("wheel", cancelScroll);
      window.removeEventListener("touchstart", cancelScroll);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return null;
}
