// Opzioni e label per i parametri di rendering AI delle foto immobile.
// File client-safe usato sia dal pannello admin sia dalla server fn per costruire il prompt.

export type Option = { id: string; label: string };

export const PHOTO_TYPES: Option[] = [
  { id: "interno", label: "Interno" },
  { id: "esterno", label: "Esterno" },
];

export const INTERNAL_CATEGORIES: Option[] = [
  { id: "soggiorno", label: "Soggiorno" },
  { id: "cucina", label: "Cucina" },
  { id: "camera_matrimoniale", label: "Camera matrimoniale" },
  { id: "camera_singola", label: "Camera singola" },
  { id: "cameretta", label: "Cameretta" },
  { id: "bagno", label: "Bagno" },
  { id: "ingresso", label: "Ingresso" },
  { id: "corridoio", label: "Corridoio" },
  { id: "studio", label: "Studio" },
  { id: "sala_pranzo", label: "Sala da pranzo" },
  { id: "taverna", label: "Taverna" },
  { id: "mansarda", label: "Mansarda" },
  { id: "cantina", label: "Cantina" },
  { id: "garage", label: "Garage" },
  { id: "altro_interno", label: "Altro interno" },
];

export const EXTERNAL_CATEGORIES: Option[] = [
  { id: "facciata", label: "Facciata" },
  { id: "giardino", label: "Giardino" },
  { id: "terrazza", label: "Terrazza" },
  { id: "balcone", label: "Balcone" },
  { id: "cortile", label: "Cortile" },
  { id: "portico", label: "Portico" },
  { id: "ingresso_esterno", label: "Ingresso esterno" },
  { id: "vista_panoramica", label: "Vista panoramica" },
  { id: "piscina", label: "Piscina" },
  { id: "dependance", label: "Dependance" },
  { id: "terreno", label: "Terreno" },
  { id: "altro_esterno", label: "Altro esterno" },
];

export const RENDER_STYLES: Option[] = [
  { id: "neutro_valorizzato", label: "Neutro valorizzato" },
  { id: "moderno_luminoso", label: "Moderno luminoso" },
  { id: "elegante_contemporaneo", label: "Elegante contemporaneo" },
  { id: "classico_raffinato", label: "Classico raffinato" },
  { id: "rustico_raffinato", label: "Rustico raffinato" },
  { id: "minimal_pulito", label: "Minimal pulito" },
  { id: "home_staging_premium", label: "Home staging premium" },
  { id: "ristrutturazione_leggera", label: "Ristrutturazione leggera" },
  { id: "ristrutturazione_completa", label: "Ristrutturazione completa" },
  { id: "esterno_curato", label: "Esterno curato" },
];

export const RENDER_GOALS: Option[] = [
  { id: "solo_valorizzazione", label: "Solo valorizzazione" },
  { id: "arredare_vuoto", label: "Arredare ambiente vuoto" },
  { id: "alleggerire_pieno", label: "Alleggerire ambiente troppo pieno" },
  { id: "modernizzare", label: "Modernizzare spazi" },
  { id: "simulare_ristrutturazione", label: "Simulare ristrutturazione" },
  { id: "luce_volumi", label: "Valorizzare luce e volumi" },
  { id: "migliorare_giardino", label: "Migliorare giardino / esterni" },
  { id: "migliorare_facciata", label: "Migliorare facciata" },
  { id: "vendibilita", label: "Rendere più vendibile la foto" },
];

export const ROOM_CONDITIONS: Option[] = [
  { id: "vuoto", label: "Vuoto" },
  { id: "arredato", label: "Arredato" },
  { id: "da_rinfrescare", label: "Da rinfrescare" },
  { id: "da_ristrutturare", label: "Da ristrutturare" },
  { id: "buono", label: "In buono stato" },
  { id: "ottimo", label: "In ottimo stato" },
];

export const INTERVENTION_LEVELS: Option[] = [
  { id: "molto_leggero", label: "Molto leggero" },
  { id: "leggero", label: "Leggero" },
  { id: "medio", label: "Medio" },
  { id: "forte", label: "Forte" },
];

export const LIGHTING_OPTIONS: Option[] = [
  { id: "naturale", label: "Naturale" },
  { id: "piu_luminosa", label: "Più luminosa" },
  { id: "molto_luminosa", label: "Molto luminosa" },
  { id: "calda", label: "Calda accogliente" },
  { id: "neutra", label: "Neutra professionale" },
];

export const VISUAL_TARGETS: Option[] = [
  { id: "famiglia", label: "Famiglia" },
  { id: "coppia", label: "Coppia" },
  { id: "investitore", label: "Investitore" },
  { id: "vacanza", label: "Casa vacanza" },
  { id: "premium", label: "Cliente premium" },
  { id: "generico", label: "Generico" },
];

export function labelOf(list: Option[], id: string | null | undefined): string | null {
  if (!id) return null;
  return list.find((o) => o.id === id)?.label ?? null;
}

export function categoriesFor(photoType: string | null | undefined): Option[] {
  if (photoType === "esterno") return EXTERNAL_CATEGORIES;
  return INTERNAL_CATEGORIES;
}

export type RenderSettings = {
  photo_type: string | null;
  photo_category: string | null;
  render_style: string | null;
  render_goal: string | null;
  room_condition: string | null;
  intervention_level: string | null;
  preserve_structure: boolean;
  desired_lighting: string | null;
  visual_target: string | null;
  render_notes: string | null;
};