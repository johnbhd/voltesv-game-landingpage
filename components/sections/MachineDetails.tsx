import Image from "next/image";
import { useState } from "react";
import type { Artwork, Machine } from "@/data/machines";
import styles from "./machines.module.css";

function SupportingArtwork({ artwork, size }: { artwork: Artwork; size: number }) {
  const [failed, setFailed] = useState(false);

  return (
    <span className={styles.supportingArtwork} style={{ width: size, height: size }}>
      {failed ? (
        <span className={styles.supportingUnavailable}>Artwork unavailable</span>
      ) : (
        <Image
          src={artwork.src}
          alt={artwork.alt}
          width={size}
          height={size}
          sizes={String(size) + "px"}
          onError={() => setFailed(true)}
        />
      )}
    </span>
  );
}

export function MachineDetails({ machine, active }: { machine: Machine; active: boolean }) {
  return (
    <div
      className={styles.details}
      data-machine-details={machine.id}
      data-active={active}
      aria-hidden={!active}
      inert={!active}
    >
      <p className={styles.unitLabel}>
        UNIT // {machine.number}<span>VOLT FORMATION</span>
      </p>
      <h3>{machine.name.replace(" ", "\n")}</h3>
      <p className={styles.description}>{machine.description}</p>
      <dl className={styles.specs}>
        <div className={styles.weaponSpec}>
          <dt>PRIMARY WEAPON</dt>
          <dd>
            <SupportingArtwork artwork={machine.primaryWeapon.artwork} size={64} />
            <span>{machine.primaryWeapon.name}</span>
          </dd>
        </div>
        <div className={styles.abilitySpec}>
          <dt>SPECIAL ABILITY</dt>
          <dd>
            <SupportingArtwork artwork={machine.specialAbility.artwork} size={112} />
            <div>
              <strong>{machine.specialAbility.name}</strong>
              <p>{machine.specialAbility.description}</p>
            </div>
          </dd>
        </div>
      </dl>
      <div className={styles.pilot}>
        <Image
          src={machine.pilot.artwork.src}
          alt={machine.pilot.artwork.alt}
          width={56}
          height={56}
          sizes="56px"
        />
        <div>
          <p className={styles.pilotLabel}>YOUR PILOT</p>
          <span>{machine.pilot.name}</span>
          <p className={styles.pilotDescription}>{machine.pilot.description}</p>
        </div>
        <span className={styles.pilotNumber}>{machine.number}</span>
      </div>
    </div>
  );
}
