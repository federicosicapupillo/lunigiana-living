import type { Language } from "./translations";
import { COMMERCIAL_HIGHLIGHT_EN } from "@/lib/admin/property-constants";

/** Centralized localizer for every property text shown on the public site. */

const TYPE_MAP: Record<string, string> = {
  Casale: "Farmhouse",
  Rustico: "Country house",
  Villa: "Villa",
  "Casa indipendente": "Detached house",
  "Casa semindipendente": "Semi-detached house",
  Terratetto: "Townhouse",
  Appartamento: "Apartment",
  Attico: "Penthouse",
  Bifamiliare: "Semi-detached house",
  Semindipendente: "Semi-detached house",
  Podere: "Country estate",
  Agriturismo: "Agritourism",
  "Borgo / proprietà storica": "Historic village / property",
  Terreno: "Land",
  "Terreno agricolo": "Agricultural land",
  "Terreno edificabile": "Building land",
  "Locale commerciale": "Commercial premises",
  Altro: "Other",
  Immobile: "Property",
  Villetta: "House",
  "Villetta a schiera": "Terraced house",
  Monolocale: "Studio",
  Bilocale: "One-bedroom apartment",
  Trilocale: "Two-bedroom apartment",
  Quadrilocale: "Three-bedroom apartment",
};

