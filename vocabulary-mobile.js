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

/* Dashboard navigation uses existing controls instead of replacing study logic. */
(() => {
  const $ = (id) => document.getElementById(id);
  const date = $('wl-date');
  const now = new Date();
  date.dateTime = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
  date.textContent = new Intl.DateTimeFormat('vi-VN',{weekday:'short',day:'numeric',month:'numeric'}).format(now);
  const nav = [...document.querySelectorAll('[data-wl-target]')];
  function select(button) { nav.forEach(b => b===button ? b.setAttribute('aria-current','location') : b.removeAttribute('aria-current')); }
  nav.forEach(button => button.addEventListener('click', () => {
    const target = $(button.dataset.wlTarget);
    if (!target) return;
    if (button.dataset.wlTarget==='home') {select(button);window.scrollTo({top:0,behavior:'auto'});return;}
    if (['library-open','sentence-open','g-open'].includes(target.id)) {target.click();return;}
    if (target.tagName==='DETAILS') target.open=true;
    select(button);target.scrollIntoView({block:'start',behavior:'auto'});
    (target.tagName==='DETAILS'?target.querySelector('summary'):target).focus({preventScroll:true});
  }));
  $('wl-progress-shortcut').addEventListener('click', () => nav.find(b => b.dataset.wlNav === 'progress').click());
  $('wl-header-settings').addEventListener('click', () => nav.find(b => b.dataset.wlNav === 'settings').click());
  new MutationObserver(() => {if (!$('home').hidden) select(nav[0]);}).observe($('home'),{attributes:true,attributeFilter:['hidden']});
})();
