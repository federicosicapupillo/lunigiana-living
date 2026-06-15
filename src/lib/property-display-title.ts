/**
 * Frontend-only "display title" cleaner for property cards.
 *
 * Goals:
 * - never invent content
 * - never touch DB / slug / SEO
 * - just clean what's already in the title (and the property type)
 *   so that grezzo-imported titles like
 *     "appartamento appartamento con ingresso indipendente e giardino"
 *     "appartamento centrale"
 *     "appartamento centro storico"
 *   render in an elegant, editorial way on cards.
 */

export type DisplayTitleInput = {
  title?: string | null;
  titleEn?: string | null;
  type?: string | null;
  location?: string | null;
  municipality?: string | null;
};

const MAX_LEN = 70;

// Words/phrases that, when they appear as the WHOLE start of the title,
// indicate the typology — used to detect "appartamento appartamento" style
// duplicates (typology repeated immediately after itself or after the
// canonical localized type).
const TYPE_TOKENS = [
  "appartamento",
  "attico",
  "villa",
  "villetta",
  "villetta a schiera",
  "casa indipendente",
  "casa semindipendente",
  "casa",
  "casetta",
  "rustico",
  "casale",
  "podere",
  "terratetto",
  "bilocale",
  "trilocale",
  "quadrilocale",
  "monolocale",
  "loft",
  "terreno",
  "ufficio",
  "garage",
  "locale commerciale",
  "borgo",
];

// Conservative phrase rewrites that improve flow without inventing facts.
const PHRASE_REWRITES: Array<[RegExp, string]> = [
  // "appartamento centro storico" -> "appartamento nel centro storico"
  [/(^|\s)(centro storico)\b/gi, (m, pre: string) => `${pre}nel centro storico`] as unknown as [RegExp, string],
  // "nuova costruzione" -> "di nuova costruzione" (only when not preceded by "di")
  [/(^|[^i]\s)(nuova costruzione)\b/gi, (m, pre: string) => `${pre}di nuova costruzione`] as unknown as [RegExp, string],
  // normalize "casetta" -> "casa" only when not "casetta di..." style poetic — keep
  // it light: do nothing here.
];

function collapseWhitespace(s: string): string {
  return s.replace(/\s+/g, " ").trim();
}

function isAllLower(s: string): boolean {
  return s === s.toLowerCase();
}

function capitalizeFirst(s: string): string {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Remove a duplicated typology at the very start of the title. */
function dedupeLeadingType(title: string): string {
  const lower = title.toLowerCase();
  // Sort longest first so "villetta a schiera" beats "villetta".
  const tokens = [...TYPE_TOKENS].sort((a, b) => b.length - a.length);
  for (const tok of tokens) {
    // "appartamento appartamento ..." or "appartamento Appartamento ..."
    const dup = new RegExp(`^${tok}\\s+${tok}\\b`, "i");
    if (dup.test(lower)) {
      return title.replace(dup, tok);
    }
  }
  return title;
}

/** Drop a trailing " a <municipality>" when the card already shows the city. */
function stripTrailingMunicipality(title: string, municipality?: string | null): string {
  if (!municipality) return title;
  const muni = municipality.trim();
  if (!muni) return title;
  // Only strip when it's at the very end (e.g. "Villa a Pontremoli").
  const re = new RegExp(`\\s+a\\s+${muni.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\.?$`, "i");
  return title.replace(re, "");
}

function applyPhraseRewrites(s: string): string {
  let out = s;
  for (const [pattern, replacement] of PHRASE_REWRITES) {
    // Each replacement is actually a fn — TS-friendly cast.
    out = out.replace(pattern, replacement as unknown as string);
  }
  return out;
}

function softTruncate(s: string, max = MAX_LEN): string {
  if (s.length <= max) return s;
  const cut = s.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  const safe = lastSpace > 40 ? cut.slice(0, lastSpace) : cut;
  return safe.replace(/[\s,;:.\-]+$/, "") + "…";
}

/**
 * Public helper. Returns a cleaned, presentational title — never empty:
 * falls back to the original title (or to the type when title is missing).
 */
export function getPropertyDisplayTitle(p: DisplayTitleInput): string {
  const rawSource = (p.title ?? "").toString();
  const raw = collapseWhitespace(rawSource);
  if (!raw) {
    const t = (p.type ?? "").toString().trim();
    return t ? capitalizeFirst(t) : "";
  }

  let out = raw;

  // 1. dedupe "appartamento appartamento ..." style.
  out = dedupeLeadingType(out);

  // 2. if the whole string is lowercase, sentence-case it.
  if (isAllLower(out)) out = capitalizeFirst(out);

  // 3. conservative editorial polish.
  out = applyPhraseRewrites(out);

  // 4. drop redundant trailing " a <municipality>" (card already shows it).
  out = stripTrailingMunicipality(out, p.municipality ?? deriveMuni(p.location));

  // 5. final tidy.
  out = collapseWhitespace(out);
  out = capitalizeFirst(out);
  out = softTruncate(out);

  return out;
}

/** Extract the leading municipality from "Pontremoli · centro storico". */
function deriveMuni(location?: string | null): string | null {
  if (!location) return null;
  const head = location.split("·")[0];
  return head ? head.trim() : null;
}
