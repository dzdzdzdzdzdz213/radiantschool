import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { PNG } = require('pngjs');

const img = PNG.sync.read(readFileSync('public/logo.png'));
console.log(`Input: ${img.width}x${img.height}`);

const size = 256;
const scale = size / Math.max(img.width, img.height);
const w = Math.round(img.width * scale);
const h = Math.round(img.height * scale);

const resized = new PNG({ width: w, height: h });
for (let y = 0; y < h; y++) {
  for (let x = 0; x < w; x++) {
    const sx = Math.floor(x / scale);
    const sy = Math.floor(y / scale);
    const si = (sy * img.width + sx) * 4;
    const di = (y * w + x) * 4;
    resized.data[di] = img.data[si];
    resized.data[di + 1] = img.data[si + 1];
    resized.data[di + 2] = img.data[si + 2];
    resized.data[di + 3] = img.data[si + 3];
  }
}

writeFileSync('public/logo-256.png', PNG.sync.write(resized));
console.log(`Wrote public/logo-256.png (${w}x${h})`);
