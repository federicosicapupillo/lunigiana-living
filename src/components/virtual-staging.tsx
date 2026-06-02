import { useState } from "react";
import { Sparkles, Loader2, Wand2, RotateCcw } from "lucide-react";

type Style = "minimal" | "rustico" | "luxury";

const STYLES: { id: Style; label: string; description: string }[] = [
  {
    id: "minimal",
    label: "Minimal",
    description: "Pulito, luminoso, essenziale, contemporaneo.",
  },
  {
    id: "rustico",
    label: "Rustico",
    description: "Caldo, materico, naturale. Legno, pietra, accoglienza.",
  },
  {
    id: "luxury",
    label: "Luxury",
    description: "Raffinato, ricco, finiture premium, look editoriale.",
  },
];

export function VirtualStaging({ gallery }: { gallery: string[] }) {
  const photos = gallery.filter(Boolean);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [style, setStyle] = useState<Style>("minimal");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sourceUrl = photos[photoIndex];

  async function generate() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/virtual-staging", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: sourceUrl, style }),
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

  if (photos.length === 0) return null;

  return (
    <section className="mt-16 rounded-sm border border-border bg-gradient-to-br from-muted/60 via-card to-muted/30 p-8 md:p-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="eyebrow inline-flex items-center gap-2">
            <Sparkles size={14} className="text-primary" /> Rendering AI
          </span>
          <h2 className="mt-3 font-serif text-3xl text-ink md:text-4xl">
            Immagina <em className="italic">questo spazio</em>
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Scegli una stanza dell'immobile e prova a vederla in tre stili diversi.
            Un modo per immaginare il potenziale di ogni ambiente prima della visita.
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-8 md:grid-cols-12">
        {/* Step 1 — select photo */}
        <div className="md:col-span-5">
          <div className="eyebrow text-muted-foreground">1. Scegli la foto</div>
          <div className="mt-3 grid grid-cols-4 gap-2">
            {photos.map((g, i) => (
              <button
                key={g + i}
                type="button"
                onClick={() => {
                  setPhotoIndex(i);
                  setResult(null);
                  setError(null);
                }}
                className={`aspect-[4/3] overflow-hidden rounded-sm bg-muted transition ${
                  i === photoIndex ? "ring-2 ring-primary" : "opacity-70 hover:opacity-100"
                }`}
                aria-label={`Foto ${i + 1}`}
              >
                <img src={g} alt="" loading="lazy" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>

          {/* Step 2 — choose style */}
          <div className="mt-8 eyebrow text-muted-foreground">2. Scegli lo stile</div>
          <div className="mt-3 space-y-2">
            {STYLES.map((s) => {
              const selected = style === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setStyle(s.id)}
                  className={`w-full rounded-sm border p-4 text-left transition ${
                    selected
                      ? "border-primary bg-primary/5"
                      : "border-border bg-card hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-serif text-lg text-ink">{s.label}</span>
                    {selected && (
                      <span className="text-[0.65rem] uppercase tracking-[0.18em] text-primary">
                        Selezionato
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{s.description}</p>
                </button>
              );
            })}
          </div>

          {/* Step 3 — generate */}
          <button
            type="button"
            onClick={generate}
            disabled={loading}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-sm bg-primary px-6 py-4 text-xs uppercase tracking-[0.22em] text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Generazione in corso…
              </>
            ) : (
              <>
                <Wand2 size={16} /> Genera rendering
              </>
            )}
          </button>
          {error && (
            <p className="mt-3 text-xs text-destructive">{error}</p>
          )}
          <p className="mt-3 text-[0.7rem] leading-relaxed text-muted-foreground">
            Il rendering è una simulazione generata da intelligenza artificiale a scopo illustrativo
            e non rappresenta uno stato reale dell'immobile.
          </p>
        </div>

        {/* Preview / result */}
        <div className="md:col-span-7">
          <div className="eyebrow text-muted-foreground">Anteprima</div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <figure className="overflow-hidden rounded-sm bg-muted">
              <img
                src={sourceUrl}
                alt="Foto originale"
                className="aspect-[4/3] w-full object-cover"
              />
              <figcaption className="bg-card px-3 py-2 text-[0.7rem] uppercase tracking-[0.18em] text-muted-foreground">
                Prima · originale
              </figcaption>
            </figure>
            <figure className="overflow-hidden rounded-sm bg-muted">
              <div className="relative aspect-[4/3] w-full">
                {result ? (
                  <img
                    src={result}
                    alt={`Rendering ${style}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-muted/60 px-6 text-center">
                    {loading ? (
                      <>
                        <Loader2 size={28} className="animate-spin text-primary" />
                        <p className="text-xs text-muted-foreground">
                          L'AI sta reinterpretando la stanza nello stile <strong>{style}</strong>…
                          <br />
                          Può richiedere una decina di secondi.
                        </p>
                      </>
                    ) : (
                      <>
                        <Sparkles size={24} className="text-primary/70" />
                        <p className="text-xs text-muted-foreground">
                          Seleziona uno stile e clicca <strong>Genera rendering</strong> per vedere
                          la stanza reinterpretata.
                        </p>
                      </>
                    )}
                  </div>
                )}
              </div>
              <figcaption className="flex items-center justify-between bg-card px-3 py-2 text-[0.7rem] uppercase tracking-[0.18em] text-muted-foreground">
                <span>Dopo · stile {style}</span>
                {result && (
                  <button
                    type="button"
                    onClick={() => setResult(null)}
                    className="inline-flex items-center gap-1 text-primary hover:underline"
                  >
                    <RotateCcw size={12} /> Riprova
                  </button>
                )}
              </figcaption>
            </figure>
          </div>
        </div>
      </div>
    </section>
  );
}