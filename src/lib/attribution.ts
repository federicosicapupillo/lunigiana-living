/**
 * Lightweight, SSR-safe UTM attribution.
 *
 * The FIRST known campaign of a browser session wins: once stored in
 * sessionStorage it is never overwritten, so a lead submitted after internal
 * navigation keeps the campaign that actually brought the visitor in.
 *
 * Every function degrades silently: if `window`/`sessionStorage` is missing or
 * throws (Safari private mode, blocked storage), forms must keep working.
 */

const STORAGE_KEY = "furia_attribution_v1";
const MAX_LEN = 120;

export type Attribution = {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
};

const EMPTY: Attribution = {
  utm_source: null,
  utm_medium: null,
  utm_campaign: null,
  utm_content: null,
  utm_term: null,
};

function clean(value: string | null, lower: boolean): string | null {
  if (!value) return null;
  const trimmed = value.trim().slice(0, MAX_LEN);
  if (!trimmed) return null;
  return lower ? trimmed.toLowerCase() : trimmed;
}

function readStorage(): Attribution | null {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Attribution>;
    return {
      utm_source: clean(parsed.utm_source ?? null, true),
      utm_medium: clean(parsed.utm_medium ?? null, true),
      utm_campaign: clean(parsed.utm_campaign ?? null, true),
      utm_content: clean(parsed.utm_content ?? null, false),
    };
  } catch {
    return null;
  }
}

function readUrl(): Attribution {
  try {
    const params = new URLSearchParams(window.location.search);
    return {
      utm_source: clean(params.get("utm_source"), true),
      utm_medium: clean(params.get("utm_medium"), true),
      utm_campaign: clean(params.get("utm_campaign"), true),
      utm_content: clean(params.get("utm_content"), false),
    };
  } catch {
    return EMPTY;
  }
}

function hasAny(a: Attribution): boolean {
  return Boolean(a.utm_source || a.utm_medium || a.utm_campaign || a.utm_content);
}

/**
 * Capture the current URL's UTM params once per session. Safe to call on every
 * mount / navigation: an already-stored campaign is never replaced.
 */
export function initAttribution(): void {
  if (typeof window === "undefined") return;
  const stored = readStorage();
  if (stored && hasAny(stored)) return;
  const current = readUrl();
  if (!hasAny(current)) return;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  } catch {
    /* storage unavailable — attribution is best-effort only */
  }
}

/**
 * Attribution fields to spread into a `leads` insert payload.
 * Falls back to the current URL when storage is unavailable.
 */
export function getAttribution(): Attribution {
  if (typeof window === "undefined") return { ...EMPTY };
  const stored = readStorage();
  if (stored && hasAny(stored)) return stored;
  const current = readUrl();
  return hasAny(current) ? current : { ...EMPTY };
}
