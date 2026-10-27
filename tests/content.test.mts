import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import sharp from "sharp";
import { machines, machineAt } from "../data/machines.ts";
import { releaseAction, release } from "../data/site.ts";
import { enemies, finalBoss } from "../data/hostiles.ts";
import { gameplayScenes } from "../data/gameplay.ts";

test("gameplay scenes use real captures with matching intrinsic dimensions", async () => {
  assert.deepEqual(gameplayScenes.map((scene) => scene.id), ["combat", "overdrive", "boss"]);
  assert.deepEqual(gameplayScenes.map((scene) => scene.image.src), [
    "/images/gameplay/gameplay.png",
    "/images/gameplay/skills.png",
    "/images/gameplay/finalboss.png",
  ]);

  for (const scene of gameplayScenes) {
    const metadata = await sharp(resolve("public", scene.image.src.slice(1))).metadata();
    assert.equal(scene.image.width, metadata.width);
    assert.equal(scene.image.height, metadata.height);
    assert.ok(scene.image.alt.length > 0);
    assert.ok(scene.description.length > 0);
    assert.ok(scene.features.length > 0);
  }
});

test("hostile roster maps all seven original sprites without invented statistics", () => {
  const sources = [
    "scout_drone.png",
    "scout_drone2.png",
    "hornet_figther.png",
    "heavy_bomber.png",
    "crab_tank.png",
    "boizanian_spike.png",
    "elite_commander.png",
  ];

  assert.equal(enemies.length, 7);
  assert.equal(new Set(enemies.map((enemy) => enemy.id)).size, 7);
  enemies.forEach((enemy, index) => {
    assert.equal(enemy.number, String(index + 1).padStart(2, "0"));
    assert.ok(enemy.artwork.source.endsWith(sources[index]));
    assert.ok(existsSync(resolve("public", enemy.artwork.source)));
    assert.ok(enemy.artwork.alt.length > 0);
    for (const field of ["hp", "damage", "threat", "stats"]) {
      assert.ok(!(field in enemy), "Unverified hostile statistics must not be published");
    }
  });
  assert.equal(enemies[2].name, "Hornet Fighter");
  assert.equal(enemies[5].name, "Boazanian Spike");
  assert.equal(finalBoss.name, "Skull Fortress");
  assert.ok(finalBoss.artwork.source.endsWith("fortress_battleship_boss.png"));
});

test("hostile derivatives preserve transparency, aspect ratios and native resolution", async () => {
  for (const { artwork } of [...enemies, finalBoss]) {
    const source = await sharp(resolve("public", artwork.source)).metadata();
    const derivative = await sharp(resolve("public", artwork.src.slice(1))).metadata();
    assert.equal(artwork.width, source.width);
    assert.equal(artwork.height, source.height);
    assert.equal(derivative.hasAlpha, true);
    assert.ok(derivative.width! <= source.width!);
    assert.ok(Math.abs(derivative.width! / derivative.height! - artwork.width / artwork.height) < 0.003);
  }
});

test("every selectable machine has its real supplied artwork and anime pilot", () => {
  assert.equal(machines.length, 5);
  assert.equal(new Set(machines.map((machine) => machine.id)).size, 5);
  for (const machine of machines) {
    assert.ok(existsSync(resolve("public", machine.artwork.source)), machine.artwork.source);
    assert.ok(existsSync(resolve("public", machine.pilot.artwork.source)), machine.pilot.artwork.source);
    assert.ok(machine.pilot.artwork.source.includes("voltes character/"));
    assert.ok(machine.artwork.alt.includes(machine.name));
    assert.ok(!("stats" in machine), "Unverified game statistics must not be published");
  }
});

test("all five pilots have full-body artwork with transparent backgrounds", async () => {
  for (const machine of machines) {
    const artwork = machine.pilot.fullBodyArtwork;
    assert.ok(artwork, `${machine.pilot.name} needs full-body artwork`);
    assert.ok(existsSync(resolve("public", artwork.source)), artwork.source);
    assert.ok(existsSync(resolve("public", artwork.src.slice(1))), artwork.src);
    assert.ok(artwork.height > artwork.width);

    for (const path of [artwork.source, artwork.src.slice(1)]) {
      const image = sharp(resolve("public", path));
      const metadata = await image.metadata();
      assert.equal(metadata.hasAlpha, true, path);
      const pixel = await image.extract({ left: 0, top: 0, width: 1, height: 1 }).raw().toBuffer();
      assert.equal(pixel[3], 0, `${path} must have a transparent background`);
    }
  }
});

test("machine navigation wraps in both directions", () => {
  assert.equal(machineAt(0).id, "crewzer");
  assert.equal(machineAt(-1).id, "lander");
  assert.equal(machineAt(5).id, "crewzer");
  assert.equal(machineAt(12).id, "panzer");
});

test("each machine maps its matching projectile and special ability artwork", () => {
  const expected = [
    ["VoltCrewzerEnergyBlast.png", "skill_crewzer_speed_burst.png"],
    ["VoltBomberTwinBlast.png", "skill_bomber_burst_strike.png"],
    ["VoltPanzerHeavyBlast.png", "skill_panzer_power_shot.png"],
    ["VoltFrigatePulseShot.png", "skill_frigate_rapid_barrage.png"],
    ["VoltLanderWideEnergyBlast.png", "skill_lander_energy_shield.png"],
  ];

  machines.forEach((machine, index) => {
    assert.ok(machine.primaryWeapon, `${machine.name} needs primary weapon data`);
    assert.ok(machine.specialAbility, `${machine.name} needs special ability data`);
    assert.ok(machine.primaryWeapon.artwork.source.endsWith(expected[index][0]));
    assert.ok(machine.specialAbility.artwork.source.endsWith(expected[index][1]));

    for (const asset of [machine.primaryWeapon.artwork, machine.specialAbility.artwork]) {
      assert.ok(existsSync(resolve("public", asset.source)), asset.source);
      assert.ok(existsSync(resolve("public", asset.src.slice(1))), asset.src);
      assert.ok(asset.alt.length > 0);
    }

    assert.ok(machine.specialAbility.description.length > 30);
    assert.ok(machine.pilot.description.length > 30);
  });
});

test("an available release uses the supplied artifact URL and confirmed version", () => {
  assert.deepEqual(releaseAction({ apkUrl: "/releases/strike.apk", version: "1.2.0" }), {
    label: "DOWNLOAD NOW",
    href: "/releases/strike.apk",
    version: "1.2.0",
  });
});

test("published APK uses the supplied GitHub link without inventing a version", () => {
  assert.deepEqual(releaseAction(release), {
    label: "DOWNLOAD NOW",
    href: "https://github.com/johnbhd/voltesv-game-landingpage/releases/download/android/voltesv.apk",
    version: null,
  });
});
