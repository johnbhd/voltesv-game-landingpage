import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import sharp from "sharp";
import { machines } from "../data/machines.ts";
import { environments } from "../data/site.ts";

await mkdir("public/images/game", { recursive: true });
const assets = [
  ...machines.flatMap((machine) => [
    machine.artwork,
    machine.pilot.artwork,
    machine.pilot.fullBodyArtwork,
    machine.primaryWeapon.artwork,
    machine.specialAbility.artwork,
  ]),
  ...Object.values(environments),
];

const manifest = [];
for (const asset of assets) {
  const output = resolve("public", asset.src.slice(1));
  const supporting = (
    asset.source.includes("firing_voltes_character/")
    || asset.source.includes("skills/")
  );
  const fullBody = asset.source.startsWith("images/pilots/");
  let width = 1254;
  if (fullBody) {
    width = 800;
  } else if (supporting) {
    width = 256;
  } else if (asset.source.includes("voltes character/")) {
    width = 640;
  }
  const result = await sharp(resolve("public", asset.source))
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: fullBody ? 90 : 84, alphaQuality: 100, effort: 5 })
    .toFile(output);
  manifest.push({
    ...asset,
    outputWidth: result.width,
    outputHeight: result.height,
    bytes: result.size,
  });
}

await sharp("public/img-assets/icon.png").resize(1000).webp({ quality: 82 }).toFile("public/images/game/social.webp");
await sharp("public/img-assets/aircraft character/VoltCruiser.png").resize(96).png().toFile("app/icon.png");
await writeFile("public/images/game/manifest.json", JSON.stringify(manifest, null, 2) + "\n");
console.log(`Prepared ${assets.length} images (${Math.round(manifest.reduce((sum, asset) => sum + asset.bytes, 0) / 1024)} KB). Original art unchanged.`);
