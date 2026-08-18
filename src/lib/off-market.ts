/**
 * Struttura (non testi) della pagina /off-market.
 * Tutti i testi vivono nel dizionario i18n esistente (src/lib/i18n/translations.ts)
 * e sono risolti con useT(): la pagina è quindi bilingue IT/EN come le altre.
 */

export const OM_PATHS = [
  { id: "buyer" as const, anchor: "#ricerca-riservata" },
  { id: "seller" as const, anchor: "#vendita-riservata" },
];

export const OM_STEP_IDS = [1, 2, 3, 4];

export const OM_BUYER_POINTS = ["om.buyer.p1", "om.buyer.p2", "om.buyer.p3", "om.buyer.p4"];
export const OM_SELLER_POINTS = ["om.seller.p1", "om.seller.p2", "om.seller.p3", "om.seller.p4"];

export const OM_FAQ_IDS = [1, 2, 3, 4, 5, 6];

/** Valori salvati in DB (sempre in italiano) + chiave di traduzione per l'etichetta. */
export const OM_BUDGETS = [
  { value: "Fino a 80.000 €", key: "om.budget.1" },
  { value: "80.000 – 150.000 €", key: "om.budget.2" },
  { value: "150.000 – 250.000 €", key: "om.budget.3" },
  { value: "250.000 – 400.000 €", key: "om.budget.4" },
  { value: "Oltre 400.000 €", key: "om.budget.5" },
  { value: "Preferisco parlarne direttamente", key: "om.budget.6" },
];

export const OM_TYPES = [
  { value: "Appartamento", key: "om.type.apartment" },
  { value: "Casa indipendente", key: "om.type.detached" },
  { value: "Villetta", key: "om.type.townhouse" },
  { value: "Rustico / casale", key: "om.type.rustic" },
  { value: "Villa", key: "om.type.villa" },
  { value: "Terreno", key: "om.type.land" },
  { value: "Immobile da ristrutturare", key: "om.type.renovation" },
  { value: "Non ho ancora deciso", key: "om.type.undecided" },
];
