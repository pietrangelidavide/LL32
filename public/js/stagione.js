/* ==========================================================================
   Stagione: ultimo GP, grafico griglia→arrivo, tabella gara per gara, classifica
   ========================================================================== */
(function () {
  'use strict';
  var U = window.LLU, LL = window.LL, $ = U.$, esc = U.esc, F = U.fmt, clamp = U.clamp;
  var MINUS = '−';

  function diff(e) { return e.stato === 'finito' ? e.griglia - e.arrivo : null; }
  function diffTxt(d) { return d > 0 ? '+' + d : d < 0 ? MINUS + Math.abs(d) : '='; }
  function diffCls(d) { return d > 0 ? 'd-up' : d < 0 ? 'd-dn' : 'd-eq'; }
  function gareConEsito(conAnnullate) { return LL.stagione.gare.filter(function (g) { return g.esito && (conAnnullate || g.esito.stato !== 'annullato'); }); }

  /* ---------- ultimo Gran Premio ---------- */
  function ultimo() {
    var box = $('#ultimo-gp'); if (!box) return;
    var lista = LL.stagione.gare.filter(function (g) { return g.esito && (g.esito.stato === 'finito' || g.esito.stato === 'ritirato'); });
    var g = lista[lista.length - 1]; if (!g) return;
    var e = g.esito, d = diff(e), rit = e.stato === 'ritirato';
    box.innerHTML =
      '<div class="last-fig">' +
        '<div class="flag-box"><span class="pole" aria-hidden="true"></span>' + U.flag.html(g.paese) + '</div>' +
        '<p class="flag-nome">' + esc(U.flag.nome(g.paese)) + '</p>' +
      '</div>' +
      '<div class="last-tx">' +
        '<span class="last-k">Ultimo Gran Premio</span>' +
        '<h3>' + esc(g.gp) + '</h3>' +
        '<p class="last-sub">' + esc(g.circuito) + ', ' + esc(F.dataBreve(g.data)) + '</p>' +
        '<div class="last-flow">' +
          '<div><span>Partenza</span><b>' + F.pos(e.griglia) + '</b></div>' +
          '<svg class="arr ic" aria-hidden="true"><use href="#i-arrow"/></svg>' +
          '<div><span>Arrivo</span><b>' + (rit ? 'Ritirato' : F.pos(e.arrivo)) + '</b></div>' +
          (d > 0 ? '<span class="gain">' + diffTxt(d) + ' posizioni</span>' : '') +
        '</div>' +
        (e.nota ? '<p class="q">' + esc(e.nota) + '</p>' : '') +
      '</div>';
    U.flag.paint(box);
    box.hidden = false;
  }

  /* ---------- grafico ---------- */
  function chart() {
    var host = $('#chart-in'), wrap = $('#chart'), tip = $('#chart-tip');
    if (!host || !wrap) return;
    var gare = gareConEsito(), n = gare.length; if (!n) return;
    var vals = [];
    gare.forEach(function (g) { if (g.esito.griglia) vals.push(g.esito.griglia); if (g.esito.arrivo) vals.push(g.esito.arrivo); });
    var lo = Math.max(1, Math.floor((Math.min.apply(null, vals) - 1) / 5) * 5), hi = Math.ceil(Math.max.apply(null, vals) / 5) * 5;

    function descr(g) {
      var e = g.esito;
      if (e.stato === 'assente') return { t: g.gp, a: 'Assente' + (e.nota ? '. ' + e.nota : '') };
      if (e.stato === 'ritirato') return { t: g.gp, a: 'Partito ' + F.pos(e.griglia) + ', ritirato.' };
      var d = diff(e);
      return {
        t: g.gp,
        a: 'Partito ' + F.pos(e.griglia) + ', arrivato ' + F.pos(e.arrivo) + '.',
        b: d > 0 ? d + (d === 1 ? ' posizione guadagnata' : ' posizioni guadagnate') : d < 0 ? Math.abs(d) + (d === -1 ? ' posizione persa' : ' posizioni perse') : 'Stessa posizione'
      };
    }

    function draw() {
      var W = Math.round(Math.max(wrap.clientWidth, n * 46 + 70));
      var H = Math.round(clamp(W * 0.4, 340, 460));
      var L = 46, R = 10, T = 20, B = 68, pw = W - L - R, ph = H - T - B, cw = pw / n;
      var X = function (i) { return L + cw * (i + 0.5); };
      var Y = function (p) { return T + (p - lo) / (hi - lo) * ph; };
      var s = '<svg viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H + '" role="group" aria-label="Griglia e arrivo di Luca in ogni Gran Premio">';
      s += '<defs><pattern id="hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="3" height="8" fill="rgba(255,255,255,.22)"/></pattern></defs>';
      for (var p = Math.ceil(lo / 5) * 5; p <= hi; p += 5) {
        s += '<line class="ch-grid' + (p % 10 === 0 ? ' is-key' : '') + '" x1="' + L + '" x2="' + (W - R) + '" y1="' + Y(p).toFixed(1) + '" y2="' + Y(p).toFixed(1) + '"/>';
        s += '<text class="ch-ax" x="' + (L - 10) + '" y="' + (Y(p) + 4).toFixed(1) + '" text-anchor="end">' + p + '°</text>';
      }
      gare.forEach(function (g, i) {
        var e = g.esito, x = X(i), d = descr(g);
        var cls = e.stato === 'finito' ? (diff(e) > 0 ? 'ch-up' : diff(e) < 0 ? 'ch-dn' : 'ch-eq') : '';
        s += '<g class="col" tabindex="0" data-i="' + i + '" role="img" aria-label="' + esc(d.t + '. ' + d.a + (d.b ? ' ' + d.b + '.' : '')) + '">';
        s += '<rect class="ch-band" x="' + (x - cw / 2).toFixed(1) + '" y="' + (T - 8) + '" width="' + cw.toFixed(1) + '" height="' + (ph + 16) + '" rx="8"/>';
        if (e.stato === 'assente') {
          s += '<rect class="ch-hatch" x="' + (x - cw * 0.26).toFixed(1) + '" y="' + T + '" width="' + (cw * 0.52).toFixed(1) + '" height="' + ph + '" rx="6"/>';
        } else {
          var y0 = Y(e.griglia);
          if (e.stato === 'finito') {
            var y1 = Y(e.arrivo);
            s += '<path class="ch-ln ' + cls + '" pathLength="1" d="M' + x.toFixed(1) + ' ' + y0.toFixed(1) + 'L' + x.toFixed(1) + ' ' + y1.toFixed(1) + '" style="--k:' + i + '"/>';
            s += '<circle class="ch-g" cx="' + x.toFixed(1) + '" cy="' + y0.toFixed(1) + '" r="6"/>';
            s += '<circle class="ch-f ' + cls + '" cx="' + x.toFixed(1) + '" cy="' + y1.toFixed(1) + '" r="7" style="--k:' + i + '"/>';
          } else {
            var yb = T + ph;
            s += '<path class="ch-ln ch-no" d="M' + x.toFixed(1) + ' ' + (y0 + 9).toFixed(1) + 'L' + x.toFixed(1) + ' ' + (yb - 18).toFixed(1) + '" style="--k:' + i + '"/>';
            s += '<circle class="ch-g" cx="' + x.toFixed(1) + '" cy="' + y0.toFixed(1) + '" r="6"/>';
            s += '<path class="ch-x" d="M' + (x - 6).toFixed(1) + ' ' + (yb - 14).toFixed(1) + 'L' + (x + 6).toFixed(1) + ' ' + (yb - 2).toFixed(1) + 'M' + (x + 6).toFixed(1) + ' ' + (yb - 14).toFixed(1) + 'L' + (x - 6).toFixed(1) + ' ' + (yb - 2).toFixed(1) + '" style="--k:' + i + '"/>';
          }
        }
        s += '<text class="ch-code" x="' + x.toFixed(1) + '" y="' + (H - B + 28) + '" text-anchor="middle">' + esc(g.paese) + '</text>';
        s += '<text class="ch-ax" x="' + x.toFixed(1) + '" y="' + (H - B + 47) + '" text-anchor="middle">' + esc(F.giornoNum(g.data) + ' ' + F.meseBreve(g.data)) + '</text>';
        s += '<rect class="ch-hit" x="' + (x - cw / 2).toFixed(1) + '" y="0" width="' + cw.toFixed(1) + '" height="' + H + '"/>';
        s += '</g>';
      });
      s += '</svg>';
      host.innerHTML = s;
      host.style.minWidth = (n * 46 + 70) + 'px';
      bind();
    }

    function hide() { tip.hidden = true; }
    function show(col) {
      var g = gare[+col.dataset.i], d = descr(g);
      tip.innerHTML = '<b>' + esc(d.t) + '</b><span>' + esc(d.a) + '</span>' + (d.b ? '<span>' + esc(d.b) + '</span>' : '') +
        (g.esito.stato === 'finito' ? '<span>' + (U.puntiGara(g.esito.arrivo) ? U.puntiGara(g.esito.arrivo) + ' punti' : 'Nessun punto') + '</span>' : '');
      tip.hidden = false;
      var a = col.querySelector('.ch-f') || col.querySelector('.ch-g') || col.querySelector('.ch-hatch');
      var r = a.getBoundingClientRect(), w = wrap.getBoundingClientRect();
      var x = clamp(r.left + r.width / 2 - w.left, 110, Math.max(110, w.width - 110));
      var below = r.top - w.top < 110;
      tip.style.left = x + 'px';
      tip.style.top = (below ? r.bottom - w.top + 14 : r.top - w.top - 14) + 'px';
      tip.style.transform = below ? 'translate(-50%,0)' : 'translate(-50%,-100%)';
    }
    function bind() {
      var cols = host.querySelectorAll('.col');
      Array.prototype.forEach.call(cols, function (c) {
        c.addEventListener('pointerenter', function () { show(c); });
        c.addEventListener('focus', function () { show(c); });
        c.addEventListener('blur', hide);
        c.addEventListener('click', function () { show(c); });
      });
      host.firstChild.addEventListener('pointerleave', hide);
    }

    draw();
    var t = 0, lastW = wrap.clientWidth;
    window.addEventListener('resize', function () {
      clearTimeout(t);
      t = setTimeout(function () { if (wrap.clientWidth !== lastW) { lastW = wrap.clientWidth; hide(); draw(); } }, 160);
    });
    if (U.reduce || !('IntersectionObserver' in window)) { wrap.classList.add('go'); return; }
    var io = new IntersectionObserver(function (es, o) {
      if (es[0].isIntersecting) { wrap.classList.add('go'); o.disconnect(); }
    }, { threshold: 0.3 });
    io.observe(wrap);
  }

  /* ---------- tabella gara per gara ---------- */
  function tabella() {
    var tb = $('#tabella tbody'); if (!tb) return;
    var gare = gareConEsito(true);
    var best = U.stats().migliorArrivo.n;
    tb.innerHTML = gare.map(function (g) {
      var e = g.esito, fin = e.stato === 'finito', d = diff(e), pt = fin ? U.puntiGara(e.arrivo) : 0;
      var cls = [];
      if (e.stato !== 'finito') cls.push('is-off');
      if (pt) cls.push('is-pt');
      if (g.n === best) cls.push('is-best');
      var sub = e.nota || g.circuito;
      return '<tr' + (cls.length ? ' class="' + cls.join(' ') + '"' : '') + '>' +
        '<td class="c-gp"><div class="gp"><span class="code">' + esc(g.paese) + '</span><div><b>' + esc(g.gp) + '</b><small>' + esc(sub) + '</small></div></div></td>' +
        '<td class="c-d hide-sm">' + esc(F.dataBreve(g.data)) + '</td>' +
        '<td>' + (e.griglia ? '<span class="num">' + F.pos(e.griglia) + '</span>' : '<span class="muted">—</span>') + '</td>' +
        '<td>' + (fin ? '<span class="num big">' + F.pos(e.arrivo) + '</span>' : '<span class="num muted">' + (e.stato === 'ritirato' ? 'RIT' : e.stato === 'annullato' ? 'ANN' : 'ASS') + '</span>') + '</td>' +
        '<td class="hide-xs">' + (fin ? '<span class="' + diffCls(d) + '">' + diffTxt(d) + '</span>' : '<span class="muted">—</span>') + '</td>' +
        '<td class="hide-md">' + (fin && e.distacco != null ? F.secondi(e.distacco) : '<span class="muted">—</span>') + '</td>' +
        '<td>' + (pt ? '<span class="pts">' + pt + '</span>' : '<span class="muted">' + (fin ? '0' : '—') + '</span>') + '</td>' +
        '<td class="c-v hide-md">' + (e.vince ? esc(e.vince) : '<span class="muted">—</span>') + '</td>' +
      '</tr>';
    }).join('');
  }

  /* ---------- classifica ---------- */
  function classifica() {
    var ol = $('#classifica'), sub = $('#class-s'); if (!ol) return;
    var c = LL.stagione.classifica, righe = c.righe, html = '', prev = 0;
    righe.forEach(function (r) {
      if (prev && r.pos - prev > 1) html += '<li class="is-gap" aria-hidden="true">…</li>';
      html += '<li class="' + (r.luca ? 'is-luca' : r.compagno ? 'is-mate' : '') + '">' +
        '<span class="pos">' + r.pos + '°</span>' +
        '<span class="nm"><b>' + esc(r.pilota) + '</b><small>' + esc(r.team) + '</small></span>' +
        '<span class="pt">' + F.num(r.punti) + '</span></li>';
      prev = r.pos;
    });
    ol.innerHTML = html;
    var g = LL.stagione.gare.filter(function (x) { return x.n === c.dopo; })[0];
    if (sub) sub.textContent = 'Dopo ' + (g ? 'il ' + g.gp : c.dopo + ' gare') + '. Qui trovi il vertice, il compagno di squadra e Luca.';
  }

  U.mod.stagione = { init: function () { ultimo(); chart(); tabella(); classifica(); } };
})();
