/**
 * Helper centralizzato per il <title> HTML delle schede immobile.
 *
 * Obiettivi (BLOCCO SEO 4A — integrazione):
 * - schema orientativo: "[Immobile o caratteristica] a [Comune] — [Codice] | Brand";
 * - il comune è SEMPRE presente e proviene solo dai dati reali dell'immobile
 *   (municipality, oppure testa di location): nessuna deduzione, nessuna invenzione;
 * - nessuna ellissi né parola tagliata a metà, nessun doppio spazio;
 * - tipologia / caratteristica distintiva preservata;
 * - espressioni promozionali deboli ("Investimento!", "Occasione!") rimosse;
 * - codice immobile e brand sempre visibili;
 * - lunghezza preferita ~60-70 caratteri, ma il comune non viene mai sacrificato.
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

const TARGET_MAX = 70;
/** Parole minime da preservare nel nucleo descrittivo (tipologia + tratto). */
const MIN_CORE_WORDS = 3;

/** Espressioni promozionali deboli, rimosse dal nucleo descrittivo. */
const WEAK_PROMO =
  /^(?:investimento|occasione|occasione unica|affare|affarone|imperdibile|da vedere|novità|nuovo annuncio|opportunità|super occasione)\s*[!.:,–—-]*\s*/i;

/** Normalizzazioni ortografiche minime (nessun dato inventato). */
function normalizeSpelling(s: string): string {
  return s
    // "35mq" -> "35 mq", "120m2" -> "120 mq"
    .replace(/(\d)\s*(?:mq|m2|m²)\b/gi, "$1 mq")
    .replace(/\btrifamigliare\b/gi, (m) => (m[0] === "T" ? "Trifamiliare" : "trifamiliare"))
    .replace(/\bbifamigliare\b/gi, (m) => (m[0] === "B" ? "Bifamiliare" : "bifamiliare"))
    .replace(/\bplurifamigliare\b/gi, (m) => (m[0] === "P" ? "Plurifamiliare" : "plurifamiliare"));
}

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
    // "posto" da solo è un troncamento di "posto auto": non può chiudere.
    if (DANGLING.has(last.toLowerCase()) || last.toLowerCase() === "posto") words.pop();
    else break;
  }
  return fixPunctuationSpacing(words.join(" "));
}

/**
 * Confine dei segmenti: punteggiatura, " e ", " con ", " da ".
 * Si eliminano solo interi segmenti finali, mai parole isolate: così una
 * caratteristica non resta mutila ("centro storico" -> "centro").
 */
const SEGMENT_RE = /(\s*[.;]\s*|,\s*|\s+e\s+|\s+con\s+|\s+da\s+)/;

/** Un nucleo di una sola parola è troppo povero: non si scende sotto. */
const MIN_KEPT_WORDS = 2;

/**
 * Accorcia il nucleo togliendo interi segmenti finali. Se nessuna variante
 * rientra nel budget senza impoverire il titolo, il nucleo resta integro:
 * meglio un title leggermente più lungo che un dato tagliato o generico.
 */
function shortenByClauses(core: string, budget: number): string {
  const tokens = core.split(SEGMENT_RE).filter((s) => s !== "");
  // tokens: [seg, sep, seg, sep, seg, ...]
  const parts: string[] = [];
  const seps: string[] = [];
  tokens.forEach((tk, i) => (i % 2 === 0 ? parts.push(tk.trim()) : seps.push(tk)));
  if (parts.length <= 1) return core;

  for (let keep = parts.length - 1; keep >= 1; keep--) {
    let out = parts[0]!;
    for (let i = 1; i < keep; i++) out += `${seps[i - 1] ?? " "}${parts[i]}`;
    out = trimDangling(fixPunctuationSpacing(collapse(out)));
    if (out.split(" ").length < MIN_KEPT_WORDS) break;
    if (out.length <= budget) return out;
  }
  return core;
}

/**
 * Parole comuni che, se maiuscole a metà titolo, vengono riportate in
 * minuscolo per una capitalizzazione italiana naturale. Nomi propri e
 * toponimi non compaiono in questa lista e restano invariati.
 */
const COMMON_LOWER = new Set([
  "appartamento", "attico", "villa", "villetta", "casa", "casetta", "rustico",
  "casale", "loft", "monolocale", "bilocale", "trilocale", "quadrilocale",
  "indipendente", "semindipendente", "bifamiliare", "trifamiliare",
  "giardino", "garage", "cantina", "terrazza", "terrazzo", "balcone",
  "terreno", "orto", "vista", "corte", "parco", "laghetto", "posto", "auto",
  "centro", "storico", "arredato", "ristrutturato", "panoramica", "nobile",
  "collina", "campagna", "borgo", "prestigio", "costruzione", "nuova",
]);

function naturalItalianCase(s: string): string {
  const words = s.split(" ");
  return words
    .map((w, i) => {
      if (i === 0) return w;
      const bare = w.replace(/[^\p{L}]/gu, "");
      if (!bare) return w;
      if (COMMON_LOWER.has(bare.toLowerCase()) && /^\p{Lu}/u.test(bare)) {
        return w.replace(bare, bare.toLowerCase());
      }
      return w;
    })
    .join(" ");
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
  core = collapse(core).replace(WEAK_PROMO, "");
  core = normalizeSpelling(core);
  core = fixPunctuationSpacing(collapse(core));
  if (!core) core = (p.type ?? "Immobile").toString().trim() || "Immobile";
  core = naturalItalianCase(core);
  core = capitalizeFirst(core);

  // Il comune viene sempre mostrato: se già presente nel nucleo non lo si
  // ripete, altrimenti si aggiunge " a <Comune>". Mai omesso per lunghezza.
  const place = muni && !new RegExp(`\\b${escapeRe(muni)}\\b`, "i").test(core) ? ` a ${muni}` : "";
  const fixed = `${place}${refPart}${suffix}`;

  const full = `${core}${fixed}`;
  if (full.length <= max) return full;

  // Si accorcia solo il nucleo descrittivo, per segmenti interi.
  const budget = max - fixed.length;
  return `${shortenByClauses(core, budget)}${fixed}`;
}
