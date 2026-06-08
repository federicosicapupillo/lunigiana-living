export const PROPERTY_TYPES = [
  "Casale",
  "Rustico",
  "Villa",
  "Casa indipendente",
  "Terratetto",
  "Appartamento",
  "Attico",
  "Bifamiliare",
  "Semindipendente",
  "Podere",
  "Agriturismo",
  "Borgo / proprietà storica",
  "Terreno agricolo",
  "Terreno edificabile",
  "Locale commerciale",
  "Altro",
] as const;

export const CONTRACT_TYPES = ["Vendita", "Affitto"] as const;

export const ENERGY_CLASSES = [
  "A4",
  "A3",
  "A2",
  "A1",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "Esente",
  "In fase di rilascio",
  "Non disponibile",
] as const;

/* ---------- Indice di Prestazione Energetica (IPE / EPgl,nren) ---------- */

export const EPI_STATUS_OPTIONS = [
  { value: "precise_value", label: "Inserisci valore preciso" },
  { value: "pending_ape", label: "In attesa di APE" },
  { value: "ape_not_available", label: "APE non disponibile" },
  { value: "exempt", label: "Immobile esente" },
  { value: "not_declared", label: "Non dichiarato" },
] as const;

export type EpiStatus = (typeof EPI_STATUS_OPTIONS)[number]["value"];

/** Format the IPE for display in public pages. Empty/null -> "Non dichiarato". */
export function formatEpi(
  status: string | null | undefined,
  value: number | null | undefined,
): string {
  switch (status) {
    case "precise_value":
      if (value == null || Number.isNaN(value)) return "Non dichiarato";
      return `${new Intl.NumberFormat("it-IT", { maximumFractionDigits: 2 }).format(value)} kWh/m² anno`;
    case "pending_ape":
      return "In attesa di APE";
    case "ape_not_available":
      return "APE non disponibile";
    case "exempt":
      return "Immobile esente";
    case "not_declared":
    case null:
    case undefined:
    case "":
      return "Non dichiarato";
    default:
      return "Non dichiarato";
  }
}

export const CONDITIONS = [
  "Ottimo",
  "Buono",
  "Abitabile",
  "Da ristrutturare",
  "Parzialmente ristrutturato",
  "Ristrutturato",
  "Nuova costruzione",
  "In costruzione",
  "Da ultimare",
  "Rustico da recuperare",
] as const;

export const FURNISHED_OPTIONS = [
  "Non arredato",
  "Arredato",
  "Parzialmente arredato",
  "Cucina arredata",
  "Su richiesta",
  "Da concordare",
] as const;
export type FurnishedOption = (typeof FURNISHED_OPTIONS)[number];

/** Mappa il livello di arredo al boolean salvato in `properties.furnished`. */
export const FURNISHED_TO_BOOL: Record<string, boolean> = {
  "Non arredato": false,
  "Arredato": true,
  "Parzialmente arredato": true,
  "Cucina arredata": true,
  "Su richiesta": false,
  "Da concordare": false,
};

export const HEATING_OPTIONS = [
  "Autonomo",
  "Centralizzato",
  "A pavimento",
  "Pompa di calore",
  "Stufa a pellet",
  "Camino",
  "Termocamino",
  "GPL",
  "Metano",
  "Gasolio",
  "Elettrico",
  "Solare termico",
  "Assente",
  "Da verificare",
] as const;

export const FLOOR_OPTIONS = [
  "Piano terra",
  "Primo piano",
  "Secondo piano",
  "Terzo piano",
  "Quarto piano",
  "Ultimo piano",
  "Attico",
  "Su più livelli",
  "Seminterrato",
  "Interrato",
  "Rialzato",
  "Non applicabile",
] as const;

/** Mappa il label piano al valore numerico salvato in `properties.floors`.
 * `null` significa: non salvare un intero (solo il label resta nei features). */
