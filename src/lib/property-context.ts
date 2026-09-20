/**
 * property-context — quale immobile sta guardando l'utente, adesso.
 *
 * Il pulsante WhatsApp flottante vive in __root.tsx, FUORI dalla pagina
 * dell'immobile: non ha modo di sapere su quale scheda si trovi l'utente.
 * Questo file è il canale fra i due.
 *
 * Una variabile di modulo e non un React context: il valore viene LETTO
 * nel gestore del click, non durante il render, quindi il pulsante non si
 * ridisegna mai e il suo aspetto non cambia.
 *
 * ⛔ SSR-safe: set viene chiamato solo in un useEffect e get solo in un
 *    onClick. Nessuno dei due gira sul server, quindi non c'è perdita fra
 *    richieste diverse.
 */

export type CurrentProperty = {
  /** L'uuid vero del database. ⛔ MAI lo slug dell'URL. */
  property_id: string;
  property_code?: string;
};

let current: CurrentProperty | null = null;

export function setCurrentProperty(p: CurrentProperty | null): void {
  if (typeof window === "undefined") return;
  current = p;
}

export function clearCurrentProperty(): void {
  if (typeof window === "undefined") return;
  current = null;
}

export function getCurrentProperty(): CurrentProperty | null {
  if (typeof window === "undefined") return null;
  return current;
}
