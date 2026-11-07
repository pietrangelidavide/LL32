# Fan Club Luca Lunetta #32

Sito del Fan Club di Luca Lunetta, pilota Moto2. Una **prima pagina** che racconta Luca e porta ai
**approfondimenti nella barra di navigazione**: Stagione, Calendario (con il live center), Carriera, Foto, Squadra e Fan Club
(con la tessera da personalizzare e scaricare).
Statico, senza cookie né tracciamento. Le pagine pubblicate stanno in `public/` e sono generate da `src/`.

## Struttura

| Pagina | Indirizzo | Sorgente |
|---|---|---|
| Home | `/` | `src/pages/index.html` |
| Stagione | `/stagione` | `src/pages/stagione.html` |
| Calendario e live | `/calendario` (live: `/calendario#live`) | `src/pages/calendario.html` |
| Carriera | `/carriera` | `src/pages/carriera.html` |
| Foto | `/foto` | `src/pages/foto.html` |
| Squadra | `/squadra` | `src/pages/squadra.html` |
| Fan Club e tessera | `/fan-club` | `src/pages/fan-club.html` |

Testata, menu, piè di pagina e icone sono in `src/layout.html` e valgono per tutte le pagine.

## Modificare le pagine

I file `public/*.html` sono **generati**: non si modificano a mano. Si cambia `src/` e si rilancia la build:

```bash
node scripts/build.mjs
```

La build compone layout e pagine, calcola dai dati (`dati.js`) i valori scritti nel codice iniziale (posizione, punti,
prossimo GP, numero di foto…), aggiorna da sola il parametro `?v=` di CSS e JS e **si ferma con un errore** se trova
più di un titolo principale, `id` ripetuti, link o ancore interne rotti, immagini senza `alt`, `width`/`height` o con proporzioni sbagliate.
Ogni pagina inizia con un commento JSON (`file`, `title`, `description`, `scripts`) letto dalla build.

## Anteprima in locale

```bash
npx wrangler dev
```

Gli indirizzi puliti (`/stagione`, `/fan-club`…) funzionano come online. Con un server qualunque su `public/` apri invece
`/stagione.html`, `/fan-club.html` e così via. Aggiungi `?nointro` per saltare le luci di partenza (si vedono solo in home).
Per provare il live in un momento preciso: `?now=2026-10-24T02:45:00Z` (orario UTC).

## Aggiornare i dati

Tutto ciò che cambia durante la stagione sta in **`public/js/dati.js`**. Il resto del sito si ricalcola da solo
(punti, posizioni guadagnate, medie, grafico, tabelle, contatori, prossimo GP).

**Dopo ogni gara**
1. Nel GP giusto di `stagione.gare` aggiungi `esito`:
   `esito: { stato: "finito", griglia: 18, arrivo: 12, distacco: 21.4, vince: "Nome", nota: "…" }`
   (`stato` può essere `"finito"`, `"ritirato"` o `"assente"`) Se la gara è stata annullata (maltempo, ecc.) usa `esito: { stato: "annullato", nota: "…" }`: non conta come GP corso, nel grafico non compare e nel calendario e nella tabella resta con l'etichetta "Annullata".)
2. Aggiorna `stagione.classifica` (`dopo` = numero dell'ultimo GP, e le righe che conosci) e `stagione.aggiornatoA`.
3. La scheda "Ultimo Gran Premio" mostra l'ultimo GP con `esito` finito o ritirato (in caso di ritiro, al posto dell'arrivo compare "Ritirato") e da sola la bandiera del Paese ospitante (CAT, ARA e VAL usano la Spagna). Un Paese nuovo si aggiunge in `public/js/bandiere.js`.

**Orari dei weekend**: aggiungi un blocco in `weekend`, con il numero del GP come chiave e le sessioni in **UTC**
(la "Z" finale). Il sito le mostra in ora italiana. Senza orari, per quel GP compare solo il conto alla rovescia in giorni.

