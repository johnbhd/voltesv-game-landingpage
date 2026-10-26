import { release, releaseAction } from "@/data/site";
import { Reveal } from "@/components/effects/Reveal";
import { Arrow } from "@/components/ui/Arrow";
import styles from "./release.module.css";

export function ReleaseSection() {
  const action = releaseAction(release);

  return (
    <section
      id="download"
      aria-labelledby="release-title"
      className={styles.release}
    >
      <div className={styles.inner}>
        <Reveal kind="rise" className={styles.releaseReveal}>
          <p className={styles.eyebrow}>
            <span /> THE NEXT MISSION
          </p>
          <h2 id="release-title">
            READY TO<br />TAKE <span>FLIGHT?</span>
          </h2>
          <p className={styles.description}>Your place in the formation is waiting.</p>
          {action.href ? (
            <a className={styles.releaseButton} href={action.href} download>
              {action.label}<Arrow />
            </a>
          ) : (
            <button
              className={styles.releaseButton}
              disabled
              aria-describedby="release-status"
            >
              {action.label}<Arrow />
            </button>
          )}
          <p id="release-status" className={styles.status}>
            {action.version
              ? `ANDROID / VERSION ${action.version}`
              : "ANDROID BUILD COMING SOON"}
          </p>
          <div id="gameplay" className={styles.gameplay}>
            <span className={styles.playIcon} aria-hidden="true">▷</span>
            <p>
              GAMEPLAY FOOTAGE COMING SOON
              <span>Real game captures will be added when available.</span>
            </p>
          </div>
        </Reveal>
      </div>
      <div className={styles.watermark} aria-hidden="true">
        V
      </div>
    </section>
  );
}
