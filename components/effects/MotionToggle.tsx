"use client";

import {
  setMotionEnabled,
  useReducedMotion,
} from "./motion-preference";
import styles from "./motion-toggle.module.css";

export function MotionToggle() {
  const reducedMotion = useReducedMotion();
  const enabled = !reducedMotion;

  return (
    <button
      aria-label={enabled ? "Disable site animations" : "Enable site animations"}
      aria-pressed={enabled}
      className={styles.toggle}
      data-motion-toggle
      onClick={() => setMotionEnabled(!enabled)}
      type="button"
    >
      <span aria-hidden="true" className={styles.indicator} />
      <span>{enabled ? "ANIMATIONS ON" : "ENABLE ANIMATIONS"}</span>
    </button>
  );
}
