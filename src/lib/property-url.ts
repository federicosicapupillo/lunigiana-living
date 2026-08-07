/**
 * Helper centralizzato per gli URL pubblici degli immobili.
 * Gli slug sono gli URL canonici: l'UUID resta solo come fallback tecnico
 * (nessun immobile pubblicato ne ha bisogno — verificato in audit).
 */
export function propertyParam(p: { slug?: string | null; id: string | number }): string {
  const slug = p.slug?.trim();
  return slug && slug.length > 0 ? slug : String(p.id);
}

/** Path pubblico completo, usato per canonical, sitemap e dati strutturati. */
export function propertyPath(p: { slug?: string | null; id: string | number }): string {
  return `/immobili/${propertyParam(p)}`;
}

/**
 * URL stabile dell'immagine Open Graph di un immobile (nessun token, nessuna
 * signed URL). Servita da `/media/og/immobili/<slug>.jpg`. Per gli immobili
 * senza slug non esiste una preview dedicata: si usa l'immagine di brand.
 */
export function propertyOgImagePath(p: { slug?: string | null; id: string | number }): string {
  const slug = p.slug?.trim();
  if (!slug) return "/og/furia-immobiliare.jpg";
  // URL senza estensione: il formato reale dipende dalla cover pubblicata
  // (JPEG o PNG) e viene dichiarato dal Content-Type della risposta.
  return `/media/og/immobili/${slug}`;
}
