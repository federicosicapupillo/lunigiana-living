import { useCallback, useEffect, useRef, useState } from "react";
import { WatermarkedImage } from "@/components/watermarked-image";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  before: string;
  after: string;
  alt: string;
  beforeLabel: string;
  afterLabel: string;
  beforeCaption?: string;
  afterCaption?: string;
  aiBadge: string;
  illustrativeNote: string;
  className?: string;
  aspectClassName?: string;
  hideCaption?: boolean;
  objectFit?: "cover" | "contain";
};

export function BeforeAfterSlider({
  before,
  after,
  alt,
  beforeLabel,
  afterLabel,
  beforeCaption,
  afterCaption,
  aiBadge,
  illustrativeNote,
  className,
  aspectClassName = "aspect-[4/3]",
  hideCaption = false,
  objectFit = "cover",
}: Props) {
  const [position, setPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef(false);

  const updateFromClientX = useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setPosition(Math.max(0, Math.min(100, pct)));
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    draggingRef.current = true;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    updateFromClientX(e.clientX);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!draggingRef.current) return;
    updateFromClientX(e.clientX);
  };
  const onPointerUp = (e: React.PointerEvent) => {
    draggingRef.current = false;
    (e.target as Element).releasePointerCapture?.(e.pointerId);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") setPosition((p) => Math.max(0, p - 4));
    else if (e.key === "ArrowRight") setPosition((p) => Math.min(100, p + 4));
    else if (e.key === "Home") setPosition(0);
    else if (e.key === "End") setPosition(100);
  };

  // Prevent the page from scrolling while dragging on touch devices.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const prevent = (e: TouchEvent) => {
      if (draggingRef.current) e.preventDefault();
    };
    el.addEventListener("touchmove", prevent, { passive: false });
    return () => el.removeEventListener("touchmove", prevent);
  }, []);

  return (
    <figure className={cn("overflow-hidden rounded-sm border border-border bg-card", className)}>
      <div
        ref={containerRef}
        className={cn("relative w-full h-full select-none overflow-hidden bg-muted touch-none", aspectClassName)}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {/* BEFORE — full layer underneath */}
        <WatermarkedImage
          src={before}
          alt={`${alt} — ${beforeLabel}`}
          loading="lazy"
          sizes="(max-width: 768px) 100vw, 50vw"
          watermark={false}
          className={cn("absolute inset-0 h-full w-full", objectFit === "contain" ? "object-contain" : "object-cover")}
          containerClassName="absolute inset-0"
        />
        {/* AFTER — clipped overlay */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
        >
          <WatermarkedImage
            src={after}
            alt={`${alt} — ${afterLabel}`}
            loading="lazy"
            sizes="(max-width: 768px) 100vw, 50vw"
            watermark={false}
            className={cn("absolute inset-0 h-full w-full", objectFit === "contain" ? "object-contain" : "object-cover")}
            containerClassName="absolute inset-0"
          />
        </div>

        {/* Labels */}
        <span className="pointer-events-none absolute left-2 top-2 inline-flex items-center rounded-sm bg-ink/70 px-2 py-1 text-[10px] uppercase tracking-wider text-cream backdrop-blur">
          {beforeLabel}
        </span>
        <span className="pointer-events-none absolute right-2 top-2 inline-flex items-center gap-1 rounded-sm bg-primary/90 px-2 py-1 text-[10px] uppercase tracking-wider text-primary-foreground backdrop-blur">
          <Sparkles size={11} /> {aiBadge} · {afterLabel}
        </span>
        <span className="pointer-events-none absolute bottom-2 left-2 inline-flex items-center rounded-sm bg-ink/70 px-2 py-1 text-[10px] italic tracking-wide text-cream backdrop-blur">
          {illustrativeNote}
        </span>

        {/* Divider + handle */}
        <div
          className="pointer-events-none absolute inset-y-0 w-px bg-background/90 shadow-[0_0_0_1px_rgba(0,0,0,0.15)]"
          style={{ left: `${position}%` }}
        />
        <button
          type="button"
          aria-label="Trascina per confrontare"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(position)}
          role="slider"
          onKeyDown={onKeyDown}
          className="absolute top-1/2 z-10 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize items-center justify-center rounded-full border border-border bg-background text-ink shadow-md transition hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          style={{ left: `${position}%` }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path d="M6 3L2 8l4 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M10 3l4 5-4 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
      {!hideCaption && (
      <figcaption className="flex flex-col gap-1 px-3 py-2 text-[11px] italic text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <span>
          <strong className="not-italic font-medium text-ink">{beforeLabel}:</strong>{" "}
          {beforeCaption}
        </span>
        <span>
          <strong className="not-italic font-medium text-primary">{afterLabel}:</strong>{" "}
          {afterCaption} · {illustrativeNote}
        </span>
      </figcaption>
      )}
    </figure>
  );
}