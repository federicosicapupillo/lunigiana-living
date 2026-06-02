import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  ArrowLeft,
  Save,
  Sparkles,
  Loader2,
  CheckCircle2,
  Trash2,
  Globe2,
  FileText,
} from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { generateDescription } from "@/lib/ai-description.functions";
import { ImageUploader } from "@/components/admin/image-uploader";
import { LocationFields } from "@/components/admin/location-fields";
import {
  PROPERTY_TYPES,
  CONTRACT_TYPES,
  ENERGY_CLASSES,
  CONDITIONS,
  STATUS_LABELS,
  NARRATIVE_FIELDS,
  LENGTH_OPTIONS,
  TONE_OPTIONS,
} from "@/lib/admin/property-constants";

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
  status: "draft" | "ready" | "published";
};

type Description = {
  generated_description: string | null;
  edited_description: string | null;
  tone_of_voice: string | null;
  length_preference: string | null;
  seo_focus: string | null;
  generated_at: string | null;
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

  // Description controls
  const [genLength, setGenLength] = useState<"breve" | "media" | "editoriale">("media");
  const [genTone, setGenTone] = useState<"neutro" | "emozionale" | "commerciale">("emozionale");
  const [seoFocus, setSeoFocus] = useState("");

  const genDescFn = useServerFn(generateDescription);

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

  const save = async (silent = false) => {
    if (!prop) return;
    setSaving(true);
    const slug = prop.slug?.trim() || slugify(prop.title || "immobile");
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

  const changeStatus = async (status: Property["status"]) => {
    if (!prop) return;
    update({ status });
    const { error } = await supabase.from("properties").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(`Stato aggiornato: ${STATUS_LABELS[status]}`);
  };

  const deleteProperty = async () => {
    if (!confirm("Eliminare definitivamente questo immobile e tutte le sue foto?")) return;
    const { error } = await supabase.from("properties").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Immobile eliminato");
    navigate({ to: "/admin/immobili" });
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
    <div className="mx-auto max-w-7xl px-6 py-8">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-6">
        <div className="min-w-0 flex-1">
          <Link
            to="/admin/immobili"
            className="inline-flex items-center gap-1 text-xs uppercase tracking-wider text-muted-foreground hover:text-ink"
          >
            <ArrowLeft size={12} /> Torna all'elenco
          </Link>
          <input
            value={prop.title}
            onChange={(e) => update({ title: e.target.value })}
            className="mt-3 w-full bg-transparent font-serif text-3xl text-ink focus:outline-none"
          />
          <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
            <span>{STATUS_LABELS[prop.status]}</span>
            <span>·</span>
            <span>{prop.reference_code || "Nessun codice"}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => save()}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-sm border border-border bg-background px-4 py-2 text-xs uppercase tracking-wider hover:border-primary/50 disabled:opacity-50"
          >
            {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
            Salva bozza
          </button>
          <button
            onClick={() => changeStatus("ready")}
            disabled={prop.status === "ready"}
            className="inline-flex items-center gap-2 rounded-sm border border-blue-300 bg-blue-50 px-4 py-2 text-xs uppercase tracking-wider text-blue-900 hover:bg-blue-100 disabled:opacity-50"
          >
            <CheckCircle2 size={13} /> Segna come pronto
          </button>
          <button
            onClick={() => changeStatus("published")}
            disabled={prop.status === "published"}
            className="inline-flex items-center gap-2 rounded-sm bg-emerald-700 px-4 py-2 text-xs uppercase tracking-wider text-white hover:bg-emerald-800 disabled:opacity-50"
          >
            <Globe2 size={13} /> Pubblica
          </button>
          <button
            onClick={deleteProperty}
            className="inline-flex items-center gap-2 rounded-sm border border-destructive/30 px-3 py-2 text-xs uppercase tracking-wider text-destructive hover:bg-destructive/10"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex flex-wrap gap-1 border-b border-border">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`-mb-px border-b-2 px-4 py-2.5 text-sm transition ${
              tab === t.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-ink"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {tab === "main" && <MainTab prop={prop} update={update} features={features} setFeatures={setFeatures} />}
        {tab === "location" && <LocationTab prop={prop} update={update} />}
        {tab === "features" && <FeaturesTab prop={prop} update={update} />}
        {tab === "amenities" && <AmenitiesTab prop={prop} update={update} />}
        {tab === "photos" && <ImageUploader propertyId={id} />}
        {tab === "narrative" && <NarrativeTab features={features} setFeatures={setFeatures} />}
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
    </div>
  );
}

/* ---------- Re-usable inputs ---------- */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-sm border border-border bg-card p-6">
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
  "w-full rounded-sm border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none";

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
}: {
  value: number | null;
  onChange: (v: number | null) => void;
  step?: number;
}) {
  return (
    <input
      type="number"
      step={step}
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
      className={inputCls}
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
      className={`flex items-center justify-between rounded-sm border px-4 py-2.5 text-sm transition ${
        value
          ? "border-primary bg-primary/5 text-ink"
          : "border-border bg-card text-muted-foreground hover:border-primary/40"
      }`}
    >
      <span>{label}</span>
      <span
        className={`ml-3 h-2.5 w-2.5 rounded-full ${value ? "bg-primary" : "bg-muted-foreground/30"}`}
      />
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
      <Field label="Slug URL">
        <TextInput value={prop.slug} onChange={(v) => update({ slug: v })} placeholder="auto da titolo se vuoto" />
      </Field>
      <Field label="Codice riferimento">
        <TextInput
          value={prop.reference_code}
          onChange={(v) => update({ reference_code: v })}
          placeholder="Es. RIF-2026-014"
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
      <Field label="Prezzo (€)">
        <NumberInput value={prop.price} onChange={(v) => update({ price: v })} step={1000} />
      </Field>
      <Field label="Prezzo">
        <Toggle
          label="Prezzo su richiesta"
          value={prop.price_on_request}
          onChange={(v) => update({ price_on_request: v })}
        />
      </Field>
      <Field label="Note brevi (catenaccio)" full>
        <textarea
          value={prop.short_notes ?? ""}
          onChange={(e) => update({ short_notes: e.target.value })}
          rows={2}
          placeholder="Frase di lancio breve, visibile nell'elenco"
          className={inputCls}
        />
      </Field>
      <Field label="Note interne (non pubblicate)" full>
        <textarea
          value={prop.internal_notes ?? ""}
          onChange={(e) => update({ internal_notes: e.target.value })}
          rows={3}
          placeholder="Promemoria per lo staff, condizioni, contatti..."
          className={inputCls}
        />
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

function FeaturesTab({ prop, update }: { prop: Property; update: (p: Partial<Property>) => void }) {
  return (
    <Section title="Caratteristiche immobile">
      <Field label="Superficie (m²)">
        <NumberInput value={prop.size_sqm} onChange={(v) => update({ size_sqm: v })} />
      </Field>
      <Field label="Camere da letto">
        <NumberInput value={prop.bedrooms} onChange={(v) => update({ bedrooms: v })} />
      </Field>
      <Field label="Bagni">
        <NumberInput value={prop.bathrooms} onChange={(v) => update({ bathrooms: v })} />
      </Field>
      <Field label="Piani">
        <NumberInput value={prop.floors} onChange={(v) => update({ floors: v })} />
      </Field>
      <Field label="Classe energetica">
        <SelectInput
          value={prop.energy_class}
          onChange={(v) => update({ energy_class: v })}
          options={ENERGY_CLASSES}
        />
      </Field>
      <Field label="Stato dell'immobile">
        <SelectInput
          value={prop.condition}
          onChange={(v) => update({ condition: v })}
          options={CONDITIONS}
        />
      </Field>
    </Section>
  );
}

function AmenitiesTab({ prop, update }: { prop: Property; update: (p: Partial<Property>) => void }) {
  const items: Array<{ key: keyof Property; label: string }> = [
    { key: "panoramic_view", label: "Vista panoramica" },
    { key: "historic_property", label: "Immobile storico" },
    { key: "garden", label: "Giardino" },
    { key: "terrace", label: "Terrazzo" },
    { key: "balcony", label: "Balcone" },
    { key: "garage", label: "Garage" },
    { key: "cellar", label: "Cantina" },
    { key: "elevator", label: "Ascensore" },
    { key: "furnished", label: "Arredato" },
  ];
  return (
    <div className="rounded-sm border border-border bg-card p-6">
      <h3 className="font-serif text-lg text-ink">Dotazioni</h3>
      <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3">
        {items.map((i) => (
          <Toggle
            key={i.key as string}
            label={i.label}
            value={prop[i.key] as boolean}
            onChange={(v) => update({ [i.key]: v } as Partial<Property>)}
          />
        ))}
      </div>
    </div>
  );
}

function NarrativeTab({
  features,
  setFeatures,
}: {
  features: Record<string, string>;
  setFeatures: (v: Record<string, string>) => void;
}) {
  return (
    <div className="rounded-sm border border-border bg-card p-6">
      <h3 className="font-serif text-lg text-ink">Parametri narrativi / commerciali</h3>
      <p className="mt-1 text-xs text-muted-foreground">
        Queste indicazioni guidano la generazione automatica della descrizione. Non vengono mai
        pubblicate direttamente, ma orientano lo stile, i contenuti e il tono.
      </p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {NARRATIVE_FIELDS.map((f) => (
          <label key={f.key} className="block">
            <span className="block text-xs uppercase tracking-wider text-muted-foreground">
              {f.label}
            </span>
            <textarea
              value={features[f.key] ?? ""}
              onChange={(e) => setFeatures({ ...features, [f.key]: e.target.value })}
              placeholder={f.placeholder}
              rows={2}
              className={`${inputCls} mt-1 min-h-[64px]`}
            />
          </label>
        ))}
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