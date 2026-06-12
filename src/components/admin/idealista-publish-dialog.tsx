import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, X, AlertTriangle, Send, CheckCircle2, ExternalLink } from "lucide-react";

type AnyProp = Record<string, any>;

type ImageRow = {
  id: string;
  image_url: string;
  rendered_image_url: string | null;
  enhanced_image_url: string | null;
  is_cover: boolean;
  sort_order: number;
  use_rendered: boolean;
  use_enhanced: boolean;
  render_status: string;
  enhancement_status: string;
};

const IDEALISTA_STATUS_LABELS: Record<string, string> = {
  not_published: "Non pubblicato",
  to_publish: "Da pubblicare",
  published: "Pubblicato",
  error: "Errore pubblicazione",
  to_update: "Da aggiornare",
  removed: "Rimosso da Idealista",
};

const IDEALISTA_STATUS_CLASSES: Record<string, string> = {
  not_published: "bg-zinc-100 text-zinc-800 border-zinc-200",
  to_publish: "bg-amber-100 text-amber-900 border-amber-200",
  published: "bg-emerald-100 text-emerald-900 border-emerald-200",
  error: "bg-red-100 text-red-900 border-red-200",
  to_update: "bg-blue-100 text-blue-900 border-blue-200",
  removed: "bg-zinc-200 text-zinc-700 border-zinc-300",
};

const PROPERTY_TYPE_MAP: Record<string, string> = {
  appartamento: "flat",
  attico: "penthouse",
  villa: "chalet",
  villetta: "chalet",
  casa_indipendente: "house",
  rustico: "countryHouse",
  casale: "countryHouse",
  terreno: "land",
  locale_commerciale: "premise",
  ufficio: "office",
  garage: "garage",
};

const CONTRACT_TYPE_MAP: Record<string, string> = {
  vendita: "sale",
  affitto: "rent",
  affitto_breve: "rent",
};

function fmtCurrency(n: number | null | undefined) {
  if (n == null) return "—";
  return new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
}

