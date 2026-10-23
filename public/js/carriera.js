/* ==========================================================================
   Carriera: linea del tempo che si accende scorrendo + tabella del Mondiale
   ========================================================================== */
(function () {
  'use strict';
  var U = window.LLU, LL = window.LL, $ = U.$, $$ = U.$$, esc = U.esc, clamp = U.clamp;

  function timeline() {
    var tl = $('#timeline'); if (!tl) return;
    tl.innerHTML = LL.carriera.map(function (c) {
      return '<li class="tl' + (c.incorso ? ' is-live-y' : '') + '">' +
        '<span class="tl-y">' + c.anno + '</span>' +
        '<span class="tl-r" aria-hidden="true"></span>' +
        '<div class="tl-c"><h3>' + esc(c.titolo) + '</h3><p>' + esc(c.testo) + '</p>' +
          (c.sigle && c.sigle.length ? '<ul class="tl-sig">' + c.sigle.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ul>' : '') +
          (c.risultato ? '<div class="tl-res"><span>' + (c.incorso ? 'Classifica oggi' : 'Piazzamento finale') + '</span><b>' + esc(c.risultato) + '</b></div>' : '') +
        '</div></li>';
    }).join('');

    var items = $$('.tl', tl);
    U.onFrame(function (y, vh) {
      var r = tl.getBoundingClientRect();
      tl.style.setProperty('--p', clamp((vh * 0.62 - r.top) / r.height, 0, 1).toFixed(4));
      items.forEach(function (it) { it.classList.toggle('is-in', it.getBoundingClientRect().top < vh * 0.72); });
    });
  }

  function tabella() {
    var tb = $('#mondiale-tab tbody'); if (!tb) return;
    var s = U.stats(), rows = LL.mondiale.slice();
    rows.push({ anno: LL.stagione.anno, classe: 'Moto2', team: LL.pilota.team, moto: LL.pilota.moto, gp: s.gp2026, podi: s.podi26, punti: s.punti, pos: s.posMondiale, incorso: true });
    tb.innerHTML = rows.map(function (r) {
      return '<tr' + (r.incorso ? ' class="is-pt"' : '') + '>' +
        '<td><span class="num">' + r.anno + '</span></td>' +
        '<td class="c-gp"><b>' + esc(r.classe) + '</b><small>' + esc(r.team) + '</small></td>' +
        '<td class="hide-sm">' + esc(r.moto) + '</td>' +
        '<td><span class="num">' + r.gp + '</span></td>' +
        '<td><span class="num">' + r.podi + '</span></td>' +
        '<td><span class="num">' + r.punti + '</span></td>' +
        '<td><span class="num big">' + esc(r.pos) + '</span>' + (r.incorso ? '<small class="muted"><br>in corso</small>' : '') + '</td>' +
      '</tr>';
    }).join('');
  }

  U.mod.carriera = { init: function () { timeline(); tabella(); } };
})();
