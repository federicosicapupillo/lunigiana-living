/**
 * Editorial content for the local-SEO "case in vendita a …" pages.
 * One entry per comune. Slugs are URL-safe; `name` is the display label
 * used in H1, breadcrumbs and CTA copy. `match` lists the strings that
 * the `municipality` field on a property may equal — used to filter the
 * public catalogue.
 */
export type ComuneSeo = {
  slug: string;
  name: string;
  /** Full geographic label used in titles and og tags. */
  fullName: string;
  /** Strings to match against `property.municipality` (case-insensitive). */
  match: string[];
  /** Short subtitle under the H1. */
  subtitle: string;
  /** 2 editorial paragraphs — original, per-comune. */
  paragraphs: [string, string];
  /** "Per chi è adatto" bullet points. */
  audience: string[];
  /** Short blurb for related-areas tiles. */
  blurb: string;
};

export const COMUNE_SEO: ComuneSeo[] = [
  {
    slug: "pontremoli",
    name: "Pontremoli",
    fullName: "Pontremoli",
    match: ["Pontremoli"],
    subtitle:
      "Scopri case, appartamenti e immobili di carattere a Pontremoli, nel cuore della Lunigiana, con l'accompagnamento locale di Furia Immobiliare.",
    paragraphs: [
      "Pontremoli è il centro principale della Lunigiana: una piccola città di pietra e portici, attraversata dal torrente Magra, con un centro storico vivo, servizi quotidiani, scuole, una stazione ferroviaria sulla linea Parma–La Spezia e un casello autostradale che la collega facilmente alla costa ligure e alla pianura padana.",
      "Qui si trovano appartamenti nel centro storico, case di paese da rivedere con gusto, ville nelle frazioni collinari e proprietà con vista sul Castello del Piagnaro. È la scelta naturale per chi cerca autenticità senza rinunciare ai servizi, sia come prima casa sia come seconda casa abitabile tutto l'anno.",
    ],
    audience: [
      "Chi vuole vivere in un centro storico vero, con servizi a portata di mano.",
      "Chi ha bisogno di treno e autostrada per spostamenti regolari.",
      "Chi cerca una seconda casa autentica, non turistica.",
      "Chi desidera restare vicino alla costa ligure e alla Toscana.",
      "Famiglie che cercano scuole, sanità e una comunità attiva.",
    ],
    blurb: "Capoluogo della Lunigiana, servizi e centro storico.",
  },
  {
    slug: "bagnone",
    name: "Bagnone",
    fullName: "Bagnone",
    match: ["Bagnone"],
    subtitle:
      "Case, appartamenti e borghi a Bagnone: un paese elegante e raccolto, dove la qualità della vita si misura nei dettagli.",
    paragraphs: [
      "Bagnone è uno dei borghi più amati della Lunigiana: una piazza-mercato medievale, il torrente che scorre tra le case, un castello che domina la valle e un mercato settimanale che porta vita al paese senza snaturarlo. L'atmosfera è quella di un luogo discreto, ben tenuto, dove ci si conosce.",
      "Gli immobili spaziano dalle case in pietra nel borgo storico agli appartamenti più recenti in zona residenziale, fino ai casali sparsi sulle colline circostanti. È una scelta coerente per chi cerca silenzio, bellezza e una comunità di paese reale.",
    ],
    audience: [
      "Chi cerca un borgo curato, vivo ma tranquillo.",
      "Chi desidera una casa con carattere, in pietra o ristrutturata con gusto.",
      "Chi vuole il mercato, il bar di paese e qualche servizio essenziale.",
      "Chi cerca una seconda casa elegante e accessibile.",
      "Chi ama camminare, leggere, coltivare un orto.",
    ],
    blurb: "Borgo elegante con castello, mercato e qualità di vita.",
  },
  {
    slug: "mulazzo",
    name: "Mulazzo",
    fullName: "Mulazzo",
    match: ["Mulazzo"],
    subtitle:
      "Case di campagna, borghi e panorami a Mulazzo: una Lunigiana letteraria, fatta di colline, scorci lunghi e silenzi gentili.",
    paragraphs: [
      "Mulazzo è un comune diffuso, fatto di borghi, frazioni e case sparse sulle colline. Legato alla memoria di Dante e della famiglia Malaspina, conserva un carattere appartato e contemplativo, con scorci che spaziano sull'intera vallata della Magra.",
      "Qui si trovano case di campagna indipendenti, piccoli rustici da recuperare, case di paese in pietra e proprietà panoramiche immerse nel verde. Una scelta coerente per chi mette al primo posto il paesaggio, la quiete e una vita più lenta.",
    ],
    audience: [
      "Chi cerca panorama vero e silenzio.",
      "Chi desidera una casa di campagna indipendente.",
      "Chi è disposto a ristrutturare con cura un rustico in pietra.",
      "Chi vuole una seconda casa contemplativa.",
      "Chi ama la storia, la natura e i borghi minori.",
    ],
    blurb: "Borghi e colline panoramiche, tra Dante e Malaspina.",
  },
  {
    slug: "filattiera",
    name: "Filattiera",
    fullName: "Filattiera",
    match: ["Filattiera"],
    subtitle:
      "Case di campagna, ville e proprietà a Filattiera: pievi romaniche, colline morbide e una posizione strategica a pochi minuti da Pontremoli.",
    paragraphs: [
      "Filattiera è una delle zone più contemplative della Lunigiana, con pievi romaniche, colline morbide e una campagna abitata in modo discreto. La posizione, a metà strada tra Pontremoli e Villafranca, la rende comoda per chi cerca verde senza isolarsi.",
      "Si trovano qui case singole con terreno, piccole ville di campagna, rustici in pietra da rivedere e appartamenti nelle frazioni principali. Una scelta naturale per chi vuole vivere immerso nel paesaggio rurale lunigianese, restando vicino ai servizi.",
    ],
    audience: [
      "Chi cerca verde, orto, terreno.",
      "Chi vuole campagna ma a pochi minuti da Pontremoli.",
      "Chi ama le pievi romaniche e i paesaggi rurali.",
      "Chi cerca una seconda casa tranquilla, ben collegata.",
      "Chi desidera una casa indipendente con un po' di spazio attorno.",
    ],
    blurb: "Pievi romaniche, campagna e accessibilità a Pontremoli.",
  },
  {
    slug: "villafranca-in-lunigiana",
    name: "Villafranca in Lunigiana",
    fullName: "Villafranca in Lunigiana",
    match: ["Villafranca in Lunigiana", "Villafranca"],
    subtitle:
      "Case, appartamenti e immobili a Villafranca in Lunigiana: posizione comoda, servizi, e un borgo sul cammino della Francigena.",
    paragraphs: [
      "Villafranca in Lunigiana è una porta naturale verso l'alta valle: ben collegata, ricca di servizi quotidiani e attraversata dal cammino della Francigena. Il borgo conserva un'identità autentica, con il museo etnografico, antichi ponti e un tessuto sociale vivo durante tutto l'anno.",
      "L'offerta abitativa è varia: appartamenti in centro, case di paese in pietra, ville nelle frazioni residenziali e proprietà con piccolo terreno nelle aree più tranquille. Una scelta concreta per chi cerca praticità senza rinunciare al carattere lunigianese.",
    ],
    audience: [
      "Chi cerca un paese con servizi e collegamenti.",
      "Chi vuole vivere lungo il cammino della Francigena.",
      "Chi cerca una casa pronta, con minor bisogno di lavori.",
      "Famiglie che lavorano in zona e cercano comodità.",
      "Chi vuole una seconda casa accessibile e ben tenuta.",
    ],
    blurb: "Posizione comoda, servizi e cammino della Francigena.",
  },
  {
    slug: "zeri",
    name: "Zeri",
    fullName: "Zeri",
    match: ["Zeri"],
    subtitle:
      "Case di montagna, baite e proprietà a Zeri: boschi, pascoli e una Lunigiana wild, lontana dal turismo di massa.",
    paragraphs: [
      "Zeri è la Lunigiana più appartata: valli profonde, allevamenti, boschi e sentieri storici. Un comune diffuso, fatto di piccole frazioni in pietra, dove il ritmo della vita è davvero diverso e i prezzi degli immobili restano accessibili.",
      "Si trovano qui case di montagna in pietra, piccoli rustici da recuperare, ex stalle e fienili convertibili in abitazione, oltre a proprietà con terreno e bosco. È la scelta giusta per chi cerca isolamento gentile, aria aperta e un progetto di vita davvero lento.",
    ],
    audience: [
      "Chi cerca natura, boschi e silenzio reale.",
      "Chi ama camminare, fare trekking, vivere all'aperto.",
      "Chi è disposto a ristrutturare con cura una casa in pietra.",
      "Chi cerca prezzi più accessibili rispetto al fondovalle.",
      "Chi sogna una seconda casa in montagna, lontana dalla folla.",
    ],
    blurb: "Montagna, boschi e prezzi accessibili.",
  },
  {
    slug: "aulla",
    name: "Aulla",
    fullName: "Aulla",
    match: ["Aulla"],
    subtitle:
      "Case, appartamenti e immobili ad Aulla: il nodo di collegamento della bassa Lunigiana, comodo per chi cerca servizi e spostamenti facili.",
    paragraphs: [
      "Aulla è uno dei principali snodi della bassa Lunigiana: vicina al casello autostradale, ben servita da treno e strade principali, è la scelta naturale per chi ha bisogno di muoversi spesso tra costa ligure, Toscana e fondovalle.",
      "L'offerta abitativa privilegia appartamenti, case semindipendenti e proprietà nelle frazioni più tranquille. Una scelta concreta per chi mette al primo posto la comodità degli spostamenti senza allontanarsi dal territorio lunigianese.",
    ],
    audience: [
      "Chi cerca comodità autostradale e ferroviaria.",
      "Chi lavora tra Lunigiana, costa e Toscana.",
      "Chi vuole una casa pratica, ben servita.",
      "Chi cerca un punto d'appoggio per esplorare il territorio.",
      "Chi preferisce un paese con servizi quotidiani completi.",
    ],
    blurb: "Nodo di collegamento, autostrada e servizi.",
  },
];

export function getComuneSeo(slug: string): ComuneSeo | undefined {
  return COMUNE_SEO.find((c) => c.slug === slug);
}

/** Returns true when `municipality` (case-insensitive) matches one of the comune's labels. */
export function municipalityMatches(comune: ComuneSeo, municipality: string | null | undefined): boolean {
  if (!municipality) return false;
  const m = municipality.trim().toLowerCase();
  return comune.match.some((label) => m === label.toLowerCase());
}