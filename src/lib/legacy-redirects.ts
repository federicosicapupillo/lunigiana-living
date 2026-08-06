/**
 * Mapping statico e versionato delle vecchie URL ASP di furiaimmobiliare.it.
 *
 * Nessuna query runtime al database: la risoluzione è puramente statica.
 * La destinazione è SEMPRE un path relativo interno (mai URL assolute,
 * mai valori forniti dall'utente) — nessuna possibilità di open redirect.
 *
 * Catena di derivazione usata per costruire il mapping (audit precedente):
 *   ID_immobile legacy → `reference` in src/data/properties.json
 *   → `reference_code` in public.properties → `slug` canonico pubblicato.
 */

/** ID legacy pubblicati → slug canonico attuale (301). */
export const LEGACY_PROPERTY_REDIRECTS: Readonly<Record<number, string>> = {
  103: "p-432-appartamento-centrale", // P-432
  118: "p-700-appartamento-d-epoca-centro-storico-pontremoli", // P-700
  120: "i-901-villa-di-prestigio-in-collina", // I-901
  201: "f-430-loft-ristrutturato-e-arredato", // F-430
  233: "p-1100-appartamento-nobile-con-terrazza", // P-1100
  248: "p-454-appartamento-centro-storico", // P-454
  249: "p-453-appartamento-centro-storico", // P-453
  266: "p-458-appartamento-nuda-proprieta", // P-458
  289: "p-460-appartamento-con-giardino", // P-460
  307: "p-533-attico-nuova-costruzione", // P-533
  311: "b-102-rustico-con-terreno", // B-102
  322: "s-520-villetta-con-garage-e-giardino", // S-520
  326: "p-100-mansarda-in-centro", // P-100
  341: "p-470-appartamento-con-cantina-e-posto-auto", // P-470
  350: "p-612-ampio-appartamento-con-garage", // P-612
  352: "p-539-attico-con-grande-terrazza-e-garage", // P-539
  354: "p-474-appartamento-centrale-con-garage", // P-474
  357: "i-400-rustico-con-terreno", // I-400
  359: "i-514-casa-indipendente-con-giardino", // I-514
  364: "p-538-appartamento-in-centro-storico", // P-538
  370: "i-209-indipendente-con-giardino", // I-209
  372: "p-540-appartamento-in-bifamigliare", // P-540
  375: "s-311-casetta-di-campagna-con-terreno", // S-311
  379: "p-329-appartamento-centro-storico", // P-329
  380: "s-521-casa-in-campagna-con-giardino", // S-521
  383: "t-800-casa-di-borgo-con-vista-e-terrazza", // T-800
  384: "i-610-villetta-centrale-con-giardino", // I-610
  390: "i-611-casa-indipendente-con-terreno", // I-611
  395: "p-484-appartamento-con-terrazza", // P-484
  396: "p-211-appartamento-in-collina", // P-211
  397: "p-613-porzione-di-bifamigliare-con-giardino", // P-613
  398: "i-612-villetta-centrale-informazioni-in-agenzia", // I-612
  400: "s-313-appartamento-con-ingresso-indipendente-e-giardino", // S-313
  401: "s-421-villetta-a-schiera-con-giardino", // S-421
  402: "p-543-attico-nel-cuore-di-pontremoli", // P-543
};

/** ID legacy definitivamente rimossi → HTTP 410 Gone (nessun redirect). */
export const LEGACY_PROPERTY_GONE: ReadonlySet<number> = new Set([
  94, 110, 122, 161, 174, 188, 214, 223, 229, 230, 241, 247, 256, 259,
  308, // P-209 venduto: trattato per ora come definitivamente non disponibile
  346, 361, 386, 392,
]);

/**
 * ID sospesi o da verificare manualmente: devono continuare a rispondere 404
 * perché potrebbero essere ripubblicati (166, 309, 313, 362) o richiedono una
 * verifica rispetto a un altro ID (387 vs 384).
 */
export const LEGACY_PROPERTY_PENDING: ReadonlySet<number> = new Set([
  166, 309, 313, 362, 387,
]);

/** Pagine statiche ASP con destinazione confermata → 301. */
export const LEGACY_STATIC_REDIRECTS: Readonly<Record<string, string>> = {
  "/index.asp": "/",
  "/chi_siamo.asp": "/chi-siamo",
  "/contattaci.asp": "/contatti",
  "/vendite2.asp": "/case-in-vendita",
};

export type LegacyPropertyResolution =
  | { kind: "redirect"; location: string }
  | { kind: "gone" }
  | { kind: "not-found" };

/**
 * Risolve una richiesta /annuncio.asp?ID_immobile=<n>.
 * Accetta esclusivamente un singolo parametro intero positivo.
 */
export function resolveLegacyProperty(url: URL): LegacyPropertyResolution {
  const values = url.searchParams.getAll("ID_immobile");
  if (values.length !== 1) return { kind: "not-found" };

  const raw = values[0]!.trim();
  if (!/^\d+$/.test(raw)) return { kind: "not-found" };

  const id = Number.parseInt(raw, 10);
  if (!Number.isSafeInteger(id) || id <= 0) return { kind: "not-found" };

  if (LEGACY_PROPERTY_PENDING.has(id)) return { kind: "not-found" };
  if (LEGACY_PROPERTY_GONE.has(id)) return { kind: "gone" };

  const slug = LEGACY_PROPERTY_REDIRECTS[id];
  if (!slug) return { kind: "not-found" };

  // Solo slug validati: nessun input utente entra nella destinazione.
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) return { kind: "not-found" };

  return { kind: "redirect", location: `/immobili/${slug}` };
}