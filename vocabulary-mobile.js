/* Presentation only: follow the visible viewport when a software keyboard opens. */
(() => {
  const root = document.documentElement;
  const viewport = window.visualViewport;
  let frame;
  function update() {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      // Preserve browser pinch zoom rather than resizing the game around it.
      if (viewport && Math.abs(viewport.scale - 1) > 0.05) return;
      const height = viewport ? viewport.height : window.innerHeight;
      root.style.setProperty('--visible-height', `${height}px`);
      root.style.setProperty('--visible-top', `${viewport ? viewport.offsetTop : 0}px`);
      root.classList.toggle('compact-viewport', height <= 550);
    });
  }
  window.addEventListener('resize', update);
  viewport?.addEventListener('resize', update);
  viewport?.addEventListener('scroll', update);
  update();
})();
