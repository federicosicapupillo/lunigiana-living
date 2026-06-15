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
  /** English copy. When undefined, IT fallback is used. */
  en?: {
    subtitle: string;
    paragraphs: [string, string];
    audience: string[];
    blurb: string;
    /** Localized meta title/description. */
    metaTitle: string;
    metaDescription: string;
  };
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
    en: {
      subtitle:
        "Discover homes, apartments and character properties for sale in Pontremoli, in the heart of Lunigiana, with local guidance from Furia Immobiliare.",
      paragraphs: [
        "Pontremoli is the main town of Lunigiana: a small stone city of arcades and bridges, crossed by the Magra river, with a living historic centre, everyday services, schools, a railway station on the Parma–La Spezia line and a motorway exit that easily connects it to the Ligurian coast and the Po valley.",
        "Here you'll find apartments in the historic centre, village houses to bring back to life with taste, villas in the hillside hamlets and properties overlooking the Castello del Piagnaro. It's a natural choice for those who want authenticity without giving up everyday services — whether as a first home or as a second home you can live in all year round.",
      ],
      audience: [
        "People who want to live in a real historic centre, with services within walking distance.",
        "Buyers who rely on train and motorway for regular travel.",
        "Anyone looking for an authentic second home, away from mass tourism.",
        "Those who want to stay close to the Ligurian coast and Tuscany.",
        "Families looking for schools, healthcare and a real, active community.",
      ],
      blurb: "The main town of Lunigiana, with services and a living historic centre.",
      metaTitle: "Homes for sale in Pontremoli | Furia Immobiliare",
      metaDescription:
        "Explore homes and character properties for sale in Pontremoli, in the heart of Lunigiana. Local guidance by Furia Immobiliare.",
    },
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
    en: {
      subtitle:
        "Homes, apartments and village properties in Bagnone: an elegant, well-kept place where quality of life shows in the details.",
      paragraphs: [
        "Bagnone is one of the best-loved villages in Lunigiana: a medieval market square, a stream running between the houses, a castle watching over the valley and a weekly market that keeps the village alive without changing its nature. The atmosphere is that of a discreet, well-cared-for place where people still know each other.",
        "Properties range from stone houses in the historic core to more recent apartments in the residential area, and farmhouses scattered over the surrounding hills. A coherent choice for those looking for quiet, beauty and a real village community.",
      ],
      audience: [
        "Those looking for a tidy village, lively yet calm.",
        "Buyers who want a home with character, in stone or carefully renovated.",
        "People who appreciate the market, the village café and a few essential services.",
        "Anyone looking for an elegant and accessible second home.",
        "Those who love walking, reading and tending a small garden.",
      ],
      blurb: "An elegant village with castle, market and a real quality of life.",
      metaTitle: "Homes for sale in Bagnone | Furia Immobiliare",
      metaDescription:
        "Explore homes and village properties for sale in Bagnone, Lunigiana. Carefully selected by Furia Immobiliare, with real local guidance.",
    },
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
    en: {
      subtitle:
        "Country homes, villages and long views in Mulazzo: a literary side of Lunigiana, made of hills, far horizons and quiet.",
      paragraphs: [
        "Mulazzo is a scattered municipality of villages, hamlets and isolated houses spread across the hills. Tied to the memory of Dante and the Malaspina family, it keeps a quiet, contemplative character, with views opening over the whole Magra valley.",
        "Here you'll find detached country houses, small rustic homes to restore, stone village houses and panoramic properties surrounded by greenery. A coherent choice for those who put landscape, silence and a slower pace first.",
      ],
      audience: [
        "Anyone looking for a real view and real silence.",
        "Buyers wanting an independent country home.",
        "Those willing to carefully restore a stone rustic property.",
        "People searching for a contemplative second home.",
        "Lovers of history, nature and lesser-known villages.",
      ],
      blurb: "Villages and panoramic hills, between Dante and the Malaspina family.",
      metaTitle: "Homes for sale in Mulazzo | Furia Immobiliare",
      metaDescription:
        "Country homes, rustic properties and panoramic houses for sale in Mulazzo, Lunigiana. Local guidance by Furia Immobiliare.",
    },
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
    en: {
      subtitle:
        "Country homes, villas and properties in Filattiera: Romanesque parishes, gentle hills and a strategic location just minutes from Pontremoli.",
      paragraphs: [
        "Filattiera is one of the most contemplative areas of Lunigiana, with Romanesque parishes, soft hills and a countryside lived in with discretion. Its position halfway between Pontremoli and Villafranca makes it ideal for those who want greenery without feeling isolated.",
        "Here you'll find detached houses with land, small country villas, stone rustics to renovate and apartments in the main hamlets. A natural choice for those who want to live surrounded by Lunigiana's rural landscape while staying close to services.",
      ],
      audience: [
        "Buyers who want greenery, a vegetable garden, some land.",
        "Anyone seeking countryside just minutes from Pontremoli.",
        "Lovers of Romanesque parishes and rural landscapes.",
        "Those looking for a quiet, well-connected second home.",
        "People wanting an independent home with a bit of space around it.",
      ],
      blurb: "Romanesque parishes, countryside and easy access to Pontremoli.",
      metaTitle: "Homes for sale in Filattiera | Furia Immobiliare",
      metaDescription:
        "Country homes, villas and properties for sale in Filattiera, Lunigiana. Local guidance by Furia Immobiliare.",
    },
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
    en: {
      subtitle:
        "Homes and apartments in Villafranca in Lunigiana: convenient location, everyday services and a village on the Via Francigena.",
      paragraphs: [
        "Villafranca in Lunigiana is a natural gateway to the upper valley: well connected, rich in everyday services and crossed by the Via Francigena. The village keeps an authentic identity, with its ethnographic museum, ancient bridges and a social fabric that stays alive all year.",
        "The housing offer is varied: apartments in the centre, stone village houses, villas in the residential hamlets and properties with a small plot of land in the quieter areas. A practical choice for those who want convenience without giving up Lunigiana's character.",
      ],
      audience: [
        "Buyers looking for a village with services and good connections.",
        "Those drawn to living along the Via Francigena.",
        "People wanting a move-in-ready home with fewer works to do.",
        "Families working in the area who value convenience.",
        "Anyone looking for an accessible, well-kept second home.",
      ],
      blurb: "Convenient location, everyday services and the Via Francigena.",
      metaTitle: "Homes for sale in Villafranca in Lunigiana | Furia Immobiliare",
      metaDescription:
        "Homes, apartments and village properties for sale in Villafranca in Lunigiana. Local guidance by Furia Immobiliare.",
    },
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
    en: {
      subtitle:
        "Mountain homes, stone cottages and properties in Zeri: forests, pastures and a wilder side of Lunigiana, far from mass tourism.",
      paragraphs: [
        "Zeri is the most secluded corner of Lunigiana: deep valleys, traditional farming, woods and historic trails. A scattered municipality of small stone hamlets where the pace of life is genuinely different and property prices remain accessible.",
        "Here you'll find stone mountain houses, small rustic homes to restore, former barns and haylofts that can be converted into homes, as well as properties with land and woodland. The right choice for those looking for gentle isolation, fresh air and a truly slower way of life.",
      ],
      audience: [
        "Those looking for nature, woods and real silence.",
        "People who love walking, trekking and outdoor life.",
        "Buyers willing to carefully restore a stone home.",
        "Anyone looking for more accessible prices than the main valley.",
        "Those dreaming of a mountain second home, far from the crowds.",
      ],
      blurb: "Mountains, forests and more accessible prices.",
      metaTitle: "Homes for sale in Zeri | Furia Immobiliare",
      metaDescription:
        "Mountain homes, stone cottages and rustic properties for sale in Zeri, Lunigiana. Local guidance by Furia Immobiliare.",
    },
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
    en: {
      subtitle:
        "Homes and apartments in Aulla: the connection hub of lower Lunigiana, ideal for those who value services and easy travel.",
      paragraphs: [
        "Aulla is one of the main hubs of lower Lunigiana: close to the motorway exit, well served by rail and main roads, it is the natural choice for those who need to move regularly between the Ligurian coast, Tuscany and the inland valleys.",
        "The local offer favours apartments, semi-detached houses and properties in the quieter hamlets. A practical choice for those who put travel convenience first while staying within the Lunigiana area.",
      ],
      audience: [
        "Buyers who value motorway and railway access.",
        "Anyone working between Lunigiana, the coast and Tuscany.",
        "Those looking for a practical, well-served home.",
        "People wanting a base from which to explore the wider territory.",
        "Anyone who prefers a town with complete everyday services.",
      ],
      blurb: "A connection hub with motorway, railway and full services.",
      metaTitle: "Homes for sale in Aulla | Furia Immobiliare",
      metaDescription:
        "Homes and apartments for sale in Aulla, the connection hub of lower Lunigiana. Local guidance by Furia Immobiliare.",
    },
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

