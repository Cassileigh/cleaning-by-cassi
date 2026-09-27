// Keep single-sample fail-on-low-score semantics. A low score is never retried.
module.exports = {
  origin: 'http://127.0.0.1:4321',
  routes: [
    '/',
    '/about',
    '/services',
    '/pricing',
    '/quote',
    '/quote-success',
    '/review',
    '/privacy',
  ],
  thresholds: {
    accessibility: 0.95,
    'best-practices': 0.95,
    performance: 0.85,
    seo: 0.95,
  },
  noindexRoutes: ['/quote-success'],
};