export function IdealistaPublishDialog({
  property,
  description,
  open,
  onClose,
  onPublished,
}: {
  property: AnyProp | null;
  description?: { generated_description: string | null; edited_description: string | null } | null;
  open: boolean;
  onClose: () => void;
  onPublished?: () => void;
}) {
  const [images, setImages] = useState<ImageRow[]>([]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [includeRenders, setIncludeRenders] = useState(false);
  const [overrides, setOverrides] = useState<{ title?: string; description?: string; price?: string }>({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open || !property?.id) return;
    setOverrides({});
    (async () => {
      const { data } = await supabase
        .from("property_images")
        .select(
          "id, image_url, rendered_image_url, enhanced_image_url, is_cover, sort_order, use_rendered, use_enhanced, render_status, enhancement_status",
        )
        .eq("property_id", property.id)
        .order("sort_order", { ascending: true });
      const rows = (data ?? []) as ImageRow[];
      setImages(rows);
      const init: Record<string, boolean> = {};
      for (const r of rows) {
        const isRender = r.render_status === "completed" && !!r.rendered_image_url;
        // di default: tutte le foto, ma escludi rendering AI
        init[r.id] = !isRender;
      }
      setSelected(init);
    })();
  }, [open, property?.id]);

  const effectiveDescription = useMemo(() => {
    if (overrides.description != null) return overrides.description;
    return description?.edited_description || description?.generated_description || property?.short_notes || "";
  }, [overrides.description, description, property]);

  const effectiveTitle = overrides.title ?? (property?.title || "");
  const effectivePrice = overrides.price != null ? Number(overrides.price) : (property?.price as number | null);

  const missing = useMemo(() => {
    const m: string[] = [];
    if (!effectiveTitle?.trim()) m.push("Titolo");
    if (!effectiveDescription?.trim() || effectiveDescription.trim().length < 40)
      m.push("Descrizione (min. 40 caratteri)");
    if (!effectivePrice && !property?.price_on_request) m.push("Prezzo");
    if (!property?.contract_type) m.push("Vendita / Affitto");
    if (!property?.property_type) m.push("Tipologia immobile");
    if (!property?.municipality) m.push("Comune");
    if (!property?.province) m.push("Provincia");
    if (!property?.size_sqm) m.push("Metratura (mq)");
    if (property?.bedrooms == null) m.push("Numero camere");
    if (property?.bathrooms == null) m.push("Numero bagni");
    if (!property?.energy_class) m.push("Classe energetica");
    return m;
  }, [effectiveTitle, effectiveDescription, effectivePrice, property]);

  const selectedImages = images.filter((i) => selected[i.id]);

  const buildPayload = () => {
    const photos = selectedImages.map((img, idx) => {
      const isRender = img.render_status === "completed" && !!img.rendered_image_url;
      const url = isRender && img.rendered_image_url ? img.rendered_image_url : img.image_url;
      return { id: img.id, url, order: idx, is_rendering: isRender, is_cover: img.is_cover };
    });
    return {
      reference_code: property?.reference_code ?? null,
      title: effectiveTitle,
      description: effectiveDescription,
      price: property?.price_on_request ? null : effectivePrice,
      price_on_request: !!property?.price_on_request,
      operation: CONTRACT_TYPE_MAP[property?.contract_type ?? ""] ?? property?.contract_type ?? null,
      property_type: PROPERTY_TYPE_MAP[property?.property_type ?? ""] ?? property?.property_type ?? null,
      municipality: property?.municipality ?? null,
      zone: property?.area_zone ?? property?.locality ?? null,
      province: property?.province ?? null,
      country: property?.country ?? "Italia",
      size_sqm: property?.size_sqm ?? null,
      bedrooms: property?.bedrooms ?? null,
      bathrooms: property?.bathrooms ?? null,
      floor: property?.floors ?? null,
      energy_class: property?.energy_class ?? null,
      energy_performance_index_status: property?.energy_performance_index_status ?? null,
      energy_performance_index_value: property?.energy_performance_index_value ?? null,
      features: {
        panoramic_view: !!property?.panoramic_view,
        historic_property: !!property?.historic_property,
        garden: !!property?.garden,
        terrace: !!property?.terrace,
        balcony: !!property?.balcony,
        garage: !!property?.garage,
        cellar: !!property?.cellar,
        elevator: !!property?.elevator,
        furnished: !!property?.furnished,
      },
      photos,
    };
  };

  const confirmPublish = async () => {
    if (!property?.id) return;
    if (missing.length > 0) {
      toast.error("Mancano campi obbligatori per Idealista");
      return;
    }
    setBusy(true);
    const payload = buildPayload();
    const imageIds = selectedImages.map((i) => i.id);
    const { error: logErr } = await supabase.from("idealista_publish_logs").insert({
      property_id: property.id,
      payload,
      image_ids: imageIds,
      outcome: "queued",
    });
    if (logErr) {
      toast.error("Errore salvataggio log: " + logErr.message);
      setBusy(false);
      return;
    }
    const { error: upErr } = await supabase
      .from("properties")
      .update({
        idealista_status: "to_publish",
        idealista_last_sync_at: new Date().toISOString(),
        idealista_last_error: null,
      })
      .eq("id", property.id);
    setBusy(false);
    if (upErr) {
      toast.error("Errore aggiornamento stato: " + upErr.message);
      return;
    }
    toast.success("Annuncio inviato a Idealista (in coda di pubblicazione)");
    onPublished?.();
    onClose();
  };

  if (!open || !property) return null;

  const currentStatus = (property.idealista_status as string) || "not_published";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true">
      <div className="relative flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-lg border border-border bg-background shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <div>
            <h2 className="text-base font-semibold tracking-wide uppercase">Pubblica su Idealista</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Riepilogo automatico dai dati dell'annuncio · Cod. {property.reference_code || "—"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`rounded-sm border px-2 py-0.5 text-[10px] uppercase tracking-wider ${
                IDEALISTA_STATUS_CLASSES[currentStatus] ?? IDEALISTA_STATUS_CLASSES.not_published
              }`}
            >
              {IDEALISTA_STATUS_LABELS[currentStatus] ?? currentStatus}
            </span>
            <button onClick={onClose} className="rounded-sm p-1 hover:bg-muted" aria-label="Chiudi">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 space-y-5 overflow-auto px-5 py-4">
          {/* Missing fields alert */}
          {missing.length > 0 && (
            <div className="flex gap-3 rounded-sm border border-amber-300 bg-amber-50 p-3 text-amber-900">
              <AlertTriangle size={18} className="mt-0.5 shrink-0" />
              <div className="text-sm">
                <p className="font-semibold">Campi mancanti per Idealista</p>
                <ul className="mt-1 list-disc pl-5 text-xs">
                  {missing.map((m) => (
                    <li key={m}>{m}</li>
                  ))}
                </ul>
                <p className="mt-2 text-xs">
                  Aggiorna i dati dall'annuncio prima di confermare la pubblicazione.
                </p>
              </div>
            </div>
          )}

          {/* Recap grid */}
          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Dati principali</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field
                label="Titolo"
                value={effectiveTitle}
                onChange={(v) => setOverrides((o) => ({ ...o, title: v }))}
                missing={!effectiveTitle?.trim()}
              />
              <Field
                label="Prezzo (€)"
                type="number"
                value={effectivePrice != null ? String(effectivePrice) : ""}
                onChange={(v) => setOverrides((o) => ({ ...o, price: v }))}
                missing={!effectivePrice && !property.price_on_request}
                hint={property.price_on_request ? "Prezzo su richiesta" : fmtCurrency(effectivePrice ?? null)}
              />
              <ReadOnly label="Operazione" value={property.contract_type || "—"} missing={!property.contract_type} />
              <ReadOnly label="Tipologia" value={property.property_type || "—"} missing={!property.property_type} />
              <ReadOnly label="Comune" value={property.municipality || "—"} missing={!property.municipality} />
              <ReadOnly label="Provincia" value={property.province || "—"} missing={!property.province} />
              <ReadOnly label="Zona / Località" value={property.area_zone || property.locality || "—"} />
              <ReadOnly label="Codice annuncio" value={property.reference_code || "—"} />
            </div>
          </section>

          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Caratteristiche</h3>
            <div className="grid gap-3 sm:grid-cols-3">
              <ReadOnly label="Superficie (mq)" value={property.size_sqm ?? "—"} missing={!property.size_sqm} />
              <ReadOnly label="Camere" value={property.bedrooms ?? "—"} missing={property.bedrooms == null} />
              <ReadOnly label="Bagni" value={property.bathrooms ?? "—"} missing={property.bathrooms == null} />
              <ReadOnly label="Piani" value={property.floors ?? "—"} />
              <ReadOnly label="Classe energetica" value={property.energy_class || "—"} missing={!property.energy_class} />
              <ReadOnly
                label="IPE / EPI"
                value={
                  property.energy_performance_index_value != null
                    ? `${property.energy_performance_index_value} kWh/m²`
                    : property.energy_performance_index_status || "—"
                }
              />
            </div>
          </section>

          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Dotazioni</h3>
            <div className="flex flex-wrap gap-1.5">
              {[
                ["panoramic_view", "Vista panoramica"],
                ["historic_property", "Storico"],
                ["garden", "Giardino"],
                ["terrace", "Terrazzo"],
                ["balcony", "Balcone"],
                ["garage", "Garage"],
                ["cellar", "Cantina"],
                ["elevator", "Ascensore"],
                ["furnished", "Arredato"],
              ]
                .filter(([k]) => property[k as string])
                .map(([k, label]) => (
                  <span key={k} className="rounded-sm border border-border bg-muted/40 px-2 py-0.5 text-[11px]">
                    {label}
                  </span>
                ))}
              {![
                "panoramic_view",
                "historic_property",
                "garden",
                "terrace",
                "balcony",
                "garage",
                "cellar",
                "elevator",
                "furnished",
              ].some((k) => property[k]) && (
                <span className="text-xs text-muted-foreground">Nessuna dotazione segnalata</span>
              )}
            </div>
          </section>

          {/* Description override */}
          <section>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Descrizione</h3>
              <span className="text-[10px] text-muted-foreground">
                Modifiche solo per l'invio, l'annuncio non viene toccato
              </span>
            </div>
            <textarea
              value={effectiveDescription}
              onChange={(e) => setOverrides((o) => ({ ...o, description: e.target.value }))}
              rows={5}
              className={`w-full rounded-sm border bg-background p-2 text-sm ${
                !effectiveDescription?.trim() || effectiveDescription.trim().length < 40
                  ? "border-amber-400"
                  : "border-border"
              }`}
            />
          </section>

          {/* Photos */}
          <section>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Foto da inviare ({selectedImages.length}/{images.length})
              </h3>
              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                <input
                  type="checkbox"
                  checked={includeRenders}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setIncludeRenders(checked);
                    setSelected((prev) => {
                      const next = { ...prev };
                      for (const img of images) {
                        const isRender = img.render_status === "completed" && !!img.rendered_image_url;
                        if (isRender) next[img.id] = checked;
                      }
                      return next;
                    });
                  }}
                />
                Includi rendering AI
              </label>
            </div>
            {images.length === 0 ? (
              <p className="text-xs text-muted-foreground">Nessuna foto disponibile per questo immobile.</p>
            ) : (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-5">
                {images.map((img) => {
                  const isRender = img.render_status === "completed" && !!img.rendered_image_url;
                  const url = isRender && img.rendered_image_url ? img.rendered_image_url : img.image_url;
                  const checked = !!selected[img.id];
                  return (
                    <button
                      type="button"
                      key={img.id}
                      onClick={() => setSelected((s) => ({ ...s, [img.id]: !s[img.id] }))}
                      className={`relative overflow-hidden rounded-sm border-2 ${
                        checked ? "border-primary" : "border-transparent opacity-60"
                      }`}
                    >
                      <img src={url} alt="" className="aspect-[4/3] w-full object-cover" />
                      {isRender && (
                        <span className="absolute left-1 top-1 rounded-sm bg-black/70 px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-white">
                          Rendering AI
                        </span>
                      )}
                      {img.is_cover && (
                        <span className="absolute right-1 top-1 rounded-sm bg-primary/90 px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-primary-foreground">
                          Cover
                        </span>
                      )}
                      {checked && (
                        <span className="absolute bottom-1 right-1 rounded-full bg-primary p-0.5 text-primary-foreground">
                          <CheckCircle2 size={14} />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          {/* Idealista metadata */}
          {(property.idealista_external_id || property.idealista_url || property.idealista_last_sync_at) && (
            <section className="rounded-sm border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
              {property.idealista_external_id && (
                <div>ID Idealista: <span className="text-ink">{property.idealista_external_id}</span></div>
              )}
              {property.idealista_url && (
                <div className="mt-1">
                  <a
                    href={property.idealista_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-primary hover:underline"
                  >
                    Apri su Idealista <ExternalLink size={11} />
                  </a>
                </div>
              )}
              {property.idealista_last_sync_at && (
                <div className="mt-1">
                  Ultima sincronizzazione: {new Date(property.idealista_last_sync_at).toLocaleString("it-IT")}
                </div>
              )}
              {property.idealista_last_error && (
                <div className="mt-1 text-red-700">Ultimo errore: {property.idealista_last_error}</div>
              )}
            </section>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 border-t border-border px-5 py-3">
          <p className="text-xs text-muted-foreground">
            {missing.length > 0
              ? `${missing.length} campi mancanti — completa l'annuncio prima dell'invio.`
              : `${selectedImages.length} foto verranno inviate.`}
          </p>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="rounded-sm border border-border bg-background px-4 py-2 text-xs uppercase tracking-wider hover:border-primary/50"
            >
              Annulla
            </button>
            <button
              onClick={confirmPublish}
              disabled={busy || missing.length > 0 || selectedImages.length === 0}
              className="inline-flex items-center gap-2 rounded-sm bg-primary px-4 py-2 text-xs uppercase tracking-wider text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              {busy ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
              Conferma pubblicazione
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  missing,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  missing?: boolean;
  hint?: string;
}) {
  return (
    <label className="block text-xs">
      <span className="mb-1 flex items-center justify-between text-muted-foreground">
        <span>{label}</span>
        {missing && <span className="text-[10px] text-amber-700">Mancante</span>}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full rounded-sm border bg-background px-2 py-1.5 text-sm ${
          missing ? "border-amber-400" : "border-border"
        }`}
      />
      {hint && <span className="mt-0.5 block text-[10px] text-muted-foreground">{hint}</span>}
    </label>
  );
}

function ReadOnly({ label, value, missing }: { label: string; value: any; missing?: boolean }) {
  return (
    <div className="text-xs">
      <div className="mb-1 flex items-center justify-between text-muted-foreground">
        <span>{label}</span>
        {missing && <span className="text-[10px] text-amber-700">Mancante</span>}
      </div>
      <div
        className={`rounded-sm border bg-muted/30 px-2 py-1.5 text-sm ${
          missing ? "border-amber-400" : "border-border"
        }`}
      >
        {value}
      </div>
    </div>
  );
}