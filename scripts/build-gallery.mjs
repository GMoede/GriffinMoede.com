// Turns the full-size photos in gallery-originals/ into web-sized images in
// public/gallery/ and writes src/data/gallery.json with each photo's size, so
// the gallery can lay itself out before any image has downloaded.
//
// Usage: add or remove photos in gallery-originals/, then run `npm run gallery`.

import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const SOURCE_DIR = path.join(ROOT, "gallery-originals");
const OUTPUT_DIR = path.join(ROOT, "public", "gallery");
const MANIFEST = path.join(ROOT, "src", "data", "gallery.json");

// Photos are shown on the wall at 1/4 of their original pixel size (this is the
// scale the gallery has always used). We save them at 2x that display size so
// they stay sharp on high-resolution screens.
const DISPLAY_SCALE = 1 / 4;
const PIXEL_DENSITY = 2;

const EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".heic", ".tif", ".tiff"]);

const files = (await fs.readdir(SOURCE_DIR))
  .filter((f) => EXTENSIONS.has(path.extname(f).toLowerCase()))
  .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

await fs.rm(OUTPUT_DIR, { recursive: true, force: true });
await fs.mkdir(OUTPUT_DIR, { recursive: true });
await fs.mkdir(path.dirname(MANIFEST), { recursive: true });

const photos = [];
let before = 0;
let after = 0;

for (const file of files) {
  const input = path.join(SOURCE_DIR, file);
  // .rotate() applies the camera's orientation tag so portrait photos stay upright.
  const image = sharp(input).rotate();
  const meta = await image.metadata();
  const portrait = (meta.orientation ?? 1) >= 5;
  const width = portrait ? meta.height : meta.width;
  const height = portrait ? meta.width : meta.height;

  const displayWidth = Math.round(width * DISPLAY_SCALE);
  const displayHeight = Math.round(height * DISPLAY_SCALE);
  const outputWidth = Math.min(width, displayWidth * PIXEL_DENSITY);

  const name = `${path.parse(file).name.toLowerCase().replace(/[^a-z0-9-]+/g, "-")}.webp`;
  const output = path.join(OUTPUT_DIR, name);
  await image.resize({ width: outputWidth }).webp({ quality: 82 }).toFile(output);

  const [{ size: inSize }, { size: outSize }] = await Promise.all([fs.stat(input), fs.stat(output)]);
  before += inSize;
  after += outSize;

  photos.push({ src: `/gallery/${name}`, width: displayWidth, height: displayHeight });
  console.log(`${file}: ${(inSize / 1024).toFixed(0)} KB -> ${(outSize / 1024).toFixed(0)} KB`);
}

await fs.writeFile(MANIFEST, JSON.stringify(photos, null, 2) + "\n");
console.log(
  `\n${photos.length} photos, ${(before / 1e6).toFixed(1)} MB -> ${(after / 1e6).toFixed(1)} MB. Wrote ${path.relative(ROOT, MANIFEST)}`
);