export const FLOOR_TO_NUMBER: Record<string, number | null> = {
  "Piano terra": 0,
  "Primo piano": 1,
  "Secondo piano": 2,
  "Terzo piano": 3,
  "Quarto piano": 4,
  "Ultimo piano": null,
  "Attico": null,
  "Su più livelli": null,
  "Seminterrato": -1,
  "Interrato": -1,
  "Rialzato": 0,
  "Non applicabile": null,
};

/* ---------- Range / opzioni "facili" sezione 3 ---------- */

export const SIZE_RANGE_OPTIONS = [
  "Fino a 50 mq",
  "50 - 80 mq",
  "80 - 120 mq",
  "120 - 160 mq",
  "160 - 200 mq",
  "200 - 300 mq",
  "300 - 500 mq",
  "Oltre 500 mq",
] as const;
export const SIZE_CUSTOM = "Inserisci valore preciso";

export const BEDROOMS_OPTIONS = [
  "Monolocale / ambiente unico",
  "1 camera",
  "2 camere",
  "3 camere",
  "4 camere",
  "5 camere",
  "Più di 5 camere",
] as const;
export const BEDROOMS_CUSTOM = "Inserisci valore personalizzato";

/** Mappa label camere → intero (null = non rappresentabile). */
export const BEDROOMS_TO_NUMBER: Record<string, number | null> = {
  "Monolocale / ambiente unico": 0,
  "1 camera": 1,
  "2 camere": 2,
  "3 camere": 3,
  "4 camere": 4,
  "5 camere": 5,
  "Più di 5 camere": 6,
};

export const BATHROOMS_OPTIONS = [
  "1 bagno",
  "2 bagni",
  "3 bagni",
  "4 bagni",
  "Più di 4 bagni",
] as const;
export const BATHROOMS_CUSTOM = "Inserisci valore personalizzato";

export const BATHROOMS_TO_NUMBER: Record<string, number | null> = {
  "1 bagno": 1,
  "2 bagni": 2,
  "3 bagni": 3,
  "4 bagni": 4,
  "Più di 4 bagni": 5,
};

export const TOTAL_FLOORS_OPTIONS = [
  "1 piano",
  "2 piani",
  "3 piani",
  "4 piani",
  "5 piani",
  "Più di 5 piani",
  "Non applicabile",
] as const;
export const TOTAL_FLOORS_CUSTOM = "Inserisci valore personalizzato";

/* ---------- Dotazioni raggruppate ---------- */

export const AMENITY_GROUPS: Array<{ title: string; items: readonly string[] }> = [
  {
    title: "Esterni",
    items: [
      "Giardino",
      "Giardino privato",
      "Corte privata",
      "Terreno",
      "Uliveto",
      "Vigneto",
      "Bosco",
      "Terrazza",
      "Terrazza panoramica",
      "Balcone",
      "Loggia",
      "Portico",
      "Patio",
      "Veranda",
      "Piscina",
      "Possibilità piscina",
      "Vista panoramica",
      "Vista montagne",
      "Vista mare",
      "Vista borgo",
      "Vista fiume",
    ],
  },
  {
    title: "Pertinenze",
    items: [
      "Garage",
      "Posto auto",
      "Posto auto coperto",
      "Cantina",
      "Taverna",
      "Soffitta",
      "Mansarda",
      "Deposito",
      "Legnaia",
      "Fienile",
      "Annesso agricolo",
      "Dependence",
      "Locale tecnico",
    ],
  },
  {
    title: "Comfort e impianti",
    items: [
      "Camino",
      "Stufa",
      "Aria condizionata",
      "Pannelli solari",
      "Fotovoltaico",
      "Impianto allarme",
      "Videosorveglianza",
      "Domotica",
      "Internet / fibra",
      "Cancello automatico",
      "Doppi vetri",
      "Zanzariere",
      "Porta blindata",
    ],
  },
  {
    title: "Accessibilità",
    items: [
      "Ascensore",
      "Accesso disabili",
      "Ingresso indipendente",
      "Strada privata",
      "Facile accesso auto",
      "Vicino ai servizi",
      "Vicino al centro",
      "Posizione riservata",
    ],
  },
  {
    title: "Caratteristiche speciali",
    items: [
      "Immobile storico",
      "Casale in pietra",
      "Rustico",
      "Travature a vista",
      "Pavimenti originali",
      "Soffitti affrescati",
      "Torretta",
      "Mura storiche",
      "Ideale per B&B",
      "Ideale per agriturismo",
      "Ideale come seconda casa",
      "Ideale per investimento",
      "Proprietà divisibile",
      "Possibilità ampliamento",
      "Possibilità cambio destinazione d'uso",
    ],
  },
];

