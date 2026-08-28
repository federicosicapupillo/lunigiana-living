/**
 * Dati della guida /prezzi-case-lunigiana.
 *
 * Due fonti distinte, mai mescolate:
 *  1. QUOTAZIONI RICHIESTE ESTERNE — Immobiliare.it, mercato immobiliare
 *     provincia di Massa-Carrara, rilevazione luglio 2026. Sono prezzi medi
 *     RICHIESTI in vendita (offerta pubblicata), non prezzi di compravendita.
 *  2. SNAPSHOT PORTAFOGLIO FURIA — estrazione manuale dal database immobili
 *     (status published, contratto vendita, escluso Massa) al 28/08/2026.
 *     Fotografia del portafoglio dell'agenzia, non dell'intero mercato.
 *
 * I valori sono congelati alla data indicata: non vanno ricalcolati a runtime.
 */

export const PZ_META = {
  h1: "Quanto costa comprare casa in Lunigiana nel 2026?",
  title: "Prezzi case in Lunigiana 2026: quanto costa comprare | Furia Immobiliare",
  description:
    "Prezzi delle case in Lunigiana nel 2026, comune per comune: quotazioni richieste, fasce di budget e fotografia del portafoglio Furia al 28 agosto 2026.",
  updatedLabel: "Aggiornato al 28 agosto 2026",
  isoDate: "2026-08-28",
} as const;

export const PZ_SOURCE = {
  externalName: "Immobiliare.it — mercato immobiliare provincia di Massa-Carrara",
  externalUrl:
    "https://www.immobiliare.it/mercato-immobiliare/toscana/massa-carrara-provincia/",
  externalPeriod: "luglio 2026",
  internalLabel:
    "elaborazione Furia Immobiliare su portafoglio attivo al 28/08/2026",
} as const;

export type ComunePrezzo = {
  nome: string;
  /** Prezzo medio richiesto in vendita, €/m², luglio 2026. */
  eurM2: number;
  /** Variazione percentuale rispetto a luglio 2025. */
  varYoY: number;
  /** Slug della pagina comune, se esiste una landing dedicata. */
  slug?: string;
};

/** Ordinati dal più economico al più caro (aiuta la lettura della tabella). */
export const PZ_COMUNI: ComunePrezzo[] = [
  { nome: "Zeri", eurM2: 559, varYoY: 8.3, slug: "zeri" },
  { nome: "Filattiera", eurM2: 729, varYoY: -13.7, slug: "filattiera" },
  { nome: "Casola in Lunigiana", eurM2: 730, varYoY: 0.3 },
  { nome: "Mulazzo", eurM2: 805, varYoY: 6.5, slug: "mulazzo" },
  { nome: "Tresana", eurM2: 809, varYoY: -3.3 },
  { nome: "Pontremoli", eurM2: 866, varYoY: 0.8, slug: "pontremoli" },
  { nome: "Comano", eurM2: 873, varYoY: -2.2 },
  { nome: "Fivizzano", eurM2: 885, varYoY: -6.5 },
  { nome: "Bagnone", eurM2: 903, varYoY: 4.0, slug: "bagnone" },
  { nome: "Licciana Nardi", eurM2: 1004, varYoY: -7.3 },
  { nome: "Villafranca in Lunigiana", eurM2: 1042, varYoY: 6.0, slug: "villafranca-in-lunigiana" },
  { nome: "Podenzana", eurM2: 1131, varYoY: -9.1 },
  { nome: "Aulla", eurM2: 1229, varYoY: -3.2, slug: "aulla" },
  { nome: "Fosdinovo", eurM2: 1713, varYoY: -1.4 },
];

/** Snapshot portafoglio Furia al 28/08/2026. */
export const PZ_FURIA = {
  attivi: 44,
  conPrezzo: 43,
  suRichiesta: 1,
  prezzoMedio: 136535,
  prezzoMediano: 120000,
  mediaEurM2: 1046,
  medianaEurM2: 1018,
  minimo: 30000,
  massimo: 450000,
} as const;

export const PZ_FASCE: { label: string; count: number }[] = [
  { label: "Sotto 100.000 €", count: 16 },
  { label: "100.000 – 149.999 €", count: 10 },
  { label: "150.000 – 199.999 €", count: 9 },
  { label: "200.000 – 299.999 €", count: 6 },
  { label: "300.000 € e oltre", count: 2 },
];

export type TipologiaStat = {
  nome: string;
  campione: number;
  medianaPrezzo: number;
  medianaEurM2: number;
  /** false quando il campione è troppo piccolo per essere citato come indicatore. */
  usabile: boolean;
  slug?: string;
};

