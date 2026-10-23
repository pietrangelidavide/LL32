/* ==========================================================================
   Foto: carosello orizzontale "coverflow" (scorrimento nativo + inclinazione e
   parallasse calcolate sulla posizione), trascinamento col mouse, frecce,
   riproduzione lenta finché non lo tocchi. Ingrandimento in <dialog> nativo.
   ========================================================================== */
(function () {
  'use strict';
  var U = window.LLU, LL = window.LL, $ = U.$, $$ = U.$$, esc = U.esc, clamp = U.clamp, reduce = U.reduce;
  var foto = LL.foto || [];
  var track, cards = [], cur = 0, bar, countEl, prev, next;
  var dlg, img, count, idx = 0, opener = null;
  var hover = false, touched = false, vis = false, queued = false;

  function render() {
    track = $('#galleria'); if (!track || !foto.length) return false;
    track.innerHTML = foto.map(function (f, i) {
      var h640 = Math.round(f.h * 640 / f.w);
      return '<li class="ph" style="--c:' + esc(f.c) + '">' +
        '<button type="button" data-i="' + i + '" aria-label="Ingrandisci la foto ' + (i + 1) + ' di ' + foto.length + ': ' + esc(f.titolo) + '">' +
          '<img src="img/' + f.id + '-640.webp" srcset="img/' + f.id + '-640.webp 640w, img/' + f.id + '.webp ' + f.w + 'w" sizes="(max-width:700px) 74vw, 420px" alt="' + esc(f.titolo) + '" width="640" height="' + h640 + '" loading="' + (i < 3 ? 'eager' : 'lazy') + '" decoding="async" draggable="false">' +
        '</button></li>';
    }).join('');
    cards = $$('.ph', track);
    return true;
  }

  /* inclinazione, scala, ombra e parallasse in base alla distanza dal centro */
  function layout() {
    queued = false;
    if (!cards.length) return;
    var c = track.scrollLeft + track.clientWidth / 2;
    var step = cards.length > 1 ? cards[1].offsetLeft - cards[0].offsetLeft : cards[0].offsetWidth;
    var best = 0, bd = 1e9;
    cards.forEach(function (el, i) {
      var d = (el.offsetLeft + el.offsetWidth / 2 - c) / step, ad = Math.abs(d);
      if (ad < bd) { bd = ad; best = i; }
      if (reduce) return;
      var k = clamp(ad, 0, 2.6);
      el.style.setProperty('--ry', clamp(-d * 26, -58, 58).toFixed(2) + 'deg');
      el.style.setProperty('--s', (1 - k * 0.085).toFixed(3));
      el.style.setProperty('--z', (-k * 46).toFixed(1) + 'px');
      el.style.setProperty('--dim', clamp(ad * 0.36, 0, 0.7).toFixed(3));
      el.style.setProperty('--ip', (clamp(-d, -2.2, 2.2) * 7).toFixed(2) + '%');
    });
    if (best !== cur || !countEl.textContent) {
      cards[cur] && cards[cur].classList.remove('is-on');
      cur = best; cards[cur].classList.add('is-on');
      countEl.textContent = String(cur + 1).padStart(2, '0') + ' / ' + String(cards.length).padStart(2, '0');
      prev.disabled = cur === 0; next.disabled = cur === cards.length - 1;
    }
  }
  function req() { if (!queued) { queued = true; requestAnimationFrame(layout); } }

  function go(i) {
    i = clamp(i, 0, cards.length - 1);
    var el = cards[i];
    track.scrollTo({ left: el.offsetLeft + el.offsetWidth / 2 - track.clientWidth / 2, behavior: reduce ? 'auto' : 'smooth' });
  }

  function carousel() {
    if (!render()) return;
    var sec = $('#foto');
    bar = $('.bar-s', sec); countEl = $('#car-count'); prev = $('#car-p'); next = $('#car-n');
    track.addEventListener('scroll', req, { passive: true });
    window.addEventListener('resize', function () { req(); go(cur); });
    U.avanzamento(track, bar);
    U.drag(track, function () { go(cur); });
    prev.addEventListener('click', function () { touched = true; go(cur - 1); });
    next.addEventListener('click', function () { touched = true; go(cur + 1); });
    track.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { go(cur + 1); touched = true; e.preventDefault(); }
      else if (e.key === 'ArrowLeft') { go(cur - 1); touched = true; e.preventDefault(); }
    });
    track.addEventListener('focusin', function (e) {
      var li = e.target.closest && e.target.closest('.ph'); if (!li) return;
      var i = cards.indexOf(li); if (i > -1 && i !== cur) go(i);
    });
    ['pointerdown', 'wheel', 'touchstart'].forEach(function (ev) { track.addEventListener(ev, function () { touched = true; }, { passive: true }); });
    track.addEventListener('mouseenter', function () { hover = true; });
    track.addEventListener('mouseleave', function () { hover = false; });
    track.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-i]'); if (!b) return;
      var i = +b.dataset.i;
      if (i !== cur && !reduce) { touched = true; go(i); return; }   // primo tocco: porta la foto al centro
      open(i, b);
    });
    layout();
    // parte dalla seconda foto, così si vedono già le vicine
    if (cards.length > 2) { track.scrollLeft = cards[1].offsetLeft + cards[1].offsetWidth / 2 - track.clientWidth / 2; layout(); }
    if (reduce || !('IntersectionObserver' in window)) return;
    new IntersectionObserver(function (es) { vis = es[0].isIntersecting; }, { threshold: 0.4 }).observe(track);
    setInterval(function () {
      if (!vis || touched || hover || document.hidden || (dlg && dlg.open)) return;
      go(cur >= cards.length - 1 ? 0 : cur + 1);
    }, 3200);
  }

  /* ---------- ingrandimento ---------- */
  function show(i) {
    idx = (i + foto.length) % foto.length;
    var f = foto[idx];
    img.src = 'img/' + f.id + '.webp';
    img.width = f.w; img.height = f.h;
    img.alt = f.titolo;
    count.textContent = (idx + 1) + ' / ' + foto.length;
    [1, -1].forEach(function (d) { var n = foto[(idx + d + foto.length) % foto.length]; new Image().src = 'img/' + n.id + '.webp'; });
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
      carousel();
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
