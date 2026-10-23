/* ==========================================================================
   Live center: stato del weekend, conto alla rovescia, orari in ora italiana.
   Gli stati si provano aggiungendo ?now=2026-10-24T02:50:00Z all'indirizzo.
   ========================================================================== */
(function () {
  'use strict';
  var U = window.LLU, LL = window.LL, $ = U.$, $$ = U.$$, esc = U.esc, F = U.fmt;
  var html = document.documentElement;
  var el = {}, units = {}, key = '', timer = 0, current = null;

  function two(n) { return String(n).padStart(2, '0'); }

  function setUnits(ms, onlyDays) {
    var s = Math.max(0, Math.floor(ms / 1000));
    var d = Math.floor(s / 86400), h = Math.floor(s % 86400 / 3600), m = Math.floor(s % 3600 / 60), sec = s % 60;
    units.d.textContent = onlyDays ? String(d) : two(d);
    units.h.textContent = two(h); units.m.textContent = two(m); units.s.textContent = two(sec);
  }
  function showUnits(all) {
    ['h', 'm', 's'].forEach(function (k) { units[k].closest('.cd').hidden = !all; });
  }

  function sessioniHtml(st) {
    if (!st.sessioni || !st.sessioni.length) {
      return '<li class="live-empty">Gli orari ufficiali di questo weekend saranno pubblicati qui appena disponibili. Intanto trovi il programma completo sul sito del Mondiale.</li>';
    }
    var t = U.now();
    return st.sessioni.map(function (s) {
      var cls = 'ses', lab = '';
      if (t >= s.a) { cls += ' is-done'; lab = 'Concluso'; }
      else if (t >= s.da) { cls += ' is-live'; lab = 'In diretta'; }
      else if (st.prossima && st.prossima.k === s.k) { cls += ' is-next'; lab = 'Prossima'; }
      if (s.gara) cls += ' is-gara';
      return '<li class="' + cls + '"><span class="ses-d">' + esc(F.giorno(s.da)) + '</span><span class="ses-t">' + F.ora(s.da) + '</span><span class="ses-n">' + esc(s.nome) + '</span><span class="ses-s">' + lab + '</span></li>';
    }).join('');
  }

  function renderStatic(st) {
    var g = st.gara, w = g && LL.weekend && LL.weekend[g.n];
    var isLive = st.tipo === 'live';
    html.toggleAttribute('data-live', isLive);
    el.main.classList.toggle('is-live', isLive);
    el.main.classList.toggle('is-over', st.tipo === 'dopo' || st.tipo === 'fine');
    var label = el.status.lastElementChild;

    if (st.tipo === 'fine' || !g) {
      label.textContent = 'Stagione conclusa';
      el.gp.textContent = 'Grazie per aver seguito Luca';
      el.circ.textContent = 'Il calendario 2026 è terminato.';
      el.next.textContent = '';
      el.ses.innerHTML = '<li class="live-empty">Il prossimo calendario sarà pubblicato qui.</li>';
      el.tv.textContent = '';
      el.ics.hidden = true;
      setHero(null);
      U.applyLive();
      return;
    }
    el.ics.hidden = false;
    el.gp.textContent = g.gp;
    el.circ.textContent = g.circuito + (w && w.giorni ? ', ' + w.giorni : '');
    el.tv.textContent = w && w.tv ? w.tv : '';
    el.ses.innerHTML = sessioniHtml(st);
    if (el.ics.lastChild && el.ics.lastChild.nodeType === 3) {
      el.ics.lastChild.textContent = st.sessioni && st.sessioni.length ? 'Aggiungi il weekend al calendario' : 'Aggiungi il GP al calendario';
    }
    el.ics.onclick = function () {
      var slug = U.breve(g).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      U.scarica(U.ics(U.eventiGara(g), g.gp + ' - Luca Lunetta #32'), 'lunetta-' + slug + '.ics');
    };

    if (st.tipo === 'live') {
      label.textContent = 'In diretta';
      el.next.textContent = 'In pista adesso: ' + st.sessione.nome + '.';
    } else if (st.tipo === 'dopo') {
      label.textContent = 'Weekend concluso';
      el.next.textContent = 'Gara terminata: i risultati e la classifica arrivano a breve.';
    } else if (st.prossima) {
      var first = st.sessioni[0] === st.prossima && U.now() < st.prossima.da;
      label.textContent = first ? 'Il weekend inizia' : 'Prossima sessione';
      el.next.textContent = st.prossima.nome + ', ' + F.giorno(st.prossima.da) + ' alle ' + F.ora(st.prossima.da) + ' (ora italiana).';
    } else {
      label.textContent = 'Prossimo Gran Premio';
      el.next.textContent = st.giorni > 0
        ? 'Gara domenica ' + F.dataBreve(g.data) + '. Gli orari delle sessioni arriveranno qui.'
        : 'È il weekend di gara. Gli orari delle sessioni arriveranno qui.';
    }
    showUnits(!!(st.sessioni && st.sessioni.length));
    setHero(g);
    U.applyLive();
  }

  function setHero(g) {
    $$('[data-stat="prossimoGp"]').forEach(function (n) { n.textContent = g ? U.breve(g) : '—'; });
    $$('[data-stat="prossimoData"]').forEach(function (n) { n.textContent = g ? F.dataBreve(g.data) : 'Stagione conclusa'; });
  }

  function tick() {
    var st = U.stato(), t = U.now();
    var k = [st.tipo, st.gara && st.gara.n, st.sessione && st.sessione.k, st.prossima && st.prossima.k].join('|');
    if (k !== key) {
      key = k; current = st; renderStatic(st);
      document.dispatchEvent(new CustomEvent('ll:stato', { detail: st }));
    }
    var show = st.tipo === 'prima';
    el.count.hidden = !show;
    if (!show) return;
    if (st.prossima) setUnits(st.prossima.da - t, false);
    else {
      var d = Math.max(0, +U.romeMidnight(st.gara.data) - +t);
      el.count.hidden = st.giorni <= 0;
      setUnits(d, true);
      units.d.textContent = String(st.giorni);
    }
    // aggiorna le etichette delle sessioni a ogni minuto cambiato
    if (st.sessioni && st.sessioni.length && t.getSeconds() === 0) el.ses.innerHTML = sessioniHtml(st);
  }

  U.mod.live = {
    init: function () {
      el.main = $('#live-main'); if (!el.main) return;
      el.status = $('#live-status'); el.gp = $('#live-gp'); el.circ = $('#live-circ');
      el.count = $('#live-count'); el.next = $('#live-next'); el.ics = $('#live-ics');
      el.ses = $('#live-sessions'); el.tv = $('#live-tv'); el.timing = $('#live-timing');
      ['d', 'h', 'm', 's'].forEach(function (k) { units[k] = $('[data-u="' + k + '"]', el.count); });
      if (el.timing && LL.link) el.timing.href = LL.link.liveTiming;
      tick();
      timer = setInterval(tick, 1000);
      document.addEventListener('visibilitychange', function () { if (!document.hidden) tick(); });
    },
    stato: function () { return current; }
  };
})();
