/* Genera le pagine di public/ da src/ (layout + pagine). Uso: node scripts/build.mjs
   - src/layout.html   : testata, menu, piè di pagina e script comuni
   - src/pages/*.html  : una pagina ciascuna; in cima un commento con i metadati (JSON)
   - Le cifre scritte nell'HTML (posizione, punti, prossimo GP...) arrivano da public/js/dati.js: sono quelle che
     si vedono anche senza JavaScript e per i motori di ricerca; il browser poi le ricalcola da solo.
   - Alla fine controlla: un solo h1 per pagina, id unici, link interni (anche i #frammenti), immagini
     (alt, width/height, file esistente, proporzioni giuste). Se qualcosa non va esce con errore.
   Non serve installare nulla: solo Node. */
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import vm from 'node:vm';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const pub = join(root, 'public');
const rd = (...p) => readFileSync(join(root, ...p), 'utf8');
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/* ---------- navigazione ---------- */
const NAV = [
  { key: 'stagione', href: '/stagione', label: 'Stagione' },
  { key: 'calendario', href: '/calendario', label: 'Calendario' },
  { key: 'carriera', href: '/carriera', label: 'Carriera' },
  { key: 'foto', href: '/foto', label: 'Foto' },
  { key: 'squadra', href: '/squadra', label: 'Squadra' },
  { key: 'fan-club', href: '/fan-club', label: 'Fan Club' }
];

/* ---------- versione per la cache: cambia da sola quando cambia un CSS o un JS ---------- */
const jsFiles = readdirSync(join(pub, 'js')).filter((f) => f.endsWith('.js')).sort();
const hash = createHash('md5');
hash.update(readFileSync(join(pub, 'css', 'style.css')));
for (const f of jsFiles) hash.update(readFileSync(join(pub, 'js', f)));
const V = hash.digest('hex').slice(0, 8);

/* ---------- dati del sito: dati.js + util.js eseguiti senza browser ---------- */
const win = { addEventListener() {}, pageYOffset: 0, innerHeight: 800 };
const ctx = vm.createContext({ window: win, document: {}, location: { search: '' }, console, Intl, Date, Math, JSON, performance: { now: () => 0 } });
for (const f of ['dati', 'util']) vm.runInContext(readFileSync(join(pub, 'js', f + '.js'), 'utf8'), ctx, { filename: f + '.js' });
const LL = win.LL, U = win.LLU, S = U.stats();
const num = (n) => Number(n).toLocaleString('it-IT');
const st = U.stato();
const nascita = new Date(LL.pilota.nascita + 'T12:00:00Z'), oggi = new Date();
let eta = oggi.getUTCFullYear() - nascita.getUTCFullYear();
if (oggi.getUTCMonth() < nascita.getUTCMonth() || (oggi.getUTCMonth() === nascita.getUTCMonth() && oggi.getUTCDate() < nascita.getUTCDate())) eta--;
const VAL = {
  posMondiale: S.posMondiale,
  punti: num(S.punti),
  migliorArrivo: S.migliorArrivo.v + '°',
  migliorArrivoGp: S.migliorArrivo.gp,
  migliorGriglia: S.migliorGriglia.v + '°',
  migliorGrigliaGp: S.migliorGriglia.gp,
  mediaGriglia: Math.round(S.mediaGriglia) + '°',
  mediaArrivo: Math.round(S.mediaArrivo) + '°',
  gp2026: num(S.gp2026),
  garePunti: num(S.garePunti),
  posGuadagnate: (S.posGuadagnate > 0 ? '+' : '') + num(S.posGuadagnate),
  gpMondiale: num(S.tot.gp),
  podiMondiale: num(S.tot.podi),
  puntiMondiale: num(S.tot.punti),
  giriVeloci: num(S.tot.giri),
  nGare: String(LL.stagione.gare.length),
  nFoto: String((LL.foto || []).length),
  prossimoGp: st.gara ? U.breve(st.gara) : '—',
  prossimoData: st.gara ? U.fmt.dataBreve(st.gara.data) : 'Stagione conclusa',
  prossimoGpNome: st.gara ? st.gara.gp : 'Stagione conclusa',
  prossimoCirc: st.gara ? st.gara.circuito : '',
  classificaSub: (() => { const c = LL.stagione.classifica, g = LL.stagione.gare.find((x) => x.n === c.dopo); return 'Dopo ' + (g ? 'il ' + g.gp : c.dopo + ' gare') + '. Qui trovi il vertice, il compagno di squadra e Luca.'; })(),
  eta: '(' + eta + ' anni)',
  igSeguaci: LL.pilota.seguaci,
  igData: LL.pilota.seguaciAl,
  aggiornato: LL.stagione.aggiornatoA
};

