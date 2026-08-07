import { type ImgHTMLAttributes } from "react";
import { STATIC_IMAGE_SETS } from "@/lib/static-image-variants";
import type { StaticImageSet } from "@/lib/static-image-set";

type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "srcSet"> & {
  /** Key in STATIC_IMAGE_SETS, e.g. "pontremoli-hero-centro-storico". */
  name: string;
  sizes: string;
  /** Fallback URL if no derived set exists (original asset). */
  fallbackSrc?: string;
  pictureClassName?: string;
};

export function staticSet(name: string): StaticImageSet | undefined {
  return STATIC_IMAGE_SETS[name];
}

/**
 * Renders a static asset through `<picture>` with AVIF + WebP responsive
 * variants. Falls back to the original asset URL when no variant set exists.
 * Visual output (crop, object-fit/position, classes) is unchanged.
 */
export function StaticImage({ name, sizes, fallbackSrc, pictureClassName, alt, width, height, ...imgProps }: Props) {
  const set = staticSet(name);
  if (!set) {
    return <img src={fallbackSrc} alt={alt} width={width} height={height} sizes={sizes} {...imgProps} />;
  }
  return (
    <picture className={pictureClassName}>
      <source type="image/avif" srcSet={set.avif} sizes={sizes} />
      <source type="image/webp" srcSet={set.webp} sizes={sizes} />
      <img
        src={set.src}
        alt={alt}
        width={width ?? set.width}
        height={height ?? set.height}
        sizes={sizes}
        {...imgProps}
      />
    </picture>
  );
}
