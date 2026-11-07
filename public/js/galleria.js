/* ==========================================================================
   Foto: collage a tutta larghezza. Le foto sono disposte in righe "giustificate"
   (stessa altezza per riga, larghezza proporzionale al formato: nessun ritaglio,
   nessun vuoto), con 3px di giunta. Ogni riga scivola di lato mentre scorri la
   pagina, l'immagine dentro a ogni riquadro ha la sua parallasse e, col mouse,
   il riquadro sotto il puntatore si allarga. Ingrandimento in <dialog> nativo.
   ========================================================================== */
(function () {
  'use strict';
  var U = window.LLU, LL = window.LL, $ = U.$, $$ = U.$$, esc = U.esc, clamp = U.clamp, reduce = U.reduce;
  var foto = LL.foto || [];
  var box, tiles = [], rows = [], gap = 3, bleed = 0, vis = false, queued = false, lastW = 0, io = null;
  var dlg, img, count, idx = 0, opener = null;

  function render() {
    box = $('#collage'); if (!box || !foto.length) return false;
    box.innerHTML = foto.map(function (f, i) {
      var h640 = Math.round(f.h * 640 / f.w);
      return '<div class="ph" role="listitem" style="--c:' + esc(f.c) + ';--ar:' + (f.w / f.h).toFixed(4) + '">' +
        '<button type="button" data-i="' + i + '" aria-label="Ingrandisci la foto ' + (i + 1) + ' di ' + foto.length + ': ' + esc(f.titolo) + '">' +
          '<img src="/img/' + f.id + '-640.webp" srcset="/img/' + f.id + '-640.webp 640w, /img/' + f.id + '.webp ' + f.w + 'w" sizes="(max-width:700px) 56vw, 34vw" alt="' + esc(f.titolo) + '" width="640" height="' + h640 + '" loading="' + (i < 4 ? 'eager' : 'lazy') + '" decoding="async" draggable="false">' +
        '</button></div>';
    }).join('');
    tiles = $$('.ph', box);
    return true;
  }

  /* divide le foto (in ordine) in k righe cercando che tutte abbiano un'altezza vicina a quella desiderata */
  function partition(ar, k, W, target) {
    var n = ar.length, pre = [0], i, j, m, INF = 1e18;
    ar.forEach(function (a) { pre.push(pre[pre.length - 1] + a); });
    function cost(a, b) { var h = (W - gap * (b - a - 1)) / (pre[b] - pre[a]), d = h - target; return d * d; }
    var dp = [], cut = [];
    for (j = 0; j <= k; j++) { dp.push(new Array(n + 1).fill(INF)); cut.push(new Array(n + 1).fill(0)); }
    dp[0][0] = 0;
    for (j = 1; j <= k; j++) for (i = j; i <= n; i++) for (m = j - 1; m < i; m++) {
      var c = dp[j - 1][m] + cost(m, i);
      if (c < dp[j][i]) { dp[j][i] = c; cut[j][i] = m; }
    }
    var out = []; i = n;
    for (j = k; j >= 1; j--) { m = cut[j][i]; out.unshift([m, i]); i = m; }
    return out;
  }

  function layout() {
    var cw = box.clientWidth; if (!cw) return;
    bleed = reduce ? 0 : Math.round(clamp(cw * 0.03, 0, 54));
    var W = cw + bleed * 2, target = clamp(cw * 0.36, 260, 520);
    var ar = foto.map(function (f) { return f.w / f.h; });
    var total = ar.reduce(function (a, b) { return a + b; }, 0);
    var k = clamp(Math.round(total * target / W), 1, foto.length);
    var parts = partition(ar, k, W, target);
    box.style.setProperty('--bleed', bleed + 'px');
    box.innerHTML = '';
    rows = parts.map(function (p, r) {
      var el = document.createElement('div'), sum = 0, i;
      el.className = 'cl-row';
      for (i = p[0]; i < p[1]; i++) { sum += ar[i]; tiles[i].style.setProperty('--k', i - p[0]); el.appendChild(tiles[i]); }
      el.style.height = ((W - gap * (p[1] - p[0] - 1)) / sum).toFixed(2) + 'px';
      box.appendChild(el);
      return { el: el, odd: r % 2 ? -1 : 1 };
    });
    lastW = cw;
    watch();
    update();
  }

  /* le foto compaiono (con un'apertura dal basso) quando la loro riga entra nello schermo;
     si osserva la riga e non il riquadro, perché un elemento già ritagliato non risulterebbe "visibile" */
  function watch() {
    if (!io) return;
    io.disconnect();
    rows.forEach(function (r) { if (!r.el.firstChild.classList.contains('in')) io.observe(r.el); });
  }

  /* scorrimento: ogni riga si sposta di lato, ogni foto ha la sua parallasse verticale */
  function update() {
    queued = false;
    if (reduce || !rows.length) return;
    var vh = window.innerHeight;
    rows.forEach(function (r) {
      var b = r.el.getBoundingClientRect();
      if (b.bottom < -80 || b.top > vh + 80) return;
      var t = clamp(((b.top + b.height / 2) - vh / 2) / (vh / 2 + b.height / 2), -1, 1);
      r.el.style.setProperty('--dx', (r.odd * t * bleed).toFixed(1) + 'px');
      var ph = r.el.children, i;
      for (i = 0; i < ph.length; i++) ph[i].style.setProperty('--py', (-t * b.height * 0.04).toFixed(1) + 'px');
    });
  }
  function req() { if (vis && !queued) { queued = true; requestAnimationFrame(update); } }

  function collage() {
    if (!render()) return;
    layout();
    var ro = 'ResizeObserver' in window ? new ResizeObserver(function () { if (Math.abs(box.clientWidth - lastW) > 1) layout(); }) : null;
    if (ro) ro.observe(box); else window.addEventListener('resize', layout);
    box.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-i]'); if (b) open(+b.dataset.i, b);
    });
    box.addEventListener('focusin', function (e) { var t = e.target.closest && e.target.closest('.ph'); if (t) t.classList.add('in'); });
    if (reduce || !('IntersectionObserver' in window)) { tiles.forEach(function (t) { t.classList.add('in'); }); return; }
    io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        Array.prototype.forEach.call(e.target.children, function (t) { t.classList.add('in'); });
        io.unobserve(e.target);
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -8% 0px' });
    watch();
    new IntersectionObserver(function (es) { vis = es[0].isIntersecting; if (vis) update(); }, { rootMargin: '120px 0px' }).observe(box);
    window.addEventListener('scroll', req, { passive: true });
    window.addEventListener('resize', req);
  }

