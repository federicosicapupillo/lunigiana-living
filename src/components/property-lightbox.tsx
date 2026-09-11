import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { img, imgSrcSet, type VariantsMap } from "@/lib/image-url";

type Props = {
  images: string[];
  index: number;
  onIndexChange: (i: number) => void;
  onClose: () => void;
  variants?: VariantsMap;
  /** Base alt text; index is appended for uniqueness. */
  alt: string;
  labels?: { close?: string; prev?: string; next?: string; hint?: string; error?: string };
};

const MAX_SCALE = 4;
const MIN_SCALE = 1;

type View = { scale: number; x: number; y: number };
const RESET: View = { scale: 1, x: 0, y: 0 };

function clamp(v: number, a: number, b: number) {
  return Math.min(b, Math.max(a, v));
}

/**
 * Fullscreen photo viewer: pinch-to-zoom, double-tap zoom, drag-to-pan when
 * zoomed, horizontal swipe to change photo only at base zoom, keyboard
 * (Esc / arrows). Reuses the existing gallery data — no second gallery.
 */
export function PropertyLightbox({
  images,
  index,
  onIndexChange,
  onClose,
  variants,
  alt,
  labels,
}: Props) {
  const count = images.length;
  const [view, setView] = useState<View>(RESET);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const viewRef = useRef(view);
  viewRef.current = view;

  const src = images[index];

  // Reset zoom + loading state whenever the photo changes.
  useEffect(() => {
    setView(RESET);
    setLoaded(false);
    setFailed(false);
  }, [src]);

  const go = useCallback(
    (delta: number) => {
      if (count < 2) return;
      onIndexChange((index + delta + count) % count);
    },
    [count, index, onIndexChange],
  );

  // Scroll lock: keep the page exactly where it was.
  useEffect(() => {
    const body = document.body;
    const prev = {
      overflow: body.style.overflow,
      paddingRight: body.style.paddingRight,
    };
    const gap = window.innerWidth - document.documentElement.clientWidth;
    body.style.overflow = "hidden";
    if (gap > 0) body.style.paddingRight = `${gap}px`;
    return () => {
      body.style.overflow = prev.overflow;
      body.style.paddingRight = prev.paddingRight;
    };
  }, []);

  // Keyboard: Esc closes, arrows navigate.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    closeRef.current?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [go, onClose]);

  const bounds = useCallback((scale: number) => {
    const el = stageRef.current;
    if (!el) return { mx: 0, my: 0 };
    const r = el.getBoundingClientRect();
    return { mx: (r.width * (scale - 1)) / 2, my: (r.height * (scale - 1)) / 2 };
  }, []);

  const applyView = useCallback(
    (next: View) => {
      const scale = clamp(next.scale, MIN_SCALE, MAX_SCALE);
      const { mx, my } = bounds(scale);
      setView({ scale, x: clamp(next.x, -mx, mx), y: clamp(next.y, -my, my) });
    },
    [bounds],
  );

  // ---- Pointer gestures (works for touch, pen and mouse) ----
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef<{
    startDist: number;
    startScale: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
    panning: boolean;
    swipe: boolean;
    moved: boolean;
  } | null>(null);
  const lastTap = useRef(0);
  const [dragX, setDragX] = useState(0);

  const centerOf = () => {
    const pts = [...pointers.current.values()];
    const n = pts.length || 1;
    return {
      x: pts.reduce((s, p) => s + p.x, 0) / n,
      y: pts.reduce((s, p) => s + p.y, 0) / n,
    };
  };
  const distOf = () => {
    const pts = [...pointers.current.values()];
    if (pts.length < 2) return 0;
    return Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const v = viewRef.current;
    const c = centerOf();
    gesture.current = {
      startDist: distOf(),
      startScale: v.scale,
      startX: v.x,
      startY: v.y,
      originX: c.x,
      originY: c.y,
      panning: v.scale > 1,
      swipe: v.scale <= 1 && pointers.current.size === 1,
      moved: false,
    };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const g = gesture.current;
    if (!g) return;
    const n = pointers.current.size;

    if (n >= 2) {
      const d = distOf();
      if (g.startDist > 0) {
        const scale = clamp((d / g.startDist) * g.startScale, MIN_SCALE, MAX_SCALE);
        applyView({ scale, x: g.startX * (scale / g.startScale), y: g.startY * (scale / g.startScale) });
        g.moved = true;
        g.swipe = false;
      }
      return;
    }

    const dx = e.clientX - g.originX;
    const dy = e.clientY - g.originY;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) g.moved = true;

    if (g.panning) {
      applyView({ scale: g.startScale, x: g.startX + dx, y: g.startY + dy });
    } else if (g.swipe && Math.abs(dx) > Math.abs(dy)) {
      setDragX(dx);
    }
  };

  const endGesture = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    const g = gesture.current;
    if (!g) return;

    if (pointers.current.size === 0) {
      if (g.swipe && Math.abs(dragX) > 60) {
        go(dragX < 0 ? 1 : -1);
      } else if (!g.moved) {
        // Double tap / double click → toggle zoom around the tap point.
        const now = Date.now();
        if (now - lastTap.current < 300) {
          lastTap.current = 0;
          const v = viewRef.current;
          if (v.scale > 1) applyView(RESET);
          else {
            const el = stageRef.current;
            const r = el?.getBoundingClientRect();
            const scale = 2.5;
            const ox = r ? e.clientX - (r.left + r.width / 2) : 0;
            const oy = r ? e.clientY - (r.top + r.height / 2) : 0;
            applyView({ scale, x: -ox * (scale - 1), y: -oy * (scale - 1) });
          }
        } else {
          lastTap.current = now;
        }
      }
      setDragX(0);
      gesture.current = null;
    } else {
      // A finger lifted mid-pinch: restart the gesture from current state.
      const v = viewRef.current;
      const c = centerOf();
      gesture.current = {
        ...g,
        startDist: distOf(),
        startScale: v.scale,
        startX: v.x,
        startY: v.y,
        originX: c.x,
        originY: c.y,
        panning: v.scale > 1,
        swipe: false,
      };
    }
  };

  // Wheel / trackpad-pinch zoom (non-passive, so the page never scrolls behind).
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const dy = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 100 : 1);
      const v = viewRef.current;
      const next = clamp(v.scale * Math.exp(-dy * 0.0015), MIN_SCALE, MAX_SCALE);
      const k = next / v.scale;
      applyView({ scale: next, x: v.x * k, y: v.y * k });
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [applyView]);

  const zoomed = view.scale > 1;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={alt}
      className="fixed inset-0 z-[100] flex flex-col bg-black"
      style={{ touchAction: "none" }}
    >
      {/* Top bar */}
      <div
        className="relative z-20 flex items-center justify-between px-2"
        style={{ paddingTop: "max(env(safe-area-inset-top), 0.5rem)" }}
      >
        {count > 1 ? (
          <span className="ml-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium tracking-wider text-white">
            {index + 1} / {count}
          </span>
        ) : (
          <span />
        )}
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label={labels?.close ?? "Chiudi"}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          <X size={24} />
        </button>
      </div>

      {/* Stage */}
      <div
        ref={stageRef}
        className="relative flex-1 select-none overflow-hidden"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endGesture}
        onPointerCancel={endGesture}
        onDoubleClick={(e) => e.preventDefault()}
      >
        {!loaded && !failed && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          </div>
        )}
        {failed ? (
          <div className="absolute inset-0 flex items-center justify-center px-6 text-center text-sm text-white/70">
            {labels?.error ?? "Immagine non disponibile"}
          </div>
        ) : (
          <img
            key={src}
            src={img.hero(src, variants)}
            srcSet={imgSrcSet(src, ["card", "hero"], variants) || undefined}
            sizes="100vw"
            alt={`${alt} — ${index + 1}/${count}`}
            draggable={false}
            decoding="async"
            onLoad={() => setLoaded(true)}
            onError={() => {
              setFailed(true);
              setLoaded(true);
            }}
            className={`absolute inset-0 m-auto max-h-full max-w-full object-contain transition-opacity duration-200 ${
              loaded ? "opacity-100" : "opacity-0"
            }`}
            style={{
              transform: `translate3d(${view.x + dragX}px, ${view.y}px, 0) scale(${view.scale})`,
              transition: gesture.current ? "none" : "transform 200ms ease-out",
              cursor: zoomed ? "grab" : "zoom-in",
            }}
          />
        )}

        {count > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label={labels?.prev ?? "Immagine precedente"}
              className="absolute left-2 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white sm:flex"
            >
              <ChevronLeft size={26} />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label={labels?.next ?? "Immagine successiva"}
              className="absolute right-2 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white sm:flex"
            >
              <ChevronRight size={26} />
            </button>
          </>
        )}
      </div>

      <div
        className="relative z-20 pb-2 text-center text-[11px] text-white/50"
        style={{ paddingBottom: "max(env(safe-area-inset-bottom), 0.5rem)" }}
      >
        {labels?.hint ?? (count > 1 ? "Scorri per cambiare foto · doppio tap per zoom" : "Doppio tap per zoom")}
      </div>
    </div>
  );
}
