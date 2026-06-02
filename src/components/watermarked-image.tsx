import { type ImgHTMLAttributes } from "react";
import watermarkAsset from "@/assets/furia-watermark.png.asset.json";
import { cn } from "@/lib/utils";

type Size = "sm" | "md" | "lg";

type Props = ImgHTMLAttributes<HTMLImageElement> & {
  containerClassName?: string;
  watermarkSize?: Size;
  watermark?: boolean;
};

const SIZE_CLASSES: Record<Size, string> = {
  sm: "w-[28%] max-w-[80px] min-w-[40px]",
  md: "w-[20%] max-w-[140px] min-w-[64px]",
  lg: "w-[16%] max-w-[200px] min-w-[80px]",
};

/**
 * Wraps a property photo with the Furia Immobiliare watermark overlay.
 * The watermark is a CSS overlay (not baked into the file) so it scales
 * responsively and never duplicates on the same image.
 */
export function WatermarkedImage({
  containerClassName,
  className,
  watermarkSize = "md",
  watermark = true,
  alt,
  ...imgProps
}: Props) {
  return (
    <div className={cn("relative h-full w-full overflow-hidden", containerClassName)}>
      <img {...imgProps} alt={alt} className={cn("h-full w-full object-cover", className)} />
      {watermark && (
        <img
          src={watermarkAsset.url}
          alt=""
          aria-hidden="true"
          draggable={false}
          loading="lazy"
          className={cn(
            "pointer-events-none absolute bottom-2 right-2 select-none object-contain opacity-25 mix-blend-multiply drop-shadow-[0_1px_2px_rgba(255,255,255,0.4)] md:bottom-3 md:right-3",
            SIZE_CLASSES[watermarkSize],
          )}
        />
      )}
    </div>
  );
}