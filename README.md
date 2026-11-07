# Fan Club Luca Lunetta #32

Sito del Fan Club di Luca Lunetta, pilota Moto2: live center, stagione 2026, calendario, carriera, foto e squadra.
Statico, senza build, senza cookie né tracciamento. Tutto sta nella cartella `public/`.

## Anteprima in locale

```bash
cd public
python3 -m http.server 8000
```

Poi apri `http://localhost:8000`. Aggiungi `?nointro` per saltare le luci di partenza.
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
I pulsanti compaiono nella sezione "Tifa con il Fan Club" solo per i campi compilati.

## Com'è fatta la pagina

Ordine delle sezioni: hero con la bandiera del Fan Club, live center, posizioni guadagnate, stagione, **foto** (collage a tutta
larghezza: righe di foto unite che scivolano di lato mentre scorri, il riquadro sotto il mouse si allarga, un tocco apre l'ingrandimento),
**calendario** (corsia orizzontale che si scorre o si trascina, con sotto lo **specchietto**: una miniatura di tutti i Gran Premi
in cui si tocca o si trascina la finestra per scorrere in fretta; segue i filtri e si usa anche con le frecce), carriera, Luca, squadra,
dove vedere Luca, Fan Club.
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
Il file `public/_headers` vale per Cloudflare e Netlify: pagina, CSS e JS vengono sempre riconvalidati, così dopo un
aggiornamento nessuno vede CSS e JS di versioni diverse. Se cambi CSS o JS aggiorna anche il parametro `?v=` in `index.html`.

## Crediti e licenze

- Foto dal profilo Instagram @lucalunetta58. Marchi e nomi dei partner appartengono ai rispettivi proprietari.
- Font: Unbounded e Barlow / Barlow Condensed, licenza SIL OFL 1.1 (testi in `public/fonts/`).
- Moto2™ e MotoGP™ sono marchi dei rispettivi proprietari.
