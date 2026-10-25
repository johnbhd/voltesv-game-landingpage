export type Artwork = {
  source: string;
  src: string;
  width: number;
  height: number;
  alt: string;
};

export type Machine = {
  id: string;
  name: string;
  number: string;
  accent: string;
  artwork: Artwork;
  description: string;
  primaryWeapon: {
    name: string;
    artwork: Artwork;
  };
  specialAbility: {
    name: string;
    artwork: Artwork;
    description: string;
  };
  pilot: {
    name: string;
    artwork: Artwork;
    fullBodyArtwork: Artwork;
    description: string;
  };
};

function artwork(source: string, slug: string, alt: string): Artwork {
  return {
    source: `img-assets/${source}`,
    src: `/images/game/${slug}.webp`,
    width: 1254,
    height: 1254,
    alt,
  };
}

function pilotBody(id: string, name: string): Artwork {
  return {
    source: `images/pilots/${id}-full-body.png`,
    src: `/images/pilots/${id}-full-body.webp`,
    width: 800,
    height: 1200,
    alt: `${name} standing in pilot uniform, full body`,
  };
}

export const machines: readonly Machine[] = [
  {
    id: "crewzer",
    name: "Volt Crewzer",
    number: "01",
    accent: "#1457D9",
    artwork: artwork(
      "aircraft character/VoltCruiser.png",
      "volt-crewzer",
      "Volt Crewzer, the red, blue and gold strike aircraft",
    ),
    description: "The unmistakable point of the formation. Take the controls of Volt Crewzer and lead the five-machine assault.",
    primaryWeapon: {
      name: "Energy Blast",
      artwork: artwork(
        "firing_voltes_character/VoltCrewzerEnergyBlast.png",
        "weapon-crewzer",
        "Crewzer Energy Blast, a narrow blue energy projectile",
      ),
    },
    specialAbility: {
      name: "Crewzer Overdrive",
      artwork: artwork(
        "skills/skill_crewzer_speed_burst.png",
        "skill-crewzer",
        "Crewzer Overdrive ability emblem",
      ),
      description: "Pushes Crewzer beyond its normal limits with enhanced mobility, temporary protection and upgraded firepower.",
    },
    pilot: {
      name: "Steve Armstrong",
      artwork: artwork(
        "voltes character/steve.png",
        "pilot-steve",
        "Steve Armstrong in his red pilot uniform",
      ),
      fullBodyArtwork: pilotBody("steve", "Steve Armstrong"),
      description: "The eldest Armstrong brother and leader of the Voltes team. A skilled pilot and marksman, Steve leads the fight against the Boazanian invaders.",
    },
  },
  {
    id: "bomber",
    name: "Volt Bomber",
    number: "02",
    accent: "#E32636",
    artwork: artwork(
      "aircraft character/VoltBomber.png",
      "volt-bomber",
      "Volt Bomber, the armored twin-cannon aircraft",
    ),
    description: "A different machine. A different way to strike. Join Mark Gordon in the cockpit of Volt Bomber.",
    primaryWeapon: {
      name: "Twin Blast",
      artwork: artwork(
        "firing_voltes_character/VoltBomberTwinBlast.png",
        "weapon-bomber",
        "Volt Bomber Twin Blast projectile",
      ),
    },
    specialAbility: {
      name: "Bombardment Strike",
      artwork: artwork(
        "skills/skill_bomber_burst_strike.png",
        "skill-bomber",
        "Bombardment Strike ability emblem",
      ),
      description: "Deploys a limited supply of heavy explosive bombs capable of clearing groups of enemies with a wide blast radius.",
    },
    pilot: {
      name: "Mark Gordon",
      artwork: artwork(
        "voltes character/mark.png",
        "pilot-mark",
        "Mark Gordon in his pilot uniform",
      ),
      fullBodyArtwork: pilotBody("mark", "Mark Gordon"),
      description: "A rodeo champion with an independent spirit, Mark pilots Volt Bomber. His rivalry with Steve grows into a trusted partnership.",
    },
  },
  {
    id: "panzer",
    name: "Volt Panzer",
    number: "03",
    accent: "#F6C744",
    artwork: artwork(
      "aircraft character/VoltPanzer.png",
      "volt-panzer",
      "Volt Panzer, the heavy armored machine",
    ),
    description: "Heavy armor. Unmistakable presence. Discover Big Bert Armstrong’s machine and its signature Power Shot.",
    primaryWeapon: {
      name: "Heavy Blast",
      artwork: artwork(
        "firing_voltes_character/VoltPanzerHeavyBlast.png",
        "weapon-panzer",
        "Volt Panzer Heavy Blast projectile",
      ),
    },
    specialAbility: {
      name: "Power Shot",
      artwork: artwork(
        "skills/skill_panzer_power_shot.png",
        "skill-panzer",
        "Power Shot ability emblem",
      ),
      description: "Unleashes an enlarged penetrating energy projectile built to cut through multiple enemies.",
    },
    pilot: {
      name: "Big Bert Armstrong",
      artwork: artwork(
        "voltes character/bigbert.png",
        "pilot-bigbert",
        "Big Bert Armstrong in his pilot uniform",
      ),
      fullBodyArtwork: pilotBody("bigbert", "Big Bert Armstrong"),
      description: "The middle Armstrong brother and pilot of Volt Panzer. A powerful martial artist and defense tactician, Big Bert brings strength and a steady heart to the team.",
    },
  },
  {
    id: "frigate",
    name: "Volt Frigate",
    number: "04",
    accent: "#40D9FF",
    artwork: artwork(
      "aircraft character/VoltFrigate.png",
      "volt-frigate",
      "Volt Frigate, the blue armored aircraft",
    ),
    description: "Meet the next piece of the formation. Little John Armstrong takes the controls of Volt Frigate.",
    primaryWeapon: {
      name: "Pulse Shot",
      artwork: artwork(
        "firing_voltes_character/VoltFrigatePulseShot.png",
        "weapon-frigate",
        "Volt Frigate Pulse Shot projectile",
      ),
    },
    specialAbility: {
      name: "Rapid Barrage",
      artwork: artwork(
        "skills/skill_frigate_rapid_barrage.png",
        "skill-frigate",
        "Rapid Barrage ability emblem",
      ),
      description: "Overcharges Frigate’s weapon system to produce an intense, continuous stream of enhanced fire.",
    },
    pilot: {
      name: "Little John Armstrong",
      artwork: artwork(
        "voltes character/littlejohn.png",
        "pilot-littlejohn",
        "Little John Armstrong in his pilot uniform",
      ),
      fullBodyArtwork: pilotBody("littlejohn", "Little John Armstrong"),
      description: "The youngest Armstrong brother and pilot of Volt Frigate. A gifted young inventor, Little John puts his knowledge of machines to work for the team.",
    },
  },
  {
    id: "lander",
    name: "Volt Lander",
    number: "05",
    accent: "#40D9FF",
    artwork: artwork(
      "aircraft character/VoltLander.png",
      "volt-lander",
      "Volt Lander, the final machine in the five-unit formation",
    ),
    description: "The formation is complete. Take flight with Jamie Robinson and explore Volt Lander’s Energy Shield.",
    primaryWeapon: {
      name: "Wide Energy Blast",
      artwork: artwork(
        "firing_voltes_character/VoltLanderWideEnergyBlast.png",
        "weapon-lander",
        "Volt Lander Wide Energy Blast projectile",
      ),
    },
    specialAbility: {
      name: "Energy Shield",
      artwork: artwork(
        "skills/skill_lander_energy_shield.png",
        "skill-lander",
        "Energy Shield ability emblem",
      ),
      description: "Surrounds Lander with a defensive energy barrier that blocks enemy fire and dangerous collisions.",
    },
    pilot: {
      name: "Jamie Robinson",
      artwork: artwork(
        "voltes character/jamie.png",
        "pilot-jamie",
        "Jamie Robinson in her pilot uniform",
      ),
      fullBodyArtwork: pilotBody("jamie", "Jamie Robinson"),
      description: "A trained ninja and pilot of Volt Lander. Jamie’s quick reflexes and calm judgment help keep the team united when the battle gets tough.",
    },
  },
];

export function machineAt(index: number): Machine {
  return machines[((index % machines.length) + machines.length) % machines.length];
}
