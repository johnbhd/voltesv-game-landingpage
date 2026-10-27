export type GameplayScene = {
  id: string;
  label: string;
  title: string;
  image: {
    src: string;
    width: number;
    height: number;
    alt: string;
  };
  description: string;
  features: string[];
};

export const gameplayScenes: GameplayScene[] = [
  {
    id: "combat",
    label: "Combat",
    title: "Every wave is a new challenge.",
    image: {
      src: "/images/gameplay/gameplay.png",
      width: 408,
      height: 832,
      alt: "Volt Crewzer firing through enemy formations above an island coastline, with score and lives visible.",
    },
    description: "Navigate enemy waves, dodge incoming fire, and keep your score climbing.",
    features: ["Vertical arcade combat", "Enemy formations", "Score chasing"],
  },
  {
    id: "overdrive",
    label: "Overdrive",
    title: "Push beyond the limits.",
    image: {
      src: "/images/gameplay/skills.png",
      width: 412,
      height: 836,
      alt: "Volt Crewzer surrounded by a blue Overdrive effect while firing twin energy shots at enemies.",
    },
    description: "Activate Crewzer’s Overdrive and push through the battlefield with enhanced firepower.",
    features: ["Machine abilities", "Weapon upgrades"],
  },
  {
    id: "boss",
    label: "Boss Encounter",
    title: "Face Skull Fortress.",
    image: {
      src: "/images/gameplay/finalboss.png",
      width: 440,
      height: 894,
      alt: "Volt Panzer confronting Skull Fortress above the ocean, with the boss health bar visible.",
    },
    description: "Face Skull Fortress in a high-pressure encounter.",
    features: ["Boss battles", "Incoming fire", "Survival"],
  },
];
