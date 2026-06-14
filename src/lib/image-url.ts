/**
 * Image URL helpers.
 *
 * Today images are signed Supabase storage URLs (or external https URLs).
 * Supabase Image Transformations require the signed token to be issued for
 * the render endpoint, which would mean a server-side change to how we sign
 * (in `public-properties.functions.ts`). This module is the single place to
 * add that swap when it becomes available, so call sites already use the
 * preset names below.
 *
 * For now these functions return the input URL unchanged. Callers should
 * continue to set proper `loading`, `decoding`, `fetchPriority` and `sizes`
 * attributes — those work regardless of transforms.
 */

export type ImgPreset = "card" | "thumb" | "hero" | "renderHero" | "original";

const PRESET_WIDTHS: Record<ImgPreset, number | null> = {
  thumb: 240,
  card: 800,
  hero: 1600,
  renderHero: 1400,
  original: null,
};

/** Return a transformed URL for the given preset. Currently a passthrough. */
export function imgVariant(url: string, _preset: ImgPreset): string {
  return url;
}

/**
 * Build a `srcSet` string for an image. When transformations are unavailable
 * (current state) this returns the original URL once, so the browser still
 * gets a valid `srcSet` attribute without breaking anything.
 */
export function imgSrcSet(url: string, widths: number[]): string {
  if (!url) return "";
  return widths.map((w) => `${url} ${w}w`).join(", ");
}

/** Convenience accessors used in JSX. */
export const img = {
  card: (u: string) => imgVariant(u, "card"),
  thumb: (u: string) => imgVariant(u, "thumb"),
  hero: (u: string) => imgVariant(u, "hero"),
  renderHero: (u: string) => imgVariant(u, "renderHero"),
  presetWidth: (p: ImgPreset) => PRESET_WIDTHS[p],
};