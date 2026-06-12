// Generatore titolo annuncio (fallback senza IA) – usato lato client per
// proporre/rigenerare automaticamente un titolo coerente con i dati immobile.

type TitleInput = {
  property_type?: string | null;
  contract_type?: string | null;
  municipality?: string | null;
  area_zone?: string | null;
  bedrooms?: number | null;
  condition?: string | null;
  panoramic_view?: boolean;
  historic_property?: boolean;
  garden?: boolean;
  terrace?: boolean;
  balcony?: boolean;
  garage?: boolean;
  furnished?: boolean;
};

const TYPE_LABEL: Record<string, string> = {
  appartamento: "Appartamento",
  attico: "Attico",
  villa: "Villa",
  villetta: "Villetta",
  casa_indipendente: "Casa indipendente",
  casa_semindipendente: "Casa semindipendente",
  rustico: "Rustico",
  casale: "Casale",
  terreno: "Terreno",
  locale_commerciale: "Locale commerciale",
  ufficio: "Ufficio",
  garage: "Garage",
  bilocale: "Bilocale",
  trilocale: "Trilocale",
  monolocale: "Monolocale",
};

const CONDITION_LABEL: Record<string, string> = {
  nuovo: "nuovo",
  ristrutturato: "ristrutturato",
  ottimo: "in ottimo stato",
  buono: "in buono stato",
  da_ristrutturare: "da ristrutturare",
  da_rinnovare: "da rinnovare",
};

function typeLabel(t?: string | null) {
  if (!t) return null;
  return TYPE_LABEL[t] ?? t.charAt(0).toUpperCase() + t.slice(1).replace(/_/g, " ");
}

export function buildFallbackTitle(p: TitleInput): string {
  const tipologia = typeLabel(p.property_type);
  const features: string[] = [];
  if (p.panoramic_view) features.push("vista panoramica");
  else if (p.garden) features.push("giardino");
  else if (p.terrace) features.push("terrazza");
  else if (p.balcony) features.push("balcone");
  else if (p.garage) features.push("garage");
  else if (p.historic_property) features.push("dettagli storici");

  const condition = p.condition ? CONDITION_LABEL[p.condition] ?? null : null;

  // Base
  let base = tipologia ?? "Immobile";
  if (condition && (condition === "ristrutturato" || condition === "nuovo")) {
    base = `${base} ${condition}`;
  } else if (condition === "da ristrutturare" && tipologia) {
    base = `${tipologia} da ristrutturare`;
  }

  if (features.length > 0) {
    base = `${base} con ${features[0]}`;
  } else if (p.bedrooms && p.bedrooms > 0) {
    base = `${base} con ${p.bedrooms} camere`;
  }

  const place = p.area_zone?.trim() || p.municipality?.trim();
  if (place) {
    base = `${base} a ${place}`;
  }

  // Capitalize first letter, single line, max ~80 chars
  base = base.replace(/\s+/g, " ").trim();
  if (base.length > 80) base = base.slice(0, 77).trimEnd() + "…";
  return base.charAt(0).toUpperCase() + base.slice(1);
}

const DEFAULT_TITLES = new Set(["", "Nuovo immobile", "Immobile"]);

export function isDefaultTitle(t?: string | null): boolean {
  if (!t) return true;
  return DEFAULT_TITLES.has(t.trim());
}