/* ---------- macro usate nelle pagine ---------- */
const ico = (n) => `<svg class="ic" aria-hidden="true"><use href="#i-${n}"/></svg>`;
const phead = (title, lead) =>
  `<section class="phead" aria-labelledby="h-pagina">
  <img class="phead-32" src="/img/numero-32.svg" alt="" width="866" height="519" aria-hidden="true">
  <div class="wrap phead-in">
    <h1 class="phead-t" id="h-pagina"><span class="ln"><span data-in="1">${title}</span></span></h1>
    <p class="lead" data-in="2">${lead}</p>
  </div>
</section>`;
function expand(html) {
  return html
    .replace(/\{\{i:([a-z]+)\}\}/g, (_m, n) => ico(n))
    .replace(/\{\{phead:([^|}]+)\|([^}]+)\}\}/g, (_m, t, l) => phead(t.trim(), l.trim()))
    .replace(/\{\{v:(\w+)\}\}/g, (_m, k) => {
      if (!(k in VAL)) throw new Error('valore sconosciuto: {{v:' + k + '}}');
      return esc(VAL[k]);
    });
}

const INTRO = `<!-- Luci di partenza: solo in home -->
<div class="intro-overlay" id="intro" role="presentation">
  <div class="gantry" aria-hidden="true">
    <div class="lights">
      <span class="lt"><i></i><i></i></span><span class="lt"><i></i><i></i></span><span class="lt"><i></i><i></i></span><span class="lt"><i></i><i></i></span><span class="lt"><i></i><i></i></span>
    </div>
  </div>
  <p class="intro-name" aria-hidden="true">Luca Lunetta <img class="n32" src="/img/numero-32.svg" alt="" width="866" height="519"></p>
  <button class="intro-skip" type="button">Salta l'intro</button>
</div>
`;

const PERSON = {
  '@context': 'https://schema.org', '@type': 'Person', name: 'Luca Lunetta', birthDate: LL.pilota.nascita,
  birthPlace: { '@type': 'Place', name: 'Roma' }, nationality: 'IT', jobTitle: 'Pilota motociclistico',
  description: 'Pilota italiano del Mondiale Moto2 con il BETA Tools SpeedRS Team, numero 32.',
  sameAs: ['https://www.instagram.com/lucalunetta58/']
};

/* ---------- costruzione ---------- */
const layout = rd('src', 'layout.html');
const built = [];
for (const f of readdirSync(join(root, 'src', 'pages')).filter((x) => x.endsWith('.html')).sort()) {
  const raw = rd('src', 'pages', f);
  const m = raw.match(/^<!--([\s\S]*?)-->\s*/);
  if (!m) throw new Error(f + ': manca il commento iniziale con i metadati');
  const meta = JSON.parse(m[1]);
  const home = meta.file === 'index';
  const content = expand(raw.slice(m[0].length));

  const path = home ? '/' : '/' + meta.file;
  const cur = (href) => (href === path ? ' aria-current="page"' : '');
  const nav = NAV.map((n) => `    <a href="${n.href}" data-spy${cur(n.href)}>${n.label}</a>`).join('\n');
  const menu = [{ href: '/', label: 'Home' }, ...NAV, { href: '/calendario#live', label: 'Live center' }]
    .map((n) => `    <a href="${n.href}"${cur(n.href)}>${n.label}</a>`).join('\n');
  const footnav = [{ href: '/', label: 'Home' }, ...NAV, { href: '/calendario#live', label: 'Live center' }]
    .map((n) => `      <a href="${n.href}">${n.label}</a>`).join('\n');
  const scripts = ['dati', 'util', 'fx', 'live', ...(meta.scripts || []), 'main']
    .map((s) => {
      if (!existsSync(join(pub, 'js', s + '.js'))) throw new Error(f + ': manca public/js/' + s + '.js');
      return `<script src="/js/${s}.js?v=${V}"${s === 'dati' ? '' : ' defer'}></script>`;
    }).join('\n');
  const jsonld = home ? `<script type="application/ld+json">\n${JSON.stringify(PERSON)}\n</script>\n` : '';
  const preload = meta.heroPreload
    ? '<link rel="preload" as="image" href="/img/luca-hero.webp" imagesrcset="/img/luca-hero-sm.webp 384w, /img/luca-hero.webp 768w" imagesizes="(max-width:820px) 60vw, 34vw" fetchpriority="high">\n'
    : '';

  const vars = {
    title: esc(meta.title), description: esc(meta.description), v: V,
    bodyClass: 'page-' + meta.file, preload, jsonld, intro: home ? INTRO : '',
    nav, menu, footnav, content, scripts, aggiornato: esc(VAL.aggiornato)
  };
  const html = layout.replace(/\{\{(\w+)\}\}/g, (_m, k) => {
    if (!(k in vars)) throw new Error('segnaposto sconosciuto nel layout: {{' + k + '}}');
    return vars[k];
  });
  writeFileSync(join(pub, meta.file + '.html'), html);
  built.push({ file: meta.file, meta, html, path });
}

