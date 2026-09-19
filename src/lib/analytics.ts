/**
 * Lightweight, privacy-safe analytics facade for Furia Immobiliare.
 *
 * Two sinks run in parallel:
 *
 * 1. First-party persistence — every event is posted best-effort to the
 *    project's own database (`POST {VITE_SUPABASE_URL}/rest/v1/site_events`)
 *    with `fetch(keepalive: true)` and `Prefer: return=minimal`. Fire-and-forget:
 *    it must NEVER break UI, clicks or forms.
 * 2. Third-party forward — Plausible / gtag / fbq / dataLayer / lvAnalytics,
 *    whatever happens to be on `window`. Safe no-op when none exists.
 *
 * Privacy guarantees (enforced here, not at call sites):
 * - No personal data is ever forwarded (name / email / phone / message / IP),
 *   including obfuscated keys like `customer_email` or `contact_phone`.
 * - No referrer, query string, user-agent or IP is ever read or sent.
 * - `session_id` is a pseudonymous per-tab identifier kept in sessionStorage.
 * - `created_at` is never sent; the database assigns the server timestamp.
 */

import { getAttribution } from "@/lib/attribution";

export type AnalyticsPayload = Record<string, string | number | boolean | null | undefined>;

/** Exact keys that must never be forwarded, even if a caller passes them by mistake. */
const PII_KEYS = new Set([
  "email",
  "phone",
  "telephone",
  "tel",
  "mobile",
  "cellulare",
  "full_name",
  "fullName",
  "name",
  "first_name",
  "last_name",
  "cognome",
  "nome",
  "message",
  "messaggio",
  "note",
  "notes",
  "ip",
  "ip_address",
  "user_agent",
  "userAgent",
  "referrer",
  "referer",
  "address",
  "indirizzo",
]);

/**
 * Key *segments* that mark a field as personal data even when disguised, e.g.
 * `customer_email`, `contact_phone`, `user_name`, `clientMessage`.
 */
const PII_SEGMENTS = [
  "email",
  "mail",
  "phone",
  "telefono",
  "cellulare",
  "mobile",
  "name",
  "cognome",
  "message",
  "messaggio",
  "note",
  "address",
  "indirizzo",
  "referrer",
  "referer",
  "agent", // user-agent
  "ip",
];

function isPiiKey(key: string): boolean {
  if (PII_KEYS.has(key)) return true;
  // Split BEFORE lowercasing so camelCase boundaries (clientMessage) survive.
  const segments = key.split(/[_\-.\s]+|(?=[A-Z])/).map((s) => s.toLowerCase());
  return segments.some((seg) => PII_SEGMENTS.includes(seg));
}

const EVENT_NAME_RE = /^[a-z0-9_]{1,80}$/;
const MAX_STRING = 200;
const MAX_PAYLOAD_CHARS = 2000;

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
    if (isPiiKey(k)) continue;
    if (v === undefined || v === null) continue;
    if (typeof v === "string") {
      // Keep strings short — analytics is for categories, not free text.
      out[k] = v.length > MAX_STRING ? v.slice(0, MAX_STRING) : v;
    } else if (typeof v === "number" || typeof v === "boolean") {
      out[k] = Number.isFinite(v as number) || typeof v === "boolean" ? v : undefined;
      if (out[k] === undefined) delete out[k];
    }
  }
  return out;
}

function currentPath(): string {
  if (!isBrowser()) return "/";
  try {
    // Pathname only — never query string or hash.
    return String(window.location?.pathname ?? "/").slice(0, 300) || "/";
  } catch {
    return "/";
  }
}

// ---------------------------------------------------------------------------
// Pseudonymous session id (per tab, no personal data, no localStorage)
// ---------------------------------------------------------------------------

const SESSION_KEY = "furia_event_session_v1";
let memorySessionId: string | null = null;

function newSessionId(): string | null {
  try {
    return typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : null;
  } catch {
    return null;
  }
}

/** Stable within the same sessionStorage lifetime; in-memory fallback. */
export function getEventSessionId(): string | null {
  if (!isBrowser()) return null;
  try {
    const existing = window.sessionStorage.getItem(SESSION_KEY);
    if (existing) return existing;
    const fresh = newSessionId();
    if (!fresh) return memorySessionId;
    window.sessionStorage.setItem(SESSION_KEY, fresh);
    return fresh;
  } catch {
    // Storage blocked (private mode etc.) — keep a per-page in-memory id.
    if (!memorySessionId) memorySessionId = newSessionId();
    return memorySessionId;
  }
}

// ---------------------------------------------------------------------------
// First-party sink → site_events (fire-and-forget)
// ---------------------------------------------------------------------------

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function asUuid(v: unknown): string | null {
  return typeof v === "string" && UUID_RE.test(v) ? v : null;
}

function asShortText(v: unknown, max: number): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim().slice(0, max);
  return t || null;
}

function sink(eventName: string, merged: AnalyticsPayload): void {
  if (!isBrowser()) return;
  // Allowlisted event names only — guards both the client and the DB CHECK.
  if (!EVENT_NAME_RE.test(eventName)) return;

  const url = (import.meta as any)?.env?.VITE_SUPABASE_URL;
  const key = (import.meta as any)?.env?.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return;

  const sessionId = getEventSessionId();
  if (!sessionId) return;

  // Structured columns are lifted out of the payload; the rest stays in `payload`.
  const { property_id, property_code, lead_id, language, ...rest } = merged;

  let payloadJson = rest as Record<string, unknown>;
  try {
    const serialized = JSON.stringify(payloadJson);
    if (serialized.length > MAX_PAYLOAD_CHARS) payloadJson = {};
  } catch {
    payloadJson = {};
  }

  const attribution = getAttribution();
  const row = {
    session_id: sessionId,
    event_name: eventName,
    page_path: currentPath(),
    language: asShortText(language, 8),
    property_id: asUuid(property_id),
    property_code: asShortText(property_code, 60),
    lead_id: asUuid(lead_id),
    utm_source: attribution.utm_source,
    utm_medium: attribution.utm_medium,
    utm_campaign: attribution.utm_campaign,
    utm_content: attribution.utm_content,
    payload: payloadJson,
    // created_at intentionally omitted — the database stamps it server-side.
  };

  try {
    const body = JSON.stringify(row);
    fetch(`${url}/rest/v1/site_events`, {
      method: "POST",
      keepalive: true,
      headers: {
        "Content-Type": "application/json",
        apikey: key,
        Authorization: `Bearer ${key}`,
        Prefer: "return=minimal",
      },
      body,
    }).catch(() => {
      // best-effort only — analytics must never surface errors to the user
    });
  } catch {
    // never break the app because of analytics
  }
}

// ---------------------------------------------------------------------------
// Third-party forward (unchanged behaviour)
// ---------------------------------------------------------------------------

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
  const merged = { ...sanitize(payload) };
  if (isDev() && isBrowser()) {
    // eslint-disable-next-line no-console
    console.debug(`[analytics] ${eventName}`, { page_path: currentPath(), ...merged });
  }
  sink(eventName, merged);
  forward(eventName, { page_path: currentPath(), ...merged });
}

/** Same as trackEvent — semantic alias for click handlers. */
export function trackClick(eventName: string, payload?: AnalyticsPayload): void {
  trackEvent(eventName, payload);
}