export const ALL_AMENITIES: string[] = AMENITY_GROUPS.flatMap((g) => g.items as string[]);

/** Mappa dotazione → colonna boolean su `properties` (per backward-compat / filtri). */
export const AMENITY_TO_COLUMN: Record<string, string> = {
  "Giardino": "garden",
  "Giardino privato": "garden",
  "Terrazza": "terrace",
  "Terrazza panoramica": "terrace",
  "Balcone": "balcony",
  "Garage": "garage",
  "Cantina": "cellar",
  "Ascensore": "elevator",
  "Vista panoramica": "panoramic_view",
  "Immobile storico": "historic_property",
};

export const AMENITY_FEATURE_PREFIX = "amenity:";

export const REGIONS = [
  "Abruzzo",
  "Basilicata",
  "Calabria",
  "Campania",
  "Emilia-Romagna",
  "Friuli-Venezia Giulia",
  "Lazio",
  "Liguria",
  "Lombardia",
  "Marche",
  "Molise",
  "Piemonte",
  "Puglia",
  "Sardegna",
  "Sicilia",
  "Toscana",
  "Trentino-Alto Adige",
  "Umbria",
  "Valle d'Aosta",
  "Veneto",
] as const;

/** Province italiane (sigla — nome). Ordinate alfabeticamente per nome. */
export const PROVINCES: Array<{ code: string; name: string }> = [
  { code: "AG", name: "Agrigento" },
  { code: "AL", name: "Alessandria" },
  { code: "AN", name: "Ancona" },
  { code: "AO", name: "Aosta" },
  { code: "AR", name: "Arezzo" },
  { code: "AP", name: "Ascoli Piceno" },
  { code: "AT", name: "Asti" },
  { code: "AV", name: "Avellino" },
  { code: "BA", name: "Bari" },
  { code: "BT", name: "Barletta-Andria-Trani" },
  { code: "BL", name: "Belluno" },
  { code: "BN", name: "Benevento" },
  { code: "BG", name: "Bergamo" },
  { code: "BI", name: "Biella" },
  { code: "BO", name: "Bologna" },
  { code: "BZ", name: "Bolzano" },
  { code: "BS", name: "Brescia" },
  { code: "BR", name: "Brindisi" },
  { code: "CA", name: "Cagliari" },
  { code: "CL", name: "Caltanissetta" },
  { code: "CB", name: "Campobasso" },
  { code: "CE", name: "Caserta" },
  { code: "CT", name: "Catania" },
  { code: "CZ", name: "Catanzaro" },
  { code: "CH", name: "Chieti" },
  { code: "CO", name: "Como" },
  { code: "CS", name: "Cosenza" },
  { code: "CR", name: "Cremona" },
  { code: "KR", name: "Crotone" },
  { code: "CN", name: "Cuneo" },
  { code: "EN", name: "Enna" },
  { code: "FM", name: "Fermo" },
  { code: "FE", name: "Ferrara" },
  { code: "FI", name: "Firenze" },
  { code: "FG", name: "Foggia" },
  { code: "FC", name: "Forlì-Cesena" },
  { code: "FR", name: "Frosinone" },
  { code: "GE", name: "Genova" },
  { code: "GO", name: "Gorizia" },
  { code: "GR", name: "Grosseto" },
  { code: "IM", name: "Imperia" },
  { code: "IS", name: "Isernia" },
  { code: "SP", name: "La Spezia" },
  { code: "AQ", name: "L'Aquila" },
  { code: "LT", name: "Latina" },
  { code: "LE", name: "Lecce" },
  { code: "LC", name: "Lecco" },
  { code: "LI", name: "Livorno" },
  { code: "LO", name: "Lodi" },
  { code: "LU", name: "Lucca" },
  { code: "MC", name: "Macerata" },
  { code: "MN", name: "Mantova" },
  { code: "MS", name: "Massa-Carrara" },
  { code: "MT", name: "Matera" },
  { code: "ME", name: "Messina" },
  { code: "MI", name: "Milano" },
  { code: "MO", name: "Modena" },
  { code: "MB", name: "Monza e della Brianza" },
  { code: "NA", name: "Napoli" },
  { code: "NO", name: "Novara" },
  { code: "NU", name: "Nuoro" },
  { code: "OR", name: "Oristano" },
  { code: "PD", name: "Padova" },
  { code: "PA", name: "Palermo" },
  { code: "PR", name: "Parma" },
  { code: "PV", name: "Pavia" },
  { code: "PG", name: "Perugia" },
  { code: "PU", name: "Pesaro e Urbino" },
  { code: "PE", name: "Pescara" },
  { code: "PC", name: "Piacenza" },
  { code: "PI", name: "Pisa" },
  { code: "PT", name: "Pistoia" },
  { code: "PN", name: "Pordenone" },
  { code: "PZ", name: "Potenza" },
  { code: "PO", name: "Prato" },
  { code: "RG", name: "Ragusa" },
  { code: "RA", name: "Ravenna" },
  { code: "RC", name: "Reggio Calabria" },
  { code: "RE", name: "Reggio Emilia" },
  { code: "RI", name: "Rieti" },
  { code: "RN", name: "Rimini" },
  { code: "RM", name: "Roma" },
  { code: "RO", name: "Rovigo" },
  { code: "SA", name: "Salerno" },
  { code: "SS", name: "Sassari" },
  { code: "SV", name: "Savona" },
  { code: "SI", name: "Siena" },
  { code: "SR", name: "Siracusa" },
  { code: "SO", name: "Sondrio" },
  { code: "SU", name: "Sud Sardegna" },
  { code: "TA", name: "Taranto" },
  { code: "TE", name: "Teramo" },
  { code: "TR", name: "Terni" },
  { code: "TO", name: "Torino" },
  { code: "TP", name: "Trapani" },
  { code: "TN", name: "Trento" },
  { code: "TV", name: "Treviso" },
  { code: "TS", name: "Trieste" },
  { code: "UD", name: "Udine" },
  { code: "VA", name: "Varese" },
  { code: "VE", name: "Venezia" },
  { code: "VB", name: "Verbano-Cusio-Ossola" },
  { code: "VC", name: "Vercelli" },
  { code: "VR", name: "Verona" },
  { code: "VV", name: "Vibo Valentia" },
  { code: "VI", name: "Vicenza" },
  { code: "VT", name: "Viterbo" },
];

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

