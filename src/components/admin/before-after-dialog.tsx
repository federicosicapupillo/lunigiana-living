import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

type CompareMode = "enhanced" | "rendered";

export interface BeforeAfterDialogProps {
  open: boolean;
  onClose: () => void;
  originalUrl: string;
  enhancedUrl?: string | null;
  renderedUrl?: string | null;
  initialMode?: CompareMode;
  onUseEnhanced?: () => void;
  onKeepOriginal?: () => void;
  /**
   * When true, no "after" image exists yet — dialog renders a simple preview
   * of the original with the localized "Foto migliorata non ancora generata"
   * message.
   */
  afterMissing?: boolean;
}

export function BeforeAfterDialog({
  open,
  onClose,
  originalUrl,
  enhancedUrl,
  renderedUrl,
  initialMode = "enhanced",
  onUseEnhanced,
  onKeepOriginal,
  afterMissing,
}: BeforeAfterDialogProps) {
  const hasEnhanced = !!enhancedUrl;
  const hasRendered = !!renderedUrl;
  const [mode, setMode] = useState<CompareMode>(initialMode);
  const [pos, setPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);

  useEffect(() => {
    if (open) {
      const m: CompareMode = hasEnhanced
        ? "enhanced"
        : hasRendered
          ? "rendered"
          : initialMode;
      setMode(m);
      setPos(50);
    }
  }, [open, hasEnhanced, hasRendered, initialMode]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const afterUrl = mode === "enhanced" ? enhancedUrl : renderedUrl;
  const showSimplePreview = afterMissing || !afterUrl;

  const updateFromClientX = (clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.max(0, Math.min(100, x)));
  };

  const onPointerDown = (e: React.PointerEvent) => {
    draggingRef.current = true;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    updateFromClientX(e.clientX);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!draggingRef.current) return;
    updateFromClientX(e.clientX);
  };
  const onPointerUp = () => {
    draggingRef.current = false;
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/70 p-3 sm:p-6"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl overflow-hidden rounded-sm border border-primary/40 bg-cream shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-primary/30 bg-cream px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] uppercase tracking-[0.2em] text-ink">
              Confronto Prima / Dopo
            </span>
            {hasEnhanced && hasRendered && !showSimplePreview && (
              <div className="ml-3 inline-flex overflow-hidden rounded-sm border border-primary/40">
                <button
                  type="button"
                  onClick={() => {
                    setMode("enhanced");
                    setPos(50);
                  }}
                  className={`px-2 py-1 text-[10px] uppercase tracking-wider transition ${
                    mode === "enhanced"
                      ? "bg-primary text-primary-foreground"
                      : "bg-background text-foreground hover:bg-muted"
                  }`}
                >
                  Originale / Migliorata
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode("rendered");
                    setPos(50);
                  }}
                  className={`border-l border-primary/40 px-2 py-1 text-[10px] uppercase tracking-wider transition ${
                    mode === "rendered"
                      ? "bg-primary text-primary-foreground"
                      : "bg-background text-foreground hover:bg-muted"
                  }`}
                >
                  Originale / Rendering
                </button>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-7 w-7 items-center justify-center rounded-sm text-ink transition hover:bg-muted"
            aria-label="Chiudi"
          >
            <X size={16} />
          </button>
        </div>

        {showSimplePreview ? (
          <div className="bg-muted/40">
            <div className="relative mx-auto flex max-h-[70vh] items-center justify-center">
              <img
                src={originalUrl}
                alt="Originale"
                className="max-h-[70vh] w-full object-contain"
              />
            </div>
            <div className="border-t border-primary/30 bg-cream px-4 py-3 text-center text-[11px] uppercase tracking-wider text-muted-foreground">
              Foto migliorata non ancora generata
            </div>
          </div>
        ) : (
          <div
            ref={containerRef}
            className="relative aspect-[4/3] w-full touch-none select-none overflow-hidden bg-ink"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            {/* After (full) */}
            <img
              src={afterUrl as string}
              alt="Dopo"
              draggable={false}
              className="absolute inset-0 h-full w-full object-contain"
            />
            {/* Before (clipped to left of slider) */}
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${pos}%` }}
            >
              <img
                src={originalUrl}
                alt="Prima"
                draggable={false}
                style={{ width: `${(100 / Math.max(pos, 0.0001)) * 100}%` }}
                className="h-full max-w-none object-contain"
              />
            </div>

            {/* Labels */}
            <span className="pointer-events-none absolute left-3 top-3 rounded-sm bg-cream/90 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-ink">
              Prima
            </span>
            <span className="pointer-events-none absolute right-3 top-3 rounded-sm bg-cream/90 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-ink">
              Dopo
            </span>

            {/* Slider handle */}
            <div
              className="pointer-events-none absolute top-0 bottom-0 w-px bg-primary/90 shadow-[0_0_0_1px_rgba(0,0,0,0.15)]"
              style={{ left: `${pos}%` }}
            >
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary bg-cream p-2 shadow-md">
                <svg width="14" height="14" viewBox="0 0 24 24" className="text-ink">
                  <path
                    d="M8 7l-5 5 5 5M16 7l5 5-5 5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-primary/30 bg-cream px-4 py-3">
          {!showSimplePreview && mode === "enhanced" && onUseEnhanced && (
            <button
              type="button"
              onClick={() => {
                onUseEnhanced();
                onClose();
              }}
              className="rounded-sm bg-primary px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] text-primary-foreground transition hover:bg-primary/90"
            >
              Usa migliorata
            </button>
          )}
          {!showSimplePreview && mode === "enhanced" && onKeepOriginal && (
            <button
              type="button"
              onClick={() => {
                onKeepOriginal();
                onClose();
              }}
              className="rounded-sm border border-primary/50 bg-background px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] text-ink transition hover:bg-muted"
            >
              Mantieni originale
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="rounded-sm border border-border bg-background px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] text-ink transition hover:bg-muted"
          >
            Chiudi
          </button>
        </div>
      </div>
    </div>
  );
}