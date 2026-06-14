import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  ArrowLeft,
  Save,
  Sparkles,
  Loader2,
  ChevronDown,
  FileText,
} from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { generateDescription } from "@/lib/ai-description.functions";
import { generateTitle } from "@/lib/ai-title.functions";
import { buildFallbackTitle, isDefaultTitle } from "@/lib/property-title";
import { ImageUploader } from "@/components/admin/image-uploader";
import { LocationFields } from "@/components/admin/location-fields";
import { WindowFlyerDialog } from "@/components/admin/window-flyer-dialog";
import { IdealistaPublishDialog } from "@/components/admin/idealista-publish-dialog";
import {
  PROPERTY_TYPES,
  CONTRACT_TYPES,
  ENERGY_CLASSES,
  CONDITIONS,
  EPI_STATUS_OPTIONS,
  STATUS_LABELS,
  STATUS_BADGE_CLASSES,
  type PropertyStatus,
  LENGTH_OPTIONS,
  TONE_OPTIONS,
  FLOOR_OPTIONS,
  FLOOR_TO_NUMBER,
  HEATING_OPTIONS,
  FURNISHED_OPTIONS,
  FURNISHED_TO_BOOL,
  SIZE_RANGE_OPTIONS,
  SIZE_CUSTOM,
  BEDROOMS_OPTIONS,
  BEDROOMS_CUSTOM,
  BEDROOMS_TO_NUMBER,
  BATHROOMS_OPTIONS,
  BATHROOMS_CUSTOM,
  BATHROOMS_TO_NUMBER,
  TOTAL_FLOORS_OPTIONS,
  TOTAL_FLOORS_CUSTOM,
  AMENITY_GROUPS,
  AMENITY_TO_COLUMN,
  AMENITY_FEATURE_PREFIX,
} from "@/lib/admin/property-constants";
import {
  MULTI_SELECT_FIELDS,
  parseMultiSelect,
  serializeMultiSelect,
  EMPTY_MULTI,
  type MultiSelectKey,
} from "@/lib/admin/property-constants";
import { COMMERCIAL_HIGHLIGHTS } from "@/lib/admin/property-constants";
import { MultiSelectChips } from "@/components/admin/multi-select-chips";
import {
  availableActions,
  applyStatusTransition,
  ACTION_LABELS,
  CONFIRM_COPY,
  type StatusAction,
} from "@/lib/admin/property-status";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";

type Property = {
  id: string;
  title: string;
  slug: string | null;
  reference_code: string | null;
  property_type: string | null;
  contract_type: string | null;
  price: number | null;
  price_on_request: boolean;
  municipality: string | null;
  area_zone: string | null;
  address: string | null;
  province: string | null;
  region: string | null;
  country: string | null;
  locality: string | null;
  show_full_address: boolean;
  postal_code: string | null;
  size_sqm: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  floors: number | null;
  energy_class: string | null;
  energy_performance_index_status: string | null;
  energy_performance_index_value: number | null;
  condition: string | null;
  panoramic_view: boolean;
  historic_property: boolean;
  garden: boolean;
  terrace: boolean;
  balcony: boolean;
  garage: boolean;
  cellar: boolean;
  elevator: boolean;
  furnished: boolean;
  latitude: number | null;
  longitude: number | null;
  short_notes: string | null;
  internal_notes: string | null;
  status: PropertyStatus;
  featured: boolean;
  homepage_order: number | null;
  title_en: string | null;
  subtitle_en: string | null;
  summary_en: string | null;
  location_description_en: string | null;
  commercial_highlights: string[];
};

type Description = {
  generated_description: string | null;
  edited_description: string | null;
  tone_of_voice: string | null;
  length_preference: string | null;
  seo_focus: string | null;
  generated_at: string | null;
  description_en?: string | null;
};

const TABS = [
  { id: "main", label: "Dati principali" },
  { id: "location", label: "Localizzazione" },
  { id: "features", label: "Caratteristiche" },
  { id: "amenities", label: "Dotazioni" },
  { id: "photos", label: "Foto" },
  { id: "narrative", label: "Parametri narrativi" },
  { id: "description", label: "Descrizione AI" },
] as const;
type Tab = (typeof TABS)[number]["id"];

