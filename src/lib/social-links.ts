/**
 * Profili social ufficiali di Furia Immobiliare.
 * Fonte unica per footer, CTA homepage e `sameAs` nei dati strutturati.
 */
export const INSTAGRAM_URL = "https://www.instagram.com/furiaimmobiliare/";
export const INSTAGRAM_HANDLE = "@furiaimmobiliare";

/** Schede agenzia sui portali immobiliari, verificate dall'agenzia. */
export const PORTAL_PROFILES: readonly string[] = [
  "https://www.idealista.it/pro/furiaimmobiliaredifuriaelena/",
  "https://www.immobiliare.it/agenzie-immobiliari/46401/furia-pontremoli/",
  "https://www.casa.it/agenzie/furia-immobiliare-di-furia-elena-125832/",
];

/** Profili verificati pubblicati in `sameAs`. */
export const OFFICIAL_SAME_AS: readonly string[] = [INSTAGRAM_URL, ...PORTAL_PROFILES];
