import { useEffect, useState } from "react";
import { ChevronDown, Loader2, Save } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { saveRenderSettings } from "@/lib/property-render.functions";
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
  onSaved?: (s: RenderSettings) => void;
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

export function RenderSettingsPanel({ imageId, initial, onSaved }: Props) {
  const [open, setOpen] = useState(!initial.photo_type);
  const [state, setState] = useState<RenderSettings>(initial);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const run = useServerFn(saveRenderSettings);

  useEffect(() => {
    setState(initial);
    setDirty(false);
    setJustSaved(false);
  }, [imageId]); // eslint-disable-line react-hooks/exhaustive-deps

  const update = <K extends keyof RenderSettings>(k: K, v: RenderSettings[K]) => {
    setState((s) => {
      const next: RenderSettings = { ...s, [k]: v };
      if (k === "photo_type") next.photo_category = null;
      return next;
    });
    setDirty(true);
    setJustSaved(false);
  };

  const save = async () => {
    setSaving(true);
    try {
      await run({ data: { imageId, settings: state } });
      setDirty(false);
      setJustSaved(true);
      toast.success("Impostazioni rendering salvate");
      onSaved?.(state);
      setTimeout(() => setJustSaved(false), 2500);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Errore salvataggio");
    } finally {
      setSaving(false);
    }
  };

  const selectCls =
    "w-full rounded-sm border border-border bg-background px-2 py-1 text-xs focus:border-primary focus:outline-none";

  const cats = categoriesFor(state.photo_type);

  return (
    <div className="rounded-sm border border-border bg-background">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-2 py-1.5 text-[10px] uppercase tracking-wider text-muted-foreground hover:text-ink"
      >
        <span>
          Impostazioni rendering
          {!state.photo_type && (
            <span className="ml-1 text-destructive">· da configurare</span>
          )}
          {dirty && !saving && (
            <span className="ml-1 text-primary">· modifiche non salvate</span>
          )}
          {!dirty && state.photo_type && (
            <span className="ml-1 text-emerald-600">· salvate</span>
          )}
        </span>
        <ChevronDown
          size={12}
          className={`transition ${open ? "rotate-180" : ""}`}
        />
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
          <label className="flex items-center gap-2 text-[11px] text-ink">
            <input
              type="checkbox"
              checked={state.preserve_structure}
              onChange={(e) => update("preserve_structure", e.target.checked)}
            />
            Mantieni struttura originale (geometrie, aperture, prospettiva)
          </label>
          <Field label="Note libere">
            <textarea
              rows={2}
              maxLength={500}
              value={state.render_notes ?? ""}
              onChange={(e) => update("render_notes", e.target.value || null)}
              placeholder="Es. valorizzare il camino, mantenere pavimento originale, non stravolgere la cucina."
              className="w-full resize-none rounded-sm border border-border bg-background px-2 py-1 text-xs focus:border-primary focus:outline-none"
            />
          </Field>
          <button
            type="button"
            onClick={save}
            disabled={saving || (!dirty && !justSaved)}
            className={`inline-flex w-full items-center justify-center gap-1 rounded-sm border px-2 py-1.5 text-[10px] uppercase tracking-wider transition disabled:opacity-50 ${
              dirty
                ? "border-primary bg-primary text-primary-foreground hover:bg-primary/90"
                : "border-border bg-background hover:border-primary/50"
            }`}
          >
            {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
            {saving
              ? "Salvataggio…"
              : dirty
              ? "Salva impostazioni"
              : justSaved
              ? "Impostazioni salvate"
              : "Impostazioni rendering salvate"}
          </button>
          {!dirty && state.photo_type && (
            <p className="text-center text-[10px] text-emerald-600">
              Foto pronta per il rendering
            </p>
          )}
          {!state.photo_type && (
            <p className="text-center text-[10px] text-muted-foreground">
              Seleziona almeno il tipo foto per abilitare il rendering
            </p>
          )}
        </div>
      )}
    </div>
  );
}