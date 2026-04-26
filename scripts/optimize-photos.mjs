#!/usr/bin/env node
/**
 * Photo optimization pipeline
 * - Reads /assets/photos/raw/
 * - Outputs AVIF + WebP + JPEG at 1x (1200w) and 2x (2400w)
 * - Strips EXIF / GPS metadata
 * - Skips files that already have all 6 derived variants
 *
 * Usage:
 *   npm install
 *   npm run optimize-photos
 *
 * Each input photo `IMG_5261.JPG` produces:
 *   /assets/photos/optimized/img-5261-1200.avif
 *   /assets/photos/optimized/img-5261-1200.webp
 *   /assets/photos/optimized/img-5261-1200.jpg
 *   /assets/photos/optimized/img-5261-2400.avif
 *   /assets/photos/optimized/img-5261-2400.webp
 *   /assets/photos/optimized/img-5261-2400.jpg
 */
import { readdir, mkdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, parse } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const RAW_DIR = join(ROOT, 'assets/photos/raw');
const OUT_DIR = join(ROOT, 'assets/photos/optimized');

const SIZES = [
  { width: 1200, suffix: '1200' },
  { width: 2400, suffix: '2400' },
];

const FORMATS = [
  { ext: 'avif', opts: { quality: 60, effort: 4 } },
  { ext: 'webp', opts: { quality: 80, effort: 5 } },
  { ext: 'jpg',  opts: { quality: 82, mozjpeg: true } },
];

function slugify(name) {
  return name
    .replace(/\.[^.]+$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function isImage(name) {
  return /\.(jpe?g|png|heic|tif|tiff|webp)$/i.test(name);
}

async function processOne(file) {
  const inputPath = join(RAW_DIR, file);
  const slug = slugify(parse(file).name);
  const meta = await sharp(inputPath).metadata();

  console.log(`\n  ${file} (${meta.width}×${meta.height}, ${(meta.size/1024/1024).toFixed(1)}MB)`);

  for (const size of SIZES) {
    if (size.width > meta.width) {
      console.log(`    skip ${size.suffix}w — source is smaller`);
      continue;
    }

    const base = sharp(inputPath)
      .rotate()                           // honor EXIF orientation
      .resize({ width: size.width, withoutEnlargement: true })
      .withMetadata({ orientation: undefined, exif: {} });  // strip EXIF

    for (const fmt of FORMATS) {
      const outName = `${slug}-${size.suffix}.${fmt.ext}`;
      const outPath = join(OUT_DIR, outName);

      if (existsSync(outPath)) {
        const inSt = await stat(inputPath);
        const outSt = await stat(outPath);
        if (outSt.mtimeMs > inSt.mtimeMs) {
          continue;  // up-to-date
        }
      }

      let pipeline = base.clone();
      if (fmt.ext === 'avif') pipeline = pipeline.avif(fmt.opts);
      else if (fmt.ext === 'webp') pipeline = pipeline.webp(fmt.opts);
      else pipeline = pipeline.jpeg(fmt.opts);

      const info = await pipeline.toFile(outPath);
      console.log(`    → ${outName}  ${(info.size/1024).toFixed(0)}KB`);
    }
  }
}

async function main() {
  if (!existsSync(RAW_DIR)) {
    console.error(`Raw directory not found: ${RAW_DIR}`);
    process.exit(1);
  }

  await mkdir(OUT_DIR, { recursive: true });

  const all = await readdir(RAW_DIR);
  const files = [];
  for (const f of all) {
    if (await isImage(f)) files.push(f);
  }

  console.log(`Found ${files.length} source images in ${RAW_DIR}`);
  console.log(`Output → ${OUT_DIR}`);
  console.log(`Variants per image: ${SIZES.length} sizes × ${FORMATS.length} formats = ${SIZES.length * FORMATS.length}`);

  const t0 = Date.now();
  for (const file of files) {
    try {
      await processOne(file);
    } catch (err) {
      console.error(`  ✗ FAILED: ${file}`);
      console.error(`    ${err.message}`);
    }
  }
  console.log(`\n✓ Done in ${((Date.now()-t0)/1000).toFixed(1)}s`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