export type ComuneSeoLocalized = {
  slug: string;
  name: string;
  fullName: string;
  subtitle: string;
  paragraphs: [string, string];
  audience: string[];
  blurb: string;
  metaTitle: string;
  metaDescription: string;
};

/** Returns the localized view of a comune entry. Falls back to IT when EN is missing. */
export function localizeComuneSeo(c: ComuneSeo, lang: "it" | "en"): ComuneSeoLocalized {
  if (lang === "en" && c.en) {
    return {
      slug: c.slug,
      name: c.name,
      fullName: c.fullName,
      subtitle: c.en.subtitle,
      paragraphs: c.en.paragraphs,
      audience: c.en.audience,
      blurb: c.en.blurb,
      metaTitle: c.en.metaTitle,
      metaDescription: c.en.metaDescription,
    };
  }
  return {
    slug: c.slug,
    name: c.name,
    fullName: c.fullName,
    subtitle: c.subtitle,
    paragraphs: c.paragraphs,
    audience: c.audience,
    blurb: c.blurb,
    metaTitle: `Case in vendita a ${c.fullName} | Furia Immobiliare`,
    metaDescription: `Scopri case, appartamenti e immobili di carattere a ${c.fullName} con Furia Immobiliare. Ti guidiamo nella scelta della casa giusta in Lunigiana.`,
  };
}