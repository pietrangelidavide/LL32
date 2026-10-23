/* ==========================================================================
   Avvio: riempie i dati fissi, poi accende i moduli nell'ordine giusto
   ========================================================================== */
(function () {
  'use strict';
  var U = window.LLU, LL = window.LL, $ = U.$, $$ = U.$$, esc = U.esc, F = U.fmt;

  function testi() {
    var s = U.stats(), p = LL.pilota;
    var map = {
      posMondiale: s.posMondiale,
      punti: F.num(s.punti),
      migliorArrivo: F.pos(s.migliorArrivo.v),
      migliorArrivoGp: s.migliorArrivo.gp,
      migliorGriglia: F.pos(s.migliorGriglia.v),
      migliorGrigliaGp: s.migliorGriglia.gp,
      mediaGriglia: F.pos(Math.round(s.mediaGriglia)),
      mediaArrivo: F.pos(Math.round(s.mediaArrivo))
    };
    $$('[data-stat]').forEach(function (el) { if (map[el.dataset.stat] != null) el.textContent = map[el.dataset.stat]; });

    // età
    var n = new Date(p.nascita + 'T12:00:00Z'), t = U.now();
    var eta = t.getUTCFullYear() - n.getUTCFullYear();
    if (t.getUTCMonth() < n.getUTCMonth() || (t.getUTCMonth() === n.getUTCMonth() && t.getUTCDate() < n.getUTCDate())) eta--;
    $$('[data-eta]').forEach(function (el) { el.textContent = '(' + eta + ' anni)'; });

    $$('[data-ig-seguaci]').forEach(function (el) { el.textContent = p.seguaci; });
    $$('[data-ig-data]').forEach(function (el) { el.textContent = p.seguaciAl; });
    $$('[data-agg]').forEach(function (el) { el.textContent = LL.stagione.aggiornatoA; });

    var mail = $('#mail-btn');
    if (mail && LL.contatti && LL.contatti.email) { mail.href = 'mailto:' + LL.contatti.email; mail.hidden = false; }

    var pl = $('#partner');
    if (pl) pl.innerHTML = LL.partner.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('');
  }

  function safe(name, fn) {
    try { fn(); } catch (e) { if (window.console) console.error('[' + name + ']', e); }
  }

  safe('testi', testi);
  ['stagione', 'calendario', 'carriera', 'galleria'].forEach(function (k) {
    safe(k, function () { U.mod[k].init(); });
  });
  safe('fx', function () { U.mod.fx.init(); });
  safe('live', function () { U.mod.live.init(); });

  // rete di sicurezza: se qualcosa si è rotto, il sito resta comunque visibile
  setTimeout(function () { document.documentElement.classList.add('ready'); }, 8000);
})();