const AMENITY_MAP: Record<string, string> = {
  Giardino: "Garden",
  "Giardino privato": "Private garden",
  "Corte privata": "Private courtyard",
  Terreno: "Land",
  Uliveto: "Olive grove",
  Vigneto: "Vineyard",
  Bosco: "Woodland",
  Terrazza: "Terrace",
  "Terrazza panoramica": "Panoramic terrace",
  Balcone: "Balcony",
  Loggia: "Loggia",
  Portico: "Portico",
  Patio: "Patio",
  Veranda: "Veranda",
  Piscina: "Swimming pool",
  "Possibilità piscina": "Pool possibility",
  "Vista panoramica": "Panoramic view",
  "Vista sulle Apuane": "Apuan Alps view",
  "Vista montagne": "Mountain view",
  "Vista mare": "Sea view",
  "Vista borgo": "Village view",
  "Vista fiume": "River view",
  Garage: "Garage",
  "Posto auto": "Parking space",
  "Posto auto coperto": "Covered parking",
  Cantina: "Cellar",
  Taverna: "Tavern room",
  Soffitta: "Attic",
  Mansarda: "Loft",
  Deposito: "Storage",
  Legnaia: "Woodshed",
  Fienile: "Barn",
  "Annesso agricolo": "Farm outbuilding",
  Dependence: "Annex",
  "Locale tecnico": "Utility room",
  Camino: "Fireplace",
  Stufa: "Stove",
  "Aria condizionata": "Air conditioning",
  "Pannelli solari": "Solar panels",
  Fotovoltaico: "Photovoltaic system",
  "Impianto allarme": "Alarm system",
  Videosorveglianza: "Video surveillance",
  Domotica: "Home automation",
  "Internet / fibra": "Internet / fibre",
  "Cancello automatico": "Automatic gate",
  "Doppi vetri": "Double glazing",
  Zanzariere: "Mosquito screens",
  "Porta blindata": "Reinforced door",
  Ascensore: "Lift",
  "Accesso disabili": "Disabled access",
  "Ingresso indipendente": "Independent entrance",
  "Strada privata": "Private road",
  "Facile accesso auto": "Easy car access",
  "Vicino ai servizi": "Close to amenities",
  "Vicino al centro": "Close to centre",
  "Vicino al mare": "Close to the sea",
  "A pochi minuti dall'autostrada": "A few minutes from the motorway",
  "Posizione riservata": "Private location",
  "Posizione dominante": "Dominant position",
  "Posizione soleggiata": "Sunny position",
  "Immobile storico": "Historic property",
  "Immobile in pietra": "Stone property",
  "Casale in pietra": "Stone farmhouse",
  "Travature a vista": "Exposed beams",
  "Pavimenti originali": "Original flooring",
  "Soffitti affrescati": "Frescoed ceilings",
  Torretta: "Tower",
  "Mura storiche": "Historic walls",
  "Ideale per B&B": "Ideal for B&B",
  "Ideale per agriturismo": "Ideal for agritourism",
  "Ideale come seconda casa": "Ideal as second home",
  "Ideale per investimento": "Ideal for investment",
  "Ideale per affitti turistici": "Ideal for holiday rentals",
  "Proprietà divisibile": "Divisible property",
  "Possibilità ampliamento": "Expansion possibility",
  "Possibilità cambio destinazione d'uso": "Change of use possible",
  "Abitabile subito": "Move-in ready",
  "Da personalizzare": "To personalise",
  "Grande potenziale": "Great potential",
  Privacy: "Privacy",
  Silenzio: "Quiet",
  Natura: "Nature",
  "Famiglia con bambini": "Family with children",
  Coppia: "Couple",
  Single: "Single person",
  Pensionati: "Retirees",
  Investitore: "Investor",
  "Investitore short-let": "Short-let investor",
  "Acquirente straniero": "International buyer",
  "Seconda casa": "Second home",
  "Prima casa": "Primary home",
  "Smart worker": "Remote worker",
  "Amanti della natura": "Nature lovers",
  "Amanti dei borghi": "Village lovers",
  "Chi cerca tranquillità": "Those looking for peace and quiet",
  "Chi cerca privacy": "Those looking for privacy",
  "Chi vuole vivere vicino al mare ma lontano dal caos": "Those who want to live near the sea, away from the crowds",
  "Gestione B&B": "B&B management",
  "Casa vacanze": "Holiday home",
  "Struttura ricettiva": "Hospitality business",
  "Progetto di ristrutturazione": "Renovation project",
  "Borgo storico": "Historic village",
  "Borgo medievale": "Medieval village",
  Campagna: "Countryside",
  Collina: "Hillside",
  Montagna: "Mountain setting",
  Valle: "Valley",
  "Vicino al fiume": "Close to the river",
  "Vicino ai sentieri": "Close to walking trails",
  "Contesto naturale": "Natural setting",
  "Contesto riservato": "Private setting",
  "Contesto panoramico": "Panoramic setting",
  "Contesto autentico": "Authentic setting",
  "Zona tranquilla": "Quiet area",
  "Silenzio dei boschi": "Woodland silence",
  "Tramonti sulle Apuane": "Sunsets over the Apuan Alps",
  "Vista aperta": "Open view",
  "Atmosfera romantica": "Romantic atmosphere",
  "Atmosfera rustica": "Rustic atmosphere",
  "Atmosfera elegante": "Elegant atmosphere",
  "Atmosfera familiare": "Family atmosphere",
  "Atmosfera mediterranea": "Mediterranean atmosphere",
  Terrazzamenti: "Terraced land",
  "Verde circostante": "Surrounding greenery",
  "Pietra a vista": "Exposed stone",
  "Facciata in pietra": "Stone façade",
  "Muri storici": "Historic walls",
  "Travi in legno": "Wooden beams",
  "Soffitti a volta": "Vaulted ceilings",
  "Camino in pietra": "Stone fireplace",
  "Camino antico": "Antique fireplace",
  "Cotto antico": "Antique terracotta flooring",
  "Archi in pietra": "Stone arches",
  "Scala in pietra": "Stone staircase",
  "Portale storico": "Historic doorway",
  Loggiato: "Loggia",
  "Cantina voltata": "Vaulted cellar",
  "Mura medievali": "Medieval walls",
  Affreschi: "Frescoes",
  "Nicchie originali": "Original niches",
  "Infissi tradizionali": "Traditional window frames",
  "Elementi rustici": "Rustic features",
  "Elementi nobiliari": "Noble architectural details",
  // Valorizzazione commerciale
  ...COMMERCIAL_HIGHLIGHT_EN,
};

const ATTR_KEY_MAP: Record<string, string> = {
  Tipologia: "Type",
  Superficie: "Surface",
  Locali: "Rooms",
  Camere: "Bedrooms",
  Bagni: "Bathrooms",
  Piano: "Floor",
  Riscaldamento: "Heating",
  Cucina: "Kitchen",
  Stato: "Condition",
  Arredamento: "Furnishing",
  Box: "Garage",
  "Posto auto": "Parking space",
  Giardino: "Garden",
  Terrazzo: "Terrace",
  Balcone: "Balcony",
  Cantina: "Cellar",
  Ascensore: "Lift",
  "Infissi interni": "Interior fittings",
  "Infissi esterni": "External fittings",
  "Classe energetica": "Energy class",
  IPE: "EPI",
};

