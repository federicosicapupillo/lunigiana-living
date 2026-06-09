import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Save, CloudDownload, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import {
  getHomeHeroVariant,
  setHomeHeroVariant,
  type HomeHeroVariant,
} from "@/lib/site-settings.functions";
import { syncAllImportedImages } from "@/lib/property-render.functions";
import heroLunigiana from "@/assets/real/hero-tramonto-ulivi.png.asset.json";
import heroPontremoli from "@/assets/real/pontremoli-hero-centro-storico.png.asset.json";
import heroElena from "@/assets/elena-furia.png.asset.json";

export const Route = createFileRoute("/_admin/admin/impostazioni")({
  head: () => ({
    meta: [
      { title: "Admin · Impostazioni Home — Furia Immobiliare" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: SettingsPage,
});

const OPTIONS: Array<{ id: HomeHeroVariant; label: string; desc: string; img: string }> = [
  {
    id: "lunigiana_emotional",
    label: "Hero emozionale Lunigiana",
    desc: "Immagine panoramica al tramonto, attuale hero della home.",
    img: heroLunigiana.url,
  },
  {
    id: "pontremoli_historic_center",
    label: "Hero Pontremoli centro storico",
    desc: "Foto di Pontremoli con fiume, Duomo e Castello sullo sfondo.",
    img: heroPontremoli.url,
  },
  {
    id: "elena_cometa",
    label: "Hero Elena e Cometa",
    desc: "Layout boutique con Elena e Cometa: presenza umana e identità Furia.",
    img: heroElena.url,
  },
];

function SettingsPage() {
  const get = useServerFn(getHomeHeroVariant);
  const set = useServerFn(setHomeHeroVariant);
  const syncAll = useServerFn(syncAllImportedImages);
  const [variant, setVariant] = useState<HomeHeroVariant>("lunigiana_emotional");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<
    | { total: number; synced: number; alreadyOk: number; failed: number; errors: Array<{ imageId: string; message: string }> }
    | null
  >(null);

  useEffect(() => {
    get()
      .then((r) => setVariant(r.variant))
      .finally(() => setLoading(false));
  }, [get]);

  const save = async () => {
    setSaving(true);
    try {
      await set({ data: { variant } });
      toast.success("Impostazioni salvate");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Errore salvataggio");
    } finally {
      setSaving(false);
    }
  };

  const runSync = async (onlyErrors: boolean) => {
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await syncAll({ data: { onlyErrors } });
      setSyncResult(res);
      if (res.failed === 0) toast.success(`Sincronizzazione completata · ${res.synced} foto`);
      else toast.warning(`Completata con ${res.failed} errori · ${res.synced} ok`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Errore sincronizzazione");
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <h1 className="font-serif text-2xl text-ink sm:text-3xl">Impostazioni Home</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Scegli quale immagine mostrare nella hero della home page pubblica.
      </p>

      <div className="mt-8">
        <h2 className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
          Hero home page
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {OPTIONS.map((opt) => {
            const active = variant === opt.id;
            return (
              <label
                key={opt.id}
                className={`group cursor-pointer overflow-hidden rounded-sm border bg-background transition ${
                  active ? "border-primary ring-2 ring-primary/30" : "border-border hover:border-primary/50"
                }`}
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                  <img
                    src={opt.img}
                    alt={opt.label}
                    className="absolute inset-0 h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="flex items-start gap-3 p-4">
                  <input
                    type="radio"
                    name="home_hero_variant"
                    value={opt.id}
                    checked={active}
                    onChange={() => setVariant(opt.id)}
                    className="mt-1 h-4 w-4 accent-primary"
                  />
                  <div className="min-w-0">
                    <div className="font-medium text-ink">{opt.label}</div>
                    <p className="mt-1 text-sm text-muted-foreground">{opt.desc}</p>
                  </div>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-sm bg-ink px-5 py-2.5 text-xs uppercase tracking-[0.2em] text-cream transition hover:bg-ink/90 disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save size={14} />} Salva
        </button>
      </div>

      <section className="mt-16 border-t border-border pt-10">
        <h2 className="font-serif text-xl text-ink">Sincronizzazione foto importate</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Scarica nello storage interno tutte le foto immobili importate dal vecchio sito.
          Le foto già sincronizzate non vengono duplicate. Necessario per generare i rendering.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => runSync(false)}
            disabled={syncing}
            className="inline-flex items-center gap-2 rounded-sm bg-primary px-5 py-2.5 text-xs uppercase tracking-[0.2em] text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
          >
            {syncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CloudDownload size={14} />}
            Sincronizza tutte le foto importate
          </button>
          {syncResult && syncResult.failed > 0 && (
            <button
              type="button"
              onClick={() => runSync(true)}
              disabled={syncing}
              className="inline-flex items-center gap-2 rounded-sm border border-border bg-background px-5 py-2.5 text-xs uppercase tracking-[0.2em] text-ink transition hover:border-primary/50 disabled:opacity-60"
            >
              <RefreshCw size={14} /> Riprova solo le foto fallite
            </button>
          )}
        </div>
        {syncing && (
          <p className="mt-4 text-sm text-muted-foreground">Sincronizzazione in corso…</p>
        )}
        {syncResult && (
          <div className="mt-6 rounded-sm border border-border bg-muted/30 p-4 text-sm">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <Stat label="Totali" value={syncResult.total} />
              <Stat label="Sincronizzate" value={syncResult.synced} tone="ok" />
              <Stat label="Già nello storage" value={syncResult.alreadyOk} />
              <Stat label="Errori" value={syncResult.failed} tone={syncResult.failed > 0 ? "error" : undefined} />
            </div>
            {syncResult.errors.length > 0 && (
              <details className="mt-4">
                <summary className="cursor-pointer text-xs uppercase tracking-wider text-muted-foreground">
                  Dettagli errori ({syncResult.errors.length})
                </summary>
                <ul className="mt-2 max-h-60 space-y-1 overflow-auto text-xs text-destructive">
                  {syncResult.errors.map((e) => (
                    <li key={e.imageId} className="font-mono">
                      {e.imageId.slice(0, 8)}… — {e.message}
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone?: "ok" | "error" }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div
        className={`mt-1 font-serif text-2xl ${
          tone === "ok" ? "text-primary" : tone === "error" ? "text-destructive" : "text-ink"
        }`}
      >
        {value}
      </div>
    </div>
  );
}