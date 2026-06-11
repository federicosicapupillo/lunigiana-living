import type { Language } from "./translations";

/**
 * Centralized localizer for property data that comes from the DB or controlled
 * value lists. Used everywhere we display property fields to ensure no IT text
 * leaks through in EN mode for known values. Free text (titles/descriptions) is
 * handled by the AI translation pipeline; this file handles the controlled
 * vocabulary and structural strings.
 */

const TYPE_MAP: Record<string, string> = {
  "Casale": "Farmhouse",
  "Rustico": "Country house",
  "Villa": "Villa",
  "Casa indipendente": "Detached house",
  "Casa semindipendente": "Semi-detached house",
  "Terratetto": "Townhouse",
  "Appartamento": "Apartment",
  "Attico": "Penthouse",
  "Bifamiliare": "Semi-detached house",
  "Semindipendente": "Semi-detached house",
  "Podere": "Country estate",
  "Agriturismo": "Agritourism",
  "Borgo / proprietà storica": "Historic village / property",
  "Terreno agricolo": "Agricultural land",
  "Terreno edificabile": "Building land",
  "Locale commerciale": "Commercial premises",
  "Altro": "Other",
  "Immobile": "Property",
  "Villetta": "House",
  "Villetta a schiera": "Terraced house",
  "Monolocale": "Studio",
  "Bilocale": "One-bedroom apartment",
  "Trilocale": "Two-bedroom apartment",
  "Quadrilocale": "Three-bedroom apartment",
};

export function localizeType(type: string | null | undefined, lang: Language): string {
  const v = (type ?? "").trim();
  if (!v) return "";
  if (lang === "it") return v;
  return TYPE_MAP[v] ?? v;
}

const AMENITY_MAP: Record<string, string> = {
  "Giardino": "Garden",
  "Giardino privato": "Private garden",
  "Corte privata": "Private courtyard",
  "Terreno": "Land",
  "Uliveto": "Olive grove",
  "Vigneto": "Vineyard",
  "Bosco": "Woodland",
  "Terrazza": "Terrace",
  "Terrazza panoramica": "Panoramic terrace",
  "Balcone": "Balcony",
  "Loggia": "Loggia",
  "Portico": "Portico",
  "Patio": "Patio",
  "Veranda": "Veranda",
  "Piscina": "Swimming pool",
  "Possibilità piscina": "Pool possibility",
  "Vista panoramica": "Panoramic view",
  "Vista montagne": "Mountain view",
  "Vista mare": "Sea view",
  "Vista borgo": "Village view",
  "Vista fiume": "River view",
  "Garage": "Garage",
  "Posto auto": "Parking space",
  "Posto auto coperto": "Covered parking",
  "Cantina": "Cellar",
  "Taverna": "Tavern room",
  "Soffitta": "Attic",
  "Mansarda": "Loft",
  "Deposito": "Storage",
  "Legnaia": "Woodshed",
  "Fienile": "Barn",
  "Annesso agricolo": "Farm outbuilding",
  "Dependence": "Annex",
  "Locale tecnico": "Utility room",
  "Camino": "Fireplace",
  "Stufa": "Stove",
  "Aria condizionata": "Air conditioning",
  "Pannelli solari": "Solar panels",
  "Fotovoltaico": "Photovoltaic system",
  "Impianto allarme": "Alarm system",
  "Videosorveglianza": "Video surveillance",
  "Domotica": "Home automation",
  "Internet / fibra": "Internet / fibre",
  "Cancello automatico": "Automatic gate",
  "Doppi vetri": "Double glazing",
  "Zanzariere": "Mosquito screens",
  "Porta blindata": "Reinforced door",
  "Ascensore": "Lift",
  "Accesso disabili": "Disabled access",
  "Ingresso indipendente": "Independent entrance",
  "Strada privata": "Private road",
  "Facile accesso auto": "Easy car access",
  "Vicino ai servizi": "Close to amenities",
  "Vicino al centro": "Close to centre",
  "Posizione riservata": "Private location",
  "Immobile storico": "Historic property",
  "Casale in pietra": "Stone farmhouse",
  "Travature a vista": "Exposed beams",
  "Pavimenti originali": "Original flooring",
  "Soffitti affrescati": "Frescoed ceilings",
  "Torretta": "Tower",
  "Mura storiche": "Historic walls",
  "Ideale per B&B": "Ideal for B&B",
  "Ideale per agriturismo": "Ideal for agritourism",
  "Ideale come seconda casa": "Ideal as second home",
  "Ideale per investimento": "Ideal for investment",
  "Proprietà divisibile": "Divisible property",
  "Possibilità ampliamento": "Expansion possibility",
  "Possibilità cambio destinazione d'uso": "Change of use possible",
};

