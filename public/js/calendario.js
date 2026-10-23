/* ==========================================================================
   Calendario: 22 Gran Premi con stato (disputato / prossimo / da disputare),
   filtri e download .ics
   ========================================================================== */
(function () {
  'use strict';
  var U = window.LLU, LL = window.LL, $ = U.$, $$ = U.$$, esc = U.esc, F = U.fmt;
  var list, rail, filtro = 'tutti';
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
  }

  function render() {
    list.innerHTML = LL.stagione.gare.map(riga).join('');
    applyFilter();
    U.applyLive();
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
      render();
      centraProssimo(false);
      document.addEventListener('ll:stato', function () { var x = rail.scrollLeft; render(); rail.scrollLeft = x; });
      U.drag(rail);
      U.avanzamento(rail, $('.bar-s', $('#calendario')));
      $('#cal-p').addEventListener('click', function () { passo(-1); });
      $('#cal-n').addEventListener('click', function () { passo(1); });
      rail.addEventListener('keydown', function (e) {
        if (e.target !== rail && e.target !== list) return;
        if (e.key === 'ArrowRight') { passo(1); e.preventDefault(); } else if (e.key === 'ArrowLeft') { passo(-1); e.preventDefault(); }
      });
      window.addEventListener('load', function () { centraProssimo(false); });

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
