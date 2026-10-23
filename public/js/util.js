/* ==========================================================================
   Funzioni condivise: tempo (ora italiana), statistiche calcolate, calendario .ics
   ========================================================================== */
(function () {
  'use strict';
  var LL = window.LL;
  var TZ = 'Europe/Rome';
  var DAY = 864e5;
  var GRACE = 3 * 3600e3; // dopo la bandiera a scacchi il weekend resta "in evidenza" per 3 ore

  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }

  var reduce = false;
  try { reduce = matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

  /* ---------- orologio (con ?now=ISO per provare gli stati del live) ---------- */
  var offset = 0;
  try {
    var m = /[?&]now=([^&]+)/.exec(location.search);
    if (m) { var t = Date.parse(decodeURIComponent(m[1])); if (!isNaN(t)) offset = t - Date.now(); }
  } catch (e) {}
  function now() { return new Date(Date.now() + offset); }

  /* ---------- formattazione ---------- */
  var cache = {};
  function dtf(o) { var k = JSON.stringify(o); return cache[k] || (cache[k] = new Intl.DateTimeFormat('it-IT', o)); }
  function noDot(s) { return s.replace(/\./g, ''); }
  function noonUTC(ds) { return new Date(ds + 'T12:00:00Z'); }
  var fmt = {
    ora: function (d) { return dtf({ timeZone: TZ, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(d); },
    giorno: function (d) { return noDot(dtf({ timeZone: TZ, weekday: 'short', day: 'numeric', month: 'short' }).format(d)); },
    dataBreve: function (ds) { return dtf({ timeZone: 'UTC', day: 'numeric', month: 'long' }).format(noonUTC(ds)); },
    dataLunga: function (ds) { return dtf({ timeZone: 'UTC', day: 'numeric', month: 'long', year: 'numeric' }).format(noonUTC(ds)); },
    giornoNum: function (ds) { return dtf({ timeZone: 'UTC', day: 'numeric' }).format(noonUTC(ds)); },
    meseBreve: function (ds) { return noDot(dtf({ timeZone: 'UTC', month: 'short' }).format(noonUTC(ds))); },
    num: function (n, dec) {
      return Number(n).toLocaleString('it-IT', { minimumFractionDigits: dec || 0, maximumFractionDigits: dec == null ? 3 : dec });
    },
    pos: function (n) { return n + '°'; },
    secondi: function (n) { return '+' + Number(n).toLocaleString('it-IT', { minimumFractionDigits: 3, maximumFractionDigits: 3 }) + ' s'; }
  };

  /* ---------- fuso orario: mezzanotte italiana di una data ---------- */
  function tzOffset(ts) {
    var p = {};
    dtf({ timeZone: TZ, hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' })
      .formatToParts(new Date(ts)).forEach(function (x) { p[x.type] = x.value; });
    return Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second) - Math.floor(ts / 1000) * 1000;
  }
  function romeMidnight(ds) {
    var a = ds.split('-').map(Number);
    var guess = Date.UTC(a[0], a[1] - 1, a[2]);
    var t = guess - tzOffset(guess);
    return new Date(guess - tzOffset(t));
  }
  function addDays(ds, n) {
    var d = noonUTC(ds); d.setUTCDate(d.getUTCDate() + n);
    return d.toISOString().slice(0, 10);
  }

  /* ---------- weekend, sessioni, stato ---------- */
  function sessioni(g) {
    var w = LL.weekend && LL.weekend[g.n];
    if (!w || !w.sessioni) return [];
    return w.sessioni.map(function (s) {
      var o = {}; for (var k in s) o[k] = s[k];
      o.da = new Date(s.da); o.a = new Date(s.a); return o;
    }).sort(function (x, y) { return x.da - y.da; });
  }
  function fine(g) {
    var ss = sessioni(g);
    if (ss.length) return new Date(Math.max.apply(null, ss.map(function (s) { return +s.a; })));
    return new Date(+romeMidnight(g.data) + 36 * 3600e3);
  }
  function target(t) {
    t = t || now();
    var gare = LL.stagione.gare;
    for (var i = 0; i < gare.length; i++) {
      if (!gare[i].esito && +t < +fine(gare[i]) + GRACE) return gare[i];
    }
    return null;
  }
  function stato(t) {
    t = t || now();
    var g = target(t);
    if (!g) return { gara: null, tipo: 'fine' };
    var ss = sessioni(g);
    if (!ss.length) {
      return { gara: g, tipo: 'prima', sessioni: ss, giorni: Math.max(0, Math.ceil((+romeMidnight(g.data) - +t) / DAY)) };
    }
    var live = null, next = null;
    for (var i = 0; i < ss.length; i++) {
      if (t >= ss[i].da && t < ss[i].a) { live = ss[i]; break; }
      if (!next && t < ss[i].da) next = ss[i];
    }
    if (live) return { gara: g, tipo: 'live', sessioni: ss, sessione: live };
    if (next) return { gara: g, tipo: 'prima', sessioni: ss, prossima: next };
    return { gara: g, tipo: 'dopo', sessioni: ss };
  }
  /* done | next | future per il calendario */
  function stadio(g, t) {
    if (g.esito) return 'done';
    var tg = target(t), gare = LL.stagione.gare;
    if (!tg) return 'done';
    return gare.indexOf(g) < gare.indexOf(tg) ? 'done' : (g === tg ? 'next' : 'future');
  }
  function breve(g) { return g.gp.replace(/^GP (?:di |del |dello |della |degli |d')?/, ''); }

  /* ---------- statistiche calcolate dai dati ---------- */
  var _s = null;
  function puntiGara(arrivo) {
    var p = LL.puntiPosizione;
    return arrivo >= 1 && arrivo <= p.length ? p[arrivo - 1] : 0;
  }
  function stats() {
    if (_s) return _s;
    var gare = LL.stagione.gare;
    var corse = gare.filter(function (g) { return g.esito && g.esito.stato !== 'assente'; });
    var fin = corse.filter(function (g) { return g.esito.stato === 'finito'; });
    var sum = function (a, f) { return a.reduce(function (x, y) { return x + f(y); }, 0); };
    var punti = sum(fin, function (g) { return puntiGara(g.esito.arrivo); });
    var garePunti = fin.filter(function (g) { return puntiGara(g.esito.arrivo) > 0; }).length;
    var posGuadagnate = sum(fin, function (g) { return g.esito.griglia - g.esito.arrivo; });
    var podi26 = fin.filter(function (g) { return g.esito.arrivo <= 3; }).length;
    function migliore(arr, campo) {
      var best = null;
      arr.forEach(function (g) { var v = g.esito[campo]; if (v != null && (!best || v < best.v)) best = { v: v, gp: g.gp, n: g.n }; });
      return best || { v: 0, gp: '' };
    }
    var luca = (LL.stagione.classifica.righe || []).filter(function (r) { return r.luca; })[0];
    var gpM = sum(LL.mondiale, function (r) { return r.gp; }) + corse.length;
    _s = {
      corse: corse, fin: fin,
      punti: punti, garePunti: garePunti, posGuadagnate: posGuadagnate, podi26: podi26,
      gp2026: corse.length,
      mediaGriglia: corse.length ? sum(corse, function (g) { return g.esito.griglia; }) / corse.length : 0,
      mediaArrivo: fin.length ? sum(fin, function (g) { return g.esito.arrivo; }) / fin.length : 0,
      migliorArrivo: migliore(fin, 'arrivo'),
      migliorGriglia: migliore(corse, 'griglia'),
      posMondiale: luca ? luca.pos + '°' : '—'
    };
    _s.count = { punti: punti, gp2026: corse.length, garePunti: garePunti, posGuadagnate: posGuadagnate };
    _s.tot = {
      gp: gpM,
      podi: sum(LL.mondiale, function (r) { return r.podi; }) + podi26,
      punti: sum(LL.mondiale, function (r) { return r.punti; }) + punti,
      giri: LL.giriVeloci || 0
    };
    return _s;
  }

  /* ---------- calendario .ics ---------- */
  function stamp(d) { return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, ''); }
  function icsEsc(s) { return String(s).replace(/\\/g, '\\\\').replace(/\r?\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;'); }
  function fold(line) {
    var out = [];
    while (line.length > 70) { out.push(line.slice(0, 70)); line = ' ' + line.slice(70); }
    out.push(line);
    return out.join('\r\n');
  }
  function ics(eventi, nome) {
    var L = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Luca Lunetta 32//Calendario//IT', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'X-WR-CALNAME:' + icsEsc(nome || 'Luca Lunetta #32')];
    var ds = stamp(new Date());
    eventi.forEach(function (e) {
      L.push('BEGIN:VEVENT', 'UID:' + e.uid + '@lunetta32', 'DTSTAMP:' + ds);
      if (e.allDay) {
        L.push('DTSTART;VALUE=DATE:' + e.start.replace(/-/g, ''), 'DTEND;VALUE=DATE:' + e.end.replace(/-/g, ''));
      } else {
        L.push('DTSTART:' + stamp(e.start), 'DTEND:' + stamp(e.end));
      }
      L.push('SUMMARY:' + icsEsc(e.summary));
      if (e.loc) L.push('LOCATION:' + icsEsc(e.loc));
      if (e.desc) L.push('DESCRIPTION:' + icsEsc(e.desc));
      L.push('END:VEVENT');
    });
    L.push('END:VCALENDAR');
    return L.map(fold).join('\r\n') + '\r\n';
  }
  function eventiGara(g) {
    var ss = sessioni(g), loc = g.circuito + ', ' + g.luogo;
    var base = 'Luca Lunetta #32, ' + LL.pilota.team + '.';
    if (ss.length) {
      return ss.map(function (s) {
        return { uid: 'gp' + g.n + '-' + s.k, summary: 'Moto2: ' + s.nome + ' (' + g.gp + ')', start: s.da, end: s.a, loc: loc, desc: base };
      });
    }
    return [{ uid: 'gp' + g.n, summary: g.gp + ' (Moto2, Luca Lunetta #32)', allDay: true, start: addDays(g.data, -2), end: addDays(g.data, 1), loc: loc, desc: base + ' Orari delle sessioni da confermare: controlla il programma ufficiale.' }];
  }
  function scarica(testo, nome) {
    var b = new Blob([testo], { type: 'text/calendar;charset=utf-8' });
    var u = URL.createObjectURL(b);
    var a = document.createElement('a');
    a.href = u; a.download = nome; a.rel = 'noopener';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(u); }, 4000);
  }

  /* ---------- testi che cambiano quando c'è una sessione in corso ---------- */
  function applyLive() {
    var on = document.documentElement.hasAttribute('data-live');
    $$('[data-live-t]').forEach(function (el) {
      if (el.dataset.base == null) el.dataset.base = el.textContent;
      el.textContent = on ? (el.dataset.liveText || 'In diretta ora') : el.dataset.base;
    });
  }

  /* ---------- un solo ascoltatore di scroll per tutti ---------- */
  var subs = [], queued = false;
  function run() {
    queued = false;
    var y = window.pageYOffset, vh = window.innerHeight;
    for (var i = 0; i < subs.length; i++) subs[i](y, vh);
  }
  function req() { if (!queued) { queued = true; requestAnimationFrame(run); } }
  window.addEventListener('scroll', req, { passive: true });
  window.addEventListener('resize', req);
  function onFrame(fn) { subs.push(fn); fn(window.pageYOffset, window.innerHeight); }

  window.LLU = {
    $: $, $$: $$, esc: esc, clamp: clamp, reduce: reduce, TZ: TZ,
    now: now, fmt: fmt, romeMidnight: romeMidnight, addDays: addDays,
    sessioni: sessioni, fine: fine, target: target, stato: stato, stadio: stadio, breve: breve,
    stats: stats, puntiGara: puntiGara,
    ics: ics, eventiGara: eventiGara, scarica: scarica,
    applyLive: applyLive, onFrame: onFrame,
    mod: {}
  };
})();