export function localizeAmenity(value: string, lang: Language): string {
  if (lang === "it") return value;
  const v = value.trim();
  return AMENITY_MAP[v] ?? v;
}

const ATTR_KEY_MAP: Record<string, string> = {
  "Tipologia": "Type",
  "Superficie": "Surface",
  "Locali": "Rooms",
  "Camere": "Bedrooms",
  "Bagni": "Bathrooms",
  "Piano": "Floor",
  "Riscaldamento": "Heating",
  "Cucina": "Kitchen",
  "Stato": "Condition",
  "Arredamento": "Furnishing",
  "Box": "Garage",
  "Posto auto": "Parking space",
  "Giardino": "Garden",
  "Terrazzo": "Terrace",
  "Balcone": "Balcony",
  "Cantina": "Cellar",
  "Ascensore": "Lift",
  "Infissi interni": "Interior fittings",
  "Infissi esterni": "External fittings",
  "Classe energetica": "Energy class",
  "IPE": "EPI",
};

export function localizeAttrKey(key: string, lang: Language): string {
  if (lang === "it") return key;
  return ATTR_KEY_MAP[key] ?? key;
}

const ATTR_VALUE_MAP: Record<string, string> = {
  "Non dichiarato": "Not declared",
  "In attesa di APE": "APE in progress",
  "APE non disponibile": "APE not available",
  "Immobile esente": "Property exempt",
  "Non indicato": "Not specified",
  "Sì": "Yes",
  "No": "No",
  "Ottimo": "Excellent",
  "Buono": "Good",
  "Abitabile": "Habitable",
  "Da ristrutturare": "To renovate",
  "Parzialmente ristrutturato": "Partially renovated",
  "Ristrutturato": "Renovated",
  "Nuova costruzione": "New build",
  "Arredato": "Furnished",
  "Non arredato": "Unfurnished",
  "Parzialmente arredato": "Partially furnished",
  "Autonomo": "Independent",
  "Centralizzato": "Centralised",
  "Assente": "None",
  "Abitabile separata": "Separate eat-in",
  "Cucinotto": "Kitchenette",
  "A vista": "Open-plan",
  "Angolo cottura": "Kitchen corner",
  "Piano terra": "Ground floor",
  "Piano rialzato": "Raised ground floor",
  "Primo piano": "First floor",
  "Secondo piano": "Second floor",
  "Ultimo piano": "Top floor",
  "Più piani": "Multiple floors",
  "Esente": "Exempt",
  "In fase di rilascio": "In progress",
  "Non disponibile": "Not available",
};

export function localizeAttrValue(value: string, lang: Language): string {
  if (lang === "it") return value;
  const v = value.trim();
  if (ATTR_VALUE_MAP[v]) return ATTR_VALUE_MAP[v];
  // EPI unit: "123 kWh/m² anno"
  if (/\bkWh\/m²\s*anno\b/.test(v)) return v.replace(/anno/g, "year");
  return v;
}

export function localizePrice(price: string, lang: Language): string {
  if (!price) return price;
  if (lang === "it") return price;
  return price
    .replace("Prezzo su richiesta", "Price on request")
    .replace("/ mese", "/ month");
}

const TAG_MAP: Record<string, string> = {
  "Storico": "Historic",
  "Panoramico": "Panoramic",
  "Nuovo": "New",
  "In evidenza": "Featured",
};

export function localizeTag(tag: string | undefined | null, lang: Language): string | undefined {
  if (!tag) return tag ?? undefined;
  if (lang === "it") return tag;
  return TAG_MAP[tag] ?? tag;
}

export function localizeRoomsLabel(label: string | null | undefined, lang: Language): string {
  const v = (label ?? "").trim();
  if (!v) return "";
  if (lang === "it") return v;
  // "3 camere" → "3 bedrooms", "1 camera" → "1 bedroom"
  return v
    .replace(/(\d+)\s+camere\b/gi, "$1 bedrooms")
    .replace(/(\d+)\s+camera\b/gi, "$1 bedroom")
    .replace(/(\d+)\s+locali\b/gi, "$1 rooms")
    .replace(/(\d+)\s+locale\b/gi, "$1 room");
}

/** Localize a free DB string by best-effort lookup across all maps. */
export function localizeKnown(value: string | null | undefined, lang: Language): string {
  const v = (value ?? "").trim();
  if (!v) return "";
  if (lang === "it") return v;
  return (
    AMENITY_MAP[v] ??
    ATTR_VALUE_MAP[v] ??
    TYPE_MAP[v] ??
    TAG_MAP[v] ??
    v
  );
}
