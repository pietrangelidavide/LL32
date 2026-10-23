/* ==========================================================================
   Bandiere dei Paesi ospitanti, disegnate in SVG (3:2) e mostrate "al vento"
   nella scheda dell'ultimo Gran Premio.
   Le regioni spagnole (CAT, ARA, VAL) mostrano la bandiera della Spagna.
   ========================================================================== */
(function () {
  'use strict';
  var U = window.LLU;
  var W = '#f5f5f2';

  function r(x, y, w, h, f) { return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="' + f + '"/>'; }
  function star(cx, cy, R, n, ratio, f) {
    var p = [], i, a, rad, k = ratio || (n === 5 ? 0.382 : 0.5);
    for (i = 0; i < n * 2; i++) {
      a = -Math.PI / 2 + i * Math.PI / n; rad = i % 2 ? R * k : R;
      p.push((cx + rad * Math.cos(a)).toFixed(2) + ',' + (cy + rad * Math.sin(a)).toFixed(2));
    }
    return '<polygon points="' + p.join(' ') + '" fill="' + (f || W) + '"/>';
  }
  function vthirds(a, b, c) { return r(0, 0, 20, 40, a) + r(20, 0, 20.1, 40, b) + r(40, 0, 20, 40, c); }
  function hthirds(a, b, c) { return r(0, 0, 60, 13.4, a) + r(0, 13.33, 60, 13.4, b) + r(0, 26.66, 60, 13.4, c); }

  /* bandiera del Regno Unito su base 60x30 (Wikimedia, semplificata) */
  function jack() {
    return '<clipPath id="uj-s"><path d="M0 0v30h60V0z"/></clipPath>' +
      '<clipPath id="uj-t"><path d="M30 15h30v15zv15H0zH0V0zV0h30z"/></clipPath>' +
      '<g clip-path="url(#uj-s)"><path d="M0 0v30h60V0z" fill="#012169"/>' +
      '<path d="M0 0L60 30M60 0L0 30" stroke="#fff" stroke-width="6"/>' +
      '<path d="M0 0L60 30M60 0L0 30" clip-path="url(#uj-t)" stroke="#c8102e" stroke-width="4"/>' +
      '<path d="M30 0v30M0 15h60" stroke="#fff" stroke-width="10"/>' +
      '<path d="M30 0v30M0 15h60" stroke="#c8102e" stroke-width="6"/></g>';
  }

  function stripes(n, a, b) {
    var s = '', i, h = 40 / n;
    for (i = 0; i < n; i++) s += r(0, (i * h).toFixed(3), 60, (h + 0.05).toFixed(3), i % 2 ? b : a);
    return s;
  }

  var F = {
    THA: function () { return r(0, 0, 60, 40, '#a51931') + r(0, 6.67, 60, 26.66, W) + r(0, 13.33, 60, 13.34, '#2d2a4a'); },
    BRA: function () {
      return r(0, 0, 60, 40, '#009b3a') + '<polygon points="30,3.5 56.5,20 30,36.5 3.5,20" fill="#fedf00"/>' +
        '<circle cx="30" cy="20" r="9.2" fill="#002776"/>' +
        '<path d="M21.2 21.8Q31.5 15.6 38.8 22.6" fill="none" stroke="#fff" stroke-width="1.9"/>';
    },
    USA: function () {
      var s = stripes(13, '#b22234', W), i, j, n;
      s += r(0, 0, 24, 21.54, '#3c3b6e');
      for (i = 0; i < 9; i++) {
        n = i % 2 ? 5 : 6;
        for (j = 0; j < n; j++) s += star((i % 2 ? 4 : 2) + j * 4, 1.3 + i * 2.4, 1, 5);
      }
      return s;
    },
    ESP: function () { return r(0, 0, 60, 40, '#aa151b') + r(0, 10, 60, 20, '#f1bf00'); },
    FRA: function () { return vthirds('#0055a4', W, '#ef4135'); },
    ITA: function () { return vthirds('#009246', W, '#ce2b37'); },
    HUN: function () { return hthirds('#ce2939', W, '#477050'); },
    CZE: function () { return r(0, 0, 60, 20, W) + r(0, 20, 60, 20, '#d7141a') + '<polygon points="0,0 30,20 0,40" fill="#11457e"/>'; },
    NED: function () { return hthirds('#ae1c28', W, '#21468b'); },
    GER: function () { return hthirds('#111', '#dd0000', '#ffce00'); },
    AUT: function () { return hthirds('#ed2939', W, '#ed2939'); },
    JPN: function () { return r(0, 0, 60, 40, W) + '<circle cx="30" cy="20" r="12" fill="#bc002d"/>'; },
    INA: function () { return r(0, 0, 60, 20.05, '#ce1126') + r(0, 20, 60, 20, W); },
    GBR: function () { return '<g transform="scale(1,1.3333)">' + jack() + '</g>'; },
    AUS: function () {
      return r(0, 0, 60, 40, '#00247d') + '<g transform="scale(.5,.6667)">' + jack() + '</g>' +
        star(15, 30, 6.4, 7, 0.42) + star(45, 7.3, 2.9, 7, 0.42) + star(36.5, 17.3, 2.9, 7, 0.42) +
        star(53.5, 16.7, 2.9, 7, 0.42) + star(45, 34.7, 3.3, 7, 0.42) + star(49.8, 22, 1.7, 5);
    },
    MAL: function () {
      return stripes(14, '#cc0001', W) + r(0, 0, 30, 22.86, '#010066') +
        '<circle cx="11.2" cy="11.43" r="7" fill="#fc0"/><circle cx="13.1" cy="11.43" r="5.7" fill="#010066"/>' +
        star(19.8, 11.43, 5.6, 14, 0.55, '#fc0');
    },
    QAT: function () {
      var p = 'M0 0H17', i;
      for (i = 0; i < 9; i++) p += 'L25 ' + ((i + 0.5) * 40 / 9).toFixed(2) + 'L17 ' + ((i + 1) * 40 / 9).toFixed(2);
      return r(0, 0, 60, 40, '#8a1538') + '<path d="' + p + 'H0Z" fill="#fff"/>';
    },
    POR: function () {
      return r(0, 0, 24, 40, '#006600') + r(24, 0, 36, 40, '#ff0000') +
        '<circle cx="24" cy="20" r="7" fill="#ffe000"/><path d="M20.8 15.6h6.4v5.2a3.2 3.2 0 0 1-6.4 0z" fill="#fff" stroke="#ff0000" stroke-width="1.1"/>' +
        '<rect x="22.5" y="17.4" width="3" height="3" fill="#003399"/>';
    },
    RSM: function () {
      return r(0, 0, 60, 20, W) + r(0, 20, 60, 20, '#5eb6e4') +
        '<circle cx="30" cy="20" r="6.2" fill="none" stroke="#5d8a3a" stroke-width="1.6"/><circle cx="30" cy="20" r="3.6" fill="#f2c200"/>';
    }
  };
  var ALIAS = { CAT: 'ESP', ARA: 'ESP', VAL: 'ESP' };
  var NOMI = {
    THA: 'Thailandia', BRA: 'Brasile', USA: 'Stati Uniti', ESP: 'Spagna', FRA: 'Francia', ITA: 'Italia', HUN: 'Ungheria',
    CZE: 'Repubblica Ceca', NED: 'Paesi Bassi', GER: 'Germania', GBR: 'Regno Unito', RSM: 'San Marino', AUT: 'Austria',
    JPN: 'Giappone', INA: 'Indonesia', AUS: 'Australia', MAL: 'Malesia', QAT: 'Qatar', POR: 'Portogallo'
  };

  /* bandiera a scacchi: se un Paese non è nell'elenco */
  function scacchi() {
    var s = r(0, 0, 60, 40, W), i, j;
    for (i = 0; i < 8; i++) for (j = 0; j < 12; j++) if ((i + j) % 2 === 0) s += r(j * 5, i * 5, 5, 5, '#111');
    return s;
  }

  function svg(code) {
    var k = ALIAS[code] || code, f = F[k];
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 40" preserveAspectRatio="none">' + (f ? f() : scacchi()) + '</svg>';
  }

  /* bandiera "al vento": strisce verticali che oscillano sfasate */
  var N = 56;
  function html(code) {
    var i, s = '<div class="flag" role="img" aria-label="Bandiera: ' + (NOMI[ALIAS[code] || code] || code) + '" style="--n:' + N + '">';
    for (i = 0; i < N; i++) s += '<i style="--i:' + i + '"></i>';
    return s + '</div>';
  }
  function paint(root) {
    var el = root.querySelector('.flag'); if (!el) return;
    el.style.setProperty('--img', 'url("data:image/svg+xml,' + encodeURIComponent(svg(el.dataset.code)) + '")');
    sway(el, N, 5.5, 3.2, N * 0.11);
  }

  /* Ogni striscia sale e scende in fase sfasata; per non far vedere i "gradini" tra una striscia e l'altra
     la inclino (skewY) di quanto serve a raccordarla con la vicina. L'angolo dipende dalle dimensioni reali. */
  function sway(el, n, amp, period, spread) {
    function set() {
      var cs = getComputedStyle(el), w = parseFloat(cs.width), h = parseFloat(cs.height);
      if (!w || !h) return;
      /* strisce affiancate con 1px di sovrapposizione: niente righe scure tra l'una e l'altra */
      el.style.setProperty('--W', w + 'px');
      el.style.setProperty('--p', (w / n) + 'px');
      var k = 2 * Math.PI * (spread / period) / n;     /* sfasamento in radianti tra due strisce vicine */
      var a = amp / 100 * h;                           /* ampiezza all'estremità libera, in px */
      el.style.setProperty('--sk', (Math.atan(a * k / (w / n)) * 180 / Math.PI).toFixed(2) + 'deg');
    }
    set();
    if (window.ResizeObserver) new ResizeObserver(set).observe(el);
    else window.addEventListener('resize', set);
  }

  /* stoffa al vento per la bandiera del Fan Club (immagine in img/bandiera-fanclub-arancio.svg, stile in CSS) */
  function cloth(el, n) {
    var i, h = '';
    for (i = 0; i < n; i++) h += '<i style="--i:' + i + '"></i>';
    el.style.setProperty('--n', n);
    el.innerHTML = h;
    if (n > 1) sway(el, n, 3.4, 4, 5.2);
  }
  U.mod.bandiere = {
    init: function () {
      var f = U.$('#fc-flag');
      if (f) cloth(f, U.reduce ? 1 : (window.innerWidth <= 820 ? 60 : 112));
    }
  };

  U.flag = {
    nome: function (code) { return NOMI[ALIAS[code] || code] || code; },
    html: function (code) { return html(code).replace('<div class="flag"', '<div class="flag" data-code="' + code + '"'); },
    paint: paint,
    svg: svg
  };
})();