**Risultati delle sessioni**: dopo ogni sessione aggiungi alla sessione, dentro `weekend`, la classifica Moto2 in `ris`:
una riga per pilota, nell'ordine di arrivo, `["Nome Cognome", "2:04.673"]`. I distacchi li calcola il sito dal primo tempo.
Casi particolari: terza cella = posizione da mostrare se non è il numero d'ordine (`"NC"`, `"2–3"`), quarta cella = testo al posto del tempo (`"senza tempo"`).
`luca` (facoltativo) sostituisce la frase sotto il nome della sessione, `nota` aggiunge un commento sotto la tabella.
La riga di Luca si riconosce dal nome in `pilota.nome`: nella tabella è evidenziata e il suo piazzamento compare nella riga della sessione.
Le sessioni senza `ris` restano righe semplici. Finita la gara il pannello passa subito al GP successivo: i risultati della gara non vengono più mostrati e non serve inserirli (si inserisce l'`esito`).

**Foto**: metti i file in `public/img/` (WebP, una versione intera `nome.webp` e una piccola `nome-640.webp`)
e aggiungi la riga in `foto` (`id`, `w`, `h`, colore `c` e `titolo`, che serve solo come testo alternativo: il collage non mostra didascalie).
Il collage dispone le foto in ordine, in righe a tutta larghezza, calcolando da solo quante ne stanno in ogni riga (nessun ritaglio a riposo).

**E-mail del management**: compila `contatti.email` e comparirà il pulsante "Scrivi al management".

**Fan Club**: in `fanClub` metti il nome utente Instagram del Fan Club, un'e-mail e/o il link di un gruppo (WhatsApp, Telegram…).
I pulsanti compaiono in fondo alla pagina Fan Club solo per i campi compilati.

## La tessera del Fan Club

Sulla pagina `/fan-club` la tessera si gira (fronte/retro), si inclina col mouse e ci si scrive sopra il proprio nome,
poi si scarica il fronte personalizzato in PNG. Il nome **resta sul dispositivo**: non viene inviato né salvato da nessuna parte.
Senza nome si scarica la tessera così com'è. La logica è in `public/js/tessera.js`.

Le immagini (`public/img/tessera-fronte|retro.png`, 2022×1276, e le versioni `.webp` per il sito) nascono da
`scripts/tessera.html`, con i colori e il carattere del sito: asfalto, giallo fluo del 32 e arancio della tuta.
Per rigenerarle dopo una modifica (servono Playwright e sharp):

```bash
NODE_PATH=$(npm root -g) node scripts/tessera.mjs
```

La targhetta del socio sta a x 62, y 452 e misura 390×92 (scala 1011 px di larghezza): se la sposti,
aggiorna `PLATE` in `public/js/tessera.js` e lo spazio in `.tess-nome` di `public/css/style.css`.

## Com'è fatta la home

Hero con la bandiera del Fan Club, Luca, il nome e il 32 (senza scheda anagrafica); nastro;
**live center in versione compatta** (conto alla rovescia e link agli orari); **fascia Fan Club con la tessera** (porta a `/fan-club`);
**indice "Entra nel box"** con cinque tessere (Stagione, Calendario, Carriera, Foto, Squadra: ognuna mostra un dato vivo);
interludio sulle posizioni guadagnate. L'ordine delle sezioni si cambia spostando i blocchi in `src/pages/index.html`.
Nelle altre pagine restano: in **Stagione** i numeri, l'ultimo GP e il grafico; in **Calendario** live center, corsia orizzontale
con **specchietto** (si tocca o si trascina per scorrere in fretta, segue i filtri, funziona anche con le frecce) e "dove vedere Luca";
in **Foto** il collage a tutta larghezza con ingrandimento; in **Carriera** la scheda di Luca e la cronologia.
Su tutte le pagine la pillola "Live center" in testata diventa "In diretta" quando c'è una sessione in corso.

La bandiera dell'hero è `public/img/bandiera-fanclub-arancio.svg` (testo convertito in tracciati, così si vede ovunque) e Luca è
il ritaglio `public/img/luca-hero.webp` (più la versione piccola `luca-hero-sm.webp`). Le bandiere sono fatte di strisce verticali
che ondeggiano, ognuna inclinata quanto serve a raccordarsi con la vicina, così il bordo resta liscio (`public/js/bandiere.js`).
Il 32 giallo è quello vero della moto (foto "Dall'alto"), raddrizzato e ridisegnato in vettoriale (`public/img/numero-32.svg`). L'arancione viene dalla tuta nelle foto (`--arancio` in `public/css/style.css`).

## Il live

Il sito non incorpora dirette: mostra il conto alla rovescia, gli orari in ora italiana e i collegamenti ufficiali
(Sky Sport MotoGP, TV8, MotoGP VideoPass, live timing). Quando una sessione è in corso, il sito passa
automaticamente in stato "In diretta".

## Pubblicazione

`wrangler.jsonc` è già pronto per Cloudflare Workers con asset statici (`npx wrangler deploy`).
La cartella `public/` funziona anche su qualsiasi hosting statico (GitHub Pages, Netlify, ecc.).
Il file `public/_headers` vale per Cloudflare e Netlify: pagine, CSS e JS vengono sempre riconvalidati, così dopo un
aggiornamento nessuno vede CSS e JS di versioni diverse. Il parametro `?v=` di CSS e JS lo aggiorna la build:
dopo ogni modifica a `src/`, CSS o JS lancia `node scripts/build.mjs` prima di pubblicare.

## Crediti e licenze

- Foto dal profilo Instagram @lucalunetta58. Marchi e nomi dei partner appartengono ai rispettivi proprietari.
- Font: Unbounded e Barlow / Barlow Condensed, licenza SIL OFL 1.1 (testi in `public/fonts/`).
- Moto2™ e MotoGP™ sono marchi dei rispettivi proprietari.
