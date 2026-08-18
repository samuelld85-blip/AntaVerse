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
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 512 512">
      <rect width="512" height="512" rx="116" fill="#10110f"/>
      <circle cx="256" cy="256" r="160" fill="none" stroke="#d8ff45" stroke-width="18" transform="rotate(-18 256 256)"/>
      <circle cx="256" cy="256" r="75" fill="#d8ff45"/>
      <circle cx="238" cy="92" r="25" fill="#38d9ff"/>
      <text x="256" y="270" text-anchor="middle" dominant-baseline="middle" font-family="Arial, Helvetica, sans-serif" font-size="72" font-weight="900" fill="#10110f">AV</text>
    </svg>`;
  return sharp(Buffer.from(svg)).png().toBuffer();
}
