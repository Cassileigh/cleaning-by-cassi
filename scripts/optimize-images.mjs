import sharp from 'sharp';
import { readdir } from 'node:fs/promises';

// Decode every shipped raster, not just its metadata: a file can exist and still be corrupt.
for (const file of await readdir('public', { recursive: true })) {
  if (/\.(png|jpe?g|webp|avif)$/i.test(file)) {
    await sharp(`public/${file}`).raw().toBuffer();
  }
}

const jobs = [
  {
    input: 'public/homepage.jpg',
    webp: 'public/homepage-optimized.webp',
    avif: 'public/homepage-optimized.avif',
    width: 1600,
  },
  {
    input: 'public/cassi-family.jpg',
    webp: 'public/about-optimized.webp',
    avif: 'public/about-optimized.avif',
    width: 1400,
  },
];

for (const job of jobs) {
  const base = sharp(job.input).rotate().resize({
    width: job.width,
    withoutEnlargement: true,
    fit: 'inside',
  });

  await Promise.all([
    base.clone().webp({ quality: 80, effort: 5 }).toFile(job.webp),
    base.clone().avif({ quality: 55, effort: 5 }).toFile(job.avif),
  ]);
}

await sharp('docs/brand/header-logo-original.png')
  .resize({ width: 344 })
  .webp({ quality: 95, effort: 6 })
  .toFile('public/header-logo-optimized.webp');
console.log('Optimized website images generated.');
