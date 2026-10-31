/* ==========================================================================
   LUCA LUNETTA · DATI DEL SITO
   Tutto ciò che cambia durante la stagione sta in questo file:
   risultati dei GP, classifica, orari delle sessioni, foto.
   Dopo ogni gara basta compilare la riga "esito" del GP e aggiornare
   la classifica: il resto del sito si ricalcola da solo.
   Gli orari delle sessioni sono in UTC (la "Z" finale); il sito li mostra in ora italiana.
   ========================================================================== */
window.LL = {

  /* ---------- Profilo ---------- */
  pilota: {
    nome: "Luca Lunetta",
    numero: 32,
    nascita: "2006-05-27",
    luogoNascita: "Roma",
    nazione: "Italia",
    altezza: 177,
    peso: 62,
    classe: "Moto2",
    team: "BETA Tools SpeedRS Team",
    moto: "Boscoscuro",
    instagram: "lucalunetta58",
    seguaci: "38,2 mila",
    seguaciAl: "23 ottobre 2026"
  },

  /* ---------- Contatti (compila per attivare il pulsante e-mail) ---------- */
  contatti: {
    email: "",          // es. "management@..." : se vuoto il pulsante e-mail non compare
    managerNome: "Diego Tavano",
    managerSocieta: "Front Row"
  },

  /* ---------- Fan Club (compila i campi: quelli vuoti non compaiono sul sito) ---------- */
  fanClub: {
    nome: "Fan Club Luca Lunetta #32",
    instagram: "",       // solo il nome utente, senza @ (es. "fanclub.lunetta32")
    email: "",           // es. "fanclub@..."
    gruppoUrl: "",       // link a un gruppo (WhatsApp, Telegram, Facebook...)
    gruppoEtichetta: "Entra nel gruppo"
  },

  /* ---------- Link utili per vedere Luca ---------- */
  link: {
    instagram: "https://www.instagram.com/lucalunetta58/",
    threads: "https://www.threads.net/@lucalunetta58",
    liveTiming: "https://www.motogp.com/en/live+timing",
    videopass: "https://www.motogp.com/en/videopass",
    sky: "https://sport.sky.it/motogp",
    tv8: "https://www.tv8.it",
    calendarioUfficiale: "https://www.motogp.com/en/calendar"
  },

  /* ---------- Punti Moto2 (posizione 1 = 25 punti ... 15 = 1 punto) ---------- */
  puntiPosizione: [25, 20, 16, 13, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1],

  /* ---------- Stagione 2026 ----------
     esito.stato: "finito" | "ritirato" | "assente"
     griglia = posizione di partenza, arrivo = posizione al traguardo,
     distacco = secondi dal vincitore, vince = vincitore della gara Moto2  */
  stagione: {
    anno: 2026,
    aggiornatoA: "GP d'Indonesia, 11 ottobre 2026",
    gare: [
      { n: 1,  gp: "GP di Thailandia",   circuito: "Buriram International Circuit",           luogo: "Buriram",               paese: "THA", data: "2026-03-01",
        esito: { stato: "ritirato", griglia: 20, vince: "Manuel González", nota: "Gara interrotta due volte: un contatto con Sergio García alla curva 3 gli costa la frattura di un piede." } },
      { n: 2,  gp: "GP del Brasile",     circuito: "Autódromo Internacional Ayrton Senna",    luogo: "Goiânia",               paese: "BRA", data: "2026-03-22",
        esito: { stato: "assente", nota: "Operato al piede il 4 marzo. Al suo posto Dennis Foggia." } },
      { n: 3,  gp: "GP degli Stati Uniti", circuito: "Circuit of the Americas",               luogo: "Austin",                paese: "USA", data: "2026-03-29",
        esito: { stato: "assente", nota: "Ancora fermo per l'infortunio. Al suo posto Dennis Foggia." } },
      { n: 4,  gp: "GP di Spagna",       circuito: "Circuito de Jerez – Ángel Nieto",         luogo: "Jerez de la Frontera",  paese: "ESP", data: "2026-04-26",
        esito: { stato: "finito", griglia: 26, arrivo: 18, distacco: 27.305, vince: "Senna Agius", nota: "Il rientro dopo l'operazione." } },
      { n: 5,  gp: "GP di Francia",      circuito: "Bugatti Circuit",                         luogo: "Le Mans",               paese: "FRA", data: "2026-05-10",
        esito: { stato: "finito", griglia: 28, arrivo: 16, distacco: 14.664, vince: "Izan Guevara" } },
      { n: 6,  gp: "GP di Catalunya",    circuito: "Circuit de Barcelona-Catalunya",          luogo: "Montmeló",              paese: "CAT", data: "2026-05-17",
        esito: { stato: "finito", griglia: 10, arrivo: 9,  distacco: 13.545, vince: "Manuel González", nota: "Il miglior risultato della stagione e i primi punti." } },
      { n: 7,  gp: "GP d'Italia",        circuito: "Autodromo del Mugello",                   luogo: "Scarperia e San Piero", paese: "ITA", data: "2026-05-31",
        esito: { stato: "finito", griglia: 20, arrivo: 16, distacco: 25.332, vince: "Manuel González" } },
      { n: 8,  gp: "GP d'Ungheria",      circuito: "Balaton Park Circuit",                    luogo: "Balatonfőkajár",        paese: "HUN", data: "2026-06-07",
        esito: { stato: "finito", griglia: 21, arrivo: 18, distacco: 31.722, vince: "Manuel González" } },
      { n: 9,  gp: "GP di Cechia",       circuito: "Automotodrom Brno",                       luogo: "Brno",                  paese: "CZE", data: "2026-06-21",
        esito: { stato: "finito", griglia: 17, arrivo: 20, distacco: 23.376, vince: "Iván Ortolá" } },
      { n: 10, gp: "GP d'Olanda",        circuito: "TT Circuit Assen",                        luogo: "Assen",                 paese: "NED", data: "2026-06-28",
        esito: { stato: "finito", griglia: 22, arrivo: 12, distacco: 18.232, vince: "David Alonso", nota: "Dieci posizioni recuperate: la seconda rimonta dell'anno dopo quella di Le Mans." } },
      { n: 11, gp: "GP di Germania",     circuito: "Sachsenring",                             luogo: "Hohenstein-Ernstthal",  paese: "GER", data: "2026-07-12",
        esito: { stato: "finito", griglia: 12, arrivo: 10, distacco: 12.741, vince: "Iván Ortolá" } },
      { n: 12, gp: "GP di Gran Bretagna", circuito: "Silverstone Circuit",                    luogo: "Silverstone",           paese: "GBR", data: "2026-08-09",
        esito: { stato: "finito", griglia: 24, arrivo: 16, distacco: 18.641, vince: "Filip Salač" } },
      { n: 13, gp: "GP d'Aragón",        circuito: "MotorLand Aragón",                        luogo: "Alcañiz",               paese: "ARA", data: "2026-08-30",
        esito: { stato: "finito", griglia: 20, arrivo: 18, vince: "Alonso López" } },
      { n: 14, gp: "GP di San Marino e della Riviera di Rimini", circuito: "Misano World Circuit Marco Simoncelli", luogo: "Misano Adriatico", paese: "RSM", data: "2026-09-13",
        esito: { stato: "finito", griglia: 23, arrivo: 23, vince: "Manuel González" } },
      { n: 15, gp: "GP d'Austria",       circuito: "Red Bull Ring",                           luogo: "Spielberg",             paese: "AUT", data: "2026-09-20",
        esito: { stato: "finito", griglia: 14, arrivo: 10, distacco: 17.263, vince: "Izan Guevara", nota: "Dalla Q1 alla Q2: quattordicesimo in griglia, decimo al traguardo." } },
      { n: 16, gp: "GP del Giappone",    circuito: "Motegi Circuit",                          luogo: "Motegi",                paese: "JPN", data: "2026-10-04",
        esito: { stato: "finito", griglia: 25, arrivo: 21, distacco: 26.784, vince: "Izan Guevara" } },
      { n: 17, gp: "GP d'Indonesia",     circuito: "Mandalika International Street Circuit",  luogo: "Mandalika",             paese: "INA", data: "2026-10-11",
        esito: { stato: "finito", griglia: 18, arrivo: 12, vince: "Izan Guevara", nota: "«Solid weekend in Indonesia»: dodicesimo in gara partendo dal diciottesimo posto." } },
      { n: 18, gp: "GP d'Australia",     circuito: "Phillip Island Grand Prix Circuit",       luogo: "Phillip Island",        paese: "AUS", data: "2026-10-25",
        esito: { stato: "annullato", nota: "Domenica niente gara: nebbia e elicottero medico a terra. Nessun punto assegnato." } },
      { n: 19, gp: "GP di Malesia",      circuito: "Sepang International Circuit",            luogo: "Sepang",                paese: "MAL", data: "2026-11-01" },
      { n: 20, gp: "GP del Qatar",       circuito: "Lusail International Circuit",            luogo: "Lusail",                paese: "QAT", data: "2026-11-08", nota: "Rinviato dal 12 aprile." },
      { n: 21, gp: "GP del Portogallo",  circuito: "Autódromo Internacional do Algarve",      luogo: "Portimão",              paese: "POR", data: "2026-11-22", nota: "Spostato di una settimana." },
      { n: 22, gp: "GP di Valencia",     circuito: "Circuit Ricardo Tormo",                   luogo: "Cheste",                paese: "VAL", data: "2026-11-29", nota: "Spostato di una settimana." }
    ],

    /* Classifica piloti dopo il GP indicato (le posizioni dall'11° al 18° non sono riportate). */
    classifica: {
      dopo: 17,
      righe: [
        { pos: 1,  pilota: "Manuel González", paese: "ESP", team: "Liqui Moly Dynavolt Intact GP", punti: 265.5 },
        { pos: 2,  pilota: "Izan Guevara",    paese: "ESP", team: "Blu Cru Pramac Yamaha Moto2",    punti: 260 },
        { pos: 3,  pilota: "Iván Ortolá",     paese: "ESP", team: "QJMotor – MSi",                  punti: 191.5 },
        { pos: 4,  pilota: "Daniel Holgado",  paese: "ESP", team: "CFMoto Aspar Team",              punti: 170 },
        { pos: 5,  pilota: "David Alonso",    paese: "COL", team: "CFMoto Aspar Team",              punti: 166 },
        { pos: 6,  pilota: "Senna Agius",     paese: "AUS", team: "Liqui Moly Dynavolt Intact GP",  punti: 165 },
        { pos: 7,  pilota: "Filip Salač",     paese: "CZE", team: "OnlyFans American Racing Team",  punti: 153 },
        { pos: 8,  pilota: "Celestino Vietti", paese: "ITA", team: "BETA Tools SpeedRS Team",       punti: 133, compagno: true },
        { pos: 9,  pilota: "Alonso López",    paese: "ESP", team: "Italjet Gresini Moto2",          punti: 125.5 },
        { pos: 10, pilota: "Daniel Muñoz",    paese: "ESP", team: "Italtrans Racing Team",          punti: 83 },
        { pos: 19, pilota: "Luca Lunetta",    paese: "ITA", team: "BETA Tools SpeedRS Team",        punti: 27, luca: true }
      ]
    }
  },

  /* ---------- Weekend con orari ufficiali (UTC) ----------
     Si aggiunge un blocco per ogni GP di cui si conoscono gli orari.
     Per i GP senza orari il sito mostra solo il conto alla rovescia in giorni.  */
  weekend: {
    18: {
      giorni: "23–25 ottobre",
      tv: "TV8 trasmette le qualifiche Moto2 in diretta sabato e la gara in differita domenica alle 12:20. Sky Sport MotoGP (canale 208), NOW e Sky Go sono in diretta tutto il weekend. Controlla sempre il palinsesto.",
      sessioni: [
        { k: "fp1",  nome: "Prove libere 1",  da: "2026-10-22T22:50:00Z", a: "2026-10-22T23:30:00Z" },
        { k: "pq",   nome: "Pre-qualifiche",  da: "2026-10-23T03:05:00Z", a: "2026-10-23T03:45:00Z" },
        { k: "fp2",  nome: "Prove libere 2",  da: "2026-10-23T22:25:00Z", a: "2026-10-23T22:55:00Z" },
        { k: "q1",   nome: "Qualifiche Q1",   da: "2026-10-24T02:40:00Z", a: "2026-10-24T02:55:00Z" },
        { k: "q2",   nome: "Qualifiche Q2",   da: "2026-10-24T03:05:00Z", a: "2026-10-24T03:20:00Z" },
        { k: "gara", nome: "Gara",            da: "2026-10-25T00:15:00Z", a: "2026-10-25T01:00:00Z", gara: true }
      ]
    },
    19: {
      giorni: "30 ottobre – 1 novembre",
      tv: "TV8 trasmette in chiaro le qualifiche Moto2 di sabato e la gara in differita domenica. Sky Sport MotoGP (canale 208), NOW e Sky Go sono in diretta tutto il weekend. Controlla sempre il palinsesto.",
      sessioni: [
        { k: "fp1",  nome: "Prove libere 1",  da: "2026-10-30T01:50:00Z", a: "2026-10-30T02:30:00Z",
          nota: "Luca non ha fatto registrare un tempo: le fonti non ne indicano il motivo.",
          ris: [
            ["Izan Guevara", "2:04.005"], ["David Alonso", "2:04.568"], ["Daniel Holgado", "2:04.568"],
            ["Joe Roberts", "2:04.758"], ["Collin Veijer", "2:04.800"], ["Filip Salač", "2:04.807"],
            ["Celestino Vietti", "2:04.841"], ["Álex Escrig", "2:04.863"], ["Manuel González", "2:04.864"],
            ["Tony Arbolino", "2:04.869"], ["Alonso López", "2:04.889"], ["Ángel Piqueras", "2:04.907"],
            ["Senna Agius", "2:04.961"], ["Xabi Zurutuza", "2:05.055"], ["Barry Baltus", "2:05.206"],
            ["Adrián Huertas", "2:05.452"], ["Alberto Ferrández", "2:05.572"], ["Mario Aji", "2:05.575"],
            ["Ayumu Sasaki", "2:05.576"], ["Taiyo Furusato", "2:05.605"], ["José Antonio Rueda", "2:05.642"],
            ["Daniel Muñoz", "2:05.789"], ["Iván Ortolá", "2:05.920"], ["Zonta van den Goorbergh", "2:06.071"],
            ["Deniz Öncü", "2:06.082"], ["Jacob Roulstone", "2:07.009"], ["Matteo Ferrari", "2:07.806"],
            ["Luca Lunetta", null, "NC", "senza tempo"]
          ]
        },
        { k: "pq",   nome: "Pre-qualifiche",  da: "2026-10-30T06:05:00Z", a: "2026-10-30T06:45:00Z",
          nota: "I primi 14 vanno direttamente in Q2. Gli altri passano dal Q1, dove i primi quattro entrano in Q2. I tempi sono ricavati dai distacchi dal miglior tempo di González.",
          ris: [
            ["Manuel González", "2:03.737"], ["Alonso López", "2:03.881"], ["Daniel Holgado", "2:03.943"],
            ["Izan Guevara", "2:03.971"], ["Tony Arbolino", "2:04.448"], ["Iván Ortolá", "2:04.463"],
            ["Ángel Piqueras", "2:04.509"], ["Collin Veijer", "2:04.607"], ["Daniel Muñoz", "2:04.639"],
            ["Taiyo Furusato", "2:04.642"], ["Senna Agius", "2:04.644"], ["Joe Roberts", "2:04.685"],
            ["Mario Aji", "2:04.686"], ["Adrián Huertas", "2:04.735"], ["Filip Salač", "2:04.735"],
            ["Celestino Vietti", "2:04.765"], ["Alberto Ferrández", "2:04.766"], ["David Alonso", "2:04.768"],
            ["Barry Baltus", "2:04.776"], ["Álex Escrig", "2:04.778"], ["José Antonio Rueda", "2:04.846"],
            ["Xabi Zurutuza", "2:04.897"], ["Ayumu Sasaki", "2:05.048"], ["Zonta van den Goorbergh", "2:05.197"],
            ["Luca Lunetta", "2:05.907"], ["Deniz Öncü", "2:05.998"], ["Jacob Roulstone", "2:06.223"],
            ["Matteo Ferrari", "2:07.310"]
          ]
        },
        { k: "fp2",  nome: "Prove libere 2",  da: "2026-10-31T01:25:00Z", a: "2026-10-31T01:55:00Z",
          ris: [
            ["Izan Guevara", "2:03.567"], ["Barry Baltus", "2:04.120"], ["David Alonso", "2:04.181"],
            ["Filip Salač", "2:04.218"], ["Daniel Holgado", "2:04.337"], ["Iván Ortolá", "2:04.351"],
            ["Álex Escrig", "2:04.384"], ["Celestino Vietti", "2:04.397"], ["José Antonio Rueda", "2:04.443"],
            ["Ángel Piqueras", "2:04.504"], ["Alonso López", "2:04.542"], ["Daniel Muñoz", "2:04.553"],
            ["Collin Veijer", "2:04.569"], ["Luca Lunetta", "2:04.673"], ["Xabi Zurutuza", "2:04.737"],
            ["Alberto Ferrández", "2:04.746"], ["Tony Arbolino", "2:04.774"], ["Manuel González", "2:04.811"],
            ["Senna Agius", "2:04.916"], ["Mario Aji", "2:04.939"], ["Deniz Öncü", "2:05.032"],
            ["Joe Roberts", "2:05.056"], ["Ayumu Sasaki", "2:05.075"], ["Adrián Huertas", "2:05.377"],
            ["Taiyo Furusato", "2:05.395"], ["Zonta van den Goorbergh", "2:05.483"], ["Matteo Ferrari", "2:06.334"],
            ["Jacob Roulstone", "2:06.808"]
          ]
        },
        { k: "q1",   nome: "Qualifiche Q1",   da: "2026-10-31T05:40:00Z", a: "2026-10-31T05:55:00Z",
          luca: "5° · 2:03.938",
          nota: "Escrig, Alonso, Salač e Vietti passano in Q2. Luca è caduto negli ultimi minuti e non ha potuto migliorarsi. Di Alonso e Salač non sono disponibili i tempi del Q1 e non si sa chi dei due sia secondo.",
          ris: [
            ["Álex Escrig", "2:03.459"], ["David Alonso", null, "2–3"], ["Filip Salač", null, "2–3"],
            ["Celestino Vietti", "2:03.904"], ["Luca Lunetta", "2:03.938"], ["Barry Baltus", "2:03.972"],
            ["José Antonio Rueda", "2:03.993"], ["Ayumu Sasaki", "2:04.183"], ["Xabi Zurutuza", "2:04.202"],
            ["Alberto Ferrández", "2:04.422"], ["Deniz Öncü", "2:04.645"], ["Zonta van den Goorbergh", "2:05.172"],
            ["Jacob Roulstone", "2:05.629"], ["Matteo Ferrari", "2:05.947"]
          ]
        },
        { k: "q2",   nome: "Qualifiche Q2",   da: "2026-10-31T06:05:00Z", a: "2026-10-31T06:20:00Z",
          luca: "escluso in Q1 · partirà 18°",
          nota: "Vietti è caduto alla curva 15 e non ha un tempo valido; ha tre posizioni di penalità per un impeding nelle pre-qualifiche e in gara parte 21°. Luca, 19° nella classifica delle qualifiche, scala quindi al 18° posto in griglia.",
          ris: [
            ["Daniel Holgado", "2:02.875"], ["Ángel Piqueras", "2:03.416"], ["Izan Guevara", "2:03.486"],
            ["David Alonso", "2:03.491"], ["Alonso López", "2:03.516"], ["Collin Veijer", "2:03.560"],
            ["Álex Escrig", "2:03.664"], ["Daniel Muñoz", "2:03.718"], ["Manuel González", "2:03.734"],
            ["Iván Ortolá", "2:03.839"], ["Mario Aji", "2:03.978"], ["Senna Agius", "2:04.009"],
            ["Adrián Huertas", "2:04.036"], ["Joe Roberts", "2:04.133"], ["Taiyo Furusato", "2:04.336"],
            ["Filip Salač", "2:04.385"], ["Tony Arbolino", "2:04.980"], ["Celestino Vietti", null, "18", "senza tempo"]
          ]
        },
        { k: "gara", nome: "Gara",            da: "2026-11-01T05:15:00Z", a: "2026-11-01T06:00:00Z", gara: true }
      ]
    }
  },

  /* ---------- Carriera ---------- */
  carriera: [
    { anno: 2006, titolo: "Nasce a Roma", testo: "Il 27 maggio. A cinque anni è già in sella a una minimoto.", sigle: ["Minimoto"] },
    { anno: 2018, titolo: "Talenti Azzurri FMI", testo: "I risultati nel campionato italiano PreMoto3 lo portano nel progetto della Federazione Motociclistica Italiana per i giovani piloti.", sigle: ["PreMoto3", "FMI"] },
    { anno: 2019, titolo: "Campione italiano PreMoto3", testo: "Al debutto nel CIV domina: 6 vittorie, 11 podi e 5 pole position.", sigle: ["CIV PreMoto3", "Campione"], risultato: "1°" },
    { anno: 2020, titolo: "Red Bull MotoGP Rookies Cup", testo: "A 14 anni entra nella Rookies Cup e corre anche due prove del CIV Moto3. Prima stagione chiusa a punti.", sigle: ["Rookies Cup", "CIV Moto3"], risultato: "23°" },
    { anno: 2021, titolo: "Rookies Cup e Mondiale Junior", testo: "Rookies Cup in crescita, con 57 punti, e prima stagione nel Mondiale Junior Moto3.", sigle: ["Rookies Cup", "CEV Moto3 Junior"], risultato: "13°" },
    { anno: 2022, titolo: "La prima vittoria. E il debutto nel Mondiale", testo: "Quinto nella Rookies Cup con la prima vittoria. Ad Assen debutta nel Motomondiale Moto3 al posto dell'infortunato Matteo Bertelle e chiude 19°.", sigle: ["Rookies Cup", "JuniorGP", "Moto3 GP"], risultato: "5°" },
    { anno: 2023, titolo: "Vice campione JuniorGP", testo: "Secondo nel JuniorGP Moto3 con 138 punti e 4 podi, dietro Ángel Piqueras. Al Mugello torna nel Mondiale con una wild card: 19°.", sigle: ["JuniorGP", "Wild card Mugello"], risultato: "2°" },
    { anno: 2024, titolo: "Moto3 a tempo pieno", testo: "Con il Sic58 Squadra Corse sale sul podio ad Aragón (3°) e in Thailandia (2°) e chiude 12° con 112 punti, miglior italiano. Il 26 novembre giura ed entra nel Centro Sportivo Carabinieri.", sigle: ["Moto3", "Sic58 Squadra Corse"], risultato: "12°" },
    { anno: 2025, titolo: "Altri due podi, poi lo stop", testo: "Terzo a Silverstone, secondo a Mandalika, 125 punti. Una caduta ad Assen gli costa la frattura di tibia e perone destri e quattro Gran Premi, ma rientra a Montmeló. Il 6 settembre è ufficiale il salto in Moto2 con un contratto di tre anni.", sigle: ["Moto3", "Sic58 Squadra Corse"], risultato: "12°" },
    { anno: 2026, titolo: "Rookie in Moto2", testo: "Con il BETA Tools SpeedRS Team, su Boscoscuro, accanto a Celestino Vietti. Una stagione partita con un infortunio e cresciuta gara dopo gara.", sigle: ["Moto2", "BETA Tools SpeedRS Team"], risultato: "19°", incorso: true }
  ],

  /* Statistiche del Mondiale per stagione (Moto3 e Moto2) */
  mondiale: [
    { anno: 2022, classe: "Moto3", team: "QJmotor Avintia Racing Team", moto: "KTM",       gp: 1,  podi: 0, punti: 0,   pos: "35°" },
    { anno: 2023, classe: "Moto3", team: "MT Helmets – MSi",            moto: "KTM",       gp: 1,  podi: 0, punti: 0,   pos: "36°" },
    { anno: 2024, classe: "Moto3", team: "Sic58 Squadra Corse",         moto: "Honda",     gp: 19, podi: 2, punti: 112, pos: "12°" },
    { anno: 2025, classe: "Moto3", team: "Sic58 Squadra Corse",         moto: "Honda",     gp: 18, podi: 2, punti: 125, pos: "12°" }
    /* il 2026 in Moto2 viene calcolato dalla sezione "stagione" */
  ],
  giriVeloci: 2,

  /* ---------- Foto (nell'ordine della galleria) ---------- */
  foto: [
    { id: "mandalika-curva",     w: 1244, h: 2314, c: "#65645d", titolo: "Mandalika" },
    { id: "dall-alto",           w: 1244, h: 1835, c: "#231a14", titolo: "Dall'alto" },
    { id: "barcellona-griglia",  w: 1304, h: 1495, c: "#6c5b4b", titolo: "Montmeló" },
    { id: "team-pugno",          w: 1320, h: 1030, c: "#3e302b", titolo: "Il pugno" },
    { id: "brno-piega",          w: 1244, h: 1958, c: "#736f70", titolo: "Brno" },
    { id: "casco-oro",           w: 1320, h: 1307, c: "#7a6f71", titolo: "Visiera dorata" },
    { id: "box-boscoscuro",      w: 1244, h: 1814, c: "#3a301c", titolo: "Nel box" },
    { id: "carabinieri-casco",   w: 1244, h: 1882, c: "#4e596b", titolo: "Carabinieri" },
    { id: "curva-cordoli",       w: 1320, h: 1608, c: "#68604f", titolo: "Cordoli" },
    { id: "mandalika-movimento", w: 1244, h: 1890, c: "#5e646b", titolo: "A tutta velocità" },
    { id: "team-pista",          w: 1320, h: 1745, c: "#868582", titolo: "Aragón" }
  ],

  /* ---------- Partner visibili su tuta e moto ---------- */
  partner: [
    "BETA Tools", "Sync Group", "HDR", "MB Conveyors", "Folladore", "Orodei Group", "Termozeta",
    "esm", "LighTech", "DragonBox", "WRS", "Macna", "Shoei", "Pirelli", "Akrapovič"
  ]
};
