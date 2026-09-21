import { useEffect, useState } from "react";
import { ChevronDown, Loader2, Sparkles, Settings2 } from "lucide-react";
import {
  PHOTO_TYPES,
  RENDER_STYLES,
  RENDER_GOALS,
  ROOM_CONDITIONS,
  INTERVENTION_LEVELS,
  LIGHTING_OPTIONS,
  VISUAL_TARGETS,
  categoriesFor,
  type RenderSettings,
} from "@/lib/render-options";
import { toast } from "sonner";

type Props = {
  imageId: string;
  initial: RenderSettings;
  hasRender: boolean;
  canRender: boolean;
  rendering: boolean;
  /**
   * Riceve i parametri scelti: il salvataggio e l'avvio della generazione
   * avvengono in un'unica azione server (nessun round trip aggiuntivo).
   */
  onGenerate: (settings: RenderSettings) => Promise<void> | void;
};

const EMPTY = "";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}

export function RenderSettingsPanel({
  imageId,
  initial,
  hasRender,
  canRender,
  rendering,
  onGenerate,
}: Props) {
  const [open, setOpen] = useState(false);
  const [advanced, setAdvanced] = useState(false);
  const [state, setState] = useState<RenderSettings>(initial);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setState({ ...initial, preserve_structure: true });
    setOpen(false);
    setAdvanced(false);
  }, [imageId]); // eslint-disable-line react-hooks/exhaustive-deps

  const update = <K extends keyof RenderSettings>(k: K, v: RenderSettings[K]) => {
    setState((s) => {
      const next: RenderSettings = { ...s, [k]: v };
      if (k === "photo_type") next.photo_category = null;
      // Real-estate constraint: structure must always be preserved.
      next.preserve_structure = true;
      return next;
    });
  };

  const generate = async () => {
    if (!state.photo_type) {
      toast.error("Completa i campi obbligatori per generare il rendering");
      return;
    }
    if (busy || rendering) return;
    setBusy(true);
    try {
      // Salvataggio parametri + generazione in un'unica azione server.
      await onGenerate(state);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Errore");
    } finally {
      setBusy(false);
    }
  };

  const selectCls =
    "w-full rounded-sm border border-border bg-background px-2 py-1 text-xs focus:border-primary focus:outline-none";

  const cats = categoriesFor(state.photo_type);

  const triggerLabel = hasRender ? "Rigenera foto con IA" : "Genera foto con IA";

  const statusLabel = open
    ? "Scegli i parametri e genera"
    : hasRender
    ? "Foto IA generata"
    : "Non ancora generata";

  const busyNow = busy || rendering;

  return (
    <div className="rounded-sm border border-border bg-background">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        disabled={!canRender}
        className="flex w-full items-center justify-between gap-2 px-2 py-1.5 text-[10px] uppercase tracking-wider text-ink hover:text-primary disabled:opacity-50"
      >
        <span className="inline-flex items-center gap-1.5">
          {hasRender ? <Sparkles size={12} className="text-primary" /> : <Settings2 size={12} />}
          {open ? "Chiudi pannello" : triggerLabel}
        </span>
        <span className="inline-flex items-center gap-1 text-muted-foreground">
          <span className="hidden sm:inline">{statusLabel}</span>
          <ChevronDown size={12} className={`transition ${open ? "rotate-180" : ""}`} />
        </span>
      </button>
      {open && (
        <div className="space-y-2 border-t border-border p-2">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Field label="Tipo foto *">
              <select
                className={selectCls}
                value={state.photo_type ?? EMPTY}
                onChange={(e) =>
                  update(
                    "photo_type",
                    (e.target.value || null) as RenderSettings["photo_type"],
                  )
                }
              >
                <option value="">— seleziona —</option>
                {PHOTO_TYPES.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Categoria ambiente">
              <select
                className={selectCls}
                value={state.photo_category ?? EMPTY}
                onChange={(e) => update("photo_category", e.target.value || null)}
                disabled={!state.photo_type}
              >
                <option value="">— seleziona —</option>
                {cats.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Stile rendering">
              <select
                className={selectCls}
                value={state.render_style ?? EMPTY}
                onChange={(e) => update("render_style", e.target.value || null)}
              >
                <option value="">— seleziona —</option>
                {RENDER_STYLES.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Obiettivo">
              <select
                className={selectCls}
                value={state.render_goal ?? EMPTY}
                onChange={(e) => update("render_goal", e.target.value || null)}
              >
                <option value="">— seleziona —</option>
                {RENDER_GOALS.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Stato attuale">
              <select
                className={selectCls}
                value={state.room_condition ?? EMPTY}
                onChange={(e) => update("room_condition", e.target.value || null)}
              >
                <option value="">— seleziona —</option>
                {ROOM_CONDITIONS.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Livello intervento">
              <select
                className={selectCls}
                value={state.intervention_level ?? EMPTY}
                onChange={(e) => update("intervention_level", e.target.value || null)}
              >
                <option value="">— seleziona —</option>
                {INTERVENTION_LEVELS.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Luminosità">
              <select
                className={selectCls}
                value={state.desired_lighting ?? EMPTY}
                onChange={(e) => update("desired_lighting", e.target.value || null)}
              >
                <option value="">— seleziona —</option>
                {LIGHTING_OPTIONS.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Target visivo">
              <select
                className={selectCls}
                value={state.visual_target ?? EMPTY}
                onChange={(e) => update("visual_target", e.target.value || null)}
              >
                <option value="">— seleziona —</option>
                {VISUAL_TARGETS.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <label className="flex items-center gap-2 text-[11px] text-ink opacity-90">
            <input
              type="checkbox"
              checked
              disabled
              readOnly
            />
            Mantieni struttura originale (sempre attivo: muri, porte, finestre e prospettiva non vengono mai modificati)
          </label>
          {/* Note libere: facoltative, fuori dal percorso principale. */}
          <button
            type="button"
            onClick={() => setAdvanced((a) => !a)}
            className="flex w-full items-center justify-between gap-2 rounded-sm border border-border px-2 py-1.5 text-[10px] uppercase tracking-wider text-muted-foreground hover:text-primary"
          >
            Opzioni avanzate (facoltative)
            <ChevronDown size={12} className={`transition ${advanced ? "rotate-180" : ""}`} />
          </button>
          {advanced && (
            <Field label="Note libere (facoltative)">
              <textarea
                rows={2}
                maxLength={500}
                value={state.render_notes ?? ""}
                onChange={(e) => update("render_notes", e.target.value || null)}
                placeholder="Es. valorizzare il camino, mantenere pavimento originale, non stravolgere la cucina."
                className="w-full resize-none rounded-sm border border-border bg-background px-2 py-1 text-xs focus:border-primary focus:outline-none"
              />
            </Field>
          )}
          <button
            type="button"
            onClick={generate}
            disabled={busyNow || !canRender}
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-sm bg-primary px-2 py-2 text-[11px] uppercase tracking-wider text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
          >
            {busyNow ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
            {busyNow
              ? "Generazione in corso…"
              : hasRender
              ? "Rigenera foto con IA"
              : "Genera foto con IA"}
          </button>
          {!state.photo_type && (
            <p className="text-center text-[10px] text-destructive">
              Completa i campi obbligatori per generare il rendering
            </p>
          )}
        </div>
      )}
    </div>
  );
}