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

  /* ---------- classifiche delle sessioni (si aprono toccando la riga) ---------- */
  var aperte = {}, lastSes = '';

  function msDa(t) {
    var m = /^(\d+):(\d{2})\.(\d{3})$/.exec(t || '');
    return m ? (+m[1] * 60 + +m[2]) * 1000 + +m[3] : null;
  }
  function righeLuca(s) {
    var n = LL.pilota.nome, ris = s.ris || [];
    for (var i = 0; i < ris.length; i++) if (ris[i][0] === n) return { i: i, r: ris[i] };
    return null;
  }
  function lucaTesto(s) {
    if (s.luca) return s.luca;
    var f = righeLuca(s); if (!f) return '';
    if (!f.r[1]) return f.r[3] || '';
    return (f.r[2] || String(f.i + 1)) + '° · ' + f.r[1];
  }
  function tabellaHtml(s) {
    var ris = s.ris, lead = null, i;
    for (i = 0; i < ris.length; i++) if (msDa(ris[i][1]) != null) { lead = msDa(ris[i][1]); break; }
    var righe = ris.map(function (r, i) {
      var t = msDa(r[1]), isL = r[0] === LL.pilota.nome;
      var pos = r[2] || String(i + 1);
      var gap = t != null && lead != null && t !== lead ? '+' + ((t - lead) / 1000).toFixed(3) : '';
      var tempo = r[1] || r[3] || '—';
      return '<tr' + (isL ? ' class="is-luca"' : '') + '><td class="r-p">' + esc(pos) + '</td><td class="r-n">' + esc(r[0]) +
        '</td><td class="r-t">' + esc(tempo) + '</td><td class="r-g">' + gap + '</td></tr>';
    }).join('');
    return '<table class="rtab"><caption class="sr-only">' + esc(s.nome) + ', classifica Moto2</caption>' +
      '<thead><tr><th scope="col">Pos.</th><th scope="col">Pilota</th><th scope="col">Tempo</th><th scope="col">Dist.</th></tr></thead>' +
      '<tbody>' + righe + '</tbody></table>' +
      (s.nota ? '<p class="rnota">' + esc(s.nota) + '</p>' : '') +
      '<p class="rnota">Dati inseriti a mano dopo ogni sessione: fa fede il sito ufficiale del Mondiale.</p>';
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
      var base = '<span class="ses-d">' + esc(F.giorno(s.da)) + '</span><span class="ses-t">' + F.ora(s.da) + '</span><span class="ses-n">' + esc(s.nome) + '</span><span class="ses-s">' + lab + '</span>';
      if (!s.ris || !s.ris.length) return '<li class="' + cls + '"><div class="ses-row">' + base + '</div></li>';
      var open = !!aperte[s.k], id = 'ses-res-' + s.k, lt = lucaTesto(s);
      return '<li class="' + cls + ' has-res' + (open ? ' is-open' : '') + '">' +
        '<button type="button" class="ses-row" data-k="' + esc(s.k) + '" aria-expanded="' + open + '" aria-controls="' + id + '">' + base +
          '<span class="ses-l">' + (lt ? '<b>Luca:</b> ' + esc(lt) : 'Classifica') + '</span>' +
          '<span class="ses-c"><span>' + (open ? 'Chiudi' : 'Tutta la Moto2') + '</span><svg class="ic" aria-hidden="true"><use href="#i-down"/></svg></span>' +
        '</button>' +
        '<div class="ses-res" id="' + id + '"' + (open ? '' : ' hidden') + '>' + tabellaHtml(s) + '</div></li>';
    }).join('');
  }
  function paintSes(st) {
    if (!el.ses) return;
    var h = sessioniHtml(st);
    if (h === lastSes) return;
    lastSes = h; el.ses.innerHTML = h;
  }

  function renderStatic(st) {
    var g = st.gara, w = g && LL.weekend && LL.weekend[g.n];
    var isLive = st.tipo === 'live';
    html.toggleAttribute('data-live', isLive);
    if (!el.main) { setHero(g || null); U.applyLive(); return; } // pagine senza pannello: solo pillola in testata e statistiche
    el.main.classList.toggle('is-live', isLive);
    el.main.classList.toggle('is-over', st.tipo === 'dopo' || st.tipo === 'fine');
    var label = el.status.lastElementChild;

    if (st.tipo === 'fine' || !g) {
      label.textContent = 'Stagione conclusa';
      el.gp.textContent = 'Grazie per aver seguito Luca';
      el.circ.textContent = 'Il calendario 2026 è terminato.';
      el.next.textContent = '';
      lastSes = ''; if (el.ses) el.ses.innerHTML = '<li class="live-empty">Il prossimo calendario sarà pubblicato qui.</li>';
      if (el.tv) el.tv.textContent = '';
      if (el.ics) el.ics.hidden = true;
      setHero(null);
      U.applyLive();
      return;
    }
    el.gp.textContent = g.gp;
    el.circ.textContent = g.circuito + (w && w.giorni ? ', ' + w.giorni : '');
    if (el.tv) el.tv.textContent = w && w.tv ? w.tv : '';
    paintSes(st);
    if (el.ics) {
      el.ics.hidden = false;
      if (el.ics.lastChild && el.ics.lastChild.nodeType === 3) {
        el.ics.lastChild.textContent = st.sessioni && st.sessioni.length ? 'Aggiungi il weekend al calendario' : 'Aggiungi il GP al calendario';
      }
      el.ics.onclick = function () {
        var slug = U.breve(g).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        U.scarica(U.ics(U.eventiGara(g), g.gp + ' - Luca Lunetta #32'), 'lunetta-' + slug + '.ics');
      };
    }

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
    if (!el.main) return;
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
    if (st.sessioni && st.sessioni.length && t.getSeconds() === 0) paintSes(st);
  }

  U.mod.live = {
    init: function () {
      el.main = $('#live-main');
      if (el.main) {
        el.status = $('#live-status'); el.gp = $('#live-gp'); el.circ = $('#live-circ');
        el.count = $('#live-count'); el.next = $('#live-next'); el.ics = $('#live-ics');
        el.ses = $('#live-sessions'); el.tv = $('#live-tv'); el.timing = $('#live-timing');
        ['d', 'h', 'm', 's'].forEach(function (k) { units[k] = $('[data-u="' + k + '"]', el.count); });
        if (el.timing && LL.link) el.timing.href = LL.link.liveTiming;
        if (el.ses) el.ses.addEventListener('click', function (e) {
          var b = e.target.closest && e.target.closest('.ses-row[data-k]'); if (!b || !el.ses.contains(b)) return;
          var k = b.dataset.k, on = !aperte[k]; aperte[k] = on;
          var li = b.parentNode, pan = li.querySelector('.ses-res');
          b.setAttribute('aria-expanded', String(on));
          li.classList.toggle('is-open', on);
          if (pan) pan.hidden = !on;
          var lab = b.querySelector('.ses-c span'); if (lab) lab.textContent = on ? 'Chiudi' : 'Tutta la Moto2';
          lastSes = current ? sessioniHtml(current) : '';
        });
      }
      // senza pannello (tutte le pagine tranne home e calendario) resta solo la pillola "in diretta" in testata
      tick();
      timer = setInterval(tick, el.main ? 1000 : 15000);
      document.addEventListener('visibilitychange', function () { if (!document.hidden) tick(); });
    },
    stato: function () { return current; }
  };
})();
