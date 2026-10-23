import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve(import.meta.dirname, "..");
const source = path.join(root, "public/assets/mo-emblem-monochrome.png");
const { data, info } = await sharp(source)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

// Ignore the transparent canvas when fitting the mark into a square favicon.
let left = info.width, top = info.height, right = -1, bottom = -1;
for (let y = 0; y < info.height; y++) {
  for (let x = 0; x < info.width; x++) {
    if (data[(y * info.width + x) * 4 + 3] <= 8) continue;
    left = Math.min(left, x);
    top = Math.min(top, y);
    right = Math.max(right, x);
    bottom = Math.max(bottom, y);
  }
}
if (right < left) throw new Error("The emblem has no visible pixels.");
const width = right - left + 1;
const height = bottom - top + 1;
const mark = await sharp(source)
  .extract({ left, top, width, height })
  .resize({ width: 512 })
  .png()
  .toBuffer();
const markHeight = 63 * height / width;
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
  <title>Life of Mo</title>
  <style>.mark{fill:#000}@media(prefers-color-scheme:dark){.mark{fill:#fff}}</style>
  <defs><mask id="emblem" maskUnits="userSpaceOnUse" x="0" y="0" width="64" height="64" style="mask-type:alpha">
    <image x="0.5" y="${(64 - markHeight) / 2}" width="63" height="${markHeight}" href="data:image/png;base64,${mark.toString("base64")}"/>
  </mask></defs>
  <path class="mark" d="M0 0h64v64H0z" mask="url(#emblem)"/>
</svg>\n`;
await fs.writeFile(path.join(root, "public/favicon.svg"), svg);

const sizes = [16, 32, 48];
const pngs = await Promise.all(sizes.map(size => sharp(Buffer.from(svg)).resize(size, size).png().toBuffer()));
// PNG-backed ICO entries provide a conventional fallback for older clients.
const directory = Buffer.alloc(6 + 16 * sizes.length);
directory.writeUInt16LE(1, 2);
directory.writeUInt16LE(sizes.length, 4);
let offset = directory.length;
sizes.forEach((size, i) => {
  const entry = 6 + 16 * i;
  directory[entry] = size;
  directory[entry + 1] = size;
  directory.writeUInt16LE(1, entry + 4);
  directory.writeUInt16LE(32, entry + 6);
  directory.writeUInt32LE(pngs[i].length, entry + 8);
  directory.writeUInt32LE(offset, entry + 12);
  offset += pngs[i].length;
});
await fs.writeFile(path.join(root, "public/favicon.ico"), Buffer.concat([directory, ...pngs]));
await fs.writeFile(path.join(root, "public/favicon-32.png"), pngs[1]);
await sharp(Buffer.from(svg)).resize(180, 180).flatten({background:"#fff"}).png()
  .toFile(path.join(root, "public/apple-touch-icon.png"));
console.log(`Favicon uses 63 of 64 pixels of width; emblem aspect ratio ${width}:${height}.`);
