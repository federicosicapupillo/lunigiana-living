/**
 * Helper centralizzato per il <title> HTML delle schede immobile.
 *
 * Obiettivi (BLOCCO SEO 4A):
 * - nessuna ellissi né parola tagliata a metà;
 * - nessun doppio spazio, nessuno spazio prima della punteggiatura;
 * - nessuna ripetizione evidente del comune;
 * - tipologia e caratteristica distintiva preservate;
 * - codice immobile sempre visibile;
 * - brand "Furia Immobiliare" mai troncato;
 * - lunghezza preferibilmente entro ~60-65 caratteri.
 *
 * Nessun dato immobiliare viene modificato: la pulizia è solo presentazionale.
 */

export const BRAND = "Furia Immobiliare";

export type MetaTitleInput = {
  title?: string | null;
  type?: string | null;
  municipality?: string | null;
  location?: string | null;
  reference?: string | null;
};

const TARGET_MAX = 65;
/** Parole minime da preservare nel nucleo descrittivo (tipologia + tratto). */
const MIN_CORE_WORDS = 3;

function collapse(s: string): string {
  return s.replace(/\s+/g, " ").trim();
}

/** Rimuove spazi prima della punteggiatura e normalizza i separatori. */
function fixPunctuationSpacing(s: string): string {
  return s
    .replace(/\s+([,.;:!?])/g, "$1")
    .replace(/([,;:])(?=\S)/g, "$1 ")
    .replace(/!{2,}/g, "!")
    .replace(/\.{2,}/g, ".")
    .replace(/\s*[–—-]\s*$/, "")
    .replace(/[,;:]\s*$/, "")
    .replace(/\.\s*$/, "");
}

function municipalityOf(p: MetaTitleInput): string | null {
  const muni = (p.municipality ?? "").trim();
  if (muni) return muni;
  const head = (p.location ?? "").split("·")[0]?.trim();
  return head || null;
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Elimina la ripetizione del comune dal titolo: prefissi tipo
 * "Pontremoli:", "Pontremoli (MS) –", oppure la coda " a Pontremoli".
 */
function stripMunicipality(title: string, muni: string | null): string {
  let out = title;
  if (muni) {
    const m = escapeRe(muni);
    out = out.replace(new RegExp(`^\\s*${m}\\s*(\\(\\s*\\w+\\s*\\))?\\s*[:\\-–—,]\\s*`, "i"), "");
    out = out.replace(new RegExp(`^\\s*${m}\\s*(\\(\\s*\\w+\\s*\\))?\\s+`, "i"), "");
    out = out.replace(new RegExp(`\\s+a\\s+${m}\\s*$`, "i"), "");
    // eventuali ulteriori occorrenze ridondanti a metà titolo
    out = out.replace(new RegExp(`\\s+a\\s+${m}\\b`, "i"), "");
  }
  return collapse(out);
}

function capitalizeFirst(s: string): string {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

/** Parole di collegamento che non possono chiudere un titolo. */
const DANGLING = new Set([
  "con", "e", "di", "a", "in", "da", "per", "del", "della", "dei", "delle",
  "al", "alla", "il", "lo", "la", "le", "i", "gli", "un", "una", "su", "tra",
]);

/** Rimuove connettori o punteggiatura orfani in coda. */
function trimDangling(s: string): string {
  const words = s.split(" ");
  while (words.length > 1) {
    const last = words[words.length - 1]!.replace(/[,.;:!?]+$/, "");
    if (DANGLING.has(last.toLowerCase())) words.pop();
    else break;
  }
  return fixPunctuationSpacing(words.join(" "));
}

/** Accorcia il nucleo togliendo parole intere dalla coda (mai ellissi). */
function shortenByWords(core: string, budget: number): string {
  // 1) prova a tenere solo la prima frase compiuta (prima di "." o ",").
  const firstClause = fixPunctuationSpacing(core.split(/[.;]|,\s/)[0] ?? core);
  if (
    firstClause.length <= budget &&
    firstClause.split(" ").length >= MIN_CORE_WORDS
  ) {
    return trimDangling(firstClause);
  }
  const words = core.split(" ");
  let out = core;
  while (out.length > budget && words.length > MIN_CORE_WORDS) {
    words.pop();
    out = trimDangling(words.join(" "));
  }
  return trimDangling(fixPunctuationSpacing(out));
}

/**
 * Costruisce il <title> della scheda immobile.
 * Formato: "<Nucleo descrittivo> a <Comune> — <Codice> | Furia Immobiliare"
 * Le parti opzionali (comune, nucleo lungo) vengono ridotte solo se necessario.
 */
export function buildPropertyMetaTitle(p: MetaTitleInput, max = TARGET_MAX): string {
  const muni = municipalityOf(p);
  const ref = (p.reference ?? "").trim();
  const suffix = ` | ${BRAND}`;
  const refPart = ref ? ` — ${ref}` : "";

  let core = fixPunctuationSpacing(collapse((p.title ?? "").toString()));
  core = stripMunicipality(core, muni);
  core = core.replace(/\s*\(\s*MS\s*\)\s*/gi, " ");
  core = fixPunctuationSpacing(collapse(core));
  if (!core) core = (p.type ?? "Immobile").toString().trim() || "Immobile";
  core = capitalizeFirst(core);

  const place = muni && !new RegExp(`\\b${escapeRe(muni)}\\b`, "i").test(core) ? ` a ${muni}` : "";

  const full = `${core}${place}${refPart}${suffix}`;
  if (full.length <= max) return full;

  // 1) prova a togliere il comune (resta nella description e nell'H1)
  const noPlace = `${core}${refPart}${suffix}`;
  if (noPlace.length <= max) return noPlace;

  // 2) accorcia il nucleo per parole intere, mantenendo comune se possibile
  const budgetWithPlace = max - (place.length + refPart.length + suffix.length);
  const shortWithPlace = shortenByWords(core, budgetWithPlace);
  const candidate = `${shortWithPlace}${place}${refPart}${suffix}`;
  if (candidate.length <= max) return candidate;

  const budget = max - (refPart.length + suffix.length);
  return `${shortenByWords(core, budget)}${refPart}${suffix}`;
}
