/**
 * site_page_view — l'evento che mancava.
 *
 * analytics.ts compila già session_id, page_path e i quattro UTM in
 * colonne dedicate: non vanno ripetuti qui. Restano page_type, utm_term,
 * landing_page, ref_host e is_landing, che finiscono in `payload` (jsonb
 * già esistente): nessuna colonna nuova, nessuna migrazione.
 *
 * ⛔ NESSUN property_id. Sulla rotta /immobili/$id il parametro dell'URL è
 *    lo SLUG, non l'uuid: l'uuid esiste solo dopo che la query ha risolto
 *    l'immobile. Scrivere lo slug farebbe rifiutare la riga (la colonna è
 *    uuid); aspettare l'uuid perderebbe le pagine abbandonate prima del
 *    caricamento; emetterne una seconda raddoppierebbe il conteggio.
 *    L'immobile è già tracciato, con l'uuid vero, da property_detail_view.
 */
import { trackEvent } from "@/lib/analytics";
import { getAttribution, getLandingContext } from "@/lib/attribution";
import { pageType, pageViewGuard } from "@/lib/page-view-core";

export { pageType } from "@/lib/page-view-core";

export function trackPageView(pathname: string, search = ""): void {
  if (typeof window === "undefined") return;          // SSR: niente eventi
  if (!pageViewGuard.shouldTrack(pathname, search)) return;

  try {
    const a = getAttribution();
    const landing = getLandingContext();

    trackEvent("site_page_view", {
      page_type: pageType(pathname),
      utm_term: a.utm_term ?? undefined,
      landing_page: landing.landing_page ?? undefined,
      ref_host: landing.ref_host ?? undefined,
      is_landing: landing.landing_page === pathname,
    });
  } catch {
    // ⛔ Il tracciamento non può mai rompere una navigazione.
  }
}
