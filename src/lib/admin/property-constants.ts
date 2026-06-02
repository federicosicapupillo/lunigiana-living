export const PROPERTY_TYPES = [
  "Casa indipendente",
  "Casa di paese",
  "Rustico / Casale",
  "Villa",
  "Appartamento",
  "Terreno",
  "Locale commerciale",
] as const;

export const CONTRACT_TYPES = ["Vendita", "Affitto"] as const;

export const ENERGY_CLASSES = ["A+", "A", "B", "C", "D", "E", "F", "G"] as const;

export const CONDITIONS = [
  "Nuovo / Da costruire",
  "Ristrutturato",
  "Buono",
  "Da ristrutturare",
  "Da demolire / ricostruire",
] as const;

export const STATUS_LABELS: Record<string, string> = {
  draft: "Bozza",
  ready: "Pronto",
  published: "Pubblicato",
};

export const NARRATIVE_FIELDS = [
  { key: "target_acquirente", label: "Target acquirente", placeholder: "Es. famiglia in cerca di seconda casa, investitore..." },
  { key: "punti_di_forza", label: "Punti di forza", placeholder: "Es. vista mare, pietra a vista, posizione panoramica" },
  { key: "stile_descrizione", label: "Stile della descrizione", placeholder: "Es. raffinato, asciutto, narrativo" },
  { key: "livello_prestigio", label: "Livello di prestigio", placeholder: "Es. residenza esclusiva, casa di carattere" },
  { key: "elementi_storici", label: "Elementi storici/architettonici", placeholder: "Es. soffitti a volta, camino in pietra, affreschi" },
  { key: "vista_contesto", label: "Vista / contesto / atmosfera", placeholder: "Es. tramonti sulle Apuane, silenzio dei boschi" },
  { key: "lavori_recenti", label: "Lavori recenti", placeholder: "Es. tetto rifatto 2023, infissi nuovi" },
  { key: "ideale_per", label: "Ideale per", placeholder: "Es. smart-working, ritiro creativo, B&B di charme" },
  { key: "parole_da_enfatizzare", label: "Parole da enfatizzare", placeholder: "Es. autentico, luminoso, panoramico" },
  { key: "parole_da_evitare", label: "Parole da evitare", placeholder: "Es. occasione, affare, prezzo trattabile" },
] as const;

export type NarrativeKey = (typeof NARRATIVE_FIELDS)[number]["key"];

export const LENGTH_OPTIONS = [
  { value: "breve", label: "Breve", hint: "80–120 parole · per annuncio rapido" },
  { value: "media", label: "Media", hint: "180–250 parole · standard portali" },
  { value: "editoriale", label: "Editoriale / premium", hint: "350–500 parole · narrazione completa" },
] as const;

export const TONE_OPTIONS = [
  { value: "neutro", label: "Neutro professionale", hint: "Asciutto, informativo, autorevole" },
  { value: "emozionale", label: "Emozionale raffinato", hint: "Evocativo, sensoriale, letterario" },
  { value: "commerciale", label: "Commerciale premium", hint: "Persuasivo ma elegante, focus valore" },
] as const;