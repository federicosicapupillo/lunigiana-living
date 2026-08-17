/**
 * Condivisione immobile via WhatsApp (utente → amico).
 *
 * - Nessun numero destinatario: si usa `https://wa.me/?text=...`, quindi è
 *   l'utente a scegliere contatto o gruppo.
 * - Nessun dato personale raccolto o salvato.
 * - L'URL condiviso è SEMPRE l'URL canonico pubblico costruito da
 *   `siteUrl(propertyPath(p))`: mai preview, mai signed URL, mai query
 *   temporanee, mai path di backend.
 * - Il prezzo viene incluso solo se realmente pubblico nella scheda
 *   (`priceValue` numerico > 0). Se è riservato / su richiesta, viene omesso.
 */
import { propertyPath } from "@/lib/property-url";
import { siteUrl } from "@/lib/site-url";

export type ShareableProperty = {
  id: string | number;
  slug?: string | null;
  reference?: string | null;
  title: string;
  location?: string | null;
  price?: string | null;
  priceValue?: number | null;
};

/** Il prezzo è pubblicamente visibile solo se esiste un valore numerico. */
export function isPricePublic(p: ShareableProperty): boolean {
  return typeof p.priceValue === "number" && Number.isFinite(p.priceValue) && p.priceValue > 0;
}

/** URL canonico assoluto della scheda immobile. */
export function propertyCanonicalUrl(p: ShareableProperty): string {
  return siteUrl(propertyPath(p));
}

export type ShareMessageLabels = {
  /** Es. "Guarda questo immobile che ho trovato su Furia Immobiliare:" */
  intro: string;
  /** Es. "Potrebbe interessarti." */
  outro: string;
};

/** Testo (non codificato) del messaggio precompilato. */
export function buildPropertyShareMessage(
  p: ShareableProperty,
  labels: ShareMessageLabels,
  priceLabel?: string | null,
): string {
  const lines: string[] = [labels.intro, ""];
  const code = p.reference?.trim();
  lines.push(code ? `${p.title} (${code})` : p.title);
  const place = p.location?.trim();
  if (place) lines.push(place);
  if (isPricePublic(p)) {
    const price = (priceLabel ?? p.price ?? "").trim();
    if (price) lines.push(price);
  }
  lines.push("", propertyCanonicalUrl(p), "", labels.outro);
  return lines.join("\n");
}

/** Link di condivisione WhatsApp senza numero destinatario. */
export function propertyShareWhatsappUrl(
  p: ShareableProperty,
  labels: ShareMessageLabels,
  priceLabel?: string | null,
): string {
  return `https://wa.me/?text=${encodeURIComponent(buildPropertyShareMessage(p, labels, priceLabel))}`;
}
