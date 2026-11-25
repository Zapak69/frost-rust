(function () {
  document.querySelectorAll('.chart .row').forEach(function (row) {
    var n = Math.max(1, Math.round(parseInt(row.dataset.fps, 10) / 1300 * 26)), box = row.querySelector('.blocks');
    for (var i = 0; i < n; i++) box.appendChild(document.createElement('i'));
  });
  var compare = document.getElementById('compare'), range = compare && compare.querySelector('.compare-range'), held = false;
  function cut(v) { compare.style.setProperty('--cut', v + '%'); range.value = Math.round(v); }
  if (compare) {
    range.addEventListener('input', function () { held = true; cut(+range.value); });
    compare.addEventListener('pointerdown', function () { held = true; });
  }
  if (!window.frostMotion) return;
  document.documentElement.classList.add('motion');
  gsap.registerPlugin(SplitText);

  var canvas = document.getElementById('pixels'), ctx = canvas.getContext('2d'), CELL = 26, cols = 0, rows = 0, lit = new Map(), mouse = null, heroOn = true, idle = 0;
  var tones = ['237,188,60', '226,143,33', '199,98,0'];
  function size() { canvas.width = canvas.clientWidth; canvas.height = canvas.clientHeight; cols = Math.ceil(canvas.width / CELL); rows = Math.ceil(canvas.height / CELL); }
  size();
  window.addEventListener('resize', size);
  window.addEventListener('pointermove', function (e) { mouse = { c: Math.floor(e.clientX / CELL), r: Math.floor(e.clientY / CELL) }; idle = 0; }, { passive: true });
  gsap.ticker.add(function () {
    if (!heroOn) return;
    if (mouse) for (var dy = -2; dy <= 2; dy++) for (var dx = -2; dx <= 2; dx++) {
      var c = mouse.c + dx, r = mouse.r + dy, d = Math.abs(dx) + Math.abs(dy);
      if (c >= 0 && r >= 0 && c < cols && r < rows && d <= 2) { var k = r * cols + c; lit.set(k, Math.max(lit.get(k) || 0, 1 - d * 0.3)); }
    }
    if (++idle > 2 && Math.random() < 0.35) lit.set((Math.random() * cols * rows) | 0, 0.6);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    lit.forEach(function (v, k) {
      var c = k % cols, r = (k / cols) | 0;
      ctx.fillStyle = 'rgba(' + tones[(c + r) % 3] + ',' + (v * 0.45).toFixed(2) + ')';
      ctx.fillRect(c * CELL + 2, r * CELL + 2, CELL - 4, CELL - 4);
      v *= 0.93;
      if (v < 0.03) lit.delete(k); else lit.set(k, v);
    });
    mouse = null;
  });

  var wrap = document.querySelector('.logo-wrap'), logo = document.getElementById('logo');
  var cover = document.createElement('div');
  cover.style.cssText = 'position:absolute;inset:-4%;display:grid;grid-template-columns:repeat(8,1fr);pointer-events:none';
  for (var i = 0; i < 64; i++) { var b = document.createElement('span'); b.style.background = 'var(--ground)'; cover.appendChild(b); }
  wrap.appendChild(cover);
  var title = new SplitText('#heroTitle', { type: 'chars,words', charsClass: 'ch' });
  var intro = gsap.timeline({ delay: 0.15 });
  intro.to(cover.children, { scale: 0, duration: 0.35, ease: 'power2.in', stagger: { each: 0.012, from: 'random' } })
    .from(logo, { scale: 0.6, rotate: -8, duration: 1, ease: 'elastic.out(1,0.6)' }, 0.1)
    .from('.hero-badge', { y: -14, opacity: 0, duration: 0.5, ease: 'power3.out' }, 0.3)
    .from(title.chars, { yPercent: 110, opacity: 0, duration: 0.6, ease: 'back.out(2)', stagger: 0.018 }, 0.35)
    .from('.hero-sub, .hero-actions, .hero-note', { y: 24, opacity: 0, duration: 0.7, stagger: 0.1, ease: 'power3.out' }, 0.85)
    .add(function () { cover.remove(); });
  gsap.to(logo, { y: -10, repeat: -1, yoyo: true, duration: 2.2, ease: 'sine.inOut' });
  var tiltX = gsap.quickTo(logo, 'rotationY', { duration: 0.6, ease: 'power3' }), tiltY = gsap.quickTo(logo, 'rotationX', { duration: 0.6, ease: 'power3' });
  gsap.set(wrap, { perspective: 600 });
  window.addEventListener('pointermove', function (e) { if (!heroOn) return; tiltX((e.clientX / window.innerWidth - 0.5) * 30); tiltY((e.clientY / window.innerHeight - 0.5) * -30); }, { passive: true });

  var palette = ['#edbc3c', '#e28f21', '#c76200', '#8a3500', '#e28f21', '#edbc3c'];
  function fill(box, n) { for (var t = 0; t < n; t++) { var c = document.createElement('i'); c.style.background = palette[(Math.random() * palette.length) | 0]; box.appendChild(c); } return box.children; }
  var wipe = document.querySelector('.wipe'), wipeRows = Math.ceil(window.innerHeight / (window.innerWidth / 16)), wipeCells = fill(wipe, 16 * wipeRows), wipeGrid = [wipeRows, 16];

  var leave = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: '.stage', start: 'top top', end: function () { return '+=' + window.innerHeight * 1.3; }, pin: true, scrub: 0.5, invalidateOnRefresh: true, refreshPriority: 10, onToggle: function (s) { heroOn = s.isActive; } } });
  leave.to(title.words, { yPercent: -140, rotate: function () { return gsap.utils.random(-14, 14); }, opacity: 0, duration: 0.5, stagger: { each: 0.03, from: 'random' } }, 0)
    .to('.hero-foot', { y: -40, opacity: 0, duration: 0.4 }, 0)
    .to('.pixels', { opacity: 0, duration: 0.5 }, 0.1)
    .to(wrap, { y: function () { return window.innerHeight / 2 - (wrap.offsetTop + wrap.offsetHeight / 2); }, scale: 1.4, duration: 0.7, ease: 'power2.inOut' }, 0.15)
    .to(wrap, { scale: 0, rotate: 90, duration: 0.3, ease: 'power2.in' }, 0.85);
  var pinLength = function () { return window.innerHeight * 1.3; };
  gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { start: 0, end: function () { return pinLength() + window.innerHeight * 0.65; }, scrub: 0.5, invalidateOnRefresh: true } })
    .to(wipeCells, { scale: 1, duration: 0.39, ease: 'power2.out', stagger: { each: 0.0015, grid: wipeGrid, from: 'center' } }, 0.9)
    .to(wipeCells, { scale: 0, duration: 0.45, ease: 'power2.in', stagger: { each: 0.0015, grid: wipeGrid, from: 'center' } }, 1.45)
    .to({}, { duration: 0.05 }, 1.9);

  var frames = gsap.utils.toArray('.frame'), dots = gsap.utils.toArray('.tour-progress i'), cells = fill(document.querySelector('.tiles'), 144);
  gsap.set(frames.concat(document.querySelector('.tiles')), { xPercent: -50, yPercent: -50 });
  gsap.set(frames, { autoAlpha: 0 });
  function setDot(i) { dots.forEach(function (d, k) { d.classList.toggle('on', k === i); }); }
  var grid = [9, 16];
  gsap.utils.toArray('.split').forEach(function (el) {
    var s = new SplitText(el, { type: 'words', wordsClass: 'wd' });
    gsap.from(s.words, { yPercent: 80, rotate: 6, opacity: 0, duration: 0.8, ease: 'power4.out', stagger: 0.06, scrollTrigger: { trigger: el, start: 'top 85%' } });
  });
  gsap.utils.toArray('.label').forEach(function (el) {
    if (el.closest('.frame') || el.closest('.stage')) return;
    gsap.from(el, { x: -24, opacity: 0, duration: 0.6, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%' } });
  });
  gsap.from('.why-sub, .view-sub', { y: 20, opacity: 0, duration: 0.6, ease: 'power3.out', scrollTrigger: { trigger: '.why-sub', start: 'top 90%' } });
  gsap.set('.why-grid', { perspective: 1200 });
  gsap.utils.toArray('.perk').forEach(function (card, k) {
    var tl = gsap.timeline({ scrollTrigger: { trigger: card, start: 'top 90%' } });
    tl.from(card, { y: 80, rotateX: -35, transformOrigin: '50% 100%', opacity: 0, duration: 0.9, ease: 'power3.out', delay: (k % 4) * 0.08 })
      .from(card.querySelectorAll('h3, p'), { y: 16, opacity: 0, duration: 0.5, stagger: 0.06, ease: 'power2.out' }, '-=0.5');
    var icon = card.querySelector('.perk-icon');
    if (icon) tl.from(icon, { scale: 0, rotate: -90, duration: 0.6, ease: 'back.out(3)' }, '-=0.7');
    card.addEventListener('pointermove', function (e) { var r = card.getBoundingClientRect(); gsap.to(card, { rotateY: ((e.clientX - r.left) / r.width - 0.5) * 8, rotateX: ((e.clientY - r.top) / r.height - 0.5) * -8, duration: 0.4, ease: 'power2.out' }); });
    card.addEventListener('pointerleave', function () { gsap.to(card, { rotateY: 0, rotateX: 0, duration: 0.6, ease: 'power3.out' }); });
  });
  gsap.utils.toArray('.perk-stat .num').forEach(function (el) {
    var o = { v: 60 }, to = parseInt(el.dataset.to, 10);
    gsap.to(o, { v: to, duration: 1.6, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 88%' }, onUpdate: function () { el.textContent = Math.round(o.v); } });
  });
  if (compare) {
    var c = { v: 100 };
    gsap.fromTo(compare, { scale: 0.86, rotateX: 18, opacity: 0.3 }, { scale: 1, rotateX: 0, opacity: 1, ease: 'none', transformPerspective: 1400, scrollTrigger: { trigger: compare, start: 'top bottom', end: 'top 30%', scrub: 0.5 } });
    gsap.to(c, { v: 50, ease: 'none', scrollTrigger: { trigger: compare, start: 'top 75%', end: 'center 45%', scrub: 0.6 }, onUpdate: function () { if (!held) cut(c.v); } });
    gsap.from('.tag-java', { x: -40, opacity: 0, duration: 0.6, ease: 'back.out(2)', scrollTrigger: { trigger: compare, start: 'top 65%' } });
    gsap.from('.tag-rust', { x: 40, opacity: 0, duration: 0.6, ease: 'back.out(2)', scrollTrigger: { trigger: compare, start: 'top 65%' } });
    gsap.from('.compare-knob', { scale: 0, rotate: 180, duration: 0.7, ease: 'back.out(2.5)', scrollTrigger: { trigger: compare, start: 'top 60%' } });
  }
  var bars = gsap.timeline({ scrollTrigger: { trigger: '.chart', start: 'top 78%' } });
  gsap.utils.toArray('.chart .row').forEach(function (row, i) {
    var t0 = i * 0.2, val = row.querySelector('.val b'), to = parseInt(row.dataset.fps, 10), o = { v: 0 }, blocks = row.querySelectorAll('.blocks i');
    bars.from(blocks, { scale: 0, duration: 0.22, ease: 'back.out(3)', stagger: 0.022 }, t0)
      .fromTo(o, { v: 0 }, { v: to, duration: 0.022 * blocks.length + 0.22, ease: 'none', onUpdate: function () { val.textContent = Math.round(o.v); } }, t0)
      .from(row.querySelector('.name'), { x: -20, opacity: 0, duration: 0.4 }, t0);
  });
  bars.to('.row-rust .blocks i', { y: -6, duration: 0.16, yoyo: true, repeat: 1, stagger: 0.012, ease: 'power2.out' });
  gsap.from('.rig', { opacity: 0, y: 12, duration: 0.6, scrollTrigger: { trigger: '.rig', start: 'top 95%' } });

  var tour = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: '.tour-stage', start: 'top top', end: function () { return '+=' + window.innerHeight * 3; }, pin: true, scrub: 0.5, invalidateOnRefresh: true, refreshPriority: 1 } });
  tour.to(cells, { scale: 1, duration: 0.25, ease: 'power2.out', stagger: { each: 0.004, grid: grid, from: 'center' } }, 0)
    .set(frames[0], { autoAlpha: 1 }, 0.6)
    .add(function () { setDot(tour.scrollTrigger.direction > 0 ? 0 : -1); }, 0.6)
    .to(cells, { scale: 0, duration: 0.25, ease: 'power2.in', stagger: { each: 0.004, grid: grid, from: 'center' } }, 0.65)
    .from(frames[0].querySelector('figcaption'), { y: 24, opacity: 0, duration: 0.35 }, 0.9);
  var at = 1.45;
  frames.slice(0, -1).forEach(function (cur, k) {
    var next = frames[k + 1];
    tour.to(cur.querySelector('figcaption'), { opacity: 0, y: -12, duration: 0.25 }, at)
      .to(cur, { y: function () { return -window.innerHeight * 0.18; }, scale: 0.86, rotate: k % 2 ? 3 : -3, autoAlpha: 0, duration: 0.7, ease: 'power2.in' }, at)
      .fromTo(next, { y: function () { return window.innerHeight * 0.7; }, scale: 1.04, rotate: k % 2 ? -4 : 4, autoAlpha: 0 }, { y: 0, scale: 1, rotate: 0, autoAlpha: 1, duration: 0.8, ease: 'power3.out', immediateRender: false }, at + 0.15)
      .from(next.querySelector('figcaption'), { y: 30, opacity: 0, duration: 0.4, immediateRender: false }, at + 0.55)
      .add(function () { setDot(tour.scrollTrigger.direction > 0 ? k + 1 : k); }, at + 0.5);
    at += 1.3;
  });
  tour.to({}, { duration: 0.5 });

  gsap.fromTo('.get-logo', { scale: 4, rotate: -20, opacity: 0 }, { scale: 1, rotate: 0, opacity: 1, ease: 'power2.out', scrollTrigger: { trigger: '.get', start: 'top 90%', end: 'top 40%', scrub: true } });
  gsap.from('.get .btn', { scale: 0.85, opacity: 0, duration: 0.6, ease: 'back.out(2)', scrollTrigger: { trigger: '.get h2', start: 'top 82%' } });
  gsap.from('.get > p, .get .os', { y: 24, opacity: 0, duration: 0.6, stagger: 0.1, ease: 'power3.out', scrollTrigger: { trigger: '.get h2', start: 'top 82%' } });

  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href'), st = tour.scrollTrigger, el = document.querySelector(id);
      if (!el && id !== '#top') return;
      e.preventDefault();
      var top = id === '#top' ? 0 : id === '#tour' ? st.start + (st.end - st.start) * (1.0 / tour.duration()) : el.getBoundingClientRect().top + window.scrollY - 70;
      window.scrollTo({ top: top, behavior: 'smooth' });
    });
  });
  var refresh = function () { ScrollTrigger.refresh(); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(refresh);
  window.addEventListener('load', refresh);
  document.querySelectorAll('img').forEach(function (img) { if (!img.complete) img.addEventListener('load', refresh, { once: true }); });
})();