// =====================================================================
// MULTI-SELECT OPTIONS for narrative fields (Punti di forza, Target,
// Atmosfera/Contesto, Elementi architettonici).
// =====================================================================

export const STRENGTHS_OPTIONS = [
  "Vista panoramica","Vista mare","Vista sulle Apuane","Vista montagne","Vista borgo",
  "Vista fiume","Posizione dominante","Posizione soleggiata","Posizione riservata",
  "Vicino al centro","Vicino ai servizi","Vicino al mare","A pochi minuti dall'autostrada",
  "Giardino privato","Terreno","Uliveto","Piscina","Possibilità piscina",
  "Immobile in pietra","Immobile storico","Ristrutturato","Abitabile subito",
  "Da personalizzare","Grande potenziale","Ideale come seconda casa",
  "Ideale per investimento","Ideale per B&B","Ideale per affitti turistici",
  "Privacy","Silenzio","Natura",
] as const;

export const TARGETS_OPTIONS = [
  "Famiglia con bambini","Coppia","Single","Pensionati","Investitore",
  "Investitore short-let","Acquirente straniero","Seconda casa","Prima casa",
  "Smart worker","Amanti della natura","Amanti dei borghi","Chi cerca tranquillità",
  "Chi cerca privacy","Chi vuole vivere vicino al mare ma lontano dal caos",
  "Gestione B&B","Agriturismo","Casa vacanze","Struttura ricettiva",
  "Progetto di ristrutturazione",
] as const;

