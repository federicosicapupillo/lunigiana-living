/**
 * Static image variant sets (Block A image optimization).
 *
 * Each original PNG asset in `src/assets` keeps living untouched; alongside it
 * we ship derived AVIF/WebP variants (`src/assets/opt/*`) generated at build
 * time and referenced through `STATIC_IMAGE_SETS`.
 */
export type StaticImageSet = {
  /** Intrinsic width/height of the largest variant — used for aspect-ratio stability. */
  width: number;
  height: number;
  /** `srcset` string for AVIF variants. */
  avif: string;
  /** `srcset` string for WebP variants (universal fallback). */
  webp: string;
  /** Largest WebP variant, used as the `<img src>` fallback. */
  src: string;
};

export type PreloadLink = {
  rel: "preload";
  as: "image";
  href: string;
  imagesrcset: string;
  imagesizes: string;
  type: string;
  fetchPriority: "high";
};

/**
 * Build a `<link rel="preload">` descriptor that matches exactly the candidate
 * the browser will pick from the AVIF `<source>` of the same image, so the LCP
 * image is downloaded once and only once.
 */
export function preloadImage(set: StaticImageSet, sizes: string): PreloadLink {
  return {
    rel: "preload",
    as: "image",
    href: set.src,
    imagesrcset: set.avif,
    imagesizes: sizes,
    type: "image/avif",
    fetchPriority: "high",
  };
}
