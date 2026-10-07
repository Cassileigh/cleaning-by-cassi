import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
test('navigation reveals after layout changes without fighting manual scroll', () => {
  let callback, resize, fontsReady;
  const events = {};
  const scrolls = [];
  const active = {};
  let observed = 0,
    disconnected = 0;
  const links = {
    querySelector: () => active,
    scrollBy: (options) => scrolls.push(options.left),
  };
  runInNewContext(
    readFileSync(new URL('../public/navigation.js', import.meta.url), 'utf8'),
    {
      document: {
        addEventListener: (name, fn) => {
          events[name] = fn;
        },
        querySelector: () => links,
        fonts: {
          ready: {
            then: (fn) => {
              fontsReady = fn;
            },
          },
          addEventListener: (name, fn) => {
            events[name] = fn;
          },
          removeEventListener: (name) => {
            delete events[name];
          },
        },
      },
      window: {
        addEventListener: (name, fn) => {
          events[name] = fn;
        },
      },
      ResizeObserver: class {
        disconnect() {}
        constructor(fn) {
          resize = fn;
        }
        observe(element) {
          assert.equal(element, links);
        }
      },
      IntersectionObserver: class {
        constructor(fn, options) {
          callback = fn;
          assert.equal(options.root, links);
          assert.equal(options.threshold, 1);
          assert.equal(options.rootMargin, '0px -4px');
        }
        disconnect() {
          disconnected++;
        }
        observe(element) {
          assert.equal(element, active);
          observed++;
        }
      },
    },
  );
  assert.deepEqual(scrolls, []);
  callback([{ intersectionRatio: 1 }]);
  assert.equal(observed, 1);
  assert.equal(disconnected, 2);
  for (const trigger of [
    resize,
    fontsReady,
    events.loadingdone,
    events.pageshow,
  ]) {
    trigger();
    const before = disconnected;
    callback([
      {
        intersectionRatio: 0.5,
        rootBounds: { left: 10, width: 200 },
        boundingClientRect: { left: 200, width: 100 },
      },
    ]);
    assert.equal(disconnected, before + 1);
  }
  assert.deepEqual(scrolls, [140, 140, 140, 140]);
  assert.equal(observed, 5);
  assert.equal(events.scroll, undefined);
});
