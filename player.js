(function () {
  var player = document.getElementById('player');
  if (!player) return;
  var video = document.getElementById('playerVideo'), big = document.getElementById('playerBig'), toggle = document.getElementById('playerToggle');
  var mute = document.getElementById('playerMute'), full = document.getElementById('playerFull'), track = document.getElementById('playerTrack');
  var fill = document.getElementById('playerFill'), knob = document.getElementById('playerKnob'), buffer = document.getElementById('playerBuffer');
  var timeEl = document.getElementById('playerTime'), durEl = document.getElementById('playerDur');
  var idleTimer = null, dragging = false;
  function fmt(t) {
    if (!isFinite(t) || t < 0) t = 0;
    var m = Math.floor(t / 60), s = Math.floor(t % 60);
    return m + ':' + (s < 10 ? '0' : '') + s;
  }
  function play() {
    var p = video.play();
    if (p && p.catch) p.catch(function () {});
  }
  function togglePlay() {
    if (video.paused || video.ended) play();
    else video.pause();
  }
  function paint() {
    var d = video.duration || 0, pct = d ? video.currentTime / d * 100 : 0;
    fill.style.width = pct + '%';
    knob.style.left = pct + '%';
    timeEl.textContent = fmt(video.currentTime);
    track.setAttribute('aria-valuenow', String(Math.round(pct)));
    track.setAttribute('aria-valuetext', fmt(video.currentTime) + ' of ' + fmt(d));
  }
  function paintBuffer() {
    var d = video.duration || 0;
    if (!d || !video.buffered.length) return;
    buffer.style.width = video.buffered.end(video.buffered.length - 1) / d * 100 + '%';
  }
  function wake() {
    player.classList.remove('idle');
    clearTimeout(idleTimer);
    if (!video.paused && !dragging) idleTimer = setTimeout(function () { player.classList.add('idle'); }, 2200);
  }
  function seekAt(clientX) {
    var r = track.getBoundingClientRect(), d = video.duration || 0;
    if (!d) return;
    video.currentTime = Math.min(1, Math.max(0, (clientX - r.left) / r.width)) * d;
    paint();
  }
  function isFull() {
    return document.fullscreenElement === player || document.webkitFullscreenElement === player;
  }
  function toggleFull() {
    if (isFull()) {
      (document.exitFullscreen || document.webkitExitFullscreen).call(document);
    } else if (player.requestFullscreen) {
      player.requestFullscreen();
    } else if (player.webkitRequestFullscreen) {
      player.webkitRequestFullscreen();
    } else if (video.webkitEnterFullscreen) {
      video.webkitEnterFullscreen();
    }
  }
  video.addEventListener('play', function () {
    player.classList.add('playing');
    toggle.setAttribute('aria-label', 'Pause');
    wake();
  });
  video.addEventListener('pause', function () {
    player.classList.remove('playing');
    toggle.setAttribute('aria-label', 'Play');
    wake();
  });
  video.addEventListener('ended', function () {
    player.classList.remove('playing');
    unfocus();
    big.setAttribute('aria-label', 'Replay teaser');
    wake();
  });
  video.addEventListener('loadedmetadata', function () {
    durEl.textContent = fmt(video.duration);
    paint();
  });
  video.addEventListener('timeupdate', function () {
    if (!dragging) paint();
  });
  video.addEventListener('progress', paintBuffer);
  var vol = document.getElementById('playerVol'), volPct = document.getElementById('playerVolPct');
  var dim = document.getElementById('teaserDim'), watch = document.getElementById('watchTeaser');
  function paintVol() {
    var v = video.muted ? 0 : Math.round(video.volume * 100);
    vol.value = String(v);
    vol.style.setProperty('--vol', v + '%');
    volPct.textContent = v + '%';
    vol.setAttribute('aria-valuetext', v + ' percent');
  }
  try {
    var saved = localStorage.getItem('frostTeaserVolume');
    if (saved !== null && isFinite(+saved)) video.volume = Math.min(1, Math.max(0, +saved / 100));
  } catch (e) {}
  vol.addEventListener('input', function () {
    var v = +vol.value;
    video.volume = v / 100;
    video.muted = v === 0;
    try { localStorage.setItem('frostTeaserVolume', String(v)); } catch (e) {}
  });
  video.addEventListener('volumechange', function () {
    var m = video.muted || video.volume === 0;
    player.classList.toggle('muted', m);
    mute.setAttribute('aria-label', m ? 'Unmute' : 'Mute');
    paintVol();
  });
  paintVol();
  function unfocus() {
    document.body.classList.remove('teaser-focus');
    window.removeEventListener('scroll', onScroll);
  }
  function onScroll() {
    var r = player.getBoundingClientRect();
    if (r.bottom < 0 || r.top > window.innerHeight) unfocus();
  }
  if (watch) watch.addEventListener('click', function (e) {
    e.preventDefault();
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (video.muted && +vol.value > 0) video.muted = false;
    if (video.ended) video.currentTime = 0;
    play();
    document.body.classList.add('teaser-focus');
    player.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
    try { history.replaceState(null, '', '#teaser'); } catch (e2) {}
    setTimeout(function () {
      window.addEventListener('scroll', onScroll, { passive: true });
      player.focus({ preventScroll: true });
    }, reduced ? 0 : 900);
  });
  dim.addEventListener('click', unfocus);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && document.body.classList.contains('teaser-focus') && !isFull()) unfocus();
  });
  video.addEventListener('click', togglePlay);
  video.addEventListener('dblclick', toggleFull);
  big.addEventListener('click', play);
  toggle.addEventListener('click', togglePlay);
  mute.addEventListener('click', function () { video.muted = !video.muted; });
  full.addEventListener('click', toggleFull);
  player.addEventListener('pointermove', wake);
  player.addEventListener('pointerleave', function () {
    if (!video.paused) player.classList.add('idle');
  });
  track.addEventListener('pointerdown', function (e) {
    dragging = true;
    track.classList.add('drag');
    track.setPointerCapture(e.pointerId);
    seekAt(e.clientX);
  });
  track.addEventListener('pointermove', function (e) {
    if (dragging) seekAt(e.clientX);
  });
  ['pointerup', 'pointercancel'].forEach(function (ev) {
    track.addEventListener(ev, function () {
      dragging = false;
      track.classList.remove('drag');
      wake();
    });
  });
  player.addEventListener('keydown', function (e) {
    if (e.target.tagName === 'BUTTON' && (e.key === ' ' || e.key === 'Enter')) return;
    var k = e.key.toLowerCase();
    if (k === ' ' || k === 'k') togglePlay();
    else if (k === 'arrowright') video.currentTime = Math.min(video.duration || 0, video.currentTime + 5);
    else if (k === 'arrowleft') video.currentTime = Math.max(0, video.currentTime - 5);
    else if (k === 'm') video.muted = !video.muted;
    else if (k === 'f') toggleFull();
    else return;
    e.preventDefault();
    wake();
  });
  if (video.readyState >= 1) {
    durEl.textContent = fmt(video.duration);
    paint();
  }
  if (window.frostMotion && window.ScrollTrigger) {
    gsap.from('.teaser > .label, .teaser-title', { y: 30, opacity: 0, duration: 0.7, stagger: 0.1, ease: 'power3.out', scrollTrigger: { trigger: '.teaser', start: 'top 85%' } });
    gsap.from('.player', { y: 60, opacity: 0, scale: 0.96, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: '.player', start: 'top 92%' } });
  }
})();