/* ---------- ingrandimento ---------- */
  function show(i) {
    idx = (i + foto.length) % foto.length;
    var f = foto[idx];
    img.src = '/img/' + f.id + '.webp';
    img.width = f.w; img.height = f.h;
    img.alt = f.titolo;
    count.textContent = (idx + 1) + ' / ' + foto.length;
    [1, -1].forEach(function (d) { var n = foto[(idx + d + foto.length) % foto.length]; new Image().src = '/img/' + n.id + '.webp'; });
  }
  function open(i, from) {
    opener = from || null;
    show(i);
    if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open', '');
    document.documentElement.classList.add('lb-open');
  }
  function close() { if (dlg.open) dlg.close(); }

  U.mod.galleria = {
    init: function () {
      collage();
      dlg = $('#lb'); if (!dlg || !foto.length) return;
      img = $('#lb-img'); count = $('#lb-count');
      $('.lb-x', dlg).addEventListener('click', close);
      $('.lb-p', dlg).addEventListener('click', function () { show(idx - 1); });
      $('.lb-n', dlg).addEventListener('click', function () { show(idx + 1); });
      dlg.addEventListener('click', function (e) { if (e.target === dlg || e.target.classList.contains('lb-in')) close(); });
      dlg.addEventListener('close', function () {
        document.documentElement.classList.remove('lb-open');
        if (opener && document.contains(opener)) opener.focus({ preventScroll: true });
      });
      dlg.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowLeft') { show(idx - 1); e.preventDefault(); }
        else if (e.key === 'ArrowRight') { show(idx + 1); e.preventDefault(); }
      });
      var sx = null;
      dlg.addEventListener('pointerdown', function (e) { if (e.pointerType === 'touch') sx = e.clientX; });
      dlg.addEventListener('pointerup', function (e) {
        if (sx == null) return;
        var dx = e.clientX - sx; sx = null;
        if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1));
      });
    }
  };
})();
