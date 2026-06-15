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

// Tooltip on the card shows the full title — line-clamp-2 handles visual
// truncation, so we don't truncate in JS anymore.

// Technical acronyms preserved as-is when normalizing SHOUTED words.
const PRESERVE_ACRONYMS = new Set([
  "IPE", "APE", "FIAIP", "B&B", "EU", "UE", "IVA", "TV", "DOC", "DOCG",
  "USA", "UK", "ZTL",
]);

// Minimum "meaningful" word count for the residual after stripping the
// trailing municipality. Below this, we keep the original title.
const MIN_WORDS_AFTER_STRIP = 3;

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
type Rewrite = { pattern: RegExp; replace: (full: string, pre: string) => string };
const PHRASE_REWRITES: Rewrite[] = [
  // "appartamento centro storico" -> "appartamento nel centro storico"
  { pattern: /(^|\s)(centro storico)\b/gi, replace: (_full, pre) => `${pre}nel centro storico` },
  // "nuova costruzione" -> "di nuova costruzione" (only when not preceded by "di ")
  { pattern: /(^|[^i]\s)(nuova costruzione)\b/gi, replace: (_full, pre) => `${pre}di nuova costruzione` },
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
  for (const { pattern, replace } of PHRASE_REWRITES) {
    out = out.replace(pattern, replace as unknown as string);
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