export const PZ_TIPOLOGIE: TipologiaStat[] = [
  { nome: "Appartamento", campione: 19, medianaPrezzo: 115000, medianaEurM2: 1018, usabile: true, slug: "appartamenti" },
  { nome: "Casa indipendente", campione: 7, medianaPrezzo: 159000, medianaEurM2: 813, usabile: true, slug: "case-indipendenti" },
  { nome: "Attico", campione: 4, medianaPrezzo: 152500, medianaEurM2: 1419, usabile: true },
  { nome: "Rustico", campione: 3, medianaPrezzo: 40000, medianaEurM2: 600, usabile: true, slug: "rustici" },
  { nome: "Semindipendente", campione: 3, medianaPrezzo: 225000, medianaEurM2: 1607, usabile: true },
  { nome: "Villa", campione: 3, medianaPrezzo: 240000, medianaEurM2: 1286, usabile: true, slug: "ville" },
];

export const PZ_BUDGET: {
  soglia: string;
  intro: string;
  composizione: string;
}[] = [
  {
    soglia: "Con meno di 100.000 €",
    intro:
      "È la fascia più popolata del nostro portafoglio: 16 immobili sui 43 con prezzo indicato.",
    composizione:
      "Oggi comprende 8 appartamenti, 3 case indipendenti, 3 rustici, 1 bifamiliare e 1 casa di borgo. I rustici sono in genere da recuperare, quindi il costo di acquisto è solo una parte della spesa complessiva.",
  },
  {
    soglia: "Tra 100.000 e 150.000 €",
    intro:
      "Sono 10 immobili: la fascia in cui rientra la mediana del portafoglio, 120.000 €.",
    composizione:
      "Attualmente 8 appartamenti, 1 attico e 1 bifamiliare. Qui si trovano soprattutto soluzioni già abitabili, spesso in paese o in centro, con lavori limitati agli impianti o alle finiture.",
  },
  {
    soglia: "Tra 150.000 e 200.000 €",
    intro: "Sono 9 immobili, con un salto evidente in metratura o indipendenza.",
    composizione:
      "Oggi 3 appartamenti, 3 case indipendenti, 2 attici e 1 semindipendente. È la soglia in cui compare con regolarità la casa con spazio esterno proprio.",
  },
  {
    soglia: "Tra 200.000 e 300.000 €",
    intro: "Sono 6 immobili, quasi tutti con giardino o terreno.",
    composizione:
      "Attualmente 2 ville, 1 attico, 1 casa di borgo, 1 casa indipendente e 1 semindipendente. In questa fascia contano molto panorama, accessibilità e stato di conservazione.",
  },
  {
    soglia: "Oltre 300.000 €",
    intro: "Sono 2 immobili: la parte più alta e più selettiva del portafoglio.",
    composizione:
      "Oggi 1 villa e 1 semindipendente. Il valore massimo attualmente in vendita è 450.000 €.",
  },
];

export const PZ_CONSIGLI: { title: string; body: string }[] = [
  {
    title: "Guardate il prezzo richiesto come punto di partenza",
    body:
      "Le quotazioni pubblicate descrivono ciò che i venditori chiedono. La trattativa, la documentazione e la perizia possono spostare il quadro, in un senso o nell'altro.",
  },
  {
    title: "Confrontate immobili nello stesso stato",
    body:
      "Un appartamento ristrutturato e uno da rifare, con la stessa metratura e nello stesso comune, non appartengono allo stesso mercato: confrontarli fra loro porta a conclusioni sbagliate.",
  },
  {
    title: "Mettete in conto i lavori prima di scegliere il budget",
    body:
      "Su rustici e case di borgo tetto, impianti e infissi possono valere una quota importante dell'investimento complessivo. Meglio stimarli in anticipo, anche in modo grossolano.",
  },
  {
    title: "Verificate accessibilità e servizi, non solo i chilometri",
    body:
      "In collina e in montagna la differenza la fanno la strada, lo sgombero neve d'inverno e la distanza reale da scuole, medico e spesa: dieci chilometri di fondovalle non equivalgono a dieci chilometri di curve.",
  },
  {
    title: "Controllate la conformità urbanistica e catastale",
    body:
      "Ampliamenti, tettoia e cambi d'uso non sanati sono una causa frequente di trattative che si fermano. È una verifica da fare prima della proposta, non dopo.",
  },
  {
    title: "Considerate i costi ricorrenti",
    body:
      "Riscaldamento, manutenzione del terreno, spese condominiali e imposte cambiano molto tra un appartamento in centro e una casa isolata con un ettaro intorno.",
  },
  {
    title: "Diffidate dei confronti su base provinciale",
    body:
      "Le medie della provincia includono la costa e Carrara, con dinamiche diverse: per la Lunigiana serve leggere il dato comune per comune, come nella tabella qui sopra.",
  },
];
