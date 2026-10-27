"use client";

import { useEffect, useRef, useState } from "react";
import { navigation, release, releaseAction } from "@/data/site";
import { Arrow } from "@/components/ui/Arrow";
import styles from "./layout.module.css";

export function SiteHeader() {
  const downloadAction = releaseAction(release);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  const header = useRef<HTMLElement>(null);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    const desktop = window.matchMedia("(min-width: 769px)");
    const onResize = () => { if (desktop.matches) setOpen(false); };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && open) { setOpen(false); toggle.current?.focus(); }
    };
    const outside = (event: PointerEvent) => {
      if (event.target instanceof Node && !header.current?.contains(event.target)) setOpen(false);
    };
    onScroll();
    if (open) header.current?.querySelector<HTMLAnchorElement>("#site-navigation a")?.focus({ preventScroll: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", outside);
    desktop.addEventListener("change", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", outside);
      desktop.removeEventListener("change", onResize);
    };
  }, [open]);

  return (
    <header ref={header} className={`${styles.header} ${scrolled || open ? styles.scrolled : ""}`} data-scrolled={scrolled}>
      <div className={styles.headerInner}>
        <a className={styles.wordmark} href="#top" aria-label="Voltes V Strike — back to top" onClick={() => setOpen(false)}>
          <span className={styles.emblem} aria-hidden="true">V</span>
          <span>VOLTES V<span className={styles.wordmarkSub}>STRIKE</span></span>
        </a>
        <nav className={`${styles.navigation} ${open ? styles.open : ""}`} id="site-navigation" aria-label="Main navigation">
          {navigation.map((item, index) => <a key={item.href} href={item.href} onClick={() => setOpen(false)}><span className={styles.navIndex}>0{index + 1}</span>{item.label}</a>)}
        </nav>
        <a
          className={styles.headerCta}
          href={downloadAction.href}
          download
          onClick={() => setOpen(false)}
        >
          Download APK <Arrow />
        </a>
        <button ref={toggle} className={styles.menuToggle} aria-controls="site-navigation" aria-expanded={open} aria-label={open ? "Close navigation" : "Open navigation"} onClick={() => setOpen(!open)}>
          <span /><span />
        </button>
      </div>
    </header>
  );
}
