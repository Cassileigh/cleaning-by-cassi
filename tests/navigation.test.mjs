import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
test('active navigation waits for layout observations and only scrolls its strip', () => {
  let callback;
  const scrolls = [];
  const active = {};
  const links = {
    querySelector: () => active,
    scrollBy: (options) => scrolls.push(options.left),
  };
  runInNewContext(
    readFileSync(new URL('../public/navigation.js', import.meta.url), 'utf8'),
    {
      document: { querySelector: () => links },
      IntersectionObserver: class {
        constructor(fn, options) {
          callback = fn;
          assert.equal(options.root, links);
          assert.equal(options.threshold, 1);
        }
        observe(element) {
          assert.equal(element, active);
        }
      },
    },
  );
  assert.deepEqual(scrolls, []);
  callback([
    { intersectionRatio: 1 },
    { intersectionRatio: 0, rootBounds: null },
  ]);
  assert.deepEqual(scrolls, []);
  callback([
    {
      intersectionRatio: 0.5,
      rootBounds: { left: 10, width: 200 },
      boundingClientRect: { left: 200, width: 100 },
    },
  ]);
  assert.deepEqual(scrolls, [140]);
});
