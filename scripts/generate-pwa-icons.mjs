import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import sharp from "sharp";

// "app" = referenced by public/manifest.webmanifest (PWA install icon).
// "web" = referenced by src/app/layout.tsx's `icons` metadata (browser tab/favicon).
const targets = [
  ["app", 180, "apple-touch-icon.png"],
  ["app", 192, "icon-192.png"],
  ["app", 512, "icon-512.png"],
  ["app", 512, "maskable-icon.png"],
  ["web", 180, "apple-touch-icon.png"],
  ["web", 192, "icon-192.png"],
  ["web", 32, "favicon-32.png"],
];

for (const dir of ["app", "web"]) {
  await mkdir(resolve("public", "icons", dir), { recursive: true });
}
for (const [dir, size, filename] of targets) {
  await writeFile(resolve("public", "icons", dir, filename), await createIcon(size));
}
console.log(
  `Icônes PWA générées : ${targets.map(([dir, , filename]) => `${dir}/${filename}`).join(", ")}.`,
);

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
