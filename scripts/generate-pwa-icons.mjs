import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import sharp from "sharp";

const targets = [
  [180, "apple-touch-icon.png"],
  [192, "icon-192.png"],
  [512, "icon-512.png"],
  [512, "maskable-icon.png"],
];

await mkdir(resolve("public", "icons"), { recursive: true });
for (const [size, filename] of targets) {
  await writeFile(resolve("public", "icons", filename), await createIcon(size));
}
console.log(`Icônes PWA générées : ${targets.map(([, filename]) => filename).join(", ")}.`);

async function createIcon(size) {
  const logo = await sharp(resolve("public", "brand", "antaverse-logo.png"))
    .resize(Math.round(size * 0.86), Math.round(size * 0.7), { fit: "contain" })
    .png()
    .toBuffer();

  return sharp({
    create: { width: size, height: size, channels: 4, background: "#0B1118" },
  })
    .composite([{ input: logo, gravity: "center" }])
    .png()
    .toBuffer();
}