/* ---------- controlli ---------- */
const errors = [], warns = [];
const bad = (p, msg) => errors.push(p + ': ' + msg);
const idsOf = (html) => [...html.matchAll(/\sid="([^"]+)"/g)].map((x) => x[1]);
const byPath = new Map(built.map((p) => [p.path, p]));
const webpSize = (buf) => {
  const kind = buf.toString('ascii', 12, 16);
  if (kind === 'VP8 ') return [buf.readUInt16LE(26) & 0x3fff, buf.readUInt16LE(28) & 0x3fff];
  if (kind === 'VP8L') { const b = buf.readUInt32LE(21); return [(b & 0x3fff) + 1, ((b >> 14) & 0x3fff) + 1]; }
  if (kind === 'VP8X') return [buf.readUIntLE(24, 3) + 1, buf.readUIntLE(27, 3) + 1];
  return null;
};
const titles = new Set();
for (const p of built) {
  const { html, file, meta } = p;
  const h1 = (html.match(/<h1[\s>]/g) || []).length;
  if (h1 !== 1) bad(file, `servono esattamente un h1, ce ne sono ${h1}`);
  const ids = idsOf(html), seen = new Set();
  ids.forEach((i) => { if (seen.has(i)) bad(file, 'id duplicato: ' + i); seen.add(i); });
  if (titles.has(meta.title)) bad(file, 'titolo uguale a quello di un\'altra pagina');
  titles.add(meta.title);
  if (meta.description.length > 175) warns.push(file + ': description lunga (' + meta.description.length + ')');
  if (/\{\{[^}]*\}\}/.test(html)) bad(file, 'segnaposto non espanso: ' + html.match(/\{\{[^}]*\}\}/)[0]);

  for (const mm of html.matchAll(/<(?:a|link)\b[^>]*?\bhref="([^"]*)"/g)) {
    const href = mm[1];
    if (!href || /^(https?:|mailto:|tel:)/.test(href)) continue;
    if (href === '#') continue;
    if (href.startsWith('#')) { if (!seen.has(href.slice(1))) bad(file, 'frammento inesistente: ' + href); continue; }
    if (!href.startsWith('/')) { bad(file, 'link relativo da evitare: ' + href); continue; }
    const [pathPart, frag] = href.split('#');
    const bare = pathPart.split('?')[0];
    const target = byPath.get(bare);
    if (target) { if (frag && !idsOf(target.html).includes(frag)) bad(file, `${href}: manca #${frag} in ${bare}`); continue; }
    if (!existsSync(join(pub, bare))) bad(file, 'link a una pagina che non esiste: ' + href);
  }
  for (const mm of html.matchAll(/<(?:img|script|source)\b[^>]*?\bsrc="([^"]*)"/g)) {
    const src = mm[1];
    if (/^(https?:|data:)/.test(src)) continue;
    if (!src.startsWith('/')) { bad(file, 'percorso relativo: ' + src); continue; }
    if (!existsSync(join(pub, src.split('?')[0]))) bad(file, 'file mancante: ' + src);
  }
  for (const mm of html.matchAll(/<img\b[^>]*>/g)) {
    const tag = mm[0];
    const src = (tag.match(/\bsrc="([^"]*)"/) || [])[1] || '';
    if (!/\balt="/.test(tag)) bad(file, 'img senza alt: ' + src);
    const w = +(tag.match(/\bwidth="(\d+)"/) || [])[1], h = +(tag.match(/\bheight="(\d+)"/) || [])[1];
    if (!w || !h) { bad(file, 'img senza width/height: ' + src); continue; }
    if (src.endsWith('.webp') && existsSync(join(pub, src))) {
      const real = webpSize(readFileSync(join(pub, src)));
      if (real && Math.abs(real[0] / real[1] - w / h) / (w / h) > 0.015) bad(file, `${src}: proporzioni ${w}x${h} diverse dal file ${real[0]}x${real[1]}`);
    }
  }
}
if (warns.length) console.warn('Avvisi:\n  ' + warns.join('\n  '));
if (errors.length) { console.error('Errori:\n  ' + errors.join('\n  ')); process.exit(1); }
console.log(`ok: ${built.length} pagine (${built.map((p) => p.file).join(', ')}), versione ${V}`);
