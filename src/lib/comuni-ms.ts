/**
 * Comuni della provincia di Massa-Carrara (Alta Toscana).
 * Lista ufficiale completa: il menù filtri deve mostrarli tutti,
 * anche quando non ci sono immobili disponibili in quel comune.
 */
export const COMUNI_MASSA_CARRARA: string[] = [
  "Aulla",
  "Bagnone",
  "Carrara",
  "Casola in Lunigiana",
  "Comano",
  "Filattiera",
  "Fivizzano",
  "Fosdinovo",
  "Licciana Nardi",
  "Massa",
  "Montignoso",
  "Mulazzo",
  "Podenzana",
  "Pontremoli",
  "Tresana",
  "Villafranca in Lunigiana",
  "Zeri",
];

/**
 * Chiave di confronto per un nome di comune: rimuove punteggiatura finale,
 * spazi extra, accenti e differenze di maiuscole, e taglia le descrizioni
 * di zona importate dal gestionale ("Pontremoli · Zona residenziale").
 */
export function comuneKey(input: string | null | undefined): string {
  if (!input) return "";
  return input
    .split("·")[0]
    .replace(/\s*[-–,]?\s*(zona|localit[aà]|frazione|loc\.?)\b.*$/i, "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9\s']/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

const CANONICAL_BY_KEY = new Map(COMUNI_MASSA_CARRARA.map((c) => [comuneKey(c), c]));

/** Restituisce il nome canonico del comune, se riconosciuto; altrimenti una versione pulita. */
export function normalizeComune(input: string | null | undefined): string {
  const key = comuneKey(input);
  if (!key) return "";
  const canonical = CANONICAL_BY_KEY.get(key);
  if (canonical) return canonical;
  return key
    .split(" ")
    .map((w) => (w.length > 2 ? w.charAt(0).toUpperCase() + w.slice(1) : w))
    .join(" ");
}

/** Unione (deduplicata e ordinata) fra i 17 comuni ufficiali e nomi extra presenti negli annunci. */
export function buildComuniOptions(extra: string[] = []): string[] {
  const map = new Map<string, string>();
  for (const c of COMUNI_MASSA_CARRARA) map.set(comuneKey(c), c);
  for (const e of extra) {
    const n = normalizeComune(e);
    if (n && !map.has(comuneKey(n))) map.set(comuneKey(n), n);
  }
  return Array.from(map.values()).sort((a, b) => a.localeCompare(b, "it"));
}
