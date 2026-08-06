/**
 * Image URL helpers wired to Supabase Image Transformations.
 *
 * The server (`public-properties.functions.ts`) signs each storage path
 * with the transform options baked into the JWT, producing variant URLs
 * served from `/storage/v1/render/image/sign/...`. Variants are returned
 * to the client as `PublicProperty.imageVariants` — a map keyed by the
 * **stable storage path** of the object (e.g.
 * `<property_id>/imported/<uuid>.jpg`), NOT by the signed URL: signed
 * URLs carry a token that changes on every signature, so a URL key can
 * never be matched reliably by the consumer.
 *
 * These helpers accept that map and resolve the right variant, falling
 * back to the original URL when:
 *  - the property has no variants (e.g. external/imported source URL)
 *  - the requested preset failed to sign
 *  - the URL is not a Supabase storage URL
 *
 * No URL is ever broken: every helper is guaranteed to return a usable
 * string. Callers should still set proper `loading`, `decoding`,
 * `fetchPriority` and `sizes` — those work regardless of transforms.
 */

export type ImgPreset = "card" | "thumb" | "hero" | "original";
export type ImageVariants = { card?: string; hero?: string; thumb?: string };
export type VariantsMap = Record<string, ImageVariants> | undefined;

export const PRESET_WIDTHS = {
  thumb: 320,
  card: 800,
  hero: 1600,
  original: null,
} as const;

/**
 * Derive the stable storage-path key from any URL that points at the
 * `property-images` bucket (signed `object/sign/...`, transformed
 * `render/image/sign/...` or public `object/public/...`). Query string
 * and token are stripped. Returns `null` for external/data URLs.
 */
export function variantKey(url: string): string | null {
  if (!url) return null;
  const marker = "/property-images/";
  const at = url.indexOf(marker);
  if (at === -1) return null;
  const rest = url.slice(at + marker.length);
  const path = rest.split("?")[0];
  return path ? decodeURIComponent(path) : null;
}

function lookup(url: string, variants?: VariantsMap): ImageVariants | undefined {
  if (!variants) return undefined;
  const key = variantKey(url);
  // Stable path key first; legacy signed-URL key kept as a fallback.
  return (key ? variants[key] : undefined) ?? variants[url];
}

/** Resolve a single variant URL. Falls back to `url` on any miss. */
export function imgVariant(url: string, preset: ImgPreset, variants?: VariantsMap): string {
  if (!url || preset === "original") return url;
  const v = lookup(url, variants);
  return v?.[preset] || url;
}

/**
 * Build a srcSet from the available variants for a given original URL.
 * Returns an empty string when no variant exists, so `<img src={...}>`
 * stays fully responsible for the fallback.
 */
export function imgSrcSet(url: string, presets: ImgPreset[], variants?: VariantsMap): string {
  const v = lookup(url, variants);
  if (!v) return "";
  const parts: string[] = [];
  for (const p of presets) {
    const u = v[p as Exclude<ImgPreset, "original">];
    const w = PRESET_WIDTHS[p];
    if (u && w) parts.push(`${u} ${w}w`);
  }
  return parts.join(", ");
}

/** Convenience accessors used in JSX. */
export const img = {
  card: (u: string, v?: VariantsMap) => imgVariant(u, "card", v),
  thumb: (u: string, v?: VariantsMap) => imgVariant(u, "thumb", v),
  hero: (u: string, v?: VariantsMap) => imgVariant(u, "hero", v),
  srcSet: imgSrcSet,
};