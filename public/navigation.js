(() => {
  const links = document.querySelector('.site-header .internal-links');
  if (links) {
    const revealActiveLink = () => {
      const active = links.querySelector('[aria-current="page"]');
      if (!active) return;
      const container = links.getBoundingClientRect();
      const item = active.getBoundingClientRect();
      if (item.left >= container.left && item.right <= container.right) return;
      // Scroll only this navigation strip; preserve the document's scroll position.
      links.scrollTo({
        left:
          links.scrollLeft +
          item.left -
          container.left -
          (links.clientWidth - item.width) / 2,
        behavior: 'auto',
      });
    };
    revealActiveLink();
    void document.fonts.ready.then(revealActiveLink);
    window.addEventListener('pageshow', revealActiveLink);
    new ResizeObserver(revealActiveLink).observe(links);
  }
})();
