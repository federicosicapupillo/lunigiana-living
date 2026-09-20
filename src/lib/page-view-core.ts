/**
 * page-view-core — la logica che può rompersi in silenzio, isolata.
 *
 * Due cose in questo tracciamento sbagliano senza dare segnale: la
 * classificazione delle route e la deduplica. Questo file NON importa
 * niente, così si può testare senza browser.
 */

export function pageType(pathname: string): string {
  const p = pathname.toLowerCase();

  if (p === "/") return "home";

  // ⚠️ PRIMA il dettaglio, POI la lista: /immobili/casa-x combacia con
  //    entrambi, e la lista vincerebbe per semplice ordine di scrittura.
  if (/^\/immobili\/[^/]+\/?$/.test(p)) return "property_detail";
  if (p === "/immobili" || p.startsWith("/immobili/")) return "property_list";

  if (p.startsWith("/case-in-vendita")) return "seo_landing";
  if (p.startsWith("/territori") || p.startsWith("/vivere")) return "editorial";
  if (p.startsWith("/contatti") || p.startsWith("/trova-casa")) return "contact";
  if (p.startsWith("/valuta-casa") || p.startsWith("/quanto-vale")) return "valuation";
  if (p.startsWith("/come-vendere") || p.startsWith("/seconda-casa")) return "editorial";
  if (p.startsWith("/prezzi") || p.startsWith("/osservatorio")) return "market_data";
  if (p.startsWith("/off-market")) return "off_market";
  if (p.startsWith("/chi-siamo") || p.startsWith("/servizi")) return "about";
  if (p.startsWith("/admin")) return "admin";

  return "other";
}

/** Le pagine che non sono comportamento di visitatore e restano fuori. */
export function isTrackablePath(pathname: string): boolean {
  return !pathname.toLowerCase().startsWith("/admin");
}

/**
 * La chiave di una navigazione. Include la query string perché un filtro
 * che cambia ?comune=zeri È una vista nuova. Non finisce mai in page_path.
 */
export function navigationKey(pathname: string, search: string): string {
  const s = search ? (search.startsWith("?") ? search : `?${search}`) : "";
  return `${pathname}${s}`;
}

/**
 * Il guard contro i duplicati.
 *
 * ⛔ DEVE vivere a livello di MODULO, non dentro un componente e non in un
 *    useRef: React StrictMode monta ogni componente due volte e due
 *    montaggi hanno due ref distinti, quindi l'evento partirebbe due volte.
 *    Il modulo invece è uno solo, condiviso da entrambi i montaggi.
 */
export function createPageViewGuard() {
  let lastKey: string | null = null;

  return {
    shouldTrack(pathname: string, search = ""): boolean {
      if (!isTrackablePath(pathname)) return false;
      const key = navigationKey(pathname, search);
      if (key === lastKey) return false;
      lastKey = key;
      return true;
    },
    reset(): void {
      lastKey = null;
    },
    current(): string | null {
      return lastKey;
    },
  };
}

/** L'istanza usata in produzione. Una sola per l'intera applicazione. */
export const pageViewGuard = createPageViewGuard();
