import sharp from 'sharp';

const jobs = [
  {
    input: 'public/homepage.jpg',
    webp: 'public/homepage-optimized.webp',
    avif: 'public/homepage-optimized.avif',
    width: 1600,
  },
  {
    input: 'public/blog-placeholder-about.jpg',
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

console.log('Optimized hero images generated.');
