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
          <p className={styles.description}>
            Download Voltes V Strike for Android and join the fight.
          </p>
          <a
            className={styles.releaseButton}
            href={action.href}
            aria-describedby="release-status"
            download
          >
            {action.label}
            <Arrow />
          </a>
          <p id="release-status" className={styles.status}>
            {action.version
              ? `ANDROID / VERSION ${action.version}`
              : "ANDROID / APK DOWNLOAD"}
          </p>
        </Reveal>
      </div>
      <div className={styles.watermark} aria-hidden="true">
        V
      </div>
    </section>
  );
}