export const Route = createFileRoute("/_admin/admin/immobili/$id")({
  head: () => ({
    meta: [
      { title: "Editor immobile — Admin Furia" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: PropertyEditor,
});

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

function PropertyEditor() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("main");
  const [prop, setProp] = useState<Property | null>(null);
  const [features, setFeatures] = useState<Record<string, string>>({});
  const [desc, setDesc] = useState<Description | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [flyerOpen, setFlyerOpen] = useState(false);
  const [idealistaOpen, setIdealistaOpen] = useState(false);
  const [titleManual, setTitleManual] = useState(false);
  const [titleGenerating, setTitleGenerating] = useState(false);

  // Description controls
  const [genLength, setGenLength] = useState<"breve" | "media" | "editoriale">("media");
  const [genTone, setGenTone] = useState<"neutro" | "emozionale" | "commerciale">("emozionale");
  const [seoFocus, setSeoFocus] = useState("");

  const genDescFn = useServerFn(generateDescription);
  const genTitleFn = useServerFn(generateTitle);

  const load = async () => {
    setLoading(true);
    const [{ data: p, error: e1 }, { data: fs }, { data: d }] = await Promise.all([
      supabase.from("properties").select("*").eq("id", id).maybeSingle(),
      supabase.from("property_features").select("feature_name, feature_value").eq("property_id", id),
      supabase.from("property_descriptions").select("*").eq("property_id", id).maybeSingle(),
    ]);
    if (e1 || !p) {
      toast.error("Immobile non trovato.");
      navigate({ to: "/admin/immobili" });
      return;
    }
    setProp(p as Property);
    // Considera "manuale" qualunque titolo non default già esistente
    setTitleManual(!isDefaultTitle((p as Property).title));
    const fmap: Record<string, string> = {};
    (fs ?? []).forEach((f: { feature_name: string; feature_value: string | null }) => {
      fmap[f.feature_name] = f.feature_value ?? "";
    });
    setFeatures(fmap);
    setDesc(d as Description | null);
    if (d) {
      setGenLength((d.length_preference as never) || "media");
      setGenTone((d.tone_of_voice as never) || "emozionale");
      setSeoFocus(d.seo_focus ?? "");
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [id]);

  const update = (patch: Partial<Property>) => setProp((p) => (p ? { ...p, ...patch } : p));

  // Auto-proposta titolo (fallback senza IA) quando il titolo è ancora il default
  // e l'admin non l'ha modificato manualmente. Aggiornato live al variare dei dati.
  useEffect(() => {
    if (!prop) return;
    if (titleManual) return;
    const proposed = buildFallbackTitle(prop);
    if (!proposed) return;
    if (proposed === prop.title) return;
    // Aggiorna solo se il titolo corrente è ancora un default/generato.
    if (!isDefaultTitle(prop.title)) return;
    setProp((cur) => (cur ? { ...cur, title: proposed } : cur));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    prop?.property_type,
    prop?.municipality,
    prop?.area_zone,
    prop?.bedrooms,
    prop?.condition,
    prop?.panoramic_view,
    prop?.garden,
    prop?.terrace,
    prop?.balcony,
    prop?.garage,
    prop?.historic_property,
    prop?.furnished,
    titleManual,
  ]);

  const regenerateTitleAi = async () => {
    if (!prop) return;
    setTitleGenerating(true);
    try {
      // Salva i dati attuali in modo che il server fn legga lo stato aggiornato.
      await save(true);
      const res = await genTitleFn({ data: { propertyId: id } });
      update({ title: res.title });
      setTitleManual(false);
      toast.success(res.source === "ai" ? "Titolo rigenerato con IA" : "Titolo rigenerato");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Errore generazione titolo";
      // Fallback locale
      update({ title: buildFallbackTitle(prop) });
      setTitleManual(false);
      toast.error(msg);
    } finally {
      setTitleGenerating(false);
    }
  };

  const save = async (silent = false) => {
    if (!prop) return;
    setSaving(true);
    // Lo slug è un dato tecnico interno: si genera solo se manca,
    // non viene mai rigenerato dal titolo dopo la creazione (stabilità SEO/link).
    const existingSlug = prop.slug?.trim();
    const slug =
      existingSlug && existingSlug.length > 0
        ? existingSlug
        : slugify(
            [prop.title, prop.municipality, prop.reference_code]
              .filter(Boolean)
              .join(" ") || "immobile",
          );
    const { error } = await supabase
      .from("properties")
      .update({ ...prop, slug })
      .eq("id", id);
    if (error) {
      toast.error(error.message);
      setSaving(false);
      return;
    }
    // Save features
    await supabase.from("property_features").delete().eq("property_id", id);
    const rows = Object.entries(features)
      .filter(([, v]) => v && v.trim().length > 0)
      .map(([feature_name, feature_value]) => ({ property_id: id, feature_name, feature_value }));
    if (rows.length) await supabase.from("property_features").insert(rows);

    setProp((p) => (p ? { ...p, slug } : p));
    setSaving(false);
    if (!silent) toast.success("Salvato");
  };

  const [statusMenu, setStatusMenu] = useState(false);
  const [pendingAction, setPendingAction] = useState<StatusAction | null>(null);
  const [statusBusy, setStatusBusy] = useState(false);

  const requestAction = (action: StatusAction) => {
    setStatusMenu(false);
    if (!CONFIRM_COPY[action]) {
      void runAction(action);
      return;
    }
    setPendingAction(action);
  };

  const runAction = async (action: StatusAction) => {
    if (!prop) return;
    setStatusBusy(true);
    const res = await applyStatusTransition(id, action);
    setStatusBusy(false);
    setPendingAction(null);
    if ("error" in res) {
      toast.error(res.error);
      return;
    }
    toast.success(`${ACTION_LABELS[action]} ✓`);
    if (action === "hard_delete") {
      navigate({ to: "/admin/immobili" });
      return;
    }
    update({ status: res.status });
  };

  const generate = async () => {
    if (!prop) return;
    setGenerating(true);
    try {
      // Auto-save first so AI sees latest data
      await save(true);
      const result = await genDescFn({
        data: {
          propertyId: id,
          length: genLength,
          tone: genTone,
          seoFocus: seoFocus.trim() || undefined,
        },
      });
      setDesc((d) => ({
        ...(d ?? { edited_description: null }),
        generated_description: result.description,
        tone_of_voice: genTone,
        length_preference: genLength,
        seo_focus: seoFocus.trim() || null,
        generated_at: new Date().toISOString(),
      }));
      toast.success("Descrizione generata");
      setTab("description");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Errore generazione");
    } finally {
      setGenerating(false);
    }
  };

  const saveEditedDesc = async () => {
    if (!desc) return;
    const { error } = await supabase
      .from("property_descriptions")
      .update({ edited_description: desc.edited_description })
      .eq("property_id", id);
    if (error) return toast.error(error.message);
    toast.success("Descrizione salvata");
  };

  if (loading || !prop) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-5 pb-28 sm:px-6 sm:py-8 sm:pb-8">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between sm:pb-6">
        <div className="min-w-0 flex-1">
          <Link
            to="/admin/immobili"
            className="inline-flex items-center gap-1 text-xs uppercase tracking-wider text-muted-foreground hover:text-ink"
          >
            <ArrowLeft size={12} /> Torna all'elenco
          </Link>
          <input
            value={prop.title}
            onChange={(e) => {
              setTitleManual(true);
              update({ title: e.target.value });
            }}
            placeholder="Il titolo verrà generato automaticamente dai dati inseriti"
            className="mt-3 w-full bg-transparent font-serif text-2xl text-ink focus:outline-none sm:text-3xl"
          />
          <div className="mt-1 flex items-center gap-3 text-[11px] text-muted-foreground">
            <button
              type="button"
              onClick={regenerateTitleAi}
              disabled={titleGenerating}
              className="inline-flex items-center gap-1 rounded-sm border border-border bg-background px-2 py-1 uppercase tracking-wider hover:border-primary/50 disabled:opacity-50"
            >
              {titleGenerating ? (
                <Loader2 size={11} className="animate-spin" />
              ) : (
                <Sparkles size={11} />
              )}
              Rigenera titolo
            </button>
            {titleManual ? (
              <span>Titolo modificato manualmente · non verrà sovrascritto</span>
            ) : (
              <span>Titolo proposto automaticamente · modificalo per personalizzarlo</span>
            )}
          </div>
          <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
            <span
              className={`rounded-sm border px-2 py-0.5 text-[10px] uppercase tracking-wider ${
                STATUS_BADGE_CLASSES[prop.status] ?? "bg-zinc-100 text-zinc-800 border-zinc-200"
              }`}
            >
              {STATUS_LABELS[prop.status] ?? prop.status}
            </span>
            <span>·</span>
            <span>{prop.reference_code || "Nessun codice"}</span>
          </div>
        </div>
        <div className="hidden flex-wrap gap-2 sm:flex">
          <button
            onClick={() => save()}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-sm border border-border bg-background px-4 py-2 text-xs uppercase tracking-wider hover:border-primary/50 disabled:opacity-50"
          >
            {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
            Salva bozza
          </button>
          <button
            onClick={() => setFlyerOpen(true)}
            className="inline-flex items-center gap-2 rounded-sm border border-border bg-background px-4 py-2 text-xs uppercase tracking-wider hover:border-primary/50"
          >
            <FileText size={13} /> Genera cartello A4
          </button>
          <button
            onClick={() => setIdealistaOpen(true)}
            className="inline-flex items-center gap-2 rounded-sm border border-border bg-background px-4 py-2 text-xs uppercase tracking-wider hover:border-primary/50"
          >
            <FileText size={13} /> Pubblica su Idealista
          </button>
          <StatusActionsButton
            status={prop.status}
            open={statusMenu}
            setOpen={setStatusMenu}
            onAction={requestAction}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-6 -mx-4 flex gap-1 overflow-x-auto border-b border-border px-4 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`-mb-px shrink-0 whitespace-nowrap border-b-2 px-3 py-2.5 text-sm transition sm:px-4 ${
              tab === t.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-ink"
            }`}
          >
            <span className="inline-flex items-center gap-2">
              {t.label}
              {t.id === "narrative" && (
                <span className="rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-primary">
                  Nuovo
                </span>
              )}
            </span>
          </button>
        ))}
      </div>

      <div className="mt-8">
        {tab === "main" && <MainTab prop={prop} update={update} features={features} setFeatures={setFeatures} />}
        {tab === "location" && <LocationTab prop={prop} update={update} />}
        {tab === "features" && (
          <FeaturesTab prop={prop} update={update} features={features} setFeatures={setFeatures} />
        )}
        {tab === "amenities" && (
          <AmenitiesTab prop={prop} update={update} features={features} setFeatures={setFeatures} />
        )}
        {tab === "photos" && <ImageUploader propertyId={id} />}
        {tab === "narrative" && (
          <NarrativeTab
            prop={prop}
            update={update}
            features={features}
            setFeatures={setFeatures}
          />
        )}
        {tab === "description" && (
          <DescriptionTab
            desc={desc}
            setDesc={setDesc}
            generating={generating}
            onGenerate={generate}
            onSaveEdit={saveEditedDesc}
            length={genLength}
            setLength={setGenLength}
            tone={genTone}
            setTone={setGenTone}
            seoFocus={seoFocus}
            setSeoFocus={setSeoFocus}
          />
        )}
      </div>

      {/* Barra azioni mobile fissa */}
      <div className="fixed inset-x-0 bottom-0 z-30 flex gap-2 border-t border-border bg-background/95 p-3 backdrop-blur sm:hidden">
        <button
          onClick={() => save()}
          disabled={saving}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-sm border border-border bg-background px-3 py-2.5 text-xs uppercase tracking-wider hover:border-primary/50 disabled:opacity-50"
        >
          {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
          Salva
        </button>
        <StatusActionsButton
          status={prop.status}
          open={statusMenu}
          setOpen={setStatusMenu}
          onAction={requestAction}
          dropUp
        />
      </div>

      <ConfirmDialog
        open={!!pendingAction}
        busy={statusBusy}
        title={pendingAction ? CONFIRM_COPY[pendingAction]?.title ?? "" : ""}
        body={pendingAction ? CONFIRM_COPY[pendingAction]?.body ?? "" : ""}
        cancel={pendingAction ? CONFIRM_COPY[pendingAction]?.cancel ?? "Annulla" : "Annulla"}
        confirm={pendingAction ? CONFIRM_COPY[pendingAction]?.confirm ?? "Conferma" : "Conferma"}
        danger={pendingAction ? CONFIRM_COPY[pendingAction]?.danger : false}
        onCancel={() => setPendingAction(null)}
        onConfirm={() => pendingAction && runAction(pendingAction)}
      />
      <WindowFlyerDialog
        property={prop}
        open={flyerOpen}
        onClose={() => setFlyerOpen(false)}
      />
      <IdealistaPublishDialog
        property={prop}
        description={desc}
        open={idealistaOpen}
        onClose={() => setIdealistaOpen(false)}
        onPublished={load}
      />
    </div>
  );
}

function StatusActionsButton({
  status,
  open,
  setOpen,
  onAction,
  dropUp,
}: {
  status: PropertyStatus;
  open: boolean;
  setOpen: (v: boolean) => void;
  onAction: (a: StatusAction) => void;
  dropUp?: boolean;
}) {
  const actions = availableActions(status);
  return (
    <div className="relative flex-1 sm:flex-none">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="inline-flex w-full items-center justify-center gap-2 rounded-sm bg-primary px-4 py-2.5 text-xs uppercase tracking-wider text-primary-foreground hover:bg-primary/90 sm:py-2"
      >
        Stato annuncio <ChevronDown size={13} />
      </button>
      {open && (
        <div
          className={`absolute right-0 z-40 w-60 overflow-hidden rounded-sm border border-border bg-card shadow-lg ${
            dropUp ? "bottom-full mb-1" : "top-full mt-1"
          }`}
        >
          {actions.length === 0 ? (
            <div className="px-3 py-2 text-xs text-muted-foreground">Nessuna azione disponibile</div>
          ) : (
            actions.map((act) => (
              <button
                key={act}
                type="button"
                onClick={() => onAction(act)}
                className={`block w-full px-3 py-2 text-left text-xs uppercase tracking-wider hover:bg-muted ${
                  act === "delete" || act === "hard_delete" ? "text-red-700" : "text-ink"
                }`}
              >
                {ACTION_LABELS[act]}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

/* ---------- Re-usable inputs ---------- */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-sm border border-border bg-card p-4 sm:p-6">
      <h3 className="font-serif text-lg text-ink">{title}</h3>
      <div className="mt-5 grid gap-4 md:grid-cols-2">{children}</div>
    </div>
  );
}

function Field({
  label,
  children,
  full,
}: {
  label: string;
  children: React.ReactNode;
  full?: boolean;
}) {
  return (
    <label className={`block ${full ? "md:col-span-2" : ""}`}>
      <span className="block text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

const inputCls =
  "w-full rounded-sm border border-border bg-background px-3 py-2.5 text-base focus:border-primary focus:outline-none sm:py-2 sm:text-sm";

function TextInput({
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  value: string | number | null | undefined;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={inputCls}
    />
  );
}

function NumberInput({
  value,
  onChange,
  step = 1,
  disabled,
  placeholder,
}: {
  value: number | null;
  onChange: (v: number | null) => void;
  step?: number;
  disabled?: boolean;
  placeholder?: string;
}) {
  return (
    <input
      type="number"
      step={step}
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
      disabled={disabled}
      placeholder={placeholder}
      className={`${inputCls} ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
    />
  );
}

function SelectInput({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string | null | undefined;
  onChange: (v: string) => void;
  options: readonly string[];
  placeholder?: string;
}) {
  return (
    <select value={value ?? ""} onChange={(e) => onChange(e.target.value)} className={inputCls}>
      <option value="">{placeholder ?? "—"}</option>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}

function Toggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      role="switch"
      aria-checked={value}
      className={`group flex w-full items-center gap-3 rounded-sm border px-4 py-2.5 text-sm transition cursor-pointer ${
        value
          ? "border-primary bg-primary/5 text-ink"
          : "border-border bg-card text-muted-foreground hover:border-primary/40"
      }`}
    >
      <span
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
          value ? "bg-primary" : "bg-muted-foreground/30"
        }`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
            value ? "translate-x-[22px]" : "translate-x-0.5"
          }`}
        />
      </span>
      <span className="font-medium">{label}</span>
    </button>
  );
}

/* ---------- Tabs ---------- */

function MainTab({
  prop,
  update,
  features,
  setFeatures,
}: {
  prop: Property;
  update: (p: Partial<Property>) => void;
  features: Record<string, string>;
  setFeatures: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}) {
  return (
    <Section title="Dati principali">
      <Field label="Codice riferimento">
        <input
          type="text"
          value={prop.reference_code ?? ""}
          readOnly
          disabled
          className={`${inputCls} cursor-not-allowed bg-muted/40 text-muted-foreground`}
        />
      </Field>
      <Field label="Tipologia immobile">
        <SelectInput
          value={prop.property_type}
          onChange={(v) => update({ property_type: v })}
          options={PROPERTY_TYPES}
          placeholder="Seleziona tipologia immobile"
        />
      </Field>
      <Field label="Contratto">
        <SelectInput
          value={prop.contract_type}
          onChange={(v) => update({ contract_type: v })}
          options={CONTRACT_TYPES}
        />
      </Field>
      <Field label="Descrizione libera" full>
        <textarea
          value={features["descrizione_libera"] ?? ""}
          onChange={(e) =>
            setFeatures({ ...features, descrizione_libera: e.target.value })
          }
          rows={5}
          placeholder="Scrivi qui una descrizione personalizzata dell'immobile, del contesto, della vista, del terreno, delle potenzialità o di altri dettagli importanti…"
          className={inputCls}
        />
      </Field>
      <Field label="Prezzo (€)" full>
        <div className="space-y-2">
          <NumberInput
            value={prop.price}
            onChange={(v) => update({ price: v })}
            step={1000}
            placeholder="Inserisci prezzo interno"
          />
          <Toggle
            label="Mostra come prezzo su richiesta"
            value={prop.price_on_request}
            onChange={(v) => update({ price_on_request: v })}
          />
          <p className="text-xs text-muted-foreground">
            Il prezzo resta salvato nel backend, ma sul sito verrà mostrato come “Prezzo su richiesta”.
          </p>
        </div>
      </Field>
      <Field label="Note private agenzia" full>
        <textarea
          value={prop.internal_notes ?? ""}
          onChange={(e) => update({ internal_notes: e.target.value })}
          rows={3}
          placeholder="Appunti interni non visibili al pubblico."
          className={inputCls}
        />
      </Field>
      <Field label="Visibilità e promozione" full>
        <div className="space-y-2 rounded-sm border border-border bg-muted/20 p-4">
          <Toggle
            label="Mostra in home page (immobile in evidenza)"
            value={prop.featured}
            onChange={(v) => update({ featured: v, homepage_order: v ? prop.homepage_order : null })}
          />
          {prop.featured && (
            <div>
              <label className="mb-1 block text-xs uppercase tracking-wider text-muted-foreground">
                Ordine in home page (1 = primo)
              </label>
              <NumberInput
                value={prop.homepage_order}
                onChange={(v) => update({ homepage_order: v })}
                step={1}
                placeholder="Lascia vuoto per ordinare automaticamente"
              />
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            Compare in home solo se l'immobile è pubblicato. Massimo 6 immobili visibili.
            Se l'ordine è vuoto, vengono mostrati prima i più recenti.
          </p>
        </div>
      </Field>
    </Section>
  );
}

function LocationTab({ prop, update }: { prop: Property; update: (p: Partial<Property>) => void }) {
  return (
    <Section title="Localizzazione">
      <LocationFields
        value={{
          region: prop.region ?? "",
          province: prop.province ?? "",
          municipality: prop.municipality ?? "",
          locality: prop.locality ?? "",
          area_zone: prop.area_zone ?? "",
          postal_code: prop.postal_code ?? "",
          address: prop.address ?? "",
          show_full_address: prop.show_full_address ?? false,
        }}
        onChange={(patch) => update(patch as Partial<Property>)}
      />
    </Section>
  );
}

function FeaturesTab({
  prop,
  update,
  features,
  setFeatures,
}: {
  prop: Property;
  update: (p: Partial<Property>) => void;
  features: Record<string, string>;
  setFeatures: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}) {
  // Helpers — leggono i label salvati nei features; con fallback sui valori
  // numerici della tabella properties per gli annunci creati prima del refactor.
  const setF = (k: string, v: string) =>
    setFeatures((m) => ({ ...m, [k]: v }));

  const sizeRange = features.size_range ?? (prop.size_sqm != null ? SIZE_CUSTOM : "");
  const bedroomsLabel =
    features.bedrooms_label ?? (prop.bedrooms != null ? BEDROOMS_CUSTOM : "");
  const bathroomsLabel =
    features.bathrooms_label ?? (prop.bathrooms != null ? BATHROOMS_CUSTOM : "");
  const totalFloorsLabel =
    features.total_floors_label ?? "";
  const floorLabel = features.floor_label ?? "";
  const heating = features.heating ?? "";
  const furnishedLevel =
    features.furnished_level ?? (prop.furnished ? "Arredato" : "");

  return (
    <Section title="Caratteristiche immobile">
      <Field label="Superficie (mq)">
        <SelectStringInput
          value={sizeRange}
          onChange={(v) => {
            setF("size_range", v);
            if (v !== SIZE_CUSTOM) update({ size_sqm: null });
          }}
          options={[...SIZE_RANGE_OPTIONS, SIZE_CUSTOM]}
          placeholder="Seleziona superficie"
        />
        {sizeRange === SIZE_CUSTOM && (
          <div className="mt-2">
            <NumberInput value={prop.size_sqm} onChange={(v) => update({ size_sqm: v })} />
          </div>
        )}
      </Field>

      <Field label="Camere">
        <SelectStringInput
          value={bedroomsLabel}
          onChange={(v) => {
            setF("bedrooms_label", v);
            if (v === BEDROOMS_CUSTOM) return;
            update({ bedrooms: v ? BEDROOMS_TO_NUMBER[v] ?? null : null });
          }}
          options={[...BEDROOMS_OPTIONS, BEDROOMS_CUSTOM]}
          placeholder="Seleziona camere"
        />
        {bedroomsLabel === BEDROOMS_CUSTOM && (
          <div className="mt-2">
            <NumberInput value={prop.bedrooms} onChange={(v) => update({ bedrooms: v })} />
          </div>
        )}
      </Field>

      <Field label="Bagni">
        <SelectStringInput
          value={bathroomsLabel}
          onChange={(v) => {
            setF("bathrooms_label", v);
            if (v === BATHROOMS_CUSTOM) return;
            update({ bathrooms: v ? BATHROOMS_TO_NUMBER[v] ?? null : null });
          }}
          options={[...BATHROOMS_OPTIONS, BATHROOMS_CUSTOM]}
          placeholder="Seleziona bagni"
        />
        {bathroomsLabel === BATHROOMS_CUSTOM && (
          <div className="mt-2">
            <NumberInput value={prop.bathrooms} onChange={(v) => update({ bathrooms: v })} />
          </div>
        )}
      </Field>

      <Field label="Piano dell'immobile">
        <SelectStringInput
          value={floorLabel}
          onChange={(v) => {
            setF("floor_label", v);
            const n = v && v in FLOOR_TO_NUMBER ? FLOOR_TO_NUMBER[v] : null;
            update({ floors: n });
          }}
          options={[...FLOOR_OPTIONS]}
          placeholder="Seleziona piano"
        />
      </Field>

      <Field label="Totale piani edificio">
        <SelectStringInput
          value={totalFloorsLabel}
          onChange={(v) => setF("total_floors_label", v)}
          options={[...TOTAL_FLOORS_OPTIONS, TOTAL_FLOORS_CUSTOM]}
          placeholder="Seleziona piani edificio"
        />
        {totalFloorsLabel === TOTAL_FLOORS_CUSTOM && (
          <div className="mt-2">
            <TextInput
              value={features.total_floors_exact ?? ""}
              onChange={(v) => setF("total_floors_exact", v)}
              placeholder="Numero piani"
              type="number"
            />
          </div>
        )}
      </Field>

      <Field label="Stato manutenzione">
        <SelectInput
          value={prop.condition}
          onChange={(v) => update({ condition: v })}
          options={CONDITIONS}
          placeholder="Seleziona stato"
        />
      </Field>

      <Field label="Classe energetica">
        <SelectInput
          value={prop.energy_class}
          onChange={(v) => update({ energy_class: v })}
          options={ENERGY_CLASSES}
          placeholder="Seleziona classe"
        />
      </Field>

      <Field label="Indice prestazione energetica">
        <select
          value={prop.energy_performance_index_status ?? ""}
          onChange={(e) => {
            const v = e.target.value;
            update({
              energy_performance_index_status: v || null,
              ...(v !== "precise_value" ? { energy_performance_index_value: null } : {}),
            });
          }}
          className={inputCls}
        >
          <option value="">—</option>
          {EPI_STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        {prop.energy_performance_index_status === "precise_value" && (
          <EpiValueInput
            value={prop.energy_performance_index_value}
            onChange={(v) => update({ energy_performance_index_value: v })}
            className={inputCls}
          />
        )}
      </Field>

      <Field label="Riscaldamento">
        <SelectStringInput
          value={heating}
          onChange={(v) => setF("heating", v)}
          options={[...HEATING_OPTIONS]}
          placeholder="Seleziona riscaldamento"
        />
      </Field>

      <Field label="Arredato">
        <SelectStringInput
          value={furnishedLevel}
          onChange={(v) => {
            setF("furnished_level", v);
            update({ furnished: v ? FURNISHED_TO_BOOL[v] ?? false : false });
          }}
          options={[...FURNISHED_OPTIONS]}
          placeholder="Seleziona stato arredo"
        />
      </Field>
    </Section>
  );
}

/** Select non-nullable in stringa, con placeholder. */
function SelectStringInput({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options: readonly string[];
  placeholder?: string;
}) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className={inputCls}>
      <option value="">{placeholder ?? "—"}</option>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}

function EpiValueInput({
  value,
  onChange,
  className,
}: {
  value: number | null;
  onChange: (v: number | null) => void;
  className: string;
}) {
  const [text, setText] = useState<string>(
    value == null ? "" : String(value).replace(".", ","),
  );
  // Sync when external value changes (e.g. initial load) but not while user types
  useEffect(() => {
    const parsed = text.trim() === "" ? null : Number(text.replace(",", "."));
    if (parsed !== value && !(Number.isNaN(parsed as number) && value == null)) {
      // Only resync if the parsed local value differs meaningfully from prop
      if (value == null) {
        setText("");
      } else if (Number.isFinite(parsed as number) && parsed !== value) {
        setText(String(value).replace(".", ","));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  return (
    <div className="mt-2 flex items-center gap-2">
      <input
        type="text"
        inputMode="decimal"
        value={text}
        onChange={(e) => {
          const raw = e.target.value;
          // Allow digits, one comma or dot, up to 2 decimals
          if (raw !== "" && !/^\d*(?:[.,]\d{0,2})?$/.test(raw)) return;
          setText(raw);
          if (raw.trim() === "") {
            onChange(null);
            return;
          }
          const normalized = raw.replace(",", ".");
          // Don't commit partial values like "135." — wait for next char
          if (normalized.endsWith(".")) return;
          const n = Number(normalized);
          onChange(Number.isFinite(n) ? n : null);
        }}
        onBlur={() => {
          if (text.trim() === "") return;
          const n = Number(text.replace(",", "."));
          if (Number.isFinite(n)) {
            onChange(n);
            setText(String(n).replace(".", ","));
          }
        }}
        placeholder="Es. 135,42"
        className={className}
      />
      <span className="shrink-0 text-xs uppercase tracking-wider text-muted-foreground">
        kWh/m² anno
      </span>
    </div>
  );
}

function AmenitiesTab({
  prop,
  update,
  features,
  setFeatures,
}: {
  prop: Property;
  update: (p: Partial<Property>) => void;
  features: Record<string, string>;
  setFeatures: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}) {
  // Una dotazione è selezionata se esiste il feature `amenity:<label>` oppure,
  // per retrocompat, se la colonna boolean corrispondente su `properties` è true.
  const isOn = (label: string): boolean => {
    if (features[AMENITY_FEATURE_PREFIX + label]) return true;
    const col = AMENITY_TO_COLUMN[label];
    if (col && (prop as unknown as Record<string, unknown>)[col] === true) return true;
    return false;
  };

  const toggle = (label: string, on: boolean) => {
    setFeatures((m) => {
      const next = { ...m };
      const key = AMENITY_FEATURE_PREFIX + label;
      if (on) next[key] = label;
      else delete next[key];
      return next;
    });
    const col = AMENITY_TO_COLUMN[label];
    if (col) update({ [col]: on } as Partial<Property>);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-sm border border-border bg-card p-6">
        <h3 className="font-serif text-lg text-ink">Dotazioni</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Seleziona tutte le dotazioni presenti. Tap per attivare/disattivare.
        </p>
        <div className="mt-6 space-y-6">
          {AMENITY_GROUPS.map((group) => (
            <div key={group.title}>
              <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-ink/70">
                {group.title}
              </div>
              <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                {group.items.map((label) => (
                  <Toggle
                    key={label}
                    label={label}
                    value={isOn(label)}
                    onChange={(v) => toggle(label, v)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-sm border border-border bg-card p-6">
        <label className="block">
          <span className="block text-xs uppercase tracking-wider text-muted-foreground">
            Altre dotazioni
          </span>
          <textarea
            value={features.altre_dotazioni ?? ""}
            onChange={(e) =>
              setFeatures((m) => ({ ...m, altre_dotazioni: e.target.value }))
            }
            rows={3}
            placeholder="Scrivi eventuali dotazioni particolari non presenti nell'elenco…"
            className={`${inputCls} mt-1`}
          />
        </label>
      </div>
    </div>
  );
}

function NarrativeTab({
  prop,
  update,
  features,
  setFeatures,
}: {
  prop: Property;
  update: (patch: Partial<Property>) => void;
  features: Record<string, string>;
  setFeatures: (v: Record<string, string>) => void;
}) {
  const selected = new Set(prop.commercial_highlights ?? []);
  const toggleHighlight = (label: string) => {
    const next = new Set(selected);
    if (next.has(label)) next.delete(label);
    else next.add(label);
    update({ commercial_highlights: Array.from(next) });
  };
  return (
    <div className="space-y-6">
      <div className="rounded-sm border border-border bg-card p-6">
        <h3 className="font-serif text-lg text-ink">Valorizzazione commerciale</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Seleziona le etichette editoriali che meglio rappresentano il valore di questo
          immobile. Compariranno come badge eleganti nella scheda e nella pagina dettaglio,
          e verranno integrate con naturalezza nella descrizione AI.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {COMMERCIAL_HIGHLIGHTS.map((h) => {
            const on = selected.has(h.label);
            return (
              <button
                key={h.label}
                type="button"
                onClick={() => toggleHighlight(h.label)}
                className={`rounded-full border px-3.5 py-1.5 text-xs tracking-wide transition ${
                  on
                    ? "border-primary/60 bg-primary/10 text-ink shadow-sm"
                    : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-ink"
                }`}
                aria-pressed={on}
              >
                {h.label}
              </button>
            );
          })}
        </div>
      </div>

    <div className="rounded-sm border border-border bg-card p-6">
      <h3 className="font-serif text-lg text-ink">Parametri narrativi / commerciali</h3>
      <p className="mt-1 text-xs text-muted-foreground">
        Seleziona le voci che meglio descrivono l'immobile. Le selezioni saranno mostrate
        come badge eleganti nella scheda pubblica.
      </p>
      <div className="mt-6 grid gap-5 md:grid-cols-2">
        {MULTI_SELECT_FIELDS.map((ms) => {
          const val = parseMultiSelect(features[ms.key]) || EMPTY_MULTI;
          return (
            <MultiSelectChips
              key={ms.key}
              label={ms.label}
              placeholder={ms.placeholder}
              options={ms.options}
              value={val}
              onChange={(v) =>
                setFeatures({ ...features, [ms.key]: serializeMultiSelect(v) })
              }
            />
          );
        })}
      </div>
    </div>
    </div>
  );
}

function DescriptionTab({
  desc,
  setDesc,
  generating,
  onGenerate,
  onSaveEdit,
  length,
  setLength,
  tone,
  setTone,
  seoFocus,
  setSeoFocus,
}: {
  desc: Description | null;
  setDesc: (d: Description | null) => void;
  generating: boolean;
  onGenerate: () => void;
  onSaveEdit: () => void;
  length: "breve" | "media" | "editoriale";
  setLength: (v: "breve" | "media" | "editoriale") => void;
  tone: "neutro" | "emozionale" | "commerciale";
  setTone: (v: "neutro" | "emozionale" | "commerciale") => void;
  seoFocus: string;
  setSeoFocus: (v: string) => void;
}) {
  const hasGenerated = !!desc?.generated_description;
  const edited = desc?.edited_description ?? desc?.generated_description ?? "";
  const wordCount = useMemo(() => (edited.trim() ? edited.trim().split(/\s+/).length : 0), [edited]);

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      {/* Controls */}
      <div className="lg:col-span-4">
        <div className="sticky top-24 space-y-5 rounded-sm border border-border bg-card p-6">
          <div>
            <h3 className="font-serif text-lg text-ink">Genera descrizione</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Furia AI genera una bozza basata sui dati inseriti e sui parametri narrativi.
            </p>
          </div>

          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Lunghezza</div>
            <div className="mt-2 space-y-1.5">
              {LENGTH_OPTIONS.map((o) => (
                <RadioRow
                  key={o.value}
                  active={length === o.value}
                  onClick={() => setLength(o.value)}
                  label={o.label}
                  hint={o.hint}
                />
              ))}
            </div>
          </div>

          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Tono di voce</div>
            <div className="mt-2 space-y-1.5">
              {TONE_OPTIONS.map((o) => (
                <RadioRow
                  key={o.value}
                  active={tone === o.value}
                  onClick={() => setTone(o.value)}
                  label={o.label}
                  hint={o.hint}
                />
              ))}
            </div>
          </div>

          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">SEO focus (opzionale)</div>
            <input
              value={seoFocus}
              onChange={(e) => setSeoFocus(e.target.value)}
              placeholder="Es. casale panoramico Lunigiana"
              className={`${inputCls} mt-1`}
            />
          </div>

          <button
            onClick={onGenerate}
            disabled={generating}
            className="inline-flex w-full items-center justify-center gap-2 rounded-sm bg-primary px-4 py-3 text-xs uppercase tracking-[0.18em] text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {generating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            {generating ? "Generazione in corso..." : hasGenerated ? "Rigenera descrizione" : "Genera descrizione"}
          </button>

          {desc?.generated_at && (
            <p className="text-xs text-muted-foreground">
              Ultima generazione: {new Date(desc.generated_at).toLocaleString("it-IT")}
            </p>
          )}
        </div>
      </div>

      {/* Editor */}
      <div className="lg:col-span-8">
        <div className="rounded-sm border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 font-serif text-lg text-ink">
              <FileText size={16} /> Descrizione finale
            </h3>
            <span className="text-xs text-muted-foreground">{wordCount} parole</span>
          </div>

          {!hasGenerated && !edited && (
            <p className="mt-6 rounded-sm border border-dashed border-border bg-muted/30 px-4 py-8 text-center text-sm text-muted-foreground">
              Nessuna descrizione ancora. Compila i dati dell'immobile e i parametri narrativi, poi
              clicca <strong>Genera descrizione</strong> qui a sinistra.
            </p>
          )}

          {(hasGenerated || edited) && (
            <>
              <textarea
                value={edited}
                onChange={(e) =>
                  setDesc({
                    ...(desc ?? {
                      generated_description: null,
                      tone_of_voice: null,
                      length_preference: null,
                      seo_focus: null,
                      generated_at: null,
                      edited_description: null,
                    }),
                    edited_description: e.target.value,
                  })
                }
                rows={20}
                className="mt-4 w-full whitespace-pre-line rounded-sm border border-border bg-background p-4 font-serif text-base leading-relaxed text-ink focus:border-primary focus:outline-none"
              />
              <div className="mt-4 flex justify-end">
                <button
                  onClick={onSaveEdit}
                  className="inline-flex items-center gap-2 rounded-sm bg-ink px-4 py-2 text-xs uppercase tracking-wider text-cream hover:bg-ink/90"
                >
                  <Save size={13} /> Salva descrizione
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function RadioRow({
  active,
  onClick,
  label,
  hint,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  hint: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-start gap-3 rounded-sm border px-3 py-2 text-left transition ${
        active
          ? "border-primary bg-primary/5"
          : "border-border bg-card hover:border-primary/40"
      }`}
    >
      <span
        className={`mt-1 h-3 w-3 shrink-0 rounded-full border-2 ${
          active ? "border-primary bg-primary" : "border-muted-foreground/40"
        }`}
      />
      <span className="flex-1">
        <span className="block text-sm text-ink">{label}</span>
        <span className="block text-[11px] text-muted-foreground">{hint}</span>
      </span>
    </button>
  );
}
