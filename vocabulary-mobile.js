/* Presentation only: follow the visible viewport when a software keyboard opens. */
(() => {
  const root = document.documentElement;
  const viewport = window.visualViewport;
  let frame;
  function update() {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
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

/* Independent sections; focus practice remains full-screen. */
(() => {
  const $ = id => document.getElementById(id);
  const now = new Date(), date = $('wl-date');
  date.dateTime = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
  date.textContent = new Intl.DateTimeFormat('vi-VN',{weekday:'short',day:'numeric',month:'numeric'}).format(now);
  const nav = [...document.querySelectorAll('[data-wl-nav]')];
  const labels = {
    home:['Tổng quan','Bảng điều phối chung: trạng thái hiện tại, việc nên làm tiếp và lộ trình học từ vựng.'],
    learn:['Học tập','Làm quen từ mới, ôn đúng lịch và luyện tự nhớ theo luồng học chính.'],
    game:['Trò chơi','Phòng tuyến thiên thạch — luyện phản xạ gõ từ tiếng Anh dưới áp lực thời gian.'],
    pet:['Trạm Sao','Linh thú đồng hành, bộ sưu tập và phần thưởng giúp tăng động lực học.'],
    progress:['Tiến độ','Thống kê từ dữ liệu học tập đã lưu để theo dõi độ bền trí nhớ.'],
    settings:['Cài đặt','Quản lý dữ liệu, sao lưu và phục hồi Word Lab.'],
    ankis:['Ankis','Ôn tập, quản lý bộ thẻ và theo dõi lịch ghi nhớ.']
  };
  let current = 'home';
  const params = new URLSearchParams(location.search);
  function mark(key) {
    current = key;
    nav.forEach(b => b.dataset.wlNav===key ? b.setAttribute('aria-current','page') : b.removeAttribute('aria-current'));
    document.documentElement.dataset.wlSection = key;
  }
  function panels(key) {
    document.querySelectorAll('[data-wl-panel]').forEach(e => e.hidden = !e.dataset.wlPanel.split(' ').includes(key));
    if (labels[key]) {
      $('wl-section-title').textContent=labels[key][0];
      $('wl-section-copy').textContent=labels[key][1];
      $('wl-date').hidden=key!=='home';
    }
    if(key==='settings') $('wl-settings').open=true;
    if(key==='ankis') WordLabAnkis.open();
  }
  function navigate(key, focus=true) {
    if (!nav.some(b=>b.dataset.wlNav===key)) key='home';
    if (VocabularyLibrary.isOpen()) {
      if(key==='library') return;
      VocabularyLibrary.close();
    }
    if (!$('sentences').hidden) {
      if(key==='sentence') return;
      VocabularySentences.close();
    }
    mark(key);
    if(key==='library') VocabularyLibrary.open();
    else if(key==='sentence') VocabularySentences.open();
    else {
      if($('home').hidden || key==='home') WordLabHome();
      panels(key);
      if(focus) $('wl-section-title').focus({preventScroll:true});
    }
    if(key==='pet') Guardian.open();
    window.scrollTo(0,0);
  }
  nav.forEach(b=>b.addEventListener('click',()=>navigate(b.dataset.wlNav)));
  $('wl-activity-link').addEventListener('click',()=>navigate('progress'));
  $('wl-progress-shortcut').addEventListener('click',()=>navigate('progress'));
  $('wl-header-settings').addEventListener('click',()=>navigate('settings'));
  $('sentence-open').addEventListener('click',e=>{e.preventDefault();navigate('sentence');});
  document.querySelector('[data-wl-back]').addEventListener('click',()=>navigate('home'));
  const screenObserver=new MutationObserver(()=>{
    if (!$('home').hidden) {
      if(current==='library'||current==='sentence') mark('home');
      panels(current);
    } else if (!$('library').hidden) mark('library');
    else if (!$('sentences').hidden) mark('sentence');
  });
  ['home','library','sentences'].forEach(id=>screenObserver.observe($(id),{attributes:true,attributeFilter:['hidden']}));
  if(params.get('view')==='sentences') mark('sentence');
  else if(params.get('view')==='library') mark('library');
  else { const key=location.hash.slice(1); navigate(nav.some(b=>b.dataset.wlNav===key)?key:'home',false); }
})();
