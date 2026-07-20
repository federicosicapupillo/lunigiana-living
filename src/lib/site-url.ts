/**
 * Base URL del sito, usata in canonical, og:url, sitemap.xml e JSON-LD.
 *
 * Per impostare il dominio definitivo, definire la variabile ambiente
 *   VITE_SITE_URL=https://www.dominio-finale.it
 * (build-time, esposta al client). In assenza, si usa il fallback qui sotto.
 *
 * Aggiornare DEFAULT_SITE_URL solo se il dominio di produzione cambia
 * in modo stabile.
 */
const DEFAULT_SITE_URL = "https://furiaimmobiliare.it";

function readEnv(): string | undefined {
  // import.meta.env (Vite, lato client + SSR)
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const v = (import.meta as any)?.env?.VITE_SITE_URL;
    if (typeof v === "string" && v.trim()) return v;
  } catch {
    // ignore
  }
  // process.env (runtime server / build)
  try {
    if (typeof process !== "undefined" && process.env?.VITE_SITE_URL) {
      return process.env.VITE_SITE_URL;
    }
    if (typeof process !== "undefined" && process.env?.SITE_URL) {
      return process.env.SITE_URL;
    }
  } catch {
    // ignore
  }
  return undefined;
}

function normalize(base: string): string {
  return base.trim().replace(/\/+$/, "");
}

/**
 * Restituisce la base URL del sito senza trailing slash.
 * Esempio: "https://www.furiaimmobiliare.it"
 */
export function getSiteUrl(): string {
  return normalize(readEnv() || DEFAULT_SITE_URL);
}

/**
 * Costruisce un URL assoluto a partire da un path relativo, evitando
 * doppie slash. Esempio: siteUrl("/case-in-vendita") => "https://.../case-in-vendita".
 */
export function siteUrl(path = "/"): string {
  const base = getSiteUrl();
  if (!path) return base;
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}