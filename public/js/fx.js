/* ==========================================================================
   Effetti: luci di partenza, parallasse, cursore, magneti, linee di velocità,
   contatori, rivelazioni, barra di avanzamento. Tutto spento con "riduci movimento".
   ========================================================================== */
(function () {
  'use strict';
  var U = window.LLU, $ = U.$, $$ = U.$$, clamp = U.clamp, reduce = U.reduce;
  var html = document.documentElement;
  var fine = false;
  try { fine = matchMedia('(pointer: fine)').matches; } catch (e) {}
  var hasIO = 'IntersectionObserver' in window;
  function lerp(a, b, t) { return a + (b - a) * t; }
  function twoFrames(fn) { requestAnimationFrame(function () { requestAnimationFrame(fn); }); }

  /* ---------- 1. Luci di partenza ---------- */
  function ready() { html.classList.add('ready'); }
  function intro() {
    var ov = $('#intro');
    if (!ov || !html.classList.contains('intro')) {
      if (ov) ov.remove();
      html.classList.remove('intro');
      twoFrames(ready);
      return;
    }
    var lights = $('.lights', ov), lt = $$('.lt', ov), timers = [], over = false;
    function at(ms, fn) { timers.push(setTimeout(fn, ms)); }
    function mark() { try { sessionStorage.setItem('ll32-intro', '1'); } catch (e) {} }
    function end(fast) {
      if (over) return; over = true;
      timers.forEach(clearTimeout); mark();
      if (fast) { ov.remove(); html.classList.remove('intro'); twoFrames(ready); return; }
      lights.classList.add('off');
      setTimeout(function () { ov.classList.add('out'); }, 140);
      setTimeout(ready, 420);
      setTimeout(function () { ov.remove(); html.classList.remove('intro'); }, 1150);
    }
    lt.forEach(function (l, i) { at(450 + i * 380, function () { l.classList.add('on'); }); });
    at(450 + (lt.length - 1) * 380 + 720, function () { end(false); });
    at(6500, function () { end(true); });
    $('.intro-skip', ov).addEventListener('click', function () { end(true); });
    window.addEventListener('keydown', function (e) { if (e.key === 'Escape') end(true); });
  }

  /* ---------- 2. Barra di avanzamento e header ---------- */
  function chrome() {
    var bar = $('#progress'), top = $('#top');
    U.onFrame(function (y, vh) {
      var max = document.documentElement.scrollHeight - vh;
      var p = max > 0 ? clamp(y / max, 0, 1) : 0;
      if (bar) { bar.style.setProperty('--p', p.toFixed(4)); bar.style.setProperty('--po', p > 0.004 && p < 0.996 ? 1 : 0); }
      if (top) top.classList.toggle('is-scrolled', y > 24);
    });
  }

  /* ---------- 3. Menu mobile ---------- */
  function menu() {
    var b = $('.burger'), m = $('#menu');
    if (!b || !m) return;
    function set(o) {
      b.setAttribute('aria-expanded', o ? 'true' : 'false');
      b.setAttribute('aria-label', o ? 'Chiudi il menu' : 'Apri il menu');
      m.hidden = !o;
      html.classList.toggle('menu-open', o);
    }
    b.addEventListener('click', function () { set(m.hidden); });
    m.addEventListener('click', function (e) { if (e.target.closest('a')) set(false); });
    window.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !m.hidden) { set(false); b.focus(); } });
    window.addEventListener('resize', function () { if (window.innerWidth > 1180 && !m.hidden) set(false); });
  }

  /* ---------- 4. Sezione attiva nel menu + indicatore che scivola ---------- */
  function spy() {
    var nav = $('.nav'), ind = nav && $('.nav-ind', nav), links = $$('[data-spy]'), act = null, hov = null;
    function put(a, mode) {
      if (!nav || !ind) return;
      links.forEach(function (l) { l.classList.toggle('under', l === a); });
      if (!a || nav.offsetWidth === 0) { ind.style.opacity = '0'; nav.removeAttribute('data-mode'); return; }
      ind.style.opacity = '1';
      ind.style.transform = 'translateX(' + a.offsetLeft + 'px)';
      ind.style.width = a.offsetWidth + 'px';
      nav.setAttribute('data-mode', mode);
    }
    function sync() { hov ? put(hov, 'hover') : put(act, 'active'); }
    if (nav) {
      links.forEach(function (l) {
        l.addEventListener('pointerenter', function (e) { if (e.pointerType === 'touch') return; hov = l; sync(); });
        l.addEventListener('focus', function () { hov = l; sync(); });
        l.addEventListener('blur', function () { hov = null; sync(); });
      });
      nav.addEventListener('pointerleave', function () { hov = null; sync(); });
      window.addEventListener('resize', sync);
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(sync);
    }
    if (!hasIO) return;
    var map = new Map();
    links.forEach(function (a) { var s = document.getElementById(a.getAttribute('href').slice(1)); if (s) map.set(s, a); });
    ['inizio', 'live', 'dove-vederlo'].forEach(function (id) { var s = document.getElementById(id); if (s) map.set(s, null); });
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        links.forEach(function (l) { l.classList.remove('is-active'); l.removeAttribute('aria-current'); });
        var a = map.get(e.target); act = a || null;
        if (a) { a.classList.add('is-active'); a.setAttribute('aria-current', 'true'); }
        sync();
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    map.forEach(function (a, s) { io.observe(s); });
  }

  /* ---------- 5. Parallasse: puntatore sull'hero, scroll sull'interludio ---------- */
  function parallax() {
    if (reduce) return;
    var hero = $('#inizio');
    if (hero && fine) {
      $$('[data-depth]', hero).forEach(function (e) { e.style.setProperty('--d', e.dataset.depth); });
      var tx = 0, ty = 0, cx = 0, cy = 0, run = false;
      var step = function () {
        cx = lerp(cx, tx, 0.08); cy = lerp(cy, ty, 0.08);
        hero.style.setProperty('--px', cx.toFixed(3)); hero.style.setProperty('--py', cy.toFixed(3));
        if (Math.abs(cx - tx) > 0.002 || Math.abs(cy - ty) > 0.002) requestAnimationFrame(step); else run = false;
      };
      var kick = function () { if (!run) { run = true; requestAnimationFrame(step); } };
      hero.addEventListener('pointermove', function (e) {
        var r = hero.getBoundingClientRect();
        tx = ((e.clientX - r.left) / r.width - 0.5) * 2; ty = ((e.clientY - r.top) / r.height - 0.5) * 2; kick();
      });
      hero.addEventListener('pointerleave', function () { tx = 0; ty = 0; kick(); });
    }
    var els = $$('[data-par]');
    if (els.length) {
      U.onFrame(function (y, vh) {
        els.forEach(function (el) {
          var b = el.parentElement.getBoundingClientRect();
          if (b.bottom < -240 || b.top > vh + 240) return;
          var f = parseFloat(el.dataset.par) || 0.1;
          el.style.transform = 'translate3d(0,' + ((b.top + b.height / 2 - vh / 2) * -f).toFixed(1) + 'px,0) scale(1.04)';
        });
      });
    }
  }

  /* ---------- 6. Magneti, riflesso al passaggio, cursore ---------- */
  function magnets() {
    if (!fine || reduce) return;
    $$('[data-magnet]').forEach(function (el) {
      var cx = 0, cy = 0;
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var x = (e.clientX - (r.left - cx) - r.width / 2) * 0.22, y = (e.clientY - (r.top - cy) - r.height / 2) * 0.3;
        cx = x; cy = y;
        el.style.setProperty('--mx', x.toFixed(1) + 'px'); el.style.setProperty('--my', y.toFixed(1) + 'px');
      });
      el.addEventListener('pointerleave', function () { cx = 0; cy = 0; el.style.removeProperty('--mx'); el.style.removeProperty('--my'); });
    });
  }
  function spotlight() {
    if (!fine) return;
    document.addEventListener('pointermove', function (e) {
      var t = e.target.closest && e.target.closest('.ph,.wc');
      if (!t) return;
      var r = t.getBoundingClientRect();
      var x = ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%', y = ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%';
      t.style.setProperty('--mx', x); t.style.setProperty('--my', y);
      t.style.setProperty('--gx', x); t.style.setProperty('--gy', y);
    }, { passive: true });
  }
  function cursor() {
    if (!fine || reduce) return;
    var c = $('#cursor'); if (!c) return;
    var lbl = $('.lbl', c), x = -100, y = -100, cx = x, cy = y, run = false;
    html.classList.add('has-cursor'); c.classList.add('is-hide');
    function step() {
      cx = lerp(cx, x, 0.22); cy = lerp(cy, y, 0.22);
      c.style.transform = 'translate3d(' + cx.toFixed(1) + 'px,' + cy.toFixed(1) + 'px,0)';
      if (Math.abs(cx - x) > 0.3 || Math.abs(cy - y) > 0.3) requestAnimationFrame(step); else run = false;
    }
    document.addEventListener('pointermove', function (e) {
      if (e.pointerType === 'touch') return;
      x = e.clientX; y = e.clientY; c.classList.remove('is-hide');
      if (!run) { run = true; requestAnimationFrame(step); }
      var t = e.target, view = t.closest && t.closest('.ph'), link = t.closest && t.closest('a,button,summary,label,[data-magnet]');
      c.classList.toggle('is-view', !!view);
      c.classList.toggle('is-link', !view && !!link);
      lbl.textContent = view ? 'Apri' : '';
    }, { passive: true });
    document.documentElement.addEventListener('mouseleave', function () { c.classList.add('is-hide'); });
  }

  /* ---------- 7. Linee di velocità quando si scorre (solo desktop) ---------- */
  function speed() {
    if (!fine || reduce || window.innerWidth < 900) return;
    var cv = document.createElement('canvas');
    cv.className = 'speed'; cv.setAttribute('aria-hidden', 'true');
    document.body.appendChild(cv);
    var ctx = cv.getContext('2d'), w = 0, h = 0, dpr = 1;
    function size() { dpr = Math.min(window.devicePixelRatio || 1, 1.5); w = cv.width = Math.round(window.innerWidth * dpr); h = cv.height = Math.round(window.innerHeight * dpr); }
    size(); window.addEventListener('resize', size);
    var L = [], i;
    for (i = 0; i < 34; i++) L.push({ x: Math.random(), y: Math.random(), s: 0.45 + Math.random() * 0.9, a: 0.3 + Math.random() * 0.5 });
    var last = window.pageYOffset, lt = performance.now(), v = 0, run = false;
    function draw() {
      v *= 0.9;
      ctx.clearRect(0, 0, w, h);
      var av = Math.abs(v);
      if (av < 0.35) { run = false; return; }
      var len = clamp(av * 5, 0, 240) * dpr, al = clamp(av / 60, 0, 0.42);
      ctx.lineWidth = 1.5 * dpr; ctx.lineCap = 'round';
      L.forEach(function (l) {
        l.y -= v * l.s * 0.9 / window.innerHeight;
        if (l.y < -0.25) l.y = 1.25; else if (l.y > 1.25) l.y = -0.25;
        ctx.strokeStyle = 'rgba(228,255,30,' + (l.a * al).toFixed(3) + ')';
        ctx.beginPath(); ctx.moveTo(l.x * w, l.y * h); ctx.lineTo(l.x * w, l.y * h + (v > 0 ? len : -len) * l.s); ctx.stroke();
      });
      requestAnimationFrame(draw);
    }
    window.addEventListener('scroll', function () {
      var n = performance.now(), dt = Math.max(8, n - lt), y = window.pageYOffset;
      v = lerp(v, clamp((y - last) / dt * 16, -90, 90), 0.4);
      last = y; lt = n;
      if (!run && Math.abs(v) > 0.6) { run = true; requestAnimationFrame(draw); }
    }, { passive: true });
  }

  /* ---------- 8. Nastro scorrevole ---------- */
  function marquee() {
    var tr = $('.mq-track'); if (!tr || !tr.firstElementChild) return;
    var set = tr.firstElementChild, w = set.getBoundingClientRect().width;
    if (!w) return;
    var k = Math.max(1, Math.ceil(window.innerWidth * 1.1 / w)), i;
    for (i = 1; i < k; i++) tr.appendChild(set.cloneNode(true));
    var n = tr.children.length;
    for (i = 0; i < n; i++) tr.appendChild(tr.children[i].cloneNode(true));
    tr.style.animationDuration = Math.round(w * k / 75) + 's';
  }

  /* ---------- 9. Contatori ---------- */
  function counters() {
    var s = U.stats();
    $$('[data-count],[data-tot]').forEach(function (el) {
      var val = el.dataset.count ? s.count[el.dataset.count] : s.tot[el.dataset.tot];
      if (val == null) return;
      var sign = el.dataset.sign || '';
      var txt = function (v) { return (v > 0 ? sign : '') + Math.round(v).toLocaleString('it-IT'); };
      el.textContent = txt(val);
      if (reduce || !hasIO) return;
      el.textContent = txt(0);
      var io = new IntersectionObserver(function (es, o) {
        if (!es[0].isIntersecting) return;
        o.disconnect();
        var t0 = performance.now(), dur = 1400;
        (function tick(n) {
          var p = clamp((n - t0) / dur, 0, 1), e = 1 - Math.pow(1 - p, 3);
          el.textContent = txt(val * e);
          if (p < 1) requestAnimationFrame(tick); else el.textContent = txt(val);
        })(t0);
      }, { threshold: 0.5 });
      io.observe(el);
    });
  }

  /* ---------- 10. Foto che si scoprono ---------- */
  function reveals() {
    var els = $$('.reveal:not(.in)');
    if (!hasIO || reduce) { els.forEach(function (e) { e.classList.add('in'); }); return; }
    var io = new IntersectionObserver(function (es, o) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); o.unobserve(e.target); } });
    }, { threshold: 0, rootMargin: '0px 0px -8% 0px' });
    els.forEach(function (e) { io.observe(e); });
  }

  U.mod.fx = {
    init: function () {
      intro();
      chrome(); menu(); spy(); parallax(); magnets(); spotlight(); cursor(); speed(); marquee(); counters(); reveals();
    },
    reveals: reveals
  };
})();
