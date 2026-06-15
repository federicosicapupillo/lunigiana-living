/**
 * Editorial content + matching rules for the typology-SEO
 * "<tipologia> in vendita in Lunigiana" pages. Separate family from
 * the comune pages (which live under /case-in-vendita/$comune).
 *
 * Each entry owns:
 *  - slug / name / fullName / metaTitle / metaDescription
 *  - subtitle + 2 original editorial paragraphs (no boilerplate swap)
 *  - audience bullets + "cosa valutare prima di comprare" tips
 *  - a `matches(p)` predicate over PublicProperty that decides whether
 *    a published property should be shown on the page. Keep it
 *    conservative: meglio mostrare meno immobili ma coerenti.
 *  - relatedTypes (slugs) + suggestedComuni (slugs of existing
 *    comune-SEO pages) for internal linking.
 */
import type { PublicProperty } from "@/lib/public-properties.functions";

export type TipologiaSeo = {
  slug: string;
  name: string;
  fullName: string;
  metaTitle: string;
  metaDescription: string;
  subtitle: string;
  paragraphs: [string, string];
  audience: string[];
  /** "Cosa valutare prima di comprare" — practical checklist. */
  considerations: string[];
  /** Short blurb for hub / related tiles. */
  blurb: string;
  relatedTypes: string[];
  suggestedComuni: string[];
  /** Conservative match: returns true ONLY when coherent. */
  matches: (p: PublicProperty) => boolean;
};

// ── helpers ────────────────────────────────────────────────────────────
const norm = (s: unknown): string =>
  (typeof s === "string" ? s : "").toLowerCase();

function haystack(p: PublicProperty): string {
  return [
    p.type,
    p.title,
    p.description,
    p.commercialHighlights?.join(" "),
    p.amenities?.join(" "),
    Object.values(p.attributes || {}).join(" "),
    p.highlights?.flatMap((h) => h.items).join(" "),
  ]
    .map(norm)
    .join(" ");
}

function anyKeyword(p: PublicProperty, kws: string[]): boolean {
  const h = haystack(p);
  return kws.some((k) => h.includes(k));
}

function typeMatches(p: PublicProperty, kws: string[]): boolean {
  const t = norm(p.type);
  return kws.some((k) => t.includes(k));
}

