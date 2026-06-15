/**
 * Lightweight, privacy-safe analytics facade for Furia Immobiliare.
 *
 * - No external scripts are loaded by this module.
 * - No personal data (name / email / phone / message / IP) is ever forwarded.
 * - In development: events are printed via console.debug for inspection.
 * - In production: events are forwarded to whatever provider is found on
 *   `window` (Plausible, gtag, fbq, dataLayer, Lovable's `lvAnalytics`).
 *   If none of those exist, the call is a safe no-op.
 *
 * This module is intentionally tiny and dependency-free so it can be imported
 * from any client component without bloating bundles.
 */

export type AnalyticsPayload = Record<string, string | number | boolean | null | undefined>;

/** Keys that must never be forwarded, even if a caller passes them by mistake. */
const PII_KEYS = new Set([
  "email",
  "phone",
  "telephone",
  "tel",
  "full_name",
  "fullName",
  "name",
  "first_name",
  "last_name",
  "message",
  "messaggio",
  "note",
  "notes",
  "ip",
  "ip_address",
  "user_agent",
  "address",
  "indirizzo",
]);

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function isDev(): boolean {
  try {
    return Boolean((import.meta as any)?.env?.DEV);
  } catch {
    return false;
  }
}

function sanitize(payload?: AnalyticsPayload): AnalyticsPayload {
  if (!payload) return {};
  const out: AnalyticsPayload = {};
  for (const [k, v] of Object.entries(payload)) {
    if (PII_KEYS.has(k)) continue;
    if (v === undefined || v === null) continue;
    if (typeof v === "string") {
      // Keep strings short — analytics is for categories, not free text.
      out[k] = v.length > 200 ? v.slice(0, 200) : v;
    } else if (typeof v === "number" || typeof v === "boolean") {
      out[k] = v;
    }
  }
  return out;
}

function commonContext(): AnalyticsPayload {
  if (!isBrowser()) return {};
  return {
    page_path: window.location?.pathname ?? "/",
  };
}

/** Forward to whichever analytics provider happens to exist on window. */
function forward(event: string, payload: AnalyticsPayload) {
  if (!isBrowser()) return;
  const w = window as any;
  try {
    if (typeof w.lvAnalytics?.track === "function") {
      w.lvAnalytics.track(event, payload);
    }
    if (typeof w.plausible === "function") {
      w.plausible(event, { props: payload });
    }
    if (typeof w.gtag === "function") {
      w.gtag("event", event, payload);
    }
    if (Array.isArray(w.dataLayer)) {
      w.dataLayer.push({ event, ...payload });
    }
    if (typeof w.fbq === "function") {
      w.fbq("trackCustom", event, payload);
    }
  } catch {
    // analytics must never break the app
  }
}

export function trackEvent(eventName: string, payload?: AnalyticsPayload): void {
  if (!eventName || typeof eventName !== "string") return;
  const merged = { ...commonContext(), ...sanitize(payload) };
  if (isDev() && isBrowser()) {
    // eslint-disable-next-line no-console
    console.debug(`[analytics] ${eventName}`, merged);
  }
  forward(eventName, merged);
}

/** Same as trackEvent — semantic alias for click handlers. */
export function trackClick(eventName: string, payload?: AnalyticsPayload): void {
  trackEvent(eventName, payload);
}
