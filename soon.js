(function () {
  var word = document.getElementById('soonWord'), count = document.getElementById('count'), note = document.getElementById('countNote');
  var rows = ['.1111..111...111..1...1', '1.....1...1.1...1.11..1', '.111..1...1.1...1.1.1.1', '....1.1...1.1...1.1..11', '1111...111...111..1...1'];
  rows.forEach(function (r) { for (var i = 0; i < r.length; i++) { var c = document.createElement('i'); if (r[i] === '1') c.className = 'on'; word.appendChild(c); } });
  var target = Date.parse(count.dataset.to), digits = {}, flip = null;
  count.querySelectorAll('b').forEach(function (b) { digits[b.dataset.unit] = b; });
  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function tick() {
    var left = Math.max(0, Math.floor((target - Date.now()) / 1000));
    var v = { d: '' + Math.floor(left / 86400), h: pad(Math.floor(left / 3600) % 24), m: pad(Math.floor(left / 60) % 60), s: pad(left % 60) };
    Object.keys(v).forEach(function (k) { if (digits[k].textContent !== v[k]) { digits[k].textContent = v[k]; if (flip && k !== 's') flip(digits[k]); } });
    if (!left) { note.textContent = 'Out now in the Frost Launcher'; clearInterval(timer); }
  }
  tick();
  var timer = setInterval(tick, 1000);
  if (!window.frostMotion) return;
  document.documentElement.classList.add('motion');
  gsap.registerPlugin(SplitText);
  var canvas = document.getElementById('pixels'), ctx = canvas.getContext('2d'), CELL = 26, cols = 0, rowsN = 0, lit = new Map(), mouse = null, idle = 0;
  var tones = ['237,188,60', '226,143,33', '199,98,0'];
  function size() { canvas.width = canvas.clientWidth; canvas.height = canvas.clientHeight; cols = Math.ceil(canvas.width / CELL); rowsN = Math.ceil(canvas.height / CELL); }
  size();
  window.addEventListener('resize', size);
  window.addEventListener('pointermove', function (e) { var r = canvas.getBoundingClientRect(); mouse = { c: Math.floor((e.clientX - r.left) / CELL), r: Math.floor((e.clientY - r.top) / CELL) }; idle = 0; }, { passive: true });
  gsap.ticker.add(function () {
    if (mouse) for (var dy = -2; dy <= 2; dy++) for (var dx = -2; dx <= 2; dx++) {
      var c = mouse.c + dx, r = mouse.r + dy, d = Math.abs(dx) + Math.abs(dy);
      if (c >= 0 && r >= 0 && c < cols && r < rowsN && d <= 2) { var k = r * cols + c; lit.set(k, Math.max(lit.get(k) || 0, 1 - d * 0.3)); }
    }
    if (++idle > 2 && Math.random() < 0.35) lit.set((Math.random() * cols * rowsN) | 0, 0.6);
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
  for (var i = 0; i < 64; i++) { var p = document.createElement('span'); p.style.background = 'var(--ground)'; cover.appendChild(p); }
  wrap.appendChild(cover);
  var title = new SplitText('#soonTitle', { type: 'chars,words', charsClass: 'ch' });
  var on = gsap.utils.toArray('.soon-word i.on');
  flip = function (el) { gsap.fromTo(el, { yPercent: -60, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.35, ease: 'back.out(2.5)' }); };
  var intro = gsap.timeline({ delay: 0.15 });
  intro.to(cover.children, { scale: 0, duration: 0.35, ease: 'power2.in', stagger: { each: 0.012, from: 'random' } })
    .from(logo, { scale: 0.6, rotate: -8, duration: 1, ease: 'elastic.out(1,0.6)' }, 0.1)
    .from(on, { scale: 0, rotate: 90, duration: 0.45, ease: 'back.out(2.5)', stagger: { each: 0.012, from: 'random' } }, 0.3)
    .from(title.chars, { yPercent: 110, opacity: 0, duration: 0.6, ease: 'back.out(2)', stagger: 0.015 }, 0.7)
    .from('.count-cell', { y: 40, rotateX: -50, transformOrigin: '50% 100%', opacity: 0, duration: 0.7, stagger: 0.08, ease: 'power3.out' }, 1.0)
    .from('.count-note', { y: 12, opacity: 0, duration: 0.5, ease: 'power3.out' }, 1.3)
    .from('.hero-actions .btn', { y: 24, opacity: 0, duration: 0.7, stagger: 0.1, ease: 'power3.out' }, 1.25)
    .add(function () { cover.remove(); hop(); });
  gsap.to(logo, { y: -10, repeat: -1, yoyo: true, duration: 2.2, ease: 'sine.inOut' });
  var tiltX = gsap.quickTo(logo, 'rotationY', { duration: 0.6, ease: 'power3' }), tiltY = gsap.quickTo(logo, 'rotationX', { duration: 0.6, ease: 'power3' });
  gsap.set(wrap, { perspective: 600 });
  gsap.set(count, { perspective: 800 });
  count.querySelectorAll('.count-cell').forEach(function (cell) {
    cell.addEventListener('pointermove', function (e) { var r = cell.getBoundingClientRect(); gsap.to(cell, { rotateY: ((e.clientX - r.left) / r.width - 0.5) * 16, rotateX: ((e.clientY - r.top) / r.height - 0.5) * -16, duration: 0.4, ease: 'power2.out' }); });
    cell.addEventListener('pointerleave', function () { gsap.to(cell, { rotateY: 0, rotateX: 0, duration: 0.6, ease: 'power3.out' }); });
  });
  window.addEventListener('pointermove', function (e) { tiltX((e.clientX / window.innerWidth - 0.5) * 30); tiltY((e.clientY / window.innerHeight - 0.5) * -30); }, { passive: true });
  function hop() { gsap.to(gsap.utils.random(on), { y: -10, duration: 0.18, yoyo: true, repeat: 1, ease: 'power2.out' }); gsap.delayedCall(0.3, hop); }
  word.addEventListener('pointermove', function (e) {
    var t = e.target;
    if (t.classList && t.classList.contains('on') && !gsap.isTweening(t)) gsap.to(t, { y: -12, rotate: gsap.utils.random(-20, 20), duration: 0.18, yoyo: true, repeat: 1, ease: 'power2.out' });
  });
})();
