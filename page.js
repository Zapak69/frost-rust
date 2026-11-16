(function () {
  var BASE = 'https://cdn.frostclient.eu/get/';
  var FILES = { win: ['Frost-Launcher-win.exe', 'Windows'], mac: ['Frost-Launcher-mac.dmg', 'macOS'], linux: ['Frost-Launcher-linux.AppImage', 'Linux'] };
  var ua = (navigator.userAgent || '') + ' ' + (navigator.platform || '');
  var os = /Windows|Win32|Win64/i.test(ua) ? 'win' : /Macintosh|Mac OS X|MacIntel|MacARM/i.test(ua) ? 'mac' : /Linux|X11/i.test(ua) && !/Android/i.test(ua) ? 'linux' : 'win';
  document.querySelectorAll('.js-dl').forEach(function (a) { a.href = BASE + FILES[os][0]; });
  document.querySelectorAll('.js-dl-label').forEach(function (s) { s.textContent = 'Download for ' + FILES[os][1]; });
  var body = document.querySelector('.doc-body'), toc = document.querySelector('.toc');
  if (body && toc) {
    body.querySelectorAll('h2').forEach(function (h, i) {
      h.id = h.id || 's' + (i + 1);
      var a = document.createElement('a');
      a.href = '#' + h.id;
      a.textContent = h.textContent.replace(/^\d+\.\s*/, '');
      toc.appendChild(a);
    });
  }
  var code = document.querySelector('.lost-code');
  if (code) {
    var rows = ['1...1..111..1...1', '1...1.1...1.1...1', '1...1.1...1.1...1', '11111.1...1.11111', '....1.1...1.....1', '....1.1...1.....1', '....1..111......1'];
    rows.forEach(function (r) { for (var i = 0; i < r.length; i++) { var c = document.createElement('i'); if (r[i] === '1') c.className = 'on'; code.appendChild(c); } });
  }
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.frostMotion = !reduce && !!window.gsap && !!window.ScrollTrigger;
  if (!window.frostMotion) return;
  gsap.registerPlugin(ScrollTrigger);
  var nav = document.getElementById('nav');
  gsap.from('.nav-inner > *', { yPercent: -160, opacity: 0, duration: 0.9, stagger: 0.12, ease: 'back.out(1.6)', delay: 0.15, clearProps: 'transform,opacity' });
  ScrollTrigger.create({ start: 60, end: 'max', onToggle: function (s) { nav.classList.toggle('compact', s.isActive); } });
  var mark = document.querySelector('.nav-mark');
  if (mark) {
    var markTo = function (id) {
      var link = id && document.querySelector('.nav-links a[data-section="' + id + '"]');
      document.querySelectorAll('.nav-links a').forEach(function (a) { a.classList.toggle('on', a === link); });
      if (!link) { gsap.to(mark, { opacity: 0, duration: 0.25, overwrite: true }); return; }
      gsap.to(mark, { x: link.offsetLeft, width: link.offsetWidth, opacity: 1, duration: 0.5, ease: 'back.out(1.7)', overwrite: true });
    };
    window.addEventListener('load', function () {
      document.querySelectorAll('.nav-links a[data-section]').forEach(function (a) {
        var id = a.dataset.section;
        ScrollTrigger.create({ trigger: '#' + id, start: 'top 55%', end: 'bottom 55%', onToggle: function (s) { if (s.isActive) markTo(id); else if (s.direction < 0 && id === 'why') markTo(null); } });
      });
      ScrollTrigger.refresh();
    });
  }
  document.querySelectorAll('.btn-main').forEach(function (btn) {
    var mx = gsap.quickTo(btn, 'x', { duration: 0.4, ease: 'power3' }), my = gsap.quickTo(btn, 'y', { duration: 0.4, ease: 'power3' });
    btn.addEventListener('pointermove', function (e) { var r = btn.getBoundingClientRect(); mx((e.clientX - r.left - r.width / 2) * 0.2); my((e.clientY - r.top - r.height / 2) * 0.3); });
    btn.addEventListener('pointerleave', function () { mx(0); my(0); });
  });
  if (body) {
    gsap.from('.doc-head > *', { y: 30, opacity: 0, duration: 0.8, stagger: 0.08, ease: 'power3.out', delay: 0.2 });
    gsap.from('.toc a', { x: -16, opacity: 0, duration: 0.5, stagger: 0.04, ease: 'power2.out', delay: 0.5 });
    body.querySelectorAll('h2, .info-block').forEach(function (el) {
      gsap.from(el, { y: 24, opacity: 0, duration: 0.6, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 92%' } });
    });
    if (toc) toc.querySelectorAll('a').forEach(function (a) {
      var h = document.getElementById(a.hash.slice(1)), next = h.nextElementSibling;
      while (next && next.tagName !== 'H2') next = next.nextElementSibling;
      ScrollTrigger.create({ trigger: h, start: 'top 40%', endTrigger: next || body, end: next ? 'top 40%' : 'bottom 40%', onToggle: function (s) { a.classList.toggle('on', s.isActive); } });
    });
  }
  if (code) {
    var tl = gsap.timeline({ delay: 0.25 });
    tl.from('.lost-code i.on', { scale: 0, rotate: 90, duration: 0.45, ease: 'back.out(2.5)', stagger: { each: 0.02, from: 'random' } })
      .from('.lost h1, .lost p, .lost .links', { y: 24, opacity: 0, duration: 0.6, stagger: 0.1, ease: 'power3.out' }, '-=0.3');
    var cells = gsap.utils.toArray('.lost-code i.on');
    gsap.delayedCall(2, function hop() { gsap.to(gsap.utils.random(cells), { y: -10, duration: 0.18, yoyo: true, repeat: 1, ease: 'power2.out' }); gsap.delayedCall(0.35, hop); });
  }
})();
