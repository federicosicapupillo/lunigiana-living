/**
 * Structured taxonomy for the SEO landings.
 *
 * Le landing SEO NON devono essere decise dalle parole presenti in
 * description / title / highlights: quelle sono ambigue ("borgo",
 * "casa in pietra", "ingresso indipendente"). Qui usiamo solo campi
 * strutturati realmente presenti nel DB:
 *
 *  - contract_type  → PublicProperty.isRent / category
 *  - property_type  → PublicProperty.type
 *  - garden (bool)  → PublicProperty.garden
 *  - price          → PublicProperty.priceValue (null se su richiesta)
 *
 * Valori property_type realmente presenti (published, ago 2026):
 *  Appartamento, Attico, Bifamiliare, Casa di borgo, Casa indipendente,
 *  Casale, Rustico, Semindipendente, Villa.
 */
import type { PublicProperty } from "@/lib/public-properties.functions";

/** Normalizza il property_type per il confronto (case/accenti/spazi). */
export function normalizedType(p: Pick<PublicProperty, "type">): string {
  return (p.type || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** True solo per immobili realmente in vendita (contract_type != affitto). */
export function isForSale(p: Pick<PublicProperty, "isRent" | "category">): boolean {
  return !p.isRent && p.category !== "affitto";
}

/** Whitelist di property_type per ciascuna landing tipologica. */
export const TYPE_WHITELIST: Record<string, string[]> = {
  // "Casa di borgo" = casa storica in pietra nel borgo: appartiene per natura
  // alla famiglia rustici/casali, non alle case indipendenti moderne.
  "rustici-casali": [
    "rustico",
    "casale",
    "casa colonica",
    "cascina",
    "fienile",
    "casa di borgo",
  ],
  "case-indipendenti": [
    "casa indipendente",
    "casa singola",
    "villetta",
    "bifamiliare",
    "semindipendente",
    "casa semindipendente",
  ],
  appartamenti: ["appartamento", "attico", "bilocale", "trilocale", "monolocale", "mansarda"],
  ville: ["villa", "villa padronale", "villa storica"],
};

/** True quando il property_type strutturato appartiene alla whitelist. */
export function typeInWhitelist(p: Pick<PublicProperty, "type">, slug: string): boolean {
  const list = TYPE_WHITELIST[slug];
  if (!list) return false;
  const t = normalizedType(p);
  if (!t) return false;
  return list.includes(t);
}

/** Soglia "case economiche". */
export const AFFORDABLE_MAX_PRICE = 100_000;

/** Prezzo confrontabile: solo vendita, valore reale > 0. */
export function isAffordableSale(
  p: Pick<PublicProperty, "isRent" | "category" | "priceValue">,
): boolean {
  return (
    isForSale(p) &&
    typeof p.priceValue === "number" &&
    p.priceValue > 0 &&
    p.priceValue <= AFFORDABLE_MAX_PRICE
  );
}

/** Giardino: solo dato strutturato. */
export function hasGarden(p: Pick<PublicProperty, "garden">): boolean {
  return p.garden === true;
}

/**
 * Landing tipologica primaria (deterministica) di un immobile, per il
 * linking interno dalle schede. `null` quando il mapping non è certo:
 * meglio nessun link che un link incoerente.
 */
export function primaryTipologiaSlug(p: PublicProperty): string | null {
  if (!isForSale(p)) return null;
  for (const slug of ["rustici-casali", "ville", "appartamenti", "case-indipendenti"]) {
    if (typeInWhitelist(p, slug)) return slug;
  }
  return null;
}

/** Comune (municipality) normalizzato, con fallback sulla location. */
export function propertyMunicipality(p: PublicProperty): string {
  if (p.municipality) return p.municipality;
  return (p.location || "").split("·")[0]?.trim() || "";
}
