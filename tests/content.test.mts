import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import { machines, machineAt } from "../data/machines.ts";
import { releaseAction, release } from "../data/site.ts";

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

test("preview releases never expose a fabricated download or version", () => {
  assert.deepEqual(releaseAction(release), {
    label: "APK COMING SOON",
    href: null,
    version: null,
  });
});

test("an available release uses the supplied artifact URL and confirmed version", () => {
  assert.deepEqual(releaseAction({ status: "available", apkUrl: "/releases/strike.apk", version: "1.2.0" }), {
    label: "DOWNLOAD APK",
    href: "/releases/strike.apk",
    version: "1.2.0",
  });
});
