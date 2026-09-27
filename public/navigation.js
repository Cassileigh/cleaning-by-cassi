(() => {
  const links = document.querySelector('.site-header .internal-links');
  if (links) {
    const active = links.querySelector('[aria-current="page"]');
    if (!active) return;
    // Use post-layout observations rather than forcing synchronous layout during
    // startup. The observer also covers font loading and viewport changes.
    new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.intersectionRatio >= 1 || !entry.rootBounds) continue;
          const item = entry.boundingClientRect;
          const container = entry.rootBounds;
          // Scroll only this strip; never move the document or keyboard focus.
          links.scrollBy({
            left:
              item.left - container.left - (container.width - item.width) / 2,
            behavior: 'auto',
          });
        }
      },
      { root: links, threshold: 1 },
    ).observe(active);
  }
})();