// ── entries ────────────────────────────────────────────────────────────
export const TIPOLOGIE_SEO: TipologiaSeo[] = [
  {
    slug: "rustici-casali",
    name: "Rustici e casali",
    fullName: "Rustici e casali",
    metaTitle: "Rustici e casali in vendita in Lunigiana | Furia Immobiliare",
    metaDescription:
      "Scopri rustici, casali e case di carattere in vendita in Lunigiana. Furia Immobiliare ti guida nella scelta dell'immobile giusto tra borghi, colline e campagna.",
    subtitle:
      "Case in pietra, casali, fienili e proprietà di campagna in Lunigiana: immobili autentici, spesso da rivedere, da scegliere con uno sguardo locale.",
    paragraphs: [
      "I rustici e i casali della Lunigiana raccontano una storia di pietra, legno e lavoro contadino: spesso si trovano fuori dai borghi, immersi nei boschi o affacciati sulle colline, con accessi più o meno comodi e gradi di conservazione molto diversi. È un mondo che richiede di essere letto bene prima di scegliere: muri portanti, copertura, esposizione, presenza di terreno e di accessi carrabili fanno la differenza tra un'occasione e un cantiere senza fine.",
      "Nel nostro lavoro accompagniamo le persone proprio in questa lettura: aiutiamo a capire quanto un rustico è davvero recuperabile, quali utenze esistono, se ci sono vincoli paesaggistici, quali interventi sono prioritari e quali invece possono attendere. L'obiettivo non è vendere un sogno, ma trovare la casa di pietra giusta per il tuo progetto reale.",
    ],
    audience: [
      "Chi cerca una casa di carattere, in pietra o legno.",
      "Chi ama borghi, campagna e contesti rurali.",
      "Chi è disposto a valutare una ristrutturazione, con tempi e budget chiari.",
      "Chi desidera privacy, natura e silenzio reale.",
      "Chi cerca una seconda casa autentica, non turistica.",
      "Chi vuole un investimento di lungo periodo su un immobile unico.",
    ],
    considerations: [
      "Stato del tetto e delle coperture, spesso prima voce di spesa.",
      "Accesso carrabile reale, soprattutto d'inverno.",
      "Utenze esistenti: acqua (acquedotto o pozzo), energia, fognatura.",
      "Eventuali vincoli paesaggistici, storici o agricoli.",
      "Stima realistica dei costi di ristrutturazione, non solo del prezzo d'acquisto.",
      "Esposizione, umidità dei muri, drenaggio del terreno circostante.",
    ],
    blurb: "Case in pietra, casali e proprietà di campagna da scegliere con cura.",
    relatedTypes: ["case-indipendenti", "case-con-giardino", "seconde-case"],
    suggestedComuni: ["mulazzo", "filattiera", "zeri", "bagnone"],
    matches: (p) =>
      typeMatches(p, ["rustico", "casale", "casa colonica", "fienile", "casa di campagna"]) ||
      anyKeyword(p, ["rustico", "casale", "casa in pietra", "casa colonica", "borgo", "fienile"]),
  },
  {
    slug: "case-indipendenti",
    name: "Case indipendenti",
    fullName: "Case indipendenti",
    metaTitle: "Case indipendenti in vendita in Lunigiana | Furia Immobiliare",
    metaDescription:
      "Case indipendenti e semindipendenti in vendita in Lunigiana: spazi propri, privacy e autonomia. Ti aiutiamo a scegliere quella giusta per la tua famiglia.",
    subtitle:
      "Case singole e semindipendenti in Lunigiana, con spazi propri, privacy e quel senso di autonomia che cambia il modo di abitare.",
    paragraphs: [
      "Una casa indipendente in Lunigiana significa quasi sempre qualcosa di più di un edificio singolo: un piccolo spazio esterno, un orto, un ingresso proprio, il vicinato a distanza giusta. Le tipologie vanno dalla casa di paese in pietra senza muri in comune, alla villetta più recente nelle frazioni residenziali, fino alla casa di campagna isolata su terreno proprio.",
      "La scelta dipende molto dal contesto: una semindipendente nel centro storico chiede attenzione ai confini e all'isolamento acustico; una casa isolata in collina chiede di valutare strada di accesso, distanza dai servizi, gestione del terreno. Ti aiutiamo a leggere la casa nel suo contesto e a capire se l'autonomia che cerchi è davvero quella che quell'immobile può darti.",
    ],
    audience: [
      "Famiglie che cercano spazi propri e un po' di esterno.",
      "Chi vuole evitare condominio e spese comuni.",
      "Chi desidera privacy e ingresso indipendente.",
      "Chi cerca una seconda casa abitabile tutto l'anno.",
      "Chi ama curare un giardino o un piccolo orto.",
    ],
    considerations: [
      "Manutenzione esterna (facciate, tetto, gronde) tutta a carico tuo.",
      "Stato del terreno e dei muri di confine, soprattutto in collina.",
      "Accessi carrabili e parcheggio in proprietà.",
      "Tipo di riscaldamento e costi reali nei mesi freddi.",
      "Distanza concreta dai servizi quotidiani (scuole, alimentari, medico).",
    ],
    blurb: "Spazi propri, autonomia e niente condominio.",
    relatedTypes: ["case-con-giardino", "ville", "rustici-casali"],
    suggestedComuni: ["pontremoli", "villafranca-in-lunigiana", "filattiera"],
    matches: (p) =>
      typeMatches(p, ["casa indipendente", "indipendente", "semindipendente", "casa singola", "villetta"]) ||
      anyKeyword(p, ["indipendente", "semindipendente", "ingresso indipendente", "casa singola"]),
  },
  {
    slug: "appartamenti",
    name: "Appartamenti",
    fullName: "Appartamenti",
    metaTitle: "Appartamenti in vendita in Lunigiana | Furia Immobiliare",
    metaDescription:
      "Appartamenti in vendita in Lunigiana: centri storici, prima casa, investimento o uso turistico. Ti aiutiamo a scegliere quello davvero coerente con il tuo progetto.",
    subtitle:
      "Appartamenti in Lunigiana: centri storici vivi, soluzioni più recenti nelle zone residenziali, ingressi accessibili al mercato.",
    paragraphs: [
      "Gli appartamenti in Lunigiana coprono situazioni molto diverse: appartamenti nei centri storici di Pontremoli, Bagnone, Villafranca o Aulla, con la comodità di avere tutto a piedi; soluzioni più recenti in zone residenziali, spesso con ascensore, posto auto e spese contenute; piccoli bilocali pensati per investimento o uso turistico.",
      "Sono spesso la porta d'ingresso più ragionevole al mercato locale: per una prima casa, per chi cerca un punto d'appoggio in zona o per chi vuole iniziare con un investimento prudente. Ti aiutiamo a capire spese condominiali reali, esposizione, stato degli impianti e potenziale di rendita prima di prendere una decisione.",
    ],
    audience: [
      "Chi cerca una prima casa accessibile, con servizi vicini.",
      "Chi vuole vivere in un centro storico, a piedi dal bar e dal mercato.",
      "Chi cerca un investimento prudente o un uso turistico stagionale.",
      "Chi non vuole gestire giardino o manutenzione esterna.",
      "Chi cerca un punto d'appoggio in zona, comodo da gestire.",
    ],
    considerations: [
      "Spese condominiali reali e fondo lavori già deliberato.",
      "Piano, ascensore e accessibilità nel tempo.",
      "Esposizione, luce naturale e rumore della via.",
      "Disponibilità di parcheggio o posto auto.",
      "Stato di impianti, infissi e classe energetica.",
    ],
    blurb: "Centri storici, prima casa, investimento o uso turistico.",
    relatedTypes: ["case-economiche", "seconde-case", "case-indipendenti"],
    suggestedComuni: ["pontremoli", "aulla", "villafranca-in-lunigiana", "bagnone"],
    matches: (p) =>
      typeMatches(p, ["appartamento", "bilocale", "trilocale", "monolocale", "attico"]) ||
      anyKeyword(p, ["appartamento", "bilocale", "trilocale", "monolocale", "attico"]),
  },
  {
    slug: "ville",
    name: "Ville",
    fullName: "Ville",
    metaTitle: "Ville in vendita in Lunigiana | Furia Immobiliare",
    metaDescription:
      "Ville in vendita in Lunigiana: spazi generosi, giardino, privacy e vista. Una selezione curata di proprietà importanti, accompagnata con discrezione.",
    subtitle:
      "Ville in Lunigiana: spazi generosi, giardino, privacy e una vista che cambia il modo di vivere la casa.",
    paragraphs: [
      "Le ville lunigianesi sono spesso proprietà importanti: case padronali storiche, ville di campagna con parco, immobili di rappresentanza affacciati sulle colline o nei pressi dei borghi principali. Hanno in comune spazi generosi, terreno proprio e una percezione di privacy diversa rispetto a una casa di paese.",
      "Per questo tipo di immobile l'accompagnamento è ancora più importante: bisogna leggere la coerenza tra costo d'acquisto, costi di gestione (riscaldamento, giardino, manutenzioni straordinarie) e il modo reale in cui si vivrà la casa. Lavoriamo con discrezione, mostrando le proprietà alle persone giuste e mettendo in chiaro pro e contro reali.",
    ],
    audience: [
      "Famiglie che cercano spazio, giardino e privacy.",
      "Chi desidera una casa di rappresentanza in un contesto autentico.",
      "Chi cerca una seconda casa importante per famiglia e ospiti.",
      "Chi ama paesaggi, viste lunghe e parchi privati.",
      "Chi vuole un immobile di valore in Lunigiana, ben accompagnato.",
    ],
    considerations: [
      "Costi reali di riscaldamento e gestione del parco/giardino.",
      "Stato strutturale, impianti e classe energetica.",
      "Manutenzioni straordinarie già fatte o ancora da fare.",
      "Vincoli storici o paesaggistici sulla proprietà.",
      "Accessibilità, sicurezza e gestione anche quando non si è in casa.",
    ],
    blurb: "Spazi generosi, giardino, privacy e vista.",
    relatedTypes: ["case-indipendenti", "case-con-giardino", "rustici-casali"],
    suggestedComuni: ["pontremoli", "filattiera", "bagnone", "mulazzo"],
    matches: (p) =>
      typeMatches(p, ["villa"]) ||
      anyKeyword(p, ["villa padronale", "villa di campagna", "villa storica"]),
  },
  {
    slug: "case-con-giardino",
    name: "Case con giardino",
    fullName: "Case con giardino",
    metaTitle: "Case con giardino in vendita in Lunigiana | Furia Immobiliare",
    metaDescription:
      "Case con giardino in vendita in Lunigiana: spazio esterno, orto, vita all'aperto. Ti aiutiamo a scegliere quella davvero adatta alla tua famiglia.",
    subtitle:
      "Case con giardino, terreno o ampio spazio esterno in Lunigiana: per chi vuole vivere anche fuori, non solo dentro casa.",
    paragraphs: [
      "Avere un giardino in Lunigiana significa poter coltivare un orto, far giocare i bambini, ospitare cani, mangiare fuori d'estate, vivere il clima mite del fondovalle. Le soluzioni vanno dal piccolo cortile recintato della casa di paese, al giardino vero attorno a una casa indipendente, fino a proprietà con terreno agricolo annesso.",
      "Lo spazio esterno cambia tutto, ma chiede anche attenzione: esposizione, pendenze, accessi, presenza di alberi importanti, gestione dell'acqua e delle recinzioni. Ti aiutiamo a capire se quel giardino è davvero vivibile come immagini e se l'impegno di manutenzione è sostenibile nel tempo.",
    ],
    audience: [
      "Famiglie con bambini che cercano spazio esterno sicuro.",
      "Chi vive con animali e desidera un giardino recintato.",
      "Chi ama orto, frutteto e vita all'aperto.",
      "Chi cerca una seconda casa dove stare fuori più che dentro.",
      "Chi vuole una casa per ospitare amici e famiglia d'estate.",
    ],
    considerations: [
      "Reale vivibilità del giardino: esposizione, pendenze, ombra.",
      "Recinzione, accessi pedonali e carrabili.",
      "Disponibilità di acqua per irrigazione e gestione del verde.",
      "Alberi importanti: tutele, manutenzione, sicurezza.",
      "Impegno realistico di manutenzione, soprattutto come seconda casa.",
    ],
    blurb: "Spazio esterno, orto, animali e vita all'aperto.",
    relatedTypes: ["case-indipendenti", "ville", "rustici-casali"],
    suggestedComuni: ["filattiera", "bagnone", "mulazzo", "villafranca-in-lunigiana"],
    matches: (p) => {
      const h = haystack(p);
      return (
        h.includes("giardino") ||
        h.includes("terreno") ||
        h.includes("orto") ||
        h.includes("parco privato")
      );
    },
  },
  {
    slug: "case-economiche",
    name: "Case economiche",
    fullName: "Case economiche",
    metaTitle: "Case economiche in vendita in Lunigiana | Furia Immobiliare",
    metaDescription:
      "Case economiche in vendita in Lunigiana sotto i 100.000 €: piccoli immobili, case da rivedere, occasioni per chi cerca con prudenza.",
    subtitle:
      "Case in Lunigiana entro budget contenuti: piccole metrature, immobili da rivedere, occasioni reali da leggere senza fretta.",
    paragraphs: [
      "In Lunigiana esistono ancora soluzioni accessibili: piccoli appartamenti, case di paese da rinfrescare, immobili da ristrutturare nei borghi più appartati. Sono opportunità interessanti per chi vuole entrare nel mercato con un budget contenuto, per un primo investimento o per una seconda casa essenziale.",
      "Allo stesso tempo, una casa economica chiede ancora più attenzione: il prezzo basso non racconta da solo il vero costo dell'operazione. Spese di ristrutturazione, eventuali oneri condominiali arretrati, stato di impianti e infissi, costi di gestione: tutto va valutato insieme, con realismo. Il nostro lavoro è aiutarti a capire se l'occasione è davvero tale.",
    ],
    audience: [
      "Chi cerca un primo immobile con budget contenuto.",
      "Chi valuta un investimento prudente in Lunigiana.",
      "Chi è disposto a fare lavori di rinfresco o ristrutturazione.",
      "Chi cerca una seconda casa essenziale, non rappresentativa.",
      "Chi vuole entrare nel mercato locale per la prima volta.",
    ],
    considerations: [
      "Costo reale di ristrutturazione, oltre al prezzo d'acquisto.",
      "Spese condominiali, fondo lavori e arretrati eventuali.",
      "Stato di impianti, infissi, copertura e umidità.",
      "Costi di gestione e utenze nei mesi freddi.",
      "Reale liquidabilità dell'immobile nel tempo.",
    ],
    blurb: "Budget contenuto, piccoli immobili e occasioni da leggere bene.",
    relatedTypes: ["appartamenti", "rustici-casali", "seconde-case"],
    suggestedComuni: ["zeri", "mulazzo", "aulla"],
    matches: (p) =>
      typeof p.priceValue === "number" && p.priceValue > 0 && p.priceValue <= 100000,
  },
  {
    slug: "seconde-case",
    name: "Seconde case",
    fullName: "Seconde case",
    metaTitle: "Seconde case in Lunigiana in vendita | Furia Immobiliare",
    metaDescription:
      "Seconde case in vendita in Lunigiana: casa vacanza, borgo, campagna o montagna. Ti aiutiamo a scegliere quella davvero gestibile anche da lontano.",
    subtitle:
      "Seconde case in Lunigiana: una casa vacanza nei borghi, in campagna o in montagna, scelta pensando anche alla gestione da lontano.",
    paragraphs: [
      "La Lunigiana è una terra naturale per la seconda casa: vicina al mare e alle Cinque Terre, ai monti dell'Appennino, ben collegata a Parma, Milano e Firenze attraverso autostrada e ferrovia. Borghi vivi, case di carattere, prezzi ancora ragionevoli rispetto ad altre aree della Toscana: ci sono molte ragioni per scegliere qui una casa vacanza.",
      "Una seconda casa, però, va scelta anche pensando a come la vivrai realmente: quanti weekend all'anno, chi se ne occupa nei mesi di assenza, quali interventi sono sostenibili da lontano. Lavoriamo molto con chi vive fuori zona o all'estero: capiamo bene questo punto e aiutiamo a evitare le scelte che diventano un peso anziché un piacere.",
    ],
    audience: [
      "Chi cerca casa vacanza vicino al mare e ai borghi.",
      "Chi vuole una base in Italia comoda da raggiungere.",
      "Chi vive fuori zona o all'estero e cerca affiancamento locale.",
      "Famiglie che cercano una casa per le vacanze, anche con ospiti.",
      "Chi valuta una seconda casa anche come potenziale investimento.",
    ],
    considerations: [
      "Distanza reale dai punti di interesse (mare, monti, città).",
      "Manutenzione gestibile anche quando non sei in casa.",
      "Sicurezza dell'immobile durante i lunghi periodi di assenza.",
      "Costi fissi (tasse, utenze minime, condominio) nei mesi vuoti.",
      "Eventuale rendita stagionale e regole locali sulle locazioni brevi.",
    ],
    blurb: "Casa vacanza nei borghi, in campagna o in montagna.",
    relatedTypes: ["rustici-casali", "case-con-giardino", "appartamenti"],
    suggestedComuni: ["pontremoli", "bagnone", "zeri", "mulazzo"],
    matches: (p) =>
      anyKeyword(p, [
        "seconda casa",
        "casa vacanza",
        "casa per le vacanze",
        "uso turistico",
        "uso vacanze",
      ]),
  },
];

export function getTipologiaSeo(slug: string): TipologiaSeo | undefined {
  return TIPOLOGIE_SEO.find((t) => t.slug === slug);
}

/** Filter pubblicati per coerenza con la tipologia (cap a 60 per pagina). */
export function filterPropertiesForTipologia<T extends PublicProperty>(
  tipologia: TipologiaSeo,
  properties: T[],
): T[] {
  return properties.filter((p) => tipologia.matches(p)).slice(0, 60);
}