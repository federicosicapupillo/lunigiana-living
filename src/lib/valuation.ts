/**
 * Opzioni del funnel proprietari "/valuta-casa".
 *
 * Le etichette seguono lo stesso schema bilingue usato dal percorso guidato
 * (`src/routes/trova-casa-lunigiana.tsx`): valore stabile per il database,
 * etichetta IT/EN per l'interfaccia. I valori non vanno rinominati, perché
 * vengono salvati nel record del lead (campo `details`) e serviranno al CRM.
 */
import type { Language } from "@/lib/i18n/translations";

export type ValOption = { value: string; labelIt: string; labelEn: string };

export function valLabel(opt: ValOption | undefined | null, lang: Language): string {
  if (!opt) return "";
  return lang === "en" ? opt.labelEn : opt.labelIt;
}

export function valLabelOf(list: ValOption[], value: string, lang: Language): string {
  return valLabel(list.find((o) => o.value === value), lang);
}

/** Tipologie: allineate ai valori usati in scheda immobile / filtri pubblici. */
export const VAL_TYPES: ValOption[] = [
  { value: "Appartamento", labelIt: "Appartamento", labelEn: "Apartment" },
  { value: "Casa indipendente", labelIt: "Casa indipendente", labelEn: "Detached house" },
  { value: "Casa semindipendente", labelIt: "Casa semindipendente", labelEn: "Semi-detached house" },
  { value: "Villa", labelIt: "Villa", labelEn: "Villa" },
  { value: "Villetta", labelIt: "Villetta", labelEn: "Small villa" },
  { value: "Rustico / Casale", labelIt: "Rustico / Casale", labelEn: "Farmhouse / country house" },
  { value: "Terratetto", labelIt: "Terratetto", labelEn: "Terraced house" },
  { value: "Palazzo / Dimora storica", labelIt: "Palazzo / Dimora storica", labelEn: "Historic palazzo / residence" },
  { value: "Agriturismo / struttura ricettiva", labelIt: "Agriturismo / struttura ricettiva", labelEn: "Agriturismo / hospitality property" },
  { value: "Terreno", labelIt: "Terreno", labelEn: "Land" },
  { value: "Altro", labelIt: "Altro", labelEn: "Other" },
];

export const VAL_FEATURES: ValOption[] = [
  { value: "garden", labelIt: "Giardino", labelEn: "Garden" },
  { value: "land", labelIt: "Terreno", labelEn: "Land" },
  { value: "terrace", labelIt: "Terrazza", labelEn: "Terrace" },
  { value: "balcony", labelIt: "Balcone", labelEn: "Balcony" },
  { value: "garage", labelIt: "Garage", labelEn: "Garage" },
  { value: "parking", labelIt: "Posto auto", labelEn: "Parking space" },
  { value: "cellar", labelIt: "Cantina", labelEn: "Cellar" },
  { value: "pool", labelIt: "Piscina", labelEn: "Swimming pool" },
  { value: "view", labelIt: "Vista panoramica", labelEn: "Panoramic view" },
  { value: "elevator", labelIt: "Ascensore", labelEn: "Lift" },
  { value: "private_entrance", labelIt: "Ingresso indipendente", labelEn: "Private entrance" },
  { value: "other", labelIt: "Altro", labelEn: "Other" },
];

/** Caratteristiche che abilitano il campo "superficie esterna". */
export const OUTDOOR_FEATURES = ["garden", "land"] as const;

export const VAL_CONDITIONS: ValOption[] = [
  { value: "new_renovated", labelIt: "Nuovo / recentemente ristrutturato", labelEn: "New / recently renovated" },
  { value: "excellent", labelIt: "Ottime condizioni", labelEn: "Excellent condition" },
  { value: "good", labelIt: "Buone condizioni", labelEn: "Good condition" },
  { value: "liveable_dated", labelIt: "Abitabile ma da aggiornare", labelEn: "Liveable but dated" },
  { value: "to_renovate", labelIt: "Da ristrutturare", labelEn: "To renovate" },
  { value: "full_renovation", labelIt: "Da ristrutturare completamente", labelEn: "Needs full renovation" },
  { value: "unknown", labelIt: "Non saprei", labelEn: "Not sure" },
];

export const VAL_OCCUPANCY: ValOption[] = [
  { value: "vacant", labelIt: "Libero", labelEn: "Vacant" },
  { value: "owner_occupied", labelIt: "Abitato dal proprietario", labelEn: "Lived in by the owner" },
  { value: "rented", labelIt: "Affittato", labelEn: "Rented out" },
  { value: "second_home", labelIt: "Utilizzato come seconda casa", labelEn: "Used as a second home" },
  { value: "other", labelIt: "Altro", labelEn: "Other" },
];

export const VAL_HAS_PRICE: ValOption[] = [
  { value: "yes", labelIt: "Sì", labelEn: "Yes" },
  { value: "no", labelIt: "No, vorrei prima capire il suo valore", labelEn: "No, I'd like to understand its value first" },
];

export const VAL_TIMELINE: ValOption[] = [
  { value: "asap", labelIt: "Il prima possibile", labelEn: "As soon as possible" },
  { value: "3m", labelIt: "Entro 3 mesi", labelEn: "Within 3 months" },
  { value: "6m", labelIt: "Entro 6 mesi", labelEn: "Within 6 months" },
  { value: "12m", labelIt: "Entro 12 mesi", labelEn: "Within 12 months" },
  { value: "considering", labelIt: "Sto solo valutando l'idea", labelEn: "I'm just considering the idea" },
  { value: "unknown", labelIt: "Non lo so ancora", labelEn: "I don't know yet" },
];

export const VAL_GOALS: ValOption[] = [
  { value: "know_value", labelIt: "Capire quanto vale il mio immobile", labelEn: "Understand what my property is worth" },
  { value: "sell", labelIt: "Vendere", labelEn: "Sell" },
  { value: "thinking", labelIt: "Sto pensando se vendere", labelEn: "I'm thinking about whether to sell" },
  { value: "sell_discreetly", labelIt: "Vendere con discrezione", labelEn: "Sell discreetly" },
  { value: "existing_buyers", labelIt: "Capire se ci sono già potenziali acquirenti", labelEn: "Find out if there are already potential buyers" },
  { value: "other", labelIt: "Altro", labelEn: "Other" },
];

/** Obiettivi che indicano interesse verso Furia Off Market. */
export const OFF_MARKET_GOALS = ["sell_discreetly", "existing_buyers"] as const;

export function isOffMarketGoal(goal: string): boolean {
  return (OFF_MARKET_GOALS as readonly string[]).includes(goal);
}

export const VAL_CONTACT_METHODS: ValOption[] = [
  { value: "whatsapp", labelIt: "WhatsApp", labelEn: "WhatsApp" },
  { value: "phone", labelIt: "Telefono", labelEn: "Phone" },
  { value: "email", labelIt: "Email", labelEn: "Email" },
];
