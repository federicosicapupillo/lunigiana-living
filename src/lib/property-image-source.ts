/**
 * Risoluzione centralizzata del "percorso dell'immagine effettivamente
 * pubblicata" per una riga di `property_images`.
 *
 * Deve restare l'unica fonte di verità: la stessa immagine scelta come
 * `src` pubblico è anche quella su cui vengono firmate le varianti
 * 320 / 800 / 1600 e quella servita dalla route social /media/og.
 *
 * Ordine di scelta identico a quello usato dall'adapter pubblico:
 *  - render_publish_mode = 'vision'    -> immagine "before" (reale)
 *  - render_publish_mode = 'emotional' -> immagine "before" (reale)
 *  - use_rendered + rendering presente -> rendering
 *  - altrimenti "before": published_image_url > enhanced (se use_enhanced)
 *    > original/imported (storage_path)
 */

export type ImageSourceRow = {
  published_image_url?: string | null;
  storage_path: string;
  rendered_storage_path?: string | null;
  rendered_image_url?: string | null;
  use_rendered?: boolean | null;
  enhanced_storage_path?: string | null;
  enhanced_image_url?: string | null;
  use_enhanced?: boolean | null;
  render_publish_mode?: string | null;
};

/**
 * Estrae il percorso storage stabile da una URL Supabase del bucket
 * `property-images` (firmata, trasformata o pubblica). `null` per URL esterne.
 */
export function pathFromStorageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const marker = "/property-images/";
  const at = url.indexOf(marker);
  if (at === -1) return null;
  const path = url.slice(at + marker.length).split("?")[0];
  return path ? decodeURIComponent(path) : null;
}

function isExternal(p: string | null | undefined): boolean {
  return !!p && /^https?:\/\//i.test(p);
}

/** Percorso storage del rendering, se esiste. */
export function renderPathOf(i: ImageSourceRow): string | null {
  return pathFromStorageUrl(i.rendered_image_url) ?? i.rendered_storage_path ?? null;
}

/** Percorso storage dell'immagine reale ("before") effettivamente pubblicata. */
export function beforePathOf(i: ImageSourceRow): string | null {
  const published = pathFromStorageUrl(i.published_image_url);
  if (published) return published;
  if (i.use_enhanced) {
    const enhanced = pathFromStorageUrl(i.enhanced_image_url) ?? i.enhanced_storage_path;
    if (enhanced) return enhanced;
  }
  return i.storage_path ?? null;
}

/**
 * Percorso storage dell'immagine effettivamente mostrata al pubblico.
 * Restituisce `null` solo per righe che puntano a URL esterne (legacy),
 * non trasformabili.
 */
export function publishedImagePath(i: ImageSourceRow): string | null {
  const mode = i.render_publish_mode ?? null;
  const render = renderPathOf(i);
  if (mode !== "vision" && mode !== "emotional" && i.use_rendered && render) {
    return isExternal(render) ? null : render;
  }
  const before = beforePathOf(i);
  return before && !isExternal(before) ? before : null;
}