export const ATMOSPHERE_OPTIONS = [
  "Borgo storico","Borgo medievale","Campagna","Collina","Montagna","Bosco","Valle",
  "Vicino al fiume","Vicino ai sentieri","Contesto naturale","Contesto riservato",
  "Contesto panoramico","Contesto autentico","Zona tranquilla","Silenzio dei boschi",
  "Tramonti sulle Apuane","Vista aperta","Atmosfera romantica","Atmosfera rustica",
  "Atmosfera elegante","Atmosfera familiare","Atmosfera mediterranea",
  "Terrazzamenti","Verde circostante",
] as const;

export const ARCHITECTURAL_OPTIONS = [
  "Pietra a vista","Facciata in pietra","Muri storici","Travi in legno",
  "Travature a vista","Soffitti a volta","Camino in pietra","Camino antico",
  "Pavimenti originali","Cotto antico","Archi in pietra","Scala in pietra",
  "Portale storico","Loggiato","Portico","Terrazza panoramica","Cantina voltata",
  "Taverna","Torretta","Mura medievali","Affreschi","Nicchie originali",
  "Infissi tradizionali","Elementi rustici","Elementi nobiliari",
] as const;

export type MultiSelectValue = {
  selected: string[];
  altro: string;
  note: string;
};

export const EMPTY_MULTI: MultiSelectValue = { selected: [], altro: "", note: "" };

/** Parse a value stored in property_features. Falls back to legacy text → note. */
export function parseMultiSelect(raw: string | null | undefined): MultiSelectValue {
  if (!raw) return { ...EMPTY_MULTI };
  const trimmed = raw.trim();
  if (!trimmed) return { ...EMPTY_MULTI };
  if (trimmed.startsWith("{")) {
    try {
      const parsed = JSON.parse(trimmed);
      return {
        selected: Array.isArray(parsed.selected) ? parsed.selected.filter((x: unknown) => typeof x === "string") : [],
        altro: typeof parsed.altro === "string" ? parsed.altro : "",
        note: typeof parsed.note === "string" ? parsed.note : "",
      };
    } catch {
      // fall through
    }
  }
  // Legacy plain text: preserve as note
  return { selected: [], altro: "", note: trimmed };
}

/** Serialize for storage. Returns empty string when nothing meaningful. */
export function serializeMultiSelect(v: MultiSelectValue): string {
  if (!v.selected.length && !v.altro.trim() && !v.note.trim()) return "";
  return JSON.stringify({
    selected: v.selected,
    altro: v.altro.trim(),
    note: v.note.trim(),
  });
}

export const MULTI_SELECT_FIELDS = [
  { key: "punti_di_forza", label: "Punti di forza", placeholder: "Seleziona uno o più punti di forza", otherLabel: "Altro punto di forza", options: STRENGTHS_OPTIONS },
  { key: "target_acquirente", label: "Target immobile", placeholder: "Seleziona uno o più target", otherLabel: "Altro target", options: TARGETS_OPTIONS },
  { key: "vista_contesto", label: "Atmosfera / Contesto", placeholder: "Seleziona uno o più elementi di atmosfera", otherLabel: "Altro elemento di contesto", options: ATMOSPHERE_OPTIONS },
  { key: "elementi_storici", label: "Elementi architettonici rilevanti", placeholder: "Seleziona uno o più elementi architettonici", otherLabel: "Altro elemento architettonico", options: ARCHITECTURAL_OPTIONS },
] as const;

export type MultiSelectKey = (typeof MULTI_SELECT_FIELDS)[number]["key"];

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