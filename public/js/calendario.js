/* ==========================================================================
   Calendario: 22 Gran Premi con stato (disputato / prossimo / da disputare),
   filtri, specchietto orizzontale per scorrere in fretta e download .ics
   ========================================================================== */
(function () {
  'use strict';
  var U = window.LLU, LL = window.LL, $ = U.$, $$ = U.$$, esc = U.esc, F = U.fmt;
  var list, rail, filtro = 'tutti';
  var mm, mmCells, mmMonths, mmWin, mmTip, cells = [], vis = [], mmDrag = false, mmMoved = false, mmX0 = 0, tipTimer = 0, queued = false;
  var MINUS = '−';

  function risultato(g, st) {
    var e = g.esito;
    if (e) {
      if (e.stato === 'assente') return '<span class="tag">Assente</span>';
      if (e.stato === 'ritirato') return '<span class="tag">Ritirato</span>';
      var d = e.griglia - e.arrivo, p = U.puntiGara(e.arrivo);
      return '<span class="num">' + F.pos(e.arrivo) + '</span><small>partito<br>' + F.pos(e.griglia) + '</small>' + (p ? '<span class="pts">' + p + '</span>' : '');
    }
    if (st === 'done') return '<span class="tag">Risultato in arrivo</span>';
    if (st === 'next') return '<span class="ev-live"><i class="dot" aria-hidden="true"></i><span data-live-t>Prossimo GP</span></span>';
    return '<span class="tag">Da disputare</span>';
  }

  function riga(g) {
    var st = U.stadio(g);
    var nota = g.nota || (g.esito && g.esito.nota) || '';
    return '<li class="ev is-' + st + '" data-st="' + st + '" data-n="' + g.n + '">' +
      '<span class="ev-n" aria-hidden="true">' + g.n + '</span>' +
      '<div class="ev-top">' +
        '<div class="ev-date"><b>' + esc(F.giornoNum(g.data)) + '</b><span>' + esc(F.meseBreve(g.data)) + '</span></div>' +
        '<span class="code">' + esc(g.paese) + '</span>' +
      '</div>' +
      '<div class="ev-main"><h3>' + esc(g.gp) + '</h3><p>' + esc(g.circuito) + ', ' + esc(g.luogo) + '</p>' +
        (nota ? '<span class="nota">' + esc(nota) + '</span>' : '') + '</div>' +
      '<div class="ev-bot">' +
        '<div class="ev-res">' + risultato(g, st) + '</div>' +
        (st === 'done' ? '' : '<button class="ev-ics" type="button" data-n="' + g.n + '" aria-label="Aggiungi ' + esc(g.gp) + ' al calendario"><svg class="ic" aria-hidden="true"><use href="#i-cal"/></svg></button>') +
      '</div>' +
    '</li>';
  }

  function applyFilter() {
    $$('.ev', list).forEach(function (r) {
      var st = r.dataset.st, show = filtro === 'tutti' || (filtro === 'prossimi' && st !== 'done') || (filtro === 'disputati' && st === 'done');
      r.classList.toggle('is-hidden', !show);
    });
    mapMini();
  }

  function render() {
    list.innerHTML = LL.stagione.gare.map(riga).join('');
    buildMini();
    applyFilter();
    U.applyLive();
  }

  /* ---------- specchietto ----------
     Una cella (la bandiera del Paese) per ogni Gran Premio; la finestra evidenziata è la parte di
     calendario visibile nella fascia sopra. Trascinala, tocca una cella o usa le frecce per scorrere. */
  function buildMini() {
    if (!mm) return;
    mmCells.innerHTML = '';
    cells = LL.stagione.gare.map(function (g) {
      var c = document.createElement('i'), st = U.stadio(g);
      c.className = 'mm-c is-' + st; c.dataset.n = g.n;
      c.style.setProperty('--img', 'url("data:image/svg+xml,' + encodeURIComponent(U.flag.svg(g.paese)) + '")');
      mmCells.appendChild(c);
      return c;
    });
  }
  function gp(n) { return LL.stagione.gare.filter(function (g) { return String(g.n) === String(n); })[0]; }

  /* quali GP sono visibili (dipende dal filtro) e come si mappano posizione nella fascia ↔ cella */
  function mapMini() {
    if (!mm) return;
    vis = $$('.ev:not(.is-hidden)', list);
    var shown = {}; vis.forEach(function (e) { shown[e.dataset.n] = 1; });
    cells.forEach(function (c) { c.classList.toggle('is-hidden', !shown[c.dataset.n]); });
    mmMonths.innerHTML = '';
    var W = mm.clientWidth, cw = vis.length ? W / vis.length : 0, last = '', start = 0, i, runs = [];
    vis.forEach(function (e, i) {
      var m = F.meseBreve(gp(e.dataset.n).data);
      if (m !== last) { runs.push({ m: m, i: i, n: 1 }); last = m; } else runs[runs.length - 1].n++;
    });
    runs.forEach(function (r) {
      var w = r.n * cw, t = w >= 34 ? r.m : (w >= 11 ? r.m.charAt(0) : '');
      if (!t) return;
      var sp = document.createElement('span'); sp.textContent = t; sp.style.left = (r.i / vis.length * 100) + '%';
      mmMonths.appendChild(sp);
    });
    mm.setAttribute('aria-valuemax', String(vis.length || 1));
    syncMini();
  }
  function geom() {
    var m = vis.length; if (!m) return null;
    var l0 = vis[0].offsetLeft, w = vis[0].offsetWidth;
    var pitch = m > 1 ? (vis[m - 1].offsetLeft - l0) / (m - 1) : w + 14;
    return { m: m, l0: l0, pitch: pitch, fmax: m - 1 + w / pitch };
  }
  function fx(g, x) { return Math.min(Math.max((x - g.l0) / g.pitch, 0), g.fmax); }

  function syncMini() {
    queued = false;
    var g = geom(); if (!g) return;
    var L = rail.scrollLeft, V = rail.clientWidth;
    var a = fx(g, L) / g.m * 100, b = fx(g, L + V) / g.m * 100;
    mmWin.style.left = a.toFixed(2) + '%'; mmWin.style.width = Math.max(b - a, 3).toFixed(2) + '%';
    var idx = Math.min(g.m - 1, Math.floor(fx(g, L + V / 2)));
    var cur = vis[idx], ga = cur && gp(cur.dataset.n);
    mm.setAttribute('aria-valuenow', String(idx + 1));
    if (ga) mm.setAttribute('aria-valuetext', ga.gp + ', ' + F.giornoNum(ga.data) + ' ' + F.meseBreve(ga.data));
  }
  function reqMini() { if (!queued) { queued = true; requestAnimationFrame(syncMini); } }

  function tip(clientX) {
    var g = geom(); if (!g) return;
    var r = mm.getBoundingClientRect(), f = Math.min(Math.max((clientX - r.left) / r.width, 0), 1) * g.m;
    var ev = vis[Math.min(g.m - 1, Math.floor(f))], ga = ev && gp(ev.dataset.n); if (!ga) return;
    mmTip.textContent = F.giornoNum(ga.data) + ' ' + F.meseBreve(ga.data) + ' · ' + U.breve(ga);
    var tw = mmTip.offsetWidth / 2, x = Math.min(Math.max(clientX - r.left, tw), r.width - tw);
    mmTip.style.left = x + 'px';
    mm.classList.add('is-tip');
  }
  function scrollA(clientX, smooth) {
    var g = geom(); if (!g) return;
    var r = mm.getBoundingClientRect(), f = Math.min(Math.max((clientX - r.left) / r.width, 0), 1) * g.m;
    rail.scrollTo({ left: Math.max(0, g.l0 + f * g.pitch - rail.clientWidth / 2), behavior: smooth && !U.reduce ? 'smooth' : 'auto' });
  }
  function mini() {
    mm = $('#cal-mm'); if (!mm) return;
    mmCells = $('.mm-cells', mm); mmMonths = $('.mm-months', mm); mmWin = $('.mm-win', mm); mmTip = $('.mm-tip', mm);
    rail.addEventListener('scroll', reqMini, { passive: true });
    window.addEventListener('resize', mapMini);
    mm.addEventListener('pointerdown', function (e) {
      if (e.button > 0) return;
      mmDrag = true; mmMoved = false; mmX0 = e.clientX;
      try { mm.setPointerCapture(e.pointerId); } catch (x) {}
      clearTimeout(tipTimer);
      mm.classList.add('is-drag'); rail.classList.add('is-drag');
      scrollA(e.clientX, true); tip(e.clientX);
    });
    mm.addEventListener('pointermove', function (e) {
      if (mmDrag) {
        if (Math.abs(e.clientX - mmX0) > 3) mmMoved = true;
        if (mmMoved) scrollA(e.clientX, false);
        tip(e.clientX);
      } else if (e.pointerType === 'mouse') tip(e.clientX);
    });
    function end(e) {
      if (!mmDrag) return;
      mmDrag = false; mm.classList.remove('is-drag'); rail.classList.remove('is-drag');
      tipTimer = setTimeout(function () { mm.classList.remove('is-tip'); }, e && e.pointerType === 'mouse' ? 0 : 700);
    }
    mm.addEventListener('pointerup', end);
    mm.addEventListener('pointercancel', end);
    mm.addEventListener('pointerleave', function (e) { if (!mmDrag) mm.classList.remove('is-tip'); });
    mm.addEventListener('keydown', function (e) {
      var g = geom(); if (!g) return;
      var dir = e.key === 'ArrowRight' || e.key === 'ArrowUp' ? 1 : (e.key === 'ArrowLeft' || e.key === 'ArrowDown' ? -1 : 0);
      if (dir) rail.scrollBy({ left: dir * g.pitch, behavior: U.reduce ? 'auto' : 'smooth' });
      else if (e.key === 'Home') rail.scrollTo({ left: 0, behavior: U.reduce ? 'auto' : 'smooth' });
      else if (e.key === 'End') rail.scrollTo({ left: rail.scrollWidth, behavior: U.reduce ? 'auto' : 'smooth' });
      else if (e.key === 'PageUp' || e.key === 'PageDown') rail.scrollBy({ left: (e.key === 'PageUp' ? -1 : 1) * rail.clientWidth * 0.8, behavior: U.reduce ? 'auto' : 'smooth' });
      else return;
      e.preventDefault();
    });
  }

  /* porta a sinistra del centro il prossimo Gran Premio (senza muovere la pagina) */
  function centraProssimo(smooth) {
    var el = $('.ev.is-next:not(.is-hidden)', list) || $('.ev:not(.is-hidden)', list);
    if (!el) return;
    rail.scrollTo({ left: Math.max(0, el.offsetLeft - (rail.clientWidth - el.offsetWidth) / 2), behavior: smooth && !U.reduce ? 'smooth' : 'auto' });
  }
  function passo(dir) {
    var c = $('.ev:not(.is-hidden)', list); if (!c) return;
    rail.scrollBy({ left: dir * (c.offsetWidth + 14) * (window.innerWidth < 700 ? 1 : 2), behavior: U.reduce ? 'auto' : 'smooth' });
  }

  U.mod.calendario = {
    init: function () {
      list = $('#cal-list'); rail = $('#cal-rail'); if (!list || !rail) return;
      mini();
      render();
      centraProssimo(false);
      document.addEventListener('ll:stato', function () { var x = rail.scrollLeft; render(); rail.scrollLeft = x; });
      U.drag(rail);
      $('#cal-p').addEventListener('click', function () { passo(-1); });
      $('#cal-n').addEventListener('click', function () { passo(1); });
      rail.addEventListener('keydown', function (e) {
        if (e.target !== rail && e.target !== list) return;
        if (e.key === 'ArrowRight') { passo(1); e.preventDefault(); } else if (e.key === 'ArrowLeft') { passo(-1); e.preventDefault(); }
      });
      window.addEventListener('load', function () { centraProssimo(false); mapMini(); });

      $$('#cal-filtri button').forEach(function (b) {
        b.addEventListener('click', function () {
          filtro = b.dataset.f;
          $$('#cal-filtri button').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
          applyFilter();
          if (filtro === 'disputati') rail.scrollTo({ left: rail.scrollWidth, behavior: U.reduce ? 'auto' : 'smooth' });
          else if (filtro === 'prossimi') rail.scrollTo({ left: 0, behavior: U.reduce ? 'auto' : 'smooth' });
          else centraProssimo(true);
        });
      });

      list.addEventListener('click', function (e) {
        var b = e.target.closest('.ev-ics'); if (!b) return;
        var g = LL.stagione.gare.filter(function (x) { return String(x.n) === b.dataset.n; })[0];
        if (!g) return;
        var slug = U.breve(g).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        U.scarica(U.ics(U.eventiGara(g), g.gp + ' - Luca Lunetta #32'), 'lunetta-' + slug + '.ics');
      });

      var all = $('#cal-ics');
      if (all) all.addEventListener('click', function () {
        var ev = [];
        LL.stagione.gare.forEach(function (g) { ev = ev.concat(U.eventiGara(g)); });
        U.scarica(U.ics(ev, 'Moto2 ' + LL.stagione.anno + ' - Luca Lunetta #32'), 'luca-lunetta-moto2-' + LL.stagione.anno + '.ics');
      });
    }
  };
})();
