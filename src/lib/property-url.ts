/**
 * Helper centralizzato per gli URL pubblici degli immobili.
 * Gli slug sono gli URL canonici: l'UUID resta solo come fallback tecnico
 * (nessun immobile pubblicato ne ha bisogno — verificato in audit).
 */
export function propertyParam(p: { slug?: string | null; id: string }): string {
  const slug = p.slug?.trim();
  return slug && slug.length > 0 ? slug : String(p.id);
}

/** Path pubblico completo, usato per canonical, sitemap e dati strutturati. */
export function propertyPath(p: { slug?: string | null; id: string }): string {
  return `/immobili/${propertyParam(p)}`;
}
