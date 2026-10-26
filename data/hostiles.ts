import type { Artwork } from "./machines";

export type Hostile = {
  id: string;
  number: string;
  name: string;
  artwork: Artwork;
};

export const enemies: readonly Hostile[] = [
  {
    id: "scout-drone",
    number: "01",
    name: "Scout Drone",
    artwork: {
      source: "img-assets/enemy assets/scout_drone.png",
      src: "/images/game/hostile-scout-drone.webp",
      width: 1254,
      height: 1254,
      alt: "Scout Drone with swept wings, twin cannons and red armor accents",
    },
  },
  {
    id: "scout-drone-02",
    number: "02",
    name: "Scout Drone Variant 02",
    artwork: {
      source: "img-assets/enemy assets/scout_drone2.png",
      src: "/images/game/hostile-scout-drone-02.webp",
      width: 1464,
      height: 1075,
      alt: "Second Scout Drone variant with a broad wingspan and four forward cannons",
    },
  },
  {
    id: "hornet-fighter",
    number: "03",
    name: "Hornet Fighter",
    artwork: {
      source: "img-assets/enemy assets/hornet_figther.png",
      src: "/images/game/hostile-hornet-fighter.webp",
      width: 1229,
      height: 1280,
      alt: "Hornet Fighter with pointed navy wings and red illuminated panels",
    },
  },
  {
    id: "heavy-bomber",
    number: "04",
    name: "Heavy Bomber",
    artwork: {
      source: "img-assets/enemy assets/heavy_bomber.png",
      src: "/images/game/hostile-heavy-bomber.webp",
      width: 1254,
      height: 1254,
      alt: "Heavy Bomber with dark armor, twin cannons and shoulder-mounted launchers",
    },
  },
  {
    id: "crab-tank",
    number: "05",
    name: "Crab Tank",
    artwork: {
      source: "img-assets/enemy assets/crab_tank.png",
      src: "/images/game/hostile-crab-tank.webp",
      width: 1536,
      height: 1024,
      alt: "Crab Tank with wide armored claws and twin forward cannons",
    },
  },
  {
    id: "boazanian-spike",
    number: "06",
    name: "Boazanian Spike",
    artwork: {
      source: "img-assets/enemy assets/boizanian_spike.png",
      src: "/images/game/hostile-boazanian-spike.webp",
      width: 1254,
      height: 1254,
      alt: "Boazanian Spike, a circular armored machine with a red core and metal spikes",
    },
  },
  {
    id: "elite-commander",
    number: "07",
    name: "Elite Commander",
    artwork: {
      source: "img-assets/enemy assets/elite_commander.png",
      src: "/images/game/hostile-elite-commander.webp",
      width: 1254,
      height: 1254,
      alt: "Elite Commander with horned black armor, gold markings and red cannons",
    },
  },
];

export const finalBoss = {
  id: "skull-fortress",
  name: "Skull Fortress",
  artwork: {
    source: "img-assets/finalboss/fortress_battleship_boss/fortress_battleship_boss.png",
    src: "/images/game/boss-skull-fortress.webp",
    width: 1254,
    height: 1254,
    alt: "Skull Fortress, a towering skull-shaped battleship with curved horns and red eyes",
  },
} satisfies { id: string; name: string; artwork: Artwork };
