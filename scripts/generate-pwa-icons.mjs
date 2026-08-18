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
      <rect width="512" height="512" rx="116" fill="#0B1118"/>
      <path fill="#16C7E8" d="M256 72 91 403h91l74-149 34-68z"/>
      <path fill="#E83DFF" d="M256 72 421 403h-91l-74-149-34-68z"/>
      <circle cx="256" cy="319" r="43" fill="#E83DFF"/>
    </svg>`;
  return sharp(Buffer.from(svg)).png().toBuffer();
}
