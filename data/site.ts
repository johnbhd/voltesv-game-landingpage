export type Release = {
  apkUrl: string;
  version?: string;
};

export const release: Release = {
  apkUrl: "https://github.com/johnbhd/voltesv-game-landingpage/releases/download/android/voltesv.apk",
};

export function releaseAction(value: Release): {
  label: string;
  href: string;
  version: string | null;
} {
  return {
    label: "DOWNLOAD NOW",
    href: value.apkUrl,
    version: value.version ?? null,
  };
}

export const environments = {
  ocean: { source: "img-assets/maps/falconmap_start.png", src: "/images/game/ocean.webp", width: 941, height: 1672 },
  hostile: { source: "img-assets/optoinal/boazanian_earthbase.png", src: "/images/game/boazanian-base.webp", width: 941, height: 1672 },
};

export const navigation = [
  { label: "Mission", href: "#mission" },
  { label: "Machines", href: "#machines" },
  { label: "Enemies", href: "#hostiles" },
  { label: "Gameplay", href: "#gameplay" },
];
