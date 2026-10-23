/* ==========================================================================
   Galleria a colonne + lightbox (tastiera, swipe, <dialog> nativo)
   ========================================================================== */
(function () {
  'use strict';
  var U = window.LLU, LL = window.LL, $ = U.$, $$ = U.$$, esc = U.esc;
  var foto = LL.foto || [], dlg, img, cap, count, idx = 0, opener = null;

  function render() {
    var g = $('#galleria'); if (!g) return;
    g.innerHTML = foto.map(function (f, i) {
      var h640 = Math.round(f.h * 640 / f.w);
      return '<figure class="ph reveal" style="--c:' + esc(f.c) + '">' +
        '<button type="button" data-i="' + i + '" aria-label="Ingrandisci: ' + esc(f.titolo) + '. ' + esc(f.testo) + '">' +
          '<img src="img/' + f.id + '-640.webp" srcset="img/' + f.id + '-640.webp 640w, img/' + f.id + '.webp ' + f.w + 'w" sizes="(max-width:560px) 50vw, (max-width:1100px) 50vw, 33vw" width="640" height="' + h640 + '" alt="" loading="lazy" decoding="async">' +
        '</button>' +
        '<figcaption><b>' + esc(f.titolo) + '</b><span>' + esc(f.testo) + '</span></figcaption>' +
      '</figure>';
    }).join('');
    g.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-i]'); if (!b) return;
      open(+b.dataset.i, b);
    });
  }

  function show(i) {
    idx = (i + foto.length) % foto.length;
    var f = foto[idx];
    img.classList.remove('in');
    img.src = 'img/' + f.id + '.webp';
    img.width = f.w; img.height = f.h;
    img.alt = f.testo;
    cap.textContent = f.titolo + '. ' + f.testo;
    count.textContent = (idx + 1) + ' / ' + foto.length;
    [1, -1].forEach(function (d) { var n = foto[(idx + d + foto.length) % foto.length]; new Image().src = 'img/' + n.id + '.webp'; });
  }
  function open(i, from) {
    opener = from || null;
    show(i);
    if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open', '');
    document.documentElement.classList.add('lb-open');
  }
  function close() { if (dlg.open) dlg.close(); }

  U.mod.galleria = {
    init: function () {
      render();
      dlg = $('#lb'); if (!dlg || !foto.length) return;
      img = $('#lb-img'); cap = $('#lb-cap'); count = $('#lb-count');
      $('.lb-x', dlg).addEventListener('click', close);
      $('.lb-p', dlg).addEventListener('click', function () { show(idx - 1); });
      $('.lb-n', dlg).addEventListener('click', function () { show(idx + 1); });
      dlg.addEventListener('click', function (e) { if (e.target === dlg || e.target.classList.contains('lb-in')) close(); });
      dlg.addEventListener('close', function () {
        document.documentElement.classList.remove('lb-open');
        if (opener && document.contains(opener)) opener.focus({ preventScroll: true });
      });
      dlg.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowLeft') { show(idx - 1); e.preventDefault(); }
        else if (e.key === 'ArrowRight') { show(idx + 1); e.preventDefault(); }
      });
      var sx = null;
      dlg.addEventListener('pointerdown', function (e) { if (e.pointerType === 'touch') sx = e.clientX; });
      dlg.addEventListener('pointerup', function (e) {
        if (sx == null) return;
        var dx = e.clientX - sx; sx = null;
        if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1));
      });
    }
  };
})();
