/**
 * Condivisione universale di un immobile (utente → chiunque).
 *
 * - Priorità alla Web Share API; i link qui sotto sono il fallback.
 * - Nessun SDK, plugin o script esterno (nessun Meta SDK).
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

/** Link mailto: oggetto = titolo immobile, corpo = messaggio completo. */
export function propertyShareMailtoUrl(
  p: ShareableProperty,
  labels: ShareMessageLabels,
  priceLabel?: string | null,
  subject?: string,
): string {
  const subj = (subject ?? p.title).trim();
  const body = buildPropertyShareMessage(p, labels, priceLabel);
  return `mailto:?subject=${encodeURIComponent(subj)}&body=${encodeURIComponent(body)}`;
}

/** Facebook Share Dialog pubblico (nessun SDK Meta). */
export function propertyShareFacebookUrl(p: ShareableProperty): string {
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(propertyCanonicalUrl(p))}`;
}

/** Telegram share (URL canonico + testo breve). */
export function propertyShareTelegramUrl(
  p: ShareableProperty,
  labels: ShareMessageLabels,
  priceLabel?: string | null,
): string {
  const text = buildPropertyShareMessage(p, labels, priceLabel);
  return `https://t.me/share/url?url=${encodeURIComponent(propertyCanonicalUrl(p))}&text=${encodeURIComponent(text)}`;
}
