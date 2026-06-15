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
  /** English copy. When undefined, IT fallback is used. */
  en?: {
    name: string;
    fullName: string;
    h1: string;
    metaTitle: string;
    metaDescription: string;
    subtitle: string;
    paragraphs: [string, string];
    audience: string[];
    considerations: string[];
    blurb: string;
  };
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
    en: {
      name: "Rustic homes and country houses",
      fullName: "Rustic homes and country houses",
      h1: "Rustic homes and country houses for sale in Lunigiana",
      metaTitle: "Rustic homes and country houses for sale in Lunigiana | Furia Immobiliare",
      metaDescription:
        "Discover rustic homes, country houses and character properties for sale in Lunigiana. Furia Immobiliare helps you choose the right one, with real local guidance.",
      subtitle:
        "Stone houses, country homes, former barns and rural properties in Lunigiana: authentic homes, often to renovate, to choose with a local eye.",
      paragraphs: [
        "Rustic homes and country houses in Lunigiana tell a story of stone, wood and rural life: they are often set outside the villages, surrounded by woods or perched on the hills, with access roads and conditions that vary widely. It's a world that needs to be read carefully before choosing: load-bearing walls, roof, exposure, the presence of land and proper road access make the difference between a true opportunity and an endless renovation site.",
        "Our role is exactly this reading: we help you understand how recoverable a rustic property really is, which utilities are in place, whether there are landscape constraints, which works should come first and which can wait. The goal is never to sell a dream, but to find the right stone home for your real plans — including when you're buying from abroad.",
      ],
      audience: [
        "Buyers looking for a home with real character, in stone or wood.",
        "Lovers of villages, countryside and rural settings.",
        "Those open to a renovation with clear budgets and timelines.",
        "People seeking privacy, nature and genuine silence.",
        "Anyone looking for an authentic second home, away from mass tourism.",
        "Long-term buyers wanting a unique, lasting property.",
      ],
      considerations: [
        "Condition of the roof and coverings — often the largest single cost.",
        "Real road access, especially in winter.",
        "Available utilities: water (mains or well), electricity, drainage.",
        "Any landscape, historical or agricultural restrictions on the property.",
        "A realistic estimate of renovation costs, not just the purchase price.",
        "Exposure, wall moisture and drainage of the surrounding land.",
      ],
      blurb: "Stone houses, country homes and rural properties to choose carefully.",
    },
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
    en: {
      name: "Independent houses",
      fullName: "Independent houses",
      h1: "Independent houses for sale in Lunigiana",
      metaTitle: "Independent houses for sale in Lunigiana | Furia Immobiliare",
      metaDescription:
        "Detached and semi-detached houses for sale in Lunigiana: your own space, privacy and autonomy. We help you find the one that truly fits your family.",
      subtitle:
        "Detached and semi-detached homes in Lunigiana, with their own outdoor space, privacy and a real sense of autonomy.",
      paragraphs: [
        "An independent house in Lunigiana almost always means more than just a single building: a small outdoor area, a vegetable garden, your own entrance, neighbours at the right distance. Options range from stone village houses with no shared walls, to more recent homes in residential hamlets, to isolated country houses with their own land.",
        "The right choice depends a lot on the context: a semi-detached home in a historic centre asks for attention to boundaries and sound insulation; an isolated hillside home asks for a careful look at road access, distance from services and land management. We help you read the home in its setting and decide whether the independence you want is the one this property can really offer.",
      ],
      audience: [
        "Families looking for their own space and a bit of outdoor area.",
        "Buyers who want to avoid shared buildings and condo fees.",
        "People who value privacy and a separate entrance.",
        "Anyone looking for a second home that can be lived in all year.",
        "Those who enjoy a garden or a small vegetable plot.",
      ],
      considerations: [
        "Outside maintenance (façades, roof, gutters) is fully on you.",
        "Condition of the land and boundary walls, especially on slopes.",
        "Real road access and private parking.",
        "Type of heating and actual cost during the cold months.",
        "Real distance to everyday services (schools, shops, doctor).",
      ],
      blurb: "Your own space, autonomy and no shared building.",
    },
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
    en: {
      name: "Apartments",
      fullName: "Apartments",
      h1: "Apartments for sale in Lunigiana",
      metaTitle: "Apartments for sale in Lunigiana | Furia Immobiliare",
      metaDescription:
        "Apartments for sale in Lunigiana: historic centres, first home, investment or holiday use. We help you choose the one that truly fits your plans.",
      subtitle:
        "Apartments in Lunigiana: lively historic centres, more recent solutions in residential areas, accessible entry points into the local market.",
      paragraphs: [
        "Apartments in Lunigiana cover very different situations: flats in the historic centres of Pontremoli, Bagnone, Villafranca or Aulla, with everything within walking distance; more recent solutions in residential areas, often with a lift, parking space and contained running costs; small one- and two-bedroom flats designed for investment or seasonal holiday use.",
        "They are often the most reasonable entry point into the local market: as a first home, as a base in the area, or as a prudent first investment. We help you understand real condo fees, exposure, the state of the systems and the rental potential before you make a decision.",
      ],
      audience: [
        "Buyers looking for an accessible first home with services nearby.",
        "Those who want to live in a historic centre, on foot from the café and the market.",
        "People considering a prudent investment or a seasonal holiday use.",
        "Anyone who doesn't want to manage a garden or outside maintenance.",
        "Buyers seeking a practical, easy-to-manage base in the area.",
      ],
      considerations: [
        "Real condo fees and any building works already approved.",
        "Floor, presence of a lift and long-term accessibility.",
        "Exposure, natural light and street noise.",
        "Availability of parking or a private parking space.",
        "State of systems, windows and energy class.",
      ],
      blurb: "Historic centres, first home, investment or holiday use.",
    },
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
    en: {
      name: "Villas",
      fullName: "Villas",
      h1: "Villas for sale in Lunigiana",
      metaTitle: "Villas for sale in Lunigiana | Furia Immobiliare",
      metaDescription:
        "Villas for sale in Lunigiana: generous spaces, garden, privacy and views. A curated selection of important properties, accompanied with discretion.",
      subtitle:
        "Villas in Lunigiana: generous spaces, garden, privacy and a view that changes the way you live the home.",
      paragraphs: [
        "Villas in Lunigiana are often important properties: historic manor houses, country villas with parkland, representative homes overlooking the hills or close to the main villages. What they share is generous spaces, their own land and a different sense of privacy compared to a village house.",
        "For this kind of property, real guidance matters even more: it is essential to read the coherence between the purchase price, running costs (heating, garden, extraordinary maintenance) and the way you'll actually live the home. We work with discretion, showing the property to the right people and being honest about the real pros and cons.",
      ],
      audience: [
        "Families looking for space, garden and privacy.",
        "Buyers wanting a representative home in an authentic context.",
        "Those seeking an important second home for family and guests.",
        "Lovers of landscape, long views and private grounds.",
        "Anyone looking for a quality property in Lunigiana, accompanied with care.",
      ],
      considerations: [
        "Real costs for heating and managing the park or garden.",
        "Structural condition, systems and energy class.",
        "Extraordinary maintenance already done — or still to be done.",
        "Historical or landscape constraints on the property.",
        "Accessibility, security and management even when you're away.",
      ],
      blurb: "Generous spaces, garden, privacy and views.",
    },
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
    en: {
      name: "Homes with garden",
      fullName: "Homes with garden",
      h1: "Homes with garden for sale in Lunigiana",
      metaTitle: "Homes with garden for sale in Lunigiana | Furia Immobiliare",
      metaDescription:
        "Homes with garden for sale in Lunigiana: outdoor space, vegetable plots and outdoor living. We help you choose the one that truly suits your family.",
      subtitle:
        "Homes with a garden, plot of land or generous outdoor area in Lunigiana: for those who want to live outside as well, not only indoors.",
      paragraphs: [
        "Having a garden in Lunigiana means being able to grow vegetables, let children play, host dogs, eat outside in the summer, and enjoy the mild climate of the valley. Options range from the small enclosed courtyard of a village house to a real garden around an independent home, or even properties with adjoining agricultural land.",
        "Outdoor space changes everything, but it also asks for attention: exposure, slopes, access, the presence of large trees, water management and fencing. We help you understand whether that garden is really liveable the way you imagine, and whether the maintenance commitment is sustainable over time.",
      ],
      audience: [
        "Families with children looking for safe outdoor space.",
        "People who live with animals and want a fenced garden.",
        "Lovers of vegetable gardens, orchards and outdoor life.",
        "Anyone seeking a second home where you spend more time outside than in.",
        "Buyers wanting a home to host friends and family in the summer.",
      ],
      considerations: [
        "Real usability of the garden: exposure, slopes, shade.",
        "Fencing, pedestrian and vehicle access.",
        "Water availability for irrigation and garden management.",
        "Important trees: protections, maintenance, safety.",
        "Realistic maintenance commitment, especially as a second home.",
      ],
      blurb: "Outdoor space, vegetable plot, animals and outdoor life.",
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
    en: {
      name: "Affordable homes",
      fullName: "Affordable homes",
      h1: "Affordable homes for sale in Lunigiana",
      metaTitle: "Affordable homes for sale in Lunigiana | Furia Immobiliare",
      metaDescription:
        "Affordable homes for sale in Lunigiana under €100,000: smaller properties, homes to renovate, real opportunities to read carefully and without rush.",
      subtitle:
        "Homes in Lunigiana within smaller budgets: compact properties, homes to refresh, real opportunities to weigh up without rush.",
      paragraphs: [
        "Accessible solutions still exist in Lunigiana: small apartments, village houses to refresh, properties to renovate in the more secluded villages. They are interesting opportunities for those who want to enter the market with a contained budget, for a first investment or for a simple second home.",
        "At the same time, an affordable home needs even more attention: the lower price alone does not tell you the true cost of the operation. Renovation works, any outstanding condo charges, the state of systems and windows, running costs — everything must be weighed up realistically. Our job is to help you understand whether the opportunity is truly that.",
      ],
      audience: [
        "Buyers looking for a first property within a contained budget.",
        "Those considering a prudent investment in Lunigiana.",
        "People open to refreshing or renovation works.",
        "Anyone seeking an essential, non-representative second home.",
        "First-time buyers entering the local market.",
      ],
      considerations: [
        "Real renovation cost on top of the purchase price.",
        "Condo fees, building-works fund and any outstanding charges.",
        "Condition of systems, windows, roof and any damp issues.",
        "Running costs and utilities during the cold months.",
        "Real liquidity of the property over time.",
      ],
      blurb: "Smaller budgets, compact homes and opportunities to read carefully.",
    },
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
    en: {
      name: "Second homes",
      fullName: "Second homes",
      h1: "Second homes for sale in Lunigiana",
      metaTitle: "Second homes for sale in Lunigiana | Furia Immobiliare",
      metaDescription:
        "Second homes for sale in Lunigiana: a holiday house in a village, in the countryside or in the mountains. We help you choose one you can also manage from afar.",
      subtitle:
        "Second homes in Lunigiana: a holiday house in a village, in the countryside or in the mountains, chosen with long-distance management in mind.",
      paragraphs: [
        "Lunigiana is a natural choice for a second home: close to the sea and the Cinque Terre, to the Apennine mountains, well connected to Parma, Milan and Florence by motorway and rail. Living villages, character homes, prices that are still reasonable compared to other areas of Tuscany: there are many good reasons to choose a holiday home here.",
        "A second home, however, also has to be chosen thinking about how you'll actually live it: how many weekends a year, who takes care of it during your absences, which works are sustainable from afar. We work a lot with people who live elsewhere in Italy or abroad: we understand this point well and help you avoid the choices that become a burden instead of a pleasure.",
      ],
      audience: [
        "Buyers looking for a holiday home near the sea and the villages.",
        "Those wanting an easy-to-reach base in Italy.",
        "People living in another region or abroad who want real local support.",
        "Families seeking a holiday house, also to host guests.",
        "Anyone weighing a second home also as a potential investment.",
      ],
      considerations: [
        "Real distance from the points of interest (sea, mountains, cities).",
        "Maintenance you can manage even when you're not in the house.",
        "Security of the property during long periods of absence.",
        "Fixed costs (taxes, minimal utilities, condo) during empty months.",
        "Possible seasonal rental income and local rules on short-term lets.",
      ],
      blurb: "A holiday home in a village, in the countryside or in the mountains.",
    },
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

export type TipologiaSeoLocalized = {
  slug: string;
  name: string;
  fullName: string;
  h1: string;
  metaTitle: string;
  metaDescription: string;
  subtitle: string;
  paragraphs: [string, string];
  audience: string[];
  considerations: string[];
  blurb: string;
  relatedTypes: string[];
  suggestedComuni: string[];
};

/** Returns the localized view of a tipologia entry. Falls back to IT when EN is missing. */
export function localizeTipologiaSeo(t: TipologiaSeo, lang: "it" | "en"): TipologiaSeoLocalized {
  if (lang === "en" && t.en) {
    return {
      slug: t.slug,
      name: t.en.name,
      fullName: t.en.fullName,
      h1: t.en.h1,
      metaTitle: t.en.metaTitle,
      metaDescription: t.en.metaDescription,
      subtitle: t.en.subtitle,
      paragraphs: t.en.paragraphs,
      audience: t.en.audience,
      considerations: t.en.considerations,
      blurb: t.en.blurb,
      relatedTypes: t.relatedTypes,
      suggestedComuni: t.suggestedComuni,
    };
  }
  return {
    slug: t.slug,
    name: t.name,
    fullName: t.fullName,
    h1: `${t.fullName} in vendita in Lunigiana`,
    metaTitle: t.metaTitle,
    metaDescription: t.metaDescription,
    subtitle: t.subtitle,
    paragraphs: t.paragraphs,
    audience: t.audience,
    considerations: t.considerations,
    blurb: t.blurb,
    relatedTypes: t.relatedTypes,
    suggestedComuni: t.suggestedComuni,
  };
}