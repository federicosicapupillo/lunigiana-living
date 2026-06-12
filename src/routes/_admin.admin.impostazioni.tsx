import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Save, CloudDownload, RefreshCw, Wand2, Upload, ShieldCheck, Zap } from "lucide-react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import {
  getHomeHeroVariant,
  setHomeHeroVariant,
  type HomeHeroVariant,
} from "@/lib/site-settings.functions";
import {
  syncAllImportedImages,
  verifyAndSyncAllPhotos,
  forceSyncPhotosBatch,
} from "@/lib/property-render.functions";
import {
  enhanceAllImages,
  publishAllEnhancedImages,
} from "@/lib/property-enhance.functions";
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
  const verifySyncAll = useServerFn(verifyAndSyncAllPhotos);
  const forceSyncBatch = useServerFn(forceSyncPhotosBatch);
  const enhanceAll = useServerFn(enhanceAllImages);
  const publishAll = useServerFn(publishAllEnhancedImages);
  const [variant, setVariant] = useState<HomeHeroVariant>("lunigiana_emotional");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<
    | { total: number; synced: number; alreadyOk: number; failed: number; errors: Array<{ imageId: string; message: string }> }
    | null
  >(null);
  const [enhancing, setEnhancing] = useState(false);
  const [enhanceResult, setEnhanceResult] = useState<
    | { total: number; enhanced: number; failed: number; skipped: number; errors: Array<{ imageId: string; message: string }> }
    | null
  >(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [verifyConfirmOpen, setVerifyConfirmOpen] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<
    | {
        propertiesAnalyzed: number;
        totalImages: number;
        alreadyOk: number;
        synced: number;
        failed: number;
        errors: Array<{ imageId: string; propertyId: string; message: string }>;
      }
    | null
  >(null);
  const [forceConfirmOpen, setForceConfirmOpen] = useState(false);
  const [forcing, setForcing] = useState(false);
  const [forceProgress, setForceProgress] = useState<{ processed: number; remaining: number } | null>(null);
  const [forceResult, setForceResult] = useState<
    | {
        processed: number;
        synced: number;
        alreadyOk: number;
        failed: number;
        errors: Array<{ imageId: string; propertyId: string; message: string }>;
      }
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

  const runEnhance = async (onlyErrors: boolean) => {
    setEnhancing(true);
    setEnhanceResult(null);
    setConfirmOpen(false);
    try {
      const res = await enhanceAll({ data: { onlyErrors } });
      setEnhanceResult(res);
      if (res.failed === 0) toast.success(`Miglioramento completato · ${res.enhanced} foto`);
      else toast.warning(`Completato con ${res.failed} errori · ${res.enhanced} ok`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Errore miglioramento");
    } finally {
      setEnhancing(false);
    }
  };

  const runPublishAll = async () => {
    if (!confirm("Pubblicare tutte le versioni migliorate disponibili come foto pubbliche?")) return;
    setPublishing(true);
    try {
      const res = await publishAll();
      toast.success(`${res.published} foto migliorate pubblicate`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Errore pubblicazione");
    } finally {
      setPublishing(false);
    }
  };

  const runVerifySyncAll = async () => {
    setVerifyConfirmOpen(false);
    setVerifying(true);
    setVerifyResult(null);
    try {
      const res = await verifySyncAll();
      setVerifyResult(res);
      if (res.failed === 0) {
        toast.success(
          `Verifica completata · ${res.alreadyOk} ok · ${res.synced} sincronizzate`,
        );
      } else {
        toast.warning(
          `Verifica completata con ${res.failed} errori · ${res.synced} sincronizzate`,
        );
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Errore verifica foto");
    } finally {
      setVerifying(false);
    }
  };

  const runForceSyncAll = async () => {
    setForceConfirmOpen(false);
    setForcing(true);
    setForceResult(null);
    setForceProgress({ processed: 0, remaining: 0 });
    let totalProcessed = 0;
    let totalSynced = 0;
    let totalAlready = 0;
    let totalFailed = 0;
    const allErrors: Array<{ imageId: string; propertyId: string; message: string }> = [];
    try {
      // Loop batches until nothing remains. Safety cap to avoid infinite loops.
      for (let i = 0; i < 500; i++) {
        const res = await forceSyncBatch({ data: { limit: 15 } });
        totalProcessed += res.processed;
        totalSynced += res.synced;
        totalAlready += res.alreadyOk;
        totalFailed += res.failed;
        allErrors.push(...res.errors);
        setForceProgress({ processed: totalProcessed, remaining: res.remaining });
        if (res.processed === 0 || res.remaining === 0) break;
      }
      setForceResult({
        processed: totalProcessed,
        synced: totalSynced,
        alreadyOk: totalAlready,
        failed: totalFailed,
        errors: allErrors,
      });
      if (totalFailed === 0) {
        toast.success(`Sincronizzate ${totalSynced} foto · ${totalAlready} già ok`);
      } else {
        toast.warning(`${totalSynced} sincronizzate · ${totalFailed} errori`);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Errore sincronizzazione forzata");
    } finally {
      setForcing(false);
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

      <section className="mt-16 border-t border-border pt-10">
        <h2 className="font-serif text-xl text-ink">Verifica e sincronizza foto nello Storage</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Controlla tutte le foto di tutti gli immobili: verifica che siano presenti nello storage
          interno, che i path siano corretti e che gli URL rispondano. Le foto già sincronizzate
          non vengono toccate. Quelle mancanti, ma con una sorgente esterna disponibile, vengono
          scaricate e ricaricate nello storage. Nessuna foto viene mai eliminata.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setVerifyConfirmOpen(true)}
            disabled={verifying}
            className="inline-flex items-center gap-2 rounded-sm bg-ink px-5 py-2.5 text-xs uppercase tracking-[0.2em] text-cream transition hover:bg-ink/90 disabled:opacity-60"
          >
            {verifying ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck size={14} />}
            Sincronizza foto nello Storage
          </button>
          <button
            type="button"
            onClick={() => setForceConfirmOpen(true)}
            disabled={forcing}
            className="inline-flex items-center gap-2 rounded-sm bg-primary px-5 py-2.5 text-xs uppercase tracking-[0.2em] text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
          >
            {forcing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap size={14} />}
            Forza sincronizzazione tutte le foto
          </button>
        </div>
        {forcing && forceProgress && (
          <p className="mt-4 text-sm text-muted-foreground">
            Sincronizzazione forzata in corso… elaborate {forceProgress.processed} foto · ancora {forceProgress.remaining} da analizzare
          </p>
        )}
        {forceResult && (
          <div className="mt-6 rounded-sm border border-primary/30 bg-primary/5 p-4 text-sm">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <Stat label="Foto elaborate" value={forceResult.processed} />
              <Stat label="Sincronizzate ora" value={forceResult.synced} tone="ok" />
              <Stat label="Già sincronizzate" value={forceResult.alreadyOk} />
              <Stat
                label="Non recuperabili"
                value={forceResult.failed}
                tone={forceResult.failed > 0 ? "error" : undefined}
              />
            </div>
            {forceResult.errors.length > 0 && (
              <details className="mt-4" open>
                <summary className="cursor-pointer text-xs uppercase tracking-wider text-muted-foreground">
                  Foto ancora problematiche ({forceResult.errors.length})
                </summary>
                <ul className="mt-2 max-h-72 space-y-1 overflow-auto text-xs text-destructive">
                  {forceResult.errors.map((e) => (
                    <li key={e.imageId} className="font-mono">
                      immobile {e.propertyId.slice(0, 8)}… · foto {e.imageId.slice(0, 8)}… — {e.message}
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </div>
        )}
        {verifying && (
          <p className="mt-4 text-sm text-muted-foreground">
            Verifica in corso… (può richiedere alcuni minuti su archivi grandi)
          </p>
        )}
        {verifyResult && (
          <div className="mt-6 rounded-sm border border-border bg-muted/30 p-4 text-sm">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
              <Stat label="Immobili analizzati" value={verifyResult.propertiesAnalyzed} />
              <Stat label="Foto analizzate" value={verifyResult.totalImages} />
              <Stat label="Già corrette" value={verifyResult.alreadyOk} />
              <Stat label="Sincronizzate" value={verifyResult.synced} tone="ok" />
              <Stat
                label="Con errore"
                value={verifyResult.failed}
                tone={verifyResult.failed > 0 ? "error" : undefined}
              />
            </div>
            {verifyResult.errors.length > 0 && (
              <details className="mt-4" open>
                <summary className="cursor-pointer text-xs uppercase tracking-wider text-muted-foreground">
                  Foto problematiche ({verifyResult.errors.length})
                </summary>
                <ul className="mt-2 max-h-72 space-y-1 overflow-auto text-xs text-destructive">
                  {verifyResult.errors.map((e) => (
                    <li key={e.imageId} className="font-mono">
                      immobile {e.propertyId.slice(0, 8)}… · foto {e.imageId.slice(0, 8)}… — {e.message}
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </div>
        )}

        {verifyConfirmOpen && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 px-4"
            onClick={() => setVerifyConfirmOpen(false)}
          >
            <div
              className="w-full max-w-md rounded-sm border border-border bg-background p-6 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="font-serif text-xl text-ink">Sincronizzare tutte le foto?</h3>
              <p className="mt-3 text-sm text-muted-foreground">
                Questa operazione controllerà tutte le foto degli immobili e tenterà di
                sincronizzarle nello Storage senza cancellare nulla. Vuoi procedere?
              </p>
              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setVerifyConfirmOpen(false)}
                  className="rounded-sm border border-border bg-background px-4 py-2 text-xs uppercase tracking-[0.18em] text-ink hover:border-primary/50"
                >
                  Annulla
                </button>
                <button
                  type="button"
                  onClick={runVerifySyncAll}
                  className="inline-flex items-center gap-2 rounded-sm bg-ink px-4 py-2 text-xs uppercase tracking-[0.18em] text-cream hover:bg-ink/90"
                >
                  <ShieldCheck size={13} /> Avvia sincronizzazione
                </button>
              </div>
            </div>
          </div>
        )}

        {forceConfirmOpen && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 px-4"
            onClick={() => setForceConfirmOpen(false)}
          >
            <div
              className="w-full max-w-md rounded-sm border border-border bg-background p-6 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="font-serif text-xl text-ink">Forzare la sincronizzazione di TUTTE le foto?</h3>
              <p className="mt-3 text-sm text-muted-foreground">
                Verranno scaricate dalla sorgente originale e ricaricate nello Storage tutte le foto non
                ancora sincronizzate, in più passaggi automatici. Nessuna foto verrà cancellata. Vuoi procedere?
              </p>
              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setForceConfirmOpen(false)}
                  className="rounded-sm border border-border bg-background px-4 py-2 text-xs uppercase tracking-[0.18em] text-ink hover:border-primary/50"
                >
                  Annulla
                </button>
                <button
                  type="button"
                  onClick={runForceSyncAll}
                  className="inline-flex items-center gap-2 rounded-sm bg-primary px-4 py-2 text-xs uppercase tracking-[0.18em] text-primary-foreground hover:bg-primary/90"
                >
                  <Zap size={13} /> Avvia sincronizzazione forzata
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      <section className="mt-16 border-t border-border pt-10">
        <h2 className="font-serif text-xl text-ink">Miglioramento fotografico</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Crea una versione ottimizzata di tutte le foto degli immobili (luminosità, contrasto,
          bilanciamento del bianco, nitidezza). L'originale non viene mai modificato: scegli
          immobile per immobile quale versione mostrare al pubblico.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            disabled={enhancing}
            className="inline-flex items-center gap-2 rounded-sm bg-primary px-5 py-2.5 text-xs uppercase tracking-[0.2em] text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
          >
            {enhancing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 size={14} />}
            Migliora tutte le foto esistenti
          </button>
          {enhanceResult && enhanceResult.failed > 0 && (
            <button
              type="button"
              onClick={() => runEnhance(true)}
              disabled={enhancing}
              className="inline-flex items-center gap-2 rounded-sm border border-border bg-background px-5 py-2.5 text-xs uppercase tracking-[0.2em] text-ink transition hover:border-primary/50 disabled:opacity-60"
            >
              <RefreshCw size={14} /> Riprova solo le foto fallite
            </button>
          )}
          <button
            type="button"
            onClick={runPublishAll}
            disabled={publishing}
            className="inline-flex items-center gap-2 rounded-sm border border-border bg-background px-5 py-2.5 text-xs uppercase tracking-[0.2em] text-ink transition hover:border-primary/50 disabled:opacity-60"
          >
            {publishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload size={14} />}
            Pubblica tutte le versioni migliorate
          </button>
        </div>
        {enhancing && (
          <p className="mt-4 text-sm text-muted-foreground">
            Miglioramento in corso… (può richiedere alcuni minuti)
          </p>
        )}
        {enhanceResult && (
          <div className="mt-6 rounded-sm border border-border bg-muted/30 p-4 text-sm">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <Stat label="Elaborate" value={enhanceResult.total} />
              <Stat label="Migliorate" value={enhanceResult.enhanced} tone="ok" />
              <Stat label="Saltate" value={enhanceResult.skipped} />
              <Stat label="Errori" value={enhanceResult.failed} tone={enhanceResult.failed > 0 ? "error" : undefined} />
            </div>
            {enhanceResult.errors.length > 0 && (
              <details className="mt-4">
                <summary className="cursor-pointer text-xs uppercase tracking-wider text-muted-foreground">
                  Dettagli errori ({enhanceResult.errors.length})
                </summary>
                <ul className="mt-2 max-h-60 space-y-1 overflow-auto text-xs text-destructive">
                  {enhanceResult.errors.map((e) => (
                    <li key={e.imageId} className="font-mono">
                      {e.imageId.slice(0, 8)}… — {e.message}
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </div>
        )}

        {confirmOpen && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 px-4"
            onClick={() => setConfirmOpen(false)}
          >
            <div
              className="w-full max-w-md rounded-sm border border-border bg-background p-6 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="font-serif text-xl text-ink">Migliora tutte le foto?</h3>
              <p className="mt-3 text-sm text-muted-foreground">
                Vuoi migliorare tutte le foto esistenti? Il sistema creerà una versione ottimizzata
                delle immagini senza cancellare gli originali.
              </p>
              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmOpen(false)}
                  className="rounded-sm border border-border bg-background px-4 py-2 text-xs uppercase tracking-[0.18em] text-ink hover:border-primary/50"
                >
                  Annulla
                </button>
                <button
                  type="button"
                  onClick={() => runEnhance(false)}
                  className="inline-flex items-center gap-2 rounded-sm bg-primary px-4 py-2 text-xs uppercase tracking-[0.18em] text-primary-foreground hover:bg-primary/90"
                >
                  <Wand2 size={13} /> Avvia miglioramento
                </button>
              </div>
            </div>
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