/* Genera le due immagini della tessera (fronte e retro) da scripts/tessera.html.
   Uso: node scripts/tessera.mjs   (serve Playwright con Chromium: npm i playwright)
   Scrive public/img/tessera-fronte|retro.png (2022x1276, trasparente agli angoli)
   e le versioni .webp usate dal sito (1200 px di larghezza, via sharp se c'è, altrimenti solo PNG). */
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

const require = createRequire(import.meta.url);
const here = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(here, '..', 'public', 'img');
let chromium;
try { ({ chromium } = require('playwright')); }
catch { ({ chromium } = require(path.join(process.env.NODE_PATH || '', 'playwright'))); }

const b = await chromium.launch();
const pg = await (await b.newContext({ deviceScaleFactor: 2, viewport: { width: 1200, height: 900 } })).newPage();
await pg.goto(pathToFileURL(path.join(here, 'tessera.html')).href);
await pg.evaluate(() => document.fonts.ready);
await pg.waitForFunction(() => [...document.images].every((i) => i.complete && i.naturalWidth > 0));
for (const [id, nome] of [['fronte', 'tessera-fronte'], ['retro', 'tessera-retro']]) {
  const el = await pg.$('#' + id);
  const png = path.join(out, nome + '.png');
  await el.screenshot({ path: png, omitBackground: true });
  console.log('scritto', path.relative(process.cwd(), png));
  try {
    const sharp = require('sharp');
    const webp = path.join(out, nome + '.webp');
    await sharp(png).resize({ width: 1200 }).webp({ quality: 90, alphaQuality: 100 }).toFile(webp);
    console.log('scritto', path.relative(process.cwd(), webp));
  } catch { console.log('sharp non trovato: .webp non aggiornato'); }
}
await b.close();