const ATTR_VALUE_MAP: Record<string, string> = {
  "Non dichiarato": "Not declared",
  "In attesa di APE": "APE in progress",
  "APE non disponibile": "APE not available",
  "Immobile esente": "Property exempt",
  "Non indicato": "Not specified",
  "Trattativa riservata": "Price on request",
  "Prezzo su richiesta": "Price on request",
  "In vendita": "For sale",
  "In affitto": "For rent",
  Sì: "Yes",
  No: "No",
  Ottimo: "Excellent",
  Buono: "Good",
  Abitabile: "Habitable",
  "Da ristrutturare": "To renovate",
  "Parzialmente ristrutturato": "Partially renovated",
  Ristrutturato: "Renovated",
  "Nuova costruzione": "New build",
  Arredato: "Furnished",
  "Non arredato": "Unfurnished",
  "Parzialmente arredato": "Partially furnished",
  Autonomo: "Independent",
  Centralizzato: "Centralised",
  Assente: "None",
  "Abitabile separata": "Separate eat-in kitchen",
  Cucinotto: "Kitchenette",
  "A vista": "Open-plan",
  "Angolo cottura": "Kitchen corner",
  "Piano terra": "Ground floor",
  "Piano rialzato": "Raised ground floor",
  "Primo piano": "First floor",
  "Secondo piano": "Second floor",
  "Ultimo piano": "Top floor",
  "Più piani": "Multiple floors",
  Esente: "Exempt",
  "In fase di rilascio": "In progress",
  "Non disponibile": "Not available",
};

const SECTION_LABEL_MAP: Record<string, string> = {
  "Punti di forza": "Strengths",
  "Target immobile": "Ideal for",
  "Target acquirente": "Buyer profile",
  "Atmosfera / Contesto": "Atmosphere / setting",
  "Vista / contesto / atmosfera": "View / setting / atmosphere",
  "Elementi architettonici rilevanti": "Architectural features",
  "Elementi storici/architettonici": "Historic / architectural features",
};

const TAG_MAP: Record<string, string> = {
  Storico: "Historic",
  Panoramico: "Panoramic",
  Nuovo: "New",
  "In evidenza": "Featured",
};

const EXACT_FREE_TEXT_MAP: Record<string, string> = {
  "appartamento centrale con garage": "Central apartment with garage",
  "rustico con terreno": "Country house with land",
  "casa indipendente con giardino": "Detached house with garden",
  "villetta con garage e giardino": "House with garage and garden",
  "villetta a schiera con garage": "Terraced house with garage",
};

const FREE_TEXT_REPLACEMENTS: Array<[RegExp, string]> = [
  [/\bcasa indipendente\b/gi, "detached house"],
  [/\bcasa semindipendente\b/gi, "semi-detached house"],
  [/\bvilletta a schiera\b/gi, "terraced house"],
  [/\bappartamento centrale\b/gi, "central apartment"],
  [/\brustico\b/gi, "country house"],
  [/\bappartamento\b/gi, "apartment"],
  [/\bvilletta\b/gi, "house"],
  [/\bterreno\b/gi, "land"],
  [/\bgiardino\b/gi, "garden"],
  [/\bgarage\b/gi, "garage"],
  [/\bterrazza\b/gi, "terrace"],
  [/\bcantina\b/gi, "cellar"],
  [/\bposto auto\b/gi, "parking space"],
  [/\bristrutturato\b/gi, "renovated"],
  [/\bda ristrutturare\b/gi, "to renovate"],
  [/\bab?itabile\b/gi, "habitable"],
  [/\bcentrale\b/gi, "central"],
  [/\bpanoramico\b/gi, "panoramic"],
  [/\bpanoramica\b/gi, "panoramic"],
  [/\bcon\b/gi, "with"],
  [/\be\b/gi, "and"],
  [/\bin\s+vendita\b/gi, "for sale"],
  [/\bin\s+affitto\b/gi, "for rent"],
];

