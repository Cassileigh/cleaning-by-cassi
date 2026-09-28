(() => {
  const links = document.querySelector('.site-header .internal-links');
  if (links) {
    const active = links.querySelector('[aria-current="page"]');
    if (!active) return;
    // Reveal once per layout change. A persistent observer would fight manual
    // scrolling whenever the current page leaves the strip.
    const observer = new IntersectionObserver(
      (entries) => {
        observer.disconnect();
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
      { root: links, rootMargin: '0px -4px', threshold: 1 },
    );
    const reveal = () => {
      observer.disconnect();
      observer.observe(active);
    };
    // Font metrics can change while an item remains partially intersecting,
    // without crossing an IntersectionObserver threshold. Re-arm explicitly.
    new ResizeObserver(reveal).observe(links);
    document.fonts.ready.then(reveal);
    document.fonts.addEventListener('loadingdone', reveal);
    window.addEventListener('pageshow', reveal);
    reveal();
  }
})();
