import { useEffect, useRef, useState } from "react";
import {
  Sparkles,
  Loader2,
  Wand2,
  RotateCcw,
  Maximize2,
  X,
  Download,
  ArrowLeftRight,
  Check,
  Image as ImageIcon,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

type Style = "minimal" | "rustico" | "luxury";
type CompareMode = "side" | "slider" | "toggle";
type Space = "interno" | "esterno";
type Intensity = "decisa" | "delicata";

const STYLES: { id: Style; label: string; description: string }[] = [
  { id: "minimal", label: "Minimal", description: "Pulito, luminoso, essenziale." },
  { id: "rustico", label: "Rustico", description: "Caldo, materico, naturale." },
  { id: "luxury", label: "Luxury", description: "Raffinato, finiture premium." },
];

const SPACES: { id: Space; label: string }[] = [
  { id: "interno", label: "Interno" },
  { id: "esterno", label: "Esterno" },
];

const INTENSITIES: { id: Intensity; label: string; hint: string }[] = [
  { id: "decisa", label: "Decisa", hint: "Restyling completo" },
  { id: "delicata", label: "Delicata", hint: "Tocco morbido" },
];

export function VirtualStaging({ gallery }: { gallery: string[] }) {
  const photos = gallery.filter(Boolean);
  const [open, setOpen] = useState(false);

  if (photos.length === 0) return null;

  return (
    <>
      <div className="mt-8 overflow-hidden rounded-sm border border-primary/20 bg-gradient-to-br from-primary/5 via-card to-muted/40">
        <div className="flex flex-col gap-5 p-6 md:flex-row md:items-center md:justify-between md:gap-8 md:p-8">
          <div className="flex items-start gap-4">
            <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary sm:flex">
              <Sparkles size={22} />
            </div>
            <div>
              <span className="eyebrow inline-flex items-center gap-2 text-primary">
                <Sparkles size={13} className="sm:hidden" /> Nuovo · Rendering AI
              </span>
              <h3 className="mt-2 font-serif text-2xl text-ink md:text-3xl">
                Visualizza il <em className="italic">potenziale</em> dello spazio
              </h3>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
                Scegli una foto dell'ambiente e scopri come potrebbe diventare in stile
                <strong className="text-ink/80"> minimal</strong>,
                <strong className="text-ink/80"> rustico</strong> o
                <strong className="text-ink/80"> luxury</strong>.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-sm bg-primary px-6 py-4 text-xs uppercase tracking-[0.22em] text-primary-foreground shadow-sm transition hover:bg-primary/90"
          >
            <Wand2 size={16} /> Prova il rendering
          </button>
        </div>
        <p className="border-t border-border/60 bg-muted/30 px-6 py-2 text-[0.7rem] leading-relaxed text-muted-foreground md:px-8">
          Rendering illustrativo generato da intelligenza artificiale, non vincolante.
        </p>
      </div>

      <StagingDialog open={open} onOpenChange={setOpen} photos={photos} />
    </>
  );
}

function StagingDialog({
  open,
  onOpenChange,
  photos,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  photos: string[];
}) {
  const [photoIndex, setPhotoIndex] = useState(0);
  const [style, setStyle] = useState<Style>("minimal");
  const [space, setSpace] = useState<Space>("interno");
  const [intensity, setIntensity] = useState<Intensity>("decisa");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [compareMode, setCompareMode] = useState<CompareMode>("side");
  const [lightbox, setLightbox] = useState<string | null>(null);

  const sourceUrl = photos[photoIndex];

  const spaceLabel = SPACES.find((s) => s.id === space)?.label ?? "";
  const styleLabel = STYLES.find((s) => s.id === style)?.label ?? "";
  const intensityLabel = INTENSITIES.find((s) => s.id === intensity)?.label ?? "";
  const summary = `${spaceLabel} · ${styleLabel} · ${intensityLabel}`;

  async function generate() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/virtual-staging", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: sourceUrl, style, space, intensity }),
      });
      const json = (await res.json()) as { image?: string; error?: string };
      if (!res.ok || !json.image) {
        throw new Error(json.error || "Generazione non riuscita");
      }
      setResult(json.image);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Errore imprevisto");
    } finally {
      setLoading(false);
    }
  }

  function resetResult() {
    setResult(null);
    setError(null);
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[95vh] w-[96vw] max-w-6xl overflow-y-auto p-0 sm:rounded-sm">
          {/* Header */}
          <div className="border-b border-border bg-muted/30 px-6 py-5 md:px-8">
            <DialogTitle asChild>
              <h2 className="font-serif text-2xl text-ink md:text-3xl">
                Crea il rendering della tua foto
              </h2>
            </DialogTitle>
            <DialogDescription className="mt-1.5 text-sm text-muted-foreground">
              Scegli stile e intensità, oppure clicca direttamente sulla foto per iniziare.
            </DialogDescription>
          </div>

          {/* Body — 2 cols on desktop, stack on mobile */}
          <div className="grid gap-6 p-6 pb-28 md:grid-cols-12 md:gap-8 md:p-8 md:pb-8">
            {/* LEFT — hero photo + CTA */}
            <div className="md:col-span-7">
              {!result ? (
                <HeroPhoto
                  src={sourceUrl}
                  loading={loading}
                  style={style}
                  onGenerate={generate}
                  onOpen={() => setLightbox(sourceUrl)}
                />
              ) : (
                <ResultViewer
                  before={sourceUrl}
                  after={result}
                  style={style}
                  mode={compareMode}
                  onModeChange={setCompareMode}
                  onLightbox={setLightbox}
                />
              )}

              {/* Thumbnails */}
              {photos.length > 1 && (
                <div className="mt-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-[0.7rem] uppercase tracking-[0.18em] text-muted-foreground">
                      Altre foto dell'immobile
                    </span>
                    <span className="text-[0.7rem] text-muted-foreground">
                      {photoIndex + 1} / {photos.length}
                    </span>
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {photos.map((g, i) => (
                      <button
                        key={g + i}
                        type="button"
                        onClick={() => {
                          setPhotoIndex(i);
                          resetResult();
                        }}
                        className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-sm bg-muted transition ${
                          i === photoIndex
                            ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                            : "opacity-60 hover:opacity-100"
                        }`}
                        aria-label={`Foto ${i + 1}`}
                      >
                        <img
                          src={g}
                          alt=""
                          loading="lazy"
                          className="h-full w-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Primary CTA — desktop only (mobile uses sticky bar) */}
              <div className="mt-5 hidden md:block">
                <button
                  type="button"
                  onClick={generate}
                  disabled={loading}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-sm bg-primary px-6 py-5 text-xs uppercase tracking-[0.22em] text-primary-foreground shadow-sm transition hover:bg-primary/90 disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" /> Generazione in corso…
                    </>
                  ) : (
                    <>
                      <Wand2 size={18} /> {result ? "Rigenera rendering" : "Genera rendering"}
                    </>
                  )}
                </button>
                {error && <p className="mt-3 text-xs text-destructive">{error}</p>}
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-[0.7rem] leading-relaxed text-muted-foreground">
                    Rendering illustrativo, non vincolante. Richiede qualche secondo.
                  </p>
                  {result && (
                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={resetResult}
                        className="inline-flex items-center gap-1.5 text-[0.7rem] uppercase tracking-[0.18em] text-muted-foreground hover:text-ink"
                      >
                        <RotateCcw size={12} /> Reset
                      </button>
                      <a
                        href={result}
                        download={`rendering-${style}.png`}
                        className="inline-flex items-center gap-1.5 text-[0.7rem] uppercase tracking-[0.18em] text-primary hover:underline"
                      >
                        <Download size={12} /> Scarica
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT — settings panel */}
            <aside className="md:col-span-5">
              <div className="rounded-sm border border-border bg-card/60 p-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-lg text-ink">Impostazioni rendering</h3>
                </div>

                {/* Summary */}
                <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 py-1.5 text-[0.7rem] uppercase tracking-[0.18em] text-primary">
                  <Sparkles size={11} /> {summary}
                </div>

                <SettingsGroup
                  step={1}
                  title="Tipo di ambiente"
                  hint="Determina se interno o esterno. Il rendering manterrà la struttura reale."
                >
                  <div className="grid grid-cols-2 gap-2">
                    {SPACES.map((s) => (
                      <Chip
                        key={s.id}
                        selected={space === s.id}
                        onClick={() => {
                          setSpace(s.id);
                          resetResult();
                        }}
                      >
                        {s.label}
                      </Chip>
                    ))}
                  </div>
                </SettingsGroup>

                <SettingsGroup step={2} title="Stile">
                  <div className="grid grid-cols-3 gap-2">
                    {STYLES.map((s) => (
                      <Chip
                        key={s.id}
                        selected={style === s.id}
                        onClick={() => {
                          setStyle(s.id);
                          resetResult();
                        }}
                      >
                        {s.label}
                      </Chip>
                    ))}
                  </div>
                  <p className="mt-2 text-[0.7rem] leading-snug text-muted-foreground">
                    {STYLES.find((s) => s.id === style)?.description}
                  </p>
                </SettingsGroup>

                <SettingsGroup step={3} title="Intensità">
                  <div className="grid grid-cols-2 gap-2">
                    {INTENSITIES.map((s) => (
                      <Chip
                        key={s.id}
                        selected={intensity === s.id}
                        onClick={() => {
                          setIntensity(s.id);
                          resetResult();
                        }}
                      >
                        <div className="text-center">
                          <div>{s.label}</div>
                          <div className="mt-0.5 text-[0.6rem] normal-case tracking-normal opacity-70">
                            {s.hint}
                          </div>
                        </div>
                      </Chip>
                    ))}
                  </div>
                </SettingsGroup>
              </div>
            </aside>
          </div>

          {/* Mobile sticky action bar */}
          <div className="sticky bottom-0 left-0 right-0 z-10 border-t border-border bg-background/95 px-4 py-3 backdrop-blur md:hidden">
            <div className="mb-2 flex items-center justify-between text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">
              <span>Selezione</span>
              <span className="text-primary">{summary}</span>
            </div>
            <button
              type="button"
              onClick={generate}
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-sm bg-primary px-6 py-4 text-xs uppercase tracking-[0.22em] text-primary-foreground shadow-sm transition hover:bg-primary/90 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Generazione…
                </>
              ) : (
                <>
                  <Wand2 size={16} /> {result ? "Rigenera" : "Genera rendering"}
                </>
              )}
            </button>
            {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
          </div>
        </DialogContent>
      </Dialog>

      <Lightbox src={lightbox} onClose={() => setLightbox(null)} />
    </>
  );
}

// — Settings group with numbered step —
function SettingsGroup({
  step,
  title,
  hint,
  children,
}: {
  step: number;
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-5 border-t border-border/60 pt-4 first-of-type:mt-5">
      <div className="mb-2.5 flex items-center gap-2">
        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-ink text-[0.65rem] font-medium text-cream">
          {step}
        </span>
        <span className="text-[0.75rem] font-medium uppercase tracking-[0.16em] text-ink">
          {title}
        </span>
      </div>
      {children}
      {hint && (
        <p className="mt-2 text-[0.7rem] leading-snug text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}

// — Generic chip selector —
function Chip({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`relative flex items-center justify-center rounded-sm border px-3 py-2.5 text-sm font-medium transition ${
        selected
          ? "border-primary bg-primary/10 text-primary"
          : "border-border bg-background text-ink hover:border-primary/40 hover:bg-muted/40"
      }`}
    >
      {selected && (
        <Check
          size={12}
          className="absolute right-1.5 top-1.5 text-primary"
          strokeWidth={3}
        />
      )}
      {children}
    </button>
  );
}

// — Hero photo: large, clickable, primary action —
function HeroPhoto({
  src,
  loading,
  style,
  onGenerate,
  onOpen,
}: {
  src: string;
  loading: boolean;
  style: Style;
  onGenerate: () => void;
  onOpen: () => void;
}) {
  return (
    <div className="group relative overflow-hidden rounded-sm bg-muted">
      <button
        type="button"
        onClick={loading ? undefined : onGenerate}
        disabled={loading}
        className="block w-full text-left"
        aria-label="Genera rendering di questa foto"
      >
        <img src={src} alt="Foto selezionata" className="aspect-[16/10] w-full object-cover" />
        {!loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-ink/0 opacity-0 transition group-hover:bg-ink/40 group-hover:opacity-100">
            <div className="inline-flex items-center gap-2 rounded-sm bg-cream/95 px-5 py-3 text-xs uppercase tracking-[0.22em] text-ink shadow-lg">
              <Wand2 size={14} /> Clicca per generare il rendering
            </div>
          </div>
        )}
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/85 px-6 text-center">
            <Loader2 size={32} className="animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">
              L'AI sta reinterpretando lo spazio in stile <strong>{style}</strong>…
            </p>
          </div>
        )}
      </button>
      <button
        type="button"
        onClick={onOpen}
        className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-sm bg-ink/70 px-3 py-2 text-[0.65rem] uppercase tracking-[0.18em] text-cream backdrop-blur hover:bg-ink/85"
      >
        <Maximize2 size={12} /> Apri grande
      </button>
      {!loading && (
        <div className="absolute bottom-3 left-3 inline-flex items-center gap-2 rounded-sm bg-background/90 px-3 py-2 text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground backdrop-blur">
          <ImageIcon size={12} className="text-primary" /> Foto selezionata
        </div>
      )}
    </div>
  );
}

// — Result viewer with compare modes —
function ResultViewer({
  before,
  after,
  style,
  mode,
  onModeChange,
  onLightbox,
}: {
  before: string;
  after: string;
  style: Style;
  mode: CompareMode;
  onModeChange: (m: CompareMode) => void;
  onLightbox: (src: string) => void;
}) {
  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <span className="text-[0.7rem] uppercase tracking-[0.18em] text-muted-foreground">
          Confronto prima / dopo
        </span>
        <div className="inline-flex rounded-sm border border-border bg-card p-1 text-[0.65rem] uppercase tracking-[0.18em]">
          {(
            [
              { id: "side", label: "Affiancato" },
              { id: "slider", label: "Slider" },
              { id: "toggle", label: "Toggle" },
            ] as { id: CompareMode; label: string }[]
          ).map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => onModeChange(m.id)}
              className={`rounded-sm px-3 py-1.5 transition ${
                mode === m.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-ink"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>
      {mode === "side" ? (
        <SideBySide
          before={before}
          after={after}
          style={style}
          onOpenBefore={() => onLightbox(before)}
          onOpenAfter={() => onLightbox(after)}
        />
      ) : mode === "slider" ? (
        <SliderCompare before={before} after={after} />
      ) : (
        <TogglePane
          before={before}
          after={after}
          style={style}
          onOpen={(src) => onLightbox(src)}
        />
      )}
    </div>
  );
}

function Pane({
  src,
  caption,
  onOpen,
}: {
  src: string;
  caption: string;
  onOpen: () => void;
}) {
  return (
    <figure className="relative overflow-hidden rounded-sm bg-muted">
      <img src={src} alt={caption} className="aspect-[4/3] w-full object-cover" />
      <button
        type="button"
        onClick={onOpen}
        className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-sm bg-ink/70 px-2.5 py-1.5 text-[0.6rem] uppercase tracking-[0.18em] text-cream backdrop-blur hover:bg-ink/85"
      >
        <Maximize2 size={11} /> Apri
      </button>
      <figcaption className="bg-card px-3 py-2 text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">
        {caption}
      </figcaption>
    </figure>
  );
}

function SideBySide({
  before,
  after,
  style,
  onOpenBefore,
  onOpenAfter,
}: {
  before: string;
  after: string;
  style: Style;
  onOpenBefore: () => void;
  onOpenAfter: () => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Pane src={before} caption="Prima · originale" onOpen={onOpenBefore} />
      <Pane src={after} caption={`Dopo · restyling ${style}`} onOpen={onOpenAfter} />
    </div>
  );
}

function SliderCompare({ before, after }: { before: string; after: string }) {
  const [pct, setPct] = useState(50);
  const ref = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  function move(clientX: number) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
    setPct((x / rect.width) * 100);
  }

  useEffect(() => {
    const up = () => (dragging.current = false);
    const mv = (e: MouseEvent) => dragging.current && move(e.clientX);
    const tmv = (e: TouchEvent) =>
      dragging.current && e.touches[0] && move(e.touches[0].clientX);
    window.addEventListener("mouseup", up);
    window.addEventListener("touchend", up);
    window.addEventListener("mousemove", mv);
    window.addEventListener("touchmove", tmv);
    return () => {
      window.removeEventListener("mouseup", up);
      window.removeEventListener("touchend", up);
      window.removeEventListener("mousemove", mv);
      window.removeEventListener("touchmove", tmv);
    };
  }, []);

  return (
    <div
      ref={ref}
      className="relative aspect-[16/10] w-full select-none overflow-hidden rounded-sm bg-muted"
      onMouseDown={(e) => {
        dragging.current = true;
        move(e.clientX);
      }}
      onTouchStart={(e) => {
        dragging.current = true;
        if (e.touches[0]) move(e.touches[0].clientX);
      }}
    >
      <img
        src={after}
        alt="Rendering"
        className="absolute inset-0 h-full w-full object-cover"
        draggable={false}
      />
      <div
        className="absolute inset-y-0 left-0 overflow-hidden"
        style={{ width: `${pct}%` }}
      >
        <img
          src={before}
          alt="Originale"
          className="absolute inset-0 h-full w-full object-cover"
          style={{ width: `${ref.current?.clientWidth || 0}px`, maxWidth: "none" }}
          draggable={false}
        />
      </div>
      <div
        className="absolute inset-y-0 w-0.5 bg-cream/90 shadow"
        style={{ left: `${pct}%` }}
      >
        <div className="absolute left-1/2 top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-cream text-ink shadow-lg">
          <ArrowLeftRight size={16} />
        </div>
      </div>
      <span className="absolute left-3 top-3 rounded-sm bg-ink/70 px-2.5 py-1 text-[0.6rem] uppercase tracking-[0.2em] text-cream backdrop-blur">
        Prima
      </span>
      <span className="absolute right-3 top-3 rounded-sm bg-primary/90 px-2.5 py-1 text-[0.6rem] uppercase tracking-[0.2em] text-primary-foreground backdrop-blur">
        Dopo · restyling AI
      </span>
    </div>
  );
}

function TogglePane({
  before,
  after,
  style,
  onOpen,
}: {
  before: string;
  after: string;
  style: Style;
  onOpen: (src: string) => void;
}) {
  const [showAfter, setShowAfter] = useState(true);
  const current = showAfter ? after : before;
  return (
    <div className="space-y-3">
      <div className="relative overflow-hidden rounded-sm bg-muted">
        <img
          src={current}
          alt={showAfter ? "Rendering" : "Originale"}
          className="aspect-[16/10] w-full object-cover"
        />
        <button
          type="button"
          onClick={() => onOpen(current)}
          className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-sm bg-ink/70 px-3 py-2 text-[0.65rem] uppercase tracking-[0.18em] text-cream backdrop-blur hover:bg-ink/85"
        >
          <Maximize2 size={12} /> Apri grande
        </button>
        <span
          className={`absolute left-3 top-3 rounded-sm px-2.5 py-1 text-[0.6rem] uppercase tracking-[0.2em] backdrop-blur ${
            showAfter
              ? "bg-primary/90 text-primary-foreground"
              : "bg-ink/70 text-cream"
          }`}
        >
          {showAfter ? `Dopo · ${style}` : "Prima · originale"}
        </span>
      </div>
      <div className="inline-flex w-full rounded-sm border border-border bg-card p-1 text-xs">
        <button
          type="button"
          onClick={() => setShowAfter(false)}
          className={`flex-1 rounded-sm px-3 py-2 uppercase tracking-[0.18em] transition ${
            !showAfter ? "bg-ink text-cream" : "text-muted-foreground hover:text-ink"
          }`}
        >
          Originale
        </button>
        <button
          type="button"
          onClick={() => setShowAfter(true)}
          className={`flex-1 rounded-sm px-3 py-2 uppercase tracking-[0.18em] transition ${
            showAfter ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-ink"
          }`}
        >
          Rendering
        </button>
      </div>
    </div>
  );
}

function Lightbox({ src, onClose }: { src: string | null; onClose: () => void }) {
  useEffect(() => {
    if (!src) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [src, onClose]);

  if (!src) return null;
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/95 p-4 md:p-8"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-cream/10 text-cream backdrop-blur transition hover:bg-cream/20"
        aria-label="Chiudi"
      >
        <X size={20} />
      </button>
      <img
        src={src}
        alt="Anteprima"
        className="max-h-full max-w-full rounded-sm object-contain shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}