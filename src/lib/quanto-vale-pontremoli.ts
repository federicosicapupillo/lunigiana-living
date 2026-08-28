/**
 * Dati della pagina /quanto-vale-casa-pontremoli.
 *
 * Due fonti distinte, mai mescolate:
 *  1. DATO PUBBLICO ESTERNO — Immobiliare.it, pagina mercato immobiliare di
 *     Pontremoli, rilevazione luglio 2026. Sono prezzi medi RICHIESTI in
 *     vendita (offerta pubblicata sul portale), non prezzi di compravendita.
 *  2. SNAPSHOT PORTAFOGLIO FURIA — estrazione dal database production
 *     (status published, contratto vendita, comune Pontremoli) al 28/08/2026.
 *     Fotografia del portafoglio dell'agenzia, non del mercato del comune.
 *
 * I valori sono congelati alla data indicata: non vanno ricalcolati a runtime.
 */

export const QV_META = {
  h1: "Quanto vale una casa a Pontremoli nel 2026?",
  title: "Quanto vale una casa a Pontremoli nel 2026 | Furia Immobiliare",
  description:
    "Prezzi richiesti a Pontremoli nel 2026: 866 €/m² medi sul portale, range 559–3.701 €/m². Perché una media non è il valore della tua casa e come chiedere una valutazione.",
  updatedLabel: "Aggiornato al 28 agosto 2026",
  isoDate: "2026-08-28",
} as const;

/**
 * Dato pubblico esterno: quotazioni RICHIESTE, luglio 2026.
 * Il conteggio annunci (annunciPortale) è il numero mostrato dal portale al
 * momento della verifica del 28 agosto 2026, distinto dalla rilevazione dei
 * prezzi (periodo).
 */
export const QV_PUBBLICO = {
  eurM2Medio: 866,
  varYoY: 0.81,
  rangeMin: 559,
  rangeMax: 3701,
  annunciPortale: 200,
  periodo: "luglio 2026",
  confrontoPeriodo: "luglio 2025",
  annunciDataLabel: "verifica 28 agosto 2026",
  fonteNome: "Immobiliare.it — mercato immobiliare di Pontremoli",
  fonteUrl: "https://www.immobiliare.it/mercato-immobiliare/toscana/pontremoli/",
} as const;

/**
 * Snapshot production al 28/08/2026: annunci Furia published, contratto
 * vendita, comune Pontremoli. Il campione €/m² usa solo le righe con prezzo
 * pubblicato e superficie valorizzata.
 */
export const QV_FURIA = {
  dataLabel: "28 agosto 2026",
  attivi: 32,
  conPrezzo: 31,
  suRichiesta: 1,
  prezzoMediano: 125000,
  prezzoMedio: 135581,
  prezzoMin: 35000,
  prezzoMax: 390000,
  campioneM2: 31,
  medianaM2: 1163,
  mediaM2: 1136,
} as const;

export type QvFattore = { title: string; body: string };

/** Perché una media al metro quadro non descrive una casa specifica. */
export const QV_FATTORI: QvFattore[] = [
  {
    title: "Stato dell'immobile",
    body: "Una casa abitabile subito e una casa da rimettere a posto partono da richieste molto diverse, perché chi compra mette in conto tempi, cantiere e imprevisti.",
  },
  {
    title: "Posizione: centro, frazione, campagna",
    body: "Il centro storico, i quartieri residenziali e le frazioni più isolate hanno domande diverse. Contano i servizi, l'accessibilità e le caratteristiche della microzona.",
  },
  {
    title: "Piano e ascensore",
    body: "Nei palazzi del centro un terzo piano senza ascensore restringe il pubblico interessato; un piano basso comodo, o un ascensore, lo allarga.",
  },
  {
    title: "Vista, luce ed esposizione",
    body: "Vista aperta sulla valle, luce per buona parte della giornata ed esposizione riparata possono incidere sull'interesse di chi visita, e si notano subito nelle visite.",
  },
  {
    title: "Esterni: terrazzo, corte, giardino",
    body: "Un terrazzo abitabile, una corte privata o un giardino cambiano l'uso quotidiano della casa e pesano parecchio nella percezione di chi visita.",
  },
  {
    title: "Garage e parcheggio",
    body: "La presenza di garage, box o parcheggio pertinenziale può incidere sull'interesse, soprattutto vicino al centro.",
  },
  {
    title: "Distribuzione interna",
    body: "Stessi metri quadri, esiti diversi: camere vere e regolari, un bagno in più, spazi passanti o mal collegati incidono su quanto la casa risulti utilizzabile.",
  },
  {
    title: "Efficienza energetica e impianti",
    body: "Serramenti, isolamento, tipo di riscaldamento ed età degli impianti spostano sia il costo di gestione che i lavori da mettere in programma.",
  },
  {
    title: "Vincoli e lavori da fare",
    body: "Parti comuni da sistemare, tetto, situazioni catastali o urbanistiche da allineare, vincoli negli edifici storici: sono elementi da verificare prima di parlare di cifre.",
  },
  {
    title: "Domanda per quella tipologia",
    body: "Un bilocale in centro, una casa di borgo e una villetta con giardino parlano a pubblici diversi e possono avere livelli di domanda differenti. Questo incide sui tempi e sul posizionamento.",
  },
];

export type QvPasso = { title: string; body: string };

/** Come lavoriamo su una valutazione. */
export const QV_METODO: QvPasso[] = [
  {
    title: "Partiamo dai comparabili",
    body: "Guardiamo immobili simili per zona, tipologia, dimensione e stato: sia quelli oggi in vendita, sia quelli che abbiamo seguito noi e di cui conosciamo l'esito.",
  },
  {
    title: "Scendiamo alla microzona",
    body: "A Pontremoli il posizionamento può cambiare tra centro, quartieri e frazioni. Il ragionamento va fatto sulla microzona specifica, non sulla media del comune.",
  },
  {
    title: "Pesiamo le caratteristiche reali",
    body: "Esterni, piano, vista, garage, distribuzione, impianti: le caratteristiche che possono incidere sull'interesse vanno considerate una per una.",
  },
  {
    title: "Verifichiamo stato e documenti",
    body: "Lavori necessari, parti comuni, planimetrie e conformità: un dettaglio non allineato può cambiare tempi e trattativa più di qualche metro quadro.",
  },
  {
    title: "Guardiamo la concorrenza attuale",
    body: "Quali immobili simili sono già in vendita, a quale richiesta e da quanto tempo. Serve a capire in che contesto la casa si presenterà.",
  },
  {
    title: "Proponiamo un posizionamento di prezzo",
    body: "Non un numero calato dall'alto, ma una fascia di richiesta motivata, con gli effetti pratici di scegliere la parte alta o bassa di quella fascia.",
  },
];
