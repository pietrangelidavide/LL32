/* ==========================================================================
   Tessera del Fan Club: si gira (fronte/retro), si inclina col mouse, ci scrivi sopra il tuo nome
   e scarichi il fronte personalizzato. Il nome non lascia mai il dispositivo: niente invii, niente salvataggi.
   Misure in "scala tessera": il file sorgente è largo 1011 px (scripts/tessera.html), la targhetta del socio
   sta a 62,452 ed è larga 390 x 92.
   ========================================================================== */
(function () {
  'use strict';
  var U = window.LLU, $ = U.$, $$ = U.$$, reduce = U.reduce;
  var BASE = 1011, PLATE = { x: 62, y: 452, w: 390, h: 92 }, PAD_L = 26, PAD_R = 22, FS_MAX = 46, FS_MIN = 24;
  var FONT = '"Barlow Condensed","Arial Narrow",Arial,sans-serif';
  var root, face, nome, input, side = 'fronte', measure = null;

  function pulisci(v) { return String(v || '').replace(/\s+/g, ' ').trim().slice(0, 24); }
  function slug(s) { return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }

  /* corpo del nome (in scala tessera) perché entri nella targhetta */
  function corpo(txt) {
    if (!measure) measure = document.createElement('canvas').getContext('2d');
    measure.font = 'italic 700 100px ' + FONT;
    var w100 = measure.measureText(txt.toUpperCase()).width + txt.length * 2; // 2 = spaziatura .02em a corpo 100
    var avail = PLATE.w - PAD_L - PAD_R;
    return Math.max(FS_MIN, Math.min(FS_MAX, avail / w100 * 100));
  }
  function paint() {
    var v = pulisci(input.value);
    nome.textContent = v;
    if (!v) { nome.style.fontSize = ''; return; }
    nome.style.fontSize = (corpo(v) * face.clientWidth / BASE).toFixed(2) + 'px';
  }

  /* ---------- fronte / retro ---------- */
  function setSide(s) {
    side = s;
    root.dataset.side = s;
    $$('.tess-ctl button').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.side === s ? 'true' : 'false'); });
    $('#tess-f').setAttribute('aria-hidden', s === 'fronte' ? 'false' : 'true');
    $('#tess-b').setAttribute('aria-hidden', s === 'retro' ? 'false' : 'true');
  }

  /* ---------- inclinazione col puntatore (solo mouse, senza "riduci movimento") ---------- */
  function tilt() {
    var fine = false;
    try { fine = matchMedia('(pointer: fine)').matches; } catch (e) {}
    if (!fine || reduce) return;
    var t = $('#tess-tilt'), run = false, rx = 0, ry = 0, gx = 50, gy = 50;
    function apply() {
      run = false;
      t.style.setProperty('--rx', rx.toFixed(2) + 'deg');
      t.style.setProperty('--ry', ry.toFixed(2) + 'deg');
      root.style.setProperty('--gx', gx.toFixed(1) + '%');
      root.style.setProperty('--gy', gy.toFixed(1) + '%');
    }
    root.addEventListener('pointermove', function (e) {
      if (e.pointerType === 'touch') return;
      var r = root.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      ry = (x - 0.5) * 14; rx = (0.5 - y) * 10; gx = x * 100; gy = y * 100;
      root.classList.add('is-tilt');
      if (!run) { run = true; requestAnimationFrame(apply); }
    });
    root.addEventListener('pointerleave', function () {
      rx = 0; ry = 0; gx = 50; gy = 50; root.classList.remove('is-tilt');
      if (!run) { run = true; requestAnimationFrame(apply); }
    });
  }

  /* ---------- fronte personalizzato in PNG ---------- */
  function carica(src) {
    return new Promise(function (ok, ko) { var i = new Image(); i.onload = function () { ok(i); }; i.onerror = ko; i.src = src; });
  }
  function disegna(nomeSocio) {
    var font = document.fonts && document.fonts.load ? document.fonts.load('italic 700 40px ' + FONT) : null;
    return Promise.all([carica('/img/tessera-fronte.png'), font]).then(function (r) {
      var im = r[0], k = im.naturalWidth / BASE, c = document.createElement('canvas');
      c.width = im.naturalWidth; c.height = im.naturalHeight;
      var x = c.getContext('2d');
      x.drawImage(im, 0, 0);
      var fs = corpo(nomeSocio) * k;
      x.font = 'italic 700 ' + fs + 'px ' + FONT;
      x.fillStyle = '#fff'; x.textBaseline = 'middle'; x.textAlign = 'left';
      if ('letterSpacing' in x) x.letterSpacing = (0.02 * fs).toFixed(2) + 'px';
      x.fillText(nomeSocio.toUpperCase(), (PLATE.x + PAD_L) * k, (PLATE.y + PLATE.h / 2 + 3) * k, (PLATE.w - PAD_L - PAD_R) * k);
      return new Promise(function (ok, ko) { c.toBlob(function (b) { b ? ok(b) : ko(new Error('png')); }, 'image/png'); });
    });
  }
  function salva(blob, filename) {
    var u = URL.createObjectURL(blob), a = document.createElement('a');
    a.href = u; a.download = filename; a.rel = 'noopener';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(u); }, 5000);
  }

  U.mod.tessera = {
    init: function () {
      root = $('#tess'); input = $('#tess-input'); face = $('#tess-f'); nome = $('#tess-nome');
      if (!root || !input || !face || !nome) return;
      setSide('fronte');

      $$('.tess-ctl button').forEach(function (b) { b.addEventListener('click', function () { setSide(b.dataset.side); }); });
      root.addEventListener('click', function () { setSide(side === 'fronte' ? 'retro' : 'fronte'); });

      input.addEventListener('input', function () { if (side !== 'fronte') setSide('fronte'); paint(); });
      $('#tess-form').addEventListener('submit', function (e) { e.preventDefault(); input.blur(); });
      if ('ResizeObserver' in window) new ResizeObserver(paint).observe(face); else window.addEventListener('resize', paint);
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(paint);
      paint();
      tilt();

      var dl = $('#tess-dl-f'), forzaOriginale = false;
      dl.addEventListener('click', function (e) {
        var v = pulisci(input.value);
        if (!v || forzaOriginale) { forzaOriginale = false; return; } // senza nome si scarica la tessera com'è
        e.preventDefault();
        disegna(v).then(function (blob) { salva(blob, 'tessera-fan-club-lunetta32-' + (slug(v) || 'socio') + '.png'); })
          .catch(function () { forzaOriginale = true; dl.click(); });
      });
    }
  };
})();
