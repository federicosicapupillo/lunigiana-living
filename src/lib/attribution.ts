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
      utm_term: clean(parsed.utm_term ?? null, true),
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
      utm_term: clean(params.get("utm_term"), true),
    };
  } catch {
    return EMPTY;
  }
}

function hasAny(a: Attribution): boolean {
  return Boolean(a.utm_source || a.utm_medium || a.utm_campaign || a.utm_content || a.utm_term);
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

/**
 * Attribution fields for a `leads` insert. `leads` has no utm_term column
 * (and must not gain one): utm_term lives only in site_events payloads.
 */
export function getLeadAttribution(): Omit<Attribution, "utm_term"> {
  const { utm_term: _utmTerm, ...rest } = getAttribution();
  return rest;
}

const LANDING_KEY = "furia_landing_v1";

export type LandingContext = {
  landing_page: string | null;
  landing_at: string | null;
  ref_host: string | null;
};

const EMPTY_LANDING: LandingContext = {
  landing_page: null, landing_at: null, ref_host: null,
};

/**
 * Registra la pagina d'ingresso e l'host di provenienza. UNA SOLA VOLTA
 * per sessione: se la chiave esiste già, non viene toccata.
 */
export function initLanding(): void {
  if (typeof window === "undefined") return;
  try {
    if (window.sessionStorage.getItem(LANDING_KEY)) return;  // first-touch

    let ref_host: string | null = null;
    try {
      const referrer = document.referrer;
      if (referrer) {
        const host = new URL(referrer).hostname;
        // una navigazione interna non è una provenienza
        ref_host = host && host !== window.location.hostname ? host.slice(0, 120) : null;
      }
    } catch {
      /* referrer assente o non analizzabile: resta null */
    }

    const value: LandingContext = {
      landing_page: String(window.location.pathname ?? "/").slice(0, 300) || "/",
      landing_at: new Date().toISOString(),
      ref_host,
    };
    window.sessionStorage.setItem(LANDING_KEY, JSON.stringify(value));
  } catch {
    /* storage bloccato: il sito deve funzionare lo stesso */
  }
}

export function getLandingContext(): LandingContext {
  if (typeof window === "undefined") return { ...EMPTY_LANDING };
  try {
    const raw = window.sessionStorage.getItem(LANDING_KEY);
    if (!raw) return { ...EMPTY_LANDING };
    const parsed = JSON.parse(raw) as Partial<LandingContext>;
    return {
      landing_page: parsed.landing_page ?? null,
      landing_at: parsed.landing_at ?? null,
      ref_host: parsed.ref_host ?? null,
    };
  } catch {
    return { ...EMPTY_LANDING };
  }
}