function sentenceCase(text: string): string {
  const trimmed = text.trim().replace(/\s+/g, " ");
  if (!trimmed) return "";
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

export function localizeType(type: string | null | undefined, lang: Language): string {
  const v = (type ?? "").trim();
  if (!v || lang === "it") return v;
  return TYPE_MAP[v] ?? localizeKnown(v, lang);
}

export function localizeAmenity(value: string, lang: Language): string {
  if (lang === "it") return value;
  return localizeKnown(value, lang);
}

export function localizeAttrKey(key: string, lang: Language): string {
  if (lang === "it") return key;
  return ATTR_KEY_MAP[key] ?? SECTION_LABEL_MAP[key] ?? key;
}

export function localizeAttrValue(value: string, lang: Language): string {
  const v = (value ?? "").trim();
  if (!v || lang === "it") return value;
  if (ATTR_VALUE_MAP[v]) return ATTR_VALUE_MAP[v];
  if (/\bkWh\/m²\s*anno\b/.test(v)) return v.replace(/anno/g, "year");
  return localizeKnown(v, lang);
}

export function localizePrice(price: string, lang: Language): string {
  if (!price || lang === "it") return price;
  return price
    .replace(/Prezzo su richiesta|Trattativa riservata/gi, "Price on request")
    .replace(/\/\s*mese/gi, "/ month");
}

export function localizeTag(tag: string | undefined | null, lang: Language): string | undefined {
  if (!tag) return tag ?? undefined;
  if (lang === "it") return tag;
  return TAG_MAP[tag] ?? localizeKnown(tag, lang);
}

export function localizeRoomsLabel(label: string | null | undefined, lang: Language): string {
  const v = (label ?? "").trim();
  if (!v || lang === "it") return v;
  return v
    .replace(/(\d+)\s+camere\b/gi, "$1 bedrooms")
    .replace(/(\d+)\s+camera\b/gi, "$1 bedroom")
    .replace(/(\d+)\s+locali\b/gi, "$1 rooms")
    .replace(/(\d+)\s+locale\b/gi, "$1 room");
}

export function localizeFreeText(value: string | null | undefined, lang: Language): string {
  const v = (value ?? "").trim();
  if (!v || lang === "it") return v;
  const exact = EXACT_FREE_TEXT_MAP[v.toLowerCase()];
  if (exact) return exact;
  const known = localizeKnown(v, lang);
  if (known !== v) return known;
  let out = v;
  for (const [pattern, replacement] of FREE_TEXT_REPLACEMENTS) {
    out = out.replace(pattern, replacement);
  }
  return sentenceCase(out);
}

/** Localize a free DB string by best-effort lookup across all maps. */
export function localizeKnown(value: string | null | undefined, lang: Language): string {
  const v = (value ?? "").trim();
  if (!v || lang === "it") return v;
  return AMENITY_MAP[v] ?? ATTR_VALUE_MAP[v] ?? TYPE_MAP[v] ?? TAG_MAP[v] ?? SECTION_LABEL_MAP[v] ?? v;
}

type LocalizableProperty = {
  title?: string;
  titleEn?: string | null;
  description?: string;
  descriptionEn?: string | null;
  price?: string;
  priceRent?: string;
  type?: string | null;
  tag?: string | null;
  epi?: string;
  roomsLabel?: string | null;
  floor?: string | null;
  amenities?: string[];
  altreDotazioni?: string | null;
  attributes?: Record<string, string>;
  highlights?: Array<{ key: string; label: string; items: string[]; note: string | null }>;
};

/** One public-site entry point: apply EN translations to all dynamic property fields. */
export function localizePropertyDynamic<T extends LocalizableProperty>(property: T, lang: Language): T {
  if (lang === "it") return property;
  const localized: LocalizableProperty = {
    ...property,
    title: localizeFreeText(property.titleEn || property.title, lang),
    description: localizeFreeText(property.descriptionEn || property.description, lang),
    price: property.price ? localizePrice(property.price, lang) : property.price,
    priceRent: property.priceRent ? localizePrice(property.priceRent, lang) : property.priceRent,
    type: localizeType(property.type, lang),
    tag: localizeTag(property.tag, lang),
    epi: property.epi ? localizeAttrValue(property.epi, lang) : property.epi,
    roomsLabel: property.roomsLabel ? localizeRoomsLabel(property.roomsLabel, lang) : property.roomsLabel,
    floor: property.floor ? localizeAttrValue(property.floor, lang) : property.floor,
    amenities: property.amenities?.map((item) => localizeAmenity(item, lang)),
    altreDotazioni: property.altreDotazioni ? localizeFreeText(property.altreDotazioni, lang) : property.altreDotazioni,
    attributes: property.attributes
      ? Object.fromEntries(Object.entries(property.attributes).map(([key, value]) => [key, localizeAttrValue(value, lang)]))
      : property.attributes,
    highlights: property.highlights?.map((group) => ({
      ...group,
      label: localizeAttrKey(group.label, lang),
      items: group.items.map((item) => localizeFreeText(item, lang)),
      note: group.note ? localizeFreeText(group.note, lang) : group.note,
    })),
  };
  return localized as T;
}
