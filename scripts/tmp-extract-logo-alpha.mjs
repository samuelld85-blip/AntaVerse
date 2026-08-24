import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const sharp = require("sharp");
const [source, destination] = process.argv.slice(2);

if (!source || !destination) {
  throw new Error("Usage: node tmp-extract-logo-alpha.mjs <source> <destination>");
}

const { data, info } = await sharp(source)
  .removeAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const { width, height, channels } = info;
const pixelCount = width * height;
const background = new Uint8Array(pixelCount);
const queued = new Uint8Array(pixelCount);
const queue = new Uint32Array(pixelCount);
let head = 0;
let tail = 0;

function isCheckerboard(index) {
  const offset = index * channels;
  const red = data[offset];
  const green = data[offset + 1];
  const blue = data[offset + 2];
  return Math.max(red, green, blue) - Math.min(red, green, blue) <= 9
    && Math.min(red, green, blue) >= 236;
}

function enqueue(index) {
  if (queued[index] || !isCheckerboard(index)) return;
  queued[index] = 1;
  queue[tail++] = index;
}

for (let x = 0; x < width; x += 1) {
  enqueue(x);
  enqueue((height - 1) * width + x);
}

for (let y = 0; y < height; y += 1) {
  enqueue(y * width);
  enqueue(y * width + width - 1);
}

while (head < tail) {
  const index = queue[head++];
  background[index] = 1;
  const x = index % width;
  const y = Math.floor(index / width);
  if (x > 0) enqueue(index - 1);
  if (x + 1 < width) enqueue(index + 1);
  if (y > 0) enqueue(index - width);
  if (y + 1 < height) enqueue(index + width);
}

const output = Buffer.alloc(pixelCount * 4);
for (let index = 0; index < pixelCount; index += 1) {
  const sourceOffset = index * channels;
  const outputOffset = index * 4;
  output[outputOffset] = data[sourceOffset];
  output[outputOffset + 1] = data[sourceOffset + 1];
  output[outputOffset + 2] = data[sourceOffset + 2];
  output[outputOffset + 3] = background[index] ? 0 : 255;
}

await sharp(output, { raw: { width, height, channels: 4 } })
  .resize(1000, 1000, { fit: "fill", kernel: sharp.kernel.lanczos3 })
  .png({ compressionLevel: 9 })
  .toFile(destination);

const result = await sharp(destination).metadata();
console.log(`${destination}: ${result.width}x${result.height}, ${result.channels} channels, alpha=${result.hasAlpha}`);
