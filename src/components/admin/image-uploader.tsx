import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  ImagePlus,
  Star,
  StarOff,
  Trash2,
  ArrowUp,
  ArrowDown,
  Loader2,
  Sparkles,
  Check,
  CloudDownload,
  Wand2,
  Download,
  Zap,
  Heart,
  Undo2,
  X,
} from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import {
  renderPropertyImage,
  syncImportedImage,
  forceSyncPhotosBatch,
  setRenderPublishMode,
  discardRender,
} from "@/lib/property-render.functions";
import {
  enhancePropertyImage,
  setPropertyImageEnhancedPublished,
} from "@/lib/property-enhance.functions";
import { RenderSettingsPanel } from "@/components/admin/render-settings-panel";
import type { RenderSettings } from "@/lib/render-options";

type Image = {
  id: string;
  image_url: string;
  original_image_url: string | null;
  rendered_image_url: string | null;
  published_image_url: string | null;
  storage_path: string;
  alt_text: string | null;
  sort_order: number;
  is_cover: boolean;
  rendered_storage_path: string | null;
  render_status: string;
  render_error: string | null;
  use_rendered: boolean;
  render_publish_mode?: string | null;
  enhanced_storage_path: string | null;
  enhanced_image_url: string | null;
  enhancement_status: string;
  enhancement_error: string | null;
  enhancement_created_at: string | null;
  use_enhanced: boolean;
  // import status
  is_imported: boolean;
  import_status: string | null;
  imported_source_url: string | null;
  // render settings
  photo_type: string | null;
  photo_category: string | null;
  render_style: string | null;
  render_goal: string | null;
  room_condition: string | null;
  intervention_level: string | null;
  preserve_structure: boolean;
  desired_lighting: string | null;
  visual_target: string | null;
  render_notes: string | null;
  rendered_signed_url?: string | null;
  render_availability?: {
    canRender: boolean;
    state: "ready_manual" | "imported_external" | "ready_synced" | "sync_error";
    statusLabel: string;
    message: string | null;
  };
};

const STORAGE_BUCKET = "property-images";
const SIGNED_URL_TTL_SECONDS = 60 * 60 * 24 * 365 * 5; // ~5 anni

const IMPORTED_NOT_SYNCED_MESSAGE =
  "Questa foto è stata importata da una fonte esterna. Prima di generare il rendering, sincronizzala nello storage.";

function logUploadStep(
  step:
    | "UPLOAD START"
    | "UPLOAD SUCCESS"
    | "OBJECT PATH"
    | "SIGNED URL REQUEST"
    | "SIGNED URL SUCCESS"
    | "SIGNED URL FAILED",
  details: { bucket: string; path: string; filename: string; property_id: string; error?: string },
) {
  const method = step === "SIGNED URL FAILED" ? console.error : console.info;
  method(`[Foto admin] ${step}`, details);
}

async function verifyStorageObjectExists(path: string) {
  const lastSlash = path.lastIndexOf("/");
  const folder = lastSlash >= 0 ? path.slice(0, lastSlash) : "";
  const filename = lastSlash >= 0 ? path.slice(lastSlash + 1) : path;

  for (let attempt = 0; attempt < 3; attempt++) {
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .list(folder, { search: filename, limit: 20 });
    if (error) return { exists: false, error: error.message, filename };
    if ((data ?? []).some((object) => object.name === filename)) {
      return { exists: true, error: null, filename };
    }
    if (attempt < 2) {
      await new Promise((resolve) => window.setTimeout(resolve, 250 * (attempt + 1)));
    }
  }

  return { exists: false, error: "Object not found dopo upload completato", filename };
}

function computeAvailability(row: {
  id: string;
  storage_path: string;
  is_imported: boolean;
  import_status: string | null;
  imported_source_url: string | null;
}): NonNullable<Image["render_availability"]> {
  const externalStorage = !!row.storage_path && /^https?:\/\//i.test(row.storage_path);
  const isExternalOnly =
    !row.storage_path ||
    externalStorage ||
    row.import_status === "external_only" ||
    row.import_status === "imported_external_only";

  if (isExternalOnly) {
    return {
      canRender: false,
      state: "imported_external",
      statusLabel: "Foto importata non sincronizzata",
      message: IMPORTED_NOT_SYNCED_MESSAGE,
    };
  }
  if (row.import_status === "sync_error") {
    return {
      canRender: false,
      state: "sync_error",
      statusLabel: "Errore sincronizzazione",
      message:
        "Impossibile recuperare questa foto dalla fonte originale. Ricarica manualmente l’immagine.",
    };
  }
  return {
    canRender: true,
    state: row.is_imported ? "ready_synced" : "ready_manual",
    statusLabel: row.is_imported
      ? "Foto sincronizzata nello storage"
      : "Foto caricata correttamente",
    message: null,
  };
}

function extractSettings(img: Image): RenderSettings {
  return {
    photo_type: img.photo_type,
    photo_category: img.photo_category,
    render_style: img.render_style,
    render_goal: img.render_goal,
    room_condition: img.room_condition,
    intervention_level: img.intervention_level,
    preserve_structure: img.preserve_structure,
    desired_lighting: img.desired_lighting,
    visual_target: img.visual_target,
    render_notes: img.render_notes,
  };
}


export function ImageUploader({ propertyId }: { propertyId: string }) {
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [renderingId, setRenderingId] = useState<string | null>(null);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [enhancingId, setEnhancingId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const runRender = useServerFn(renderPropertyImage);
  const runSetPublishMode = useServerFn(setRenderPublishMode);
  const runDiscardRender = useServerFn(discardRender);
  const runSync = useServerFn(syncImportedImage);
  const runForceSync = useServerFn(forceSyncPhotosBatch);
  const [bulkSyncing, setBulkSyncing] = useState(false);
  const runEnhance = useServerFn(enhancePropertyImage);
  const runSetEnhancedPublished = useServerFn(setPropertyImageEnhancedPublished);
  const [lastError, setLastError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const syncAllForProperty = async () => {
    setBulkSyncing(true);
    const tid = toast.loading("Sincronizzazione foto in corso…");
    let synced = 0;
    let failed = 0;
    try {
      for (let i = 0; i < 100; i++) {
        const res = await runForceSync({ data: { propertyId, limit: 15 } });
        synced += res.synced;
        failed += res.failed;
        if (res.processed === 0 || res.remaining === 0) break;
      }
      await load();
      if (failed === 0) toast.success(`Sincronizzazione completata · ${synced} foto`, { id: tid });
      else toast.warning(`${synced} sincronizzate · ${failed} errori`, { id: tid });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Errore sincronizzazione", { id: tid });
    } finally {
      setBulkSyncing(false);
    }
  };

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("property_images")
      .select(
        "id, image_url, original_image_url, rendered_image_url, published_image_url, storage_path, alt_text, sort_order, is_cover, rendered_storage_path, render_status, render_error, use_rendered, render_publish_mode, enhanced_storage_path, enhanced_image_url, enhancement_status, enhancement_error, enhancement_created_at, use_enhanced, is_imported, import_status, imported_source_url, photo_type, photo_category, render_style, render_goal, room_condition, intervention_level, preserve_structure, desired_lighting, visual_target, render_notes",
      )
      .eq("property_id", propertyId)
      .order("sort_order", { ascending: true });
    if (error) toast.error(error.message);
    const rows = (data ?? []) as Image[];
    // Sign rendered paths
    const paths = rows.map((r) => r.rendered_storage_path).filter((p): p is string => !!p);
    const signedMap: Record<string, string> = {};
    if (paths.length > 0) {
      const { data: signed } = await supabase.storage
        .from(STORAGE_BUCKET)
        .createSignedUrls(paths, SIGNED_URL_TTL_SECONDS);
      if (signed) {
        for (const s of signed) {
          if (s.path && s.signedUrl) signedMap[s.path] = s.signedUrl;
        }
      }
    }
    const availability = rows.map((r) => computeAvailability(r));
    setImages(
      rows.map((r, idx) => ({
        ...r,
        rendered_signed_url: r.rendered_storage_path
          ? (signedMap[r.rendered_storage_path] ?? null)
          : null,
        render_availability: availability[idx],
      })),
    );
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [propertyId]);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setLastError(null);
    const errors: string[] = [];
    try {
      const baseOrder = images.length;
      const willBeFirstUpload = images.length === 0;
      let count = 0;
      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) {
          errors.push(`${file.name}: tipo file non supportato (${file.type || "sconosciuto"})`);
          continue;
        }
        const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
        const path = `${propertyId}/${crypto.randomUUID()}.${ext}`;
        const logDetails = {
          bucket: STORAGE_BUCKET,
          path,
          filename: file.name,
          property_id: propertyId,
        };
        logUploadStep("UPLOAD START", logDetails);
        logUploadStep("OBJECT PATH", logDetails);
        const { error: upErr } = await supabase.storage
          .from(STORAGE_BUCKET)
          .upload(path, file, { cacheControl: "31536000", upsert: false });
        if (upErr) {
          const msg = `Upload fallito (${file.name}): ${upErr.message}`;
          toast.error(msg);
          errors.push(msg);
          continue;
        }
        logUploadStep("UPLOAD SUCCESS", logDetails);

        const existsCheck = await verifyStorageObjectExists(path);
        if (!existsCheck.exists) {
          const msg = `File non trovato nello storage dopo upload (${file.name}). Bucket: ${STORAGE_BUCKET} · Path: ${path} · Dettaglio: ${existsCheck.error ?? "n/d"}`;
          logUploadStep("SIGNED URL FAILED", { ...logDetails, error: msg });
          toast.error(msg);
          errors.push(msg);
          continue;
        }

        logUploadStep("SIGNED URL REQUEST", logDetails);
        const { data: signed, error: signErr } = await supabase.storage
          .from(STORAGE_BUCKET)
          .createSignedUrl(path, SIGNED_URL_TTL_SECONDS);
        if (signErr || !signed) {
          const msg = `URL firmato fallito (${file.name}). Bucket: ${STORAGE_BUCKET} · Path: ${path} · Dettaglio: ${signErr?.message ?? "n/d"}`;
          logUploadStep("SIGNED URL FAILED", { ...logDetails, error: signErr?.message ?? "n/d" });
          toast.error(msg);
          errors.push(msg);
          continue;
        }
        logUploadStep("SIGNED URL SUCCESS", logDetails);
        const { error: insErr } = await supabase.from("property_images").insert({
          property_id: propertyId,
          image_url: signed.signedUrl,
          original_image_url: signed.signedUrl,
          published_image_url: signed.signedUrl,
          storage_path: path,
          sort_order: baseOrder + count,
          is_cover: willBeFirstUpload && count === 0,
          is_imported: false,
          import_status: "synced_to_storage",
          render_status: "not_generated",
        });
        if (insErr) {
          const msg = `Errore caricamento foto (${file.name}): ${insErr.message}`;
          toast.error(msg);
          errors.push(msg);
          // best-effort cleanup of orphan storage object
          await supabase.storage.from(STORAGE_BUCKET).remove([path]);
          continue;
        }
        count++;
      }
      if (count > 0) toast.success(`${count} immagine/i caricate`);
      if (errors.length > 0) setLastError(errors.join(" · "));
      await load();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Errore sconosciuto";
      toast.error(`Errore caricamento foto: ${msg}`);
      setLastError(`Errore caricamento foto: ${msg}`);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (uploading) return;
    const files = e.dataTransfer?.files;
    if (files && files.length > 0) handleFiles(files);
  };
  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!dragOver) setDragOver(true);
  };
  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const setCover = async (id: string) => {
    const { error } = await supabase
      .from("property_images")
      .update({ is_cover: true })
      .eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Cover impostata");
    await load();
  };

  const remove = async (img: Image) => {
    if (!confirm("Eliminare questa immagine?")) return;
    await supabase.storage.from(STORAGE_BUCKET).remove([img.storage_path]);
    const { error } = await supabase.from("property_images").delete().eq("id", img.id);
    if (error) return toast.error(error.message);
    toast.success("Immagine eliminata");
    await load();
  };

  const move = async (idx: number, dir: -1 | 1) => {
    const next = idx + dir;
    if (next < 0 || next >= images.length) return;
    const a = images[idx];
    const b = images[next];
    // Swap sort_order
    await supabase.from("property_images").update({ sort_order: b.sort_order }).eq("id", a.id);
    await supabase.from("property_images").update({ sort_order: a.sort_order }).eq("id", b.id);
    await load();
  };

  const updateAlt = async (id: string, alt: string) => {
    await supabase.from("property_images").update({ alt_text: alt }).eq("id", id);
  };

  const generate = async (img: Image) => {
    if (!img.render_availability?.canRender) {
      toast.error(
        img.render_availability?.message ?? "Sincronizza la foto prima di generare il rendering",
      );
      return;
    }
    setRenderingId(img.id);
    try {
      await runRender({ data: { imageId: img.id } });
      toast.success("Rendering generato");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Errore rendering");
      await load();
    } finally {
      setRenderingId(null);
    }
  };

  const setPublishMode = async (img: Image, mode: "main" | "emotional" | "none") => {
    try {
      await runSetPublishMode({ data: { imageId: img.id, mode } });
      toast.success(
        mode === "main"
          ? "Rendering pubblicato come foto principale (originale conservata)"
          : mode === "emotional"
            ? "Rendering usato come Prima/Dopo"
            : "Rendering non pubblicato",
      );
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Errore");
    }
  };

  const discard = async (img: Image) => {
    if (!confirm("Scartare il rendering generato? La foto originale resterà intatta.")) return;
    try {
      await runDiscardRender({ data: { imageId: img.id } });
      toast.success("Rendering scartato. Foto originale ripristinata.");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Errore");
    }
  };

  const enhance = async (img: Image) => {
    if (!img.render_availability?.canRender) {
      toast.error("Sincronizza prima la foto nello storage interno");
      return;
    }
    setEnhancingId(img.id);
    try {
      await runEnhance({ data: { imageId: img.id } });
      toast.success("Foto migliorata");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Errore miglioramento");
      await load();
    } finally {
      setEnhancingId(null);
    }
  };

  const toggleEnhancedPublished = async (img: Image, useEnhanced: boolean) => {
    try {
      await runSetEnhancedPublished({ data: { imageId: img.id, useEnhanced } });
      toast.success(useEnhanced ? "Versione migliorata pubblicata" : "Originale pubblicato");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Errore");
    }
  };

  const syncImage = async (img: Image) => {
    setSyncingId(img.id);
    try {
      await runSync({ data: { imageId: img.id } });
      toast.success("Foto sincronizzata nello storage");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Errore sincronizzazione");
      await load();
    } finally {
      setSyncingId(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-serif text-xl text-ink">Foto dell'immobile</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            La prima foto viene impostata come cover automaticamente. Puoi cambiarla in qualsiasi
            momento con la stellina.
          </p>
        </div>
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-sm bg-primary px-4 py-2 text-xs uppercase tracking-[0.18em] text-primary-foreground hover:bg-primary/90">
          {uploading ? <Loader2 size={14} className="animate-spin" /> : <ImagePlus size={14} />}
          {uploading ? "Caricamento..." : "Carica foto"}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
            disabled={uploading}
          />
        </label>
      </div>

      <div className="mt-3 flex justify-end">
        <button
          type="button"
          onClick={syncAllForProperty}
          disabled={bulkSyncing}
          className="inline-flex items-center gap-2 rounded-sm border border-border bg-background px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] text-ink hover:border-primary/50 disabled:opacity-60"
        >
          {bulkSyncing ? <Loader2 size={12} className="animate-spin" /> : <Zap size={12} />}
          Sincronizza tutte le foto di questo immobile
        </button>
      </div>

      {lastError && (
        <div className="mt-3 flex items-start justify-between gap-3 rounded-sm border border-destructive/40 bg-destructive/5 px-3 py-2 text-xs text-destructive">
          <span className="leading-relaxed">Errore caricamento foto: {lastError}</span>
          <button
            type="button"
            onClick={() => setLastError(null)}
            className="shrink-0 rounded-sm p-1 hover:bg-destructive/10"
            aria-label="Chiudi"
          >
            <X size={12} />
          </button>
        </div>
      )}

      {loading ? (
        <div className="mt-8 flex justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </div>
      ) : images.length === 0 ? (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          disabled={uploading}
          className={`mt-6 flex h-48 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-sm border-2 border-dashed text-sm transition-colors disabled:opacity-60 ${
            dragOver
              ? "border-primary bg-primary/5 text-ink"
              : "border-border bg-muted/30 text-muted-foreground hover:border-primary/50"
          }`}
        >
          {uploading ? (
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          ) : (
            <ImagePlus size={20} />
          )}
          <span>
            {uploading
              ? "Caricamento in corso…"
              : "Trascina qui le foto oppure clicca per selezionarle"}
          </span>
        </button>
      ) : (
        <div
          className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
        >
          {images.map((img, idx) => (
            <div
              key={img.id}
              className={`group relative overflow-hidden rounded-sm border bg-card ${
                img.is_cover ? "border-primary" : "border-border"
              }`}
            >
              {/* Versions gallery */}
              <div className="bg-card p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    Versioni
                  </span>
                  {img.is_cover && (
                    <span className="inline-flex items-center gap-1 rounded-sm bg-primary px-2 py-0.5 text-[10px] uppercase tracking-wider text-primary-foreground">
                      <Star size={10} className="fill-current" /> Cover in uso
                    </span>
                  )}
                </div>
                <div className="grid gap-2 sm:grid-cols-3">
                  {/* Originale — always shown */}
                  <VersionCard
                    label="Originale"
                    inUse={!img.use_rendered && !img.use_enhanced}
                    src={img.image_url}
                    alt={img.alt_text ?? "Originale"}
                    downloadUrl={img.image_url}
                    downloadName={`originale-${img.id}.jpg`}
                  />
                  {/* Migliorata */}
                  {img.enhanced_image_url ? (
                    <VersionCard
                      label="Migliorata"
                      inUse={img.use_enhanced}
                      src={img.enhanced_image_url}
                      alt="Migliorata"
                      downloadUrl={img.enhanced_image_url}
                      downloadName={`migliorata-${img.id}.jpg`}
                    />
                  ) : (
                    <EmptyVersion
                      icon={<Wand2 size={14} />}
                      title="Foto non ancora migliorata"
                      hint={
                        img.enhancement_status === "processing"
                          ? "In elaborazione…"
                          : img.enhancement_status === "error"
                            ? "Errore: riprova"
                            : undefined
                      }
                    />
                  )}
                  {/* Rendering */}
                  {img.rendered_signed_url ? (
                    <div className="flex flex-col gap-1.5">
                      <VersionCard
                        label="Rendering"
                        inUse={img.use_rendered}
                        src={img.rendered_signed_url}
                        alt="Rendering"
                        downloadUrl={img.rendered_signed_url}
                        downloadName={`rendering-${img.id}.jpg`}
                        statusPill={
                          img.render_publish_mode === "main"
                            ? "Sostituisce originale"
                            : img.render_publish_mode === "emotional"
                              ? "Prima/Dopo"
                              : "Generato · non pubblicato"
                        }
                      />
                      <div className="flex flex-wrap gap-1">
                        <CompactBtn
                          onClick={() => setPublishMode(img, "main")}
                          disabled={img.render_publish_mode === "main"}
                          title="Sostituisce la foto originale nella gallery. L'originale resta come backup."
                          icon={<Sparkles size={10} />}
                          active={img.render_publish_mode === "main"}
                        >
                          Sostituisci originale
                        </CompactBtn>
                        <CompactBtn
                          onClick={() => setPublishMode(img, "emotional")}
                          disabled={img.render_publish_mode === "emotional"}
                          title="Mostra il rendering nella sezione pubblica Prima/Dopo."
                          icon={<Heart size={10} />}
                          active={img.render_publish_mode === "emotional"}
                        >
                          Usa come Prima/Dopo
                        </CompactBtn>
                        {img.render_publish_mode === "main" && (
                          <CompactBtn
                            onClick={() => setPublishMode(img, "none")}
                            title="Torna a mostrare la foto originale nella gallery."
                            icon={<Undo2 size={10} />}
                          >
                            Ripristina originale
                          </CompactBtn>
                        )}
                        <CompactBtn
                          onClick={() => discard(img)}
                          title="Elimina il rendering generato. La foto originale resta intatta."
                          icon={<X size={10} />}
                          danger
                        >
                          Scarta
                        </CompactBtn>
                      </div>
                    </div>
                  ) : (
                    <EmptyVersion
                      icon={<Sparkles size={14} />}
                      title="Rendering non ancora generato"
                      hint={
                        img.render_status === "processing"
                          ? "In elaborazione…"
                          : img.render_status === "error"
                            ? "Errore: riprova"
                            : undefined
                      }
                    />
                  )}
                </div>

                {/* Enhancement actions */}
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => enhance(img)}
                    disabled={enhancingId === img.id || !img.render_availability?.canRender}
                    className="inline-flex items-center gap-1.5 rounded-sm bg-ink px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] text-cream transition-colors hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {enhancingId === img.id ? (
                      <>
                        <Loader2 size={12} className="animate-spin" />
                        Miglioramento in corso…
                      </>
                    ) : (
                      <>
                        <Wand2 size={12} />
                        {img.enhanced_storage_path ? "Rigenera miglioramento" : "Migliora foto"}
                      </>
                    )}
                  </button>
                  {img.enhanced_storage_path && (
                    <div className="flex flex-wrap gap-1">
                      <button
                        type="button"
                        onClick={() => toggleEnhancedPublished(img, true)}
                        disabled={img.use_enhanced}
                        className="inline-flex items-center gap-1 rounded-sm border border-border bg-background px-2 py-1 text-[10px] uppercase tracking-wider hover:border-primary/50 disabled:opacity-40"
                      >
                        {img.use_enhanced && <Check size={11} className="text-primary" />}
                        Usa migliorata
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleEnhancedPublished(img, false)}
                        disabled={!img.use_enhanced}
                        className="inline-flex items-center gap-1 rounded-sm border border-border bg-background px-2 py-1 text-[10px] uppercase tracking-wider hover:border-primary/50 disabled:opacity-40"
                      >
                        {!img.use_enhanced && <Check size={11} className="text-primary" />}
                        Mantieni originale
                      </button>
                    </div>
                  )}
                </div>
                {!img.enhanced_image_url && (
                  <div className="mt-2 text-[10px] uppercase tracking-wider text-muted-foreground">
                    Stato miglioramento:{" "}
                    <span
                      className={
                        img.enhancement_status === "error"
                          ? "text-destructive"
                          : img.enhancement_status === "processing"
                            ? "text-primary"
                            : ""
                      }
                    >
                      {img.enhancement_status === "not_enhanced" && "non ancora eseguito"}
                      {img.enhancement_status === "processing" && "in elaborazione"}
                      {img.enhancement_status === "enhanced" && "completato"}
                      {img.enhancement_status === "error" && "errore"}
                    </span>
                  </div>
                )}
                {img.enhancement_error && (
                  <div className="mt-1 text-[10px] text-destructive">{img.enhancement_error}</div>
                )}
              </div>
              <div className="space-y-2 p-3">
                <input
                  defaultValue={img.alt_text ?? ""}
                  onBlur={(e) => updateAlt(img.id, e.target.value)}
                  placeholder="Descrizione (alt text)"
                  className="w-full rounded-sm border border-border bg-background px-2 py-1 text-xs focus:border-primary focus:outline-none"
                />
                {/* Rendering controls */}
                <div className="space-y-2 rounded-sm border border-border bg-muted/30 p-2">
                  {img.render_availability && !img.render_availability.canRender && (
                    <div className="rounded-sm border border-border bg-background p-2 text-[10px] text-foreground">
                      <div className="font-semibold uppercase tracking-wider">
                        {img.render_availability.statusLabel}
                      </div>
                      <p className="mt-1 text-muted-foreground">
                        {img.render_availability.message}
                      </p>
                      <button
                        type="button"
                        onClick={() => syncImage(img)}
                        disabled={
                          syncingId === img.id || img.render_availability.state === "sync_error"
                        }
                        className="mt-2 inline-flex items-center gap-1 rounded-sm bg-primary px-2 py-1 text-[10px] uppercase tracking-wider text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                      >
                        {syncingId === img.id ? (
                          <Loader2 size={11} className="animate-spin" />
                        ) : (
                          <CloudDownload size={11} />
                        )}
                        Sincronizza foto importata
                      </button>
                    </div>
                  )}
                  {img.render_availability?.canRender && (
                    <div className="rounded-sm border border-border bg-background p-2 text-[10px] uppercase tracking-wider text-primary">
                      {img.render_availability.statusLabel}
                    </div>
                  )}
                  <RenderSettingsPanel
                    imageId={img.id}
                    initial={extractSettings(img)}
                    hasRender={!!img.rendered_storage_path}
                    canRender={!!img.render_availability?.canRender}
                    rendering={renderingId === img.id}
                    onGenerate={() => generate(img)}
                  />
                  {img.render_error && (
                    <div className="text-[10px] text-destructive">{img.render_error}</div>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex gap-1">
                    <IconBtn onClick={() => move(idx, -1)} disabled={idx === 0} title="Sposta su">
                      <ArrowUp size={13} />
                    </IconBtn>
                    <IconBtn
                      onClick={() => move(idx, 1)}
                      disabled={idx === images.length - 1}
                      title="Sposta giù"
                    >
                      <ArrowDown size={13} />
                    </IconBtn>
                  </div>
                  <div className="flex gap-1">
                    {img.is_cover ? (
                      <IconBtn title="Già cover" disabled>
                        <Star size={13} className="fill-primary text-primary" />
                      </IconBtn>
                    ) : (
                      <IconBtn onClick={() => setCover(img.id)} title="Imposta come cover">
                        <StarOff size={13} />
                      </IconBtn>
                    )}
                    <IconBtn onClick={() => remove(img)} title="Elimina" danger>
                      <Trash2 size={13} />
                    </IconBtn>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function IconBtn({
  children,
  onClick,
  disabled,
  title,
  danger,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  title?: string;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`rounded-sm border border-border p-1.5 text-foreground transition hover:border-primary/50 disabled:opacity-30 ${
        danger ? "hover:border-destructive hover:text-destructive" : ""
      }`}
    >
      {children}
    </button>
  );
}

function VersionCard({
  label,
  inUse,
  src,
  alt,
  downloadUrl,
  downloadName,
  statusPill,
}: {
  label: string;
  inUse: boolean;
  src: string;
  alt: string;
  downloadUrl: string;
  downloadName: string;
  statusPill?: string;
}) {
  return (
    <div
      className={`group relative overflow-hidden rounded-sm border bg-muted transition ${
        inUse ? "border-primary ring-1 ring-primary/40" : "border-border"
      }`}
    >
      <div className="relative aspect-[4/3]">
        <img src={src} alt={alt} className="h-full w-full object-cover" loading="lazy" />
        <span className="absolute left-1.5 top-1.5 rounded-sm bg-background/85 px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-foreground">
          {label}
          {inUse && <span className="ml-1 text-primary">· in uso</span>}
        </span>
        {statusPill && (
          <span className="absolute bottom-1.5 left-1.5 right-1.5 truncate rounded-sm bg-background/85 px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-foreground">
            {statusPill}
          </span>
        )}
        <a
          href={downloadUrl}
          download={downloadName}
          target="_blank"
          rel="noopener noreferrer"
          title="Scarica"
          className="absolute right-1.5 top-1.5 inline-flex items-center gap-1 rounded-sm bg-background/85 px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-foreground opacity-0 transition group-hover:opacity-100 hover:bg-background"
        >
          <Download size={10} />
        </a>
      </div>
    </div>
  );
}

function CompactBtn({
  children,
  onClick,
  disabled,
  title,
  icon,
  active,
  danger,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  title?: string;
  icon?: React.ReactNode;
  active?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`inline-flex items-center gap-1 rounded-sm border px-1.5 py-0.5 text-[9px] uppercase tracking-wider transition disabled:opacity-40 ${
        active
          ? "border-primary bg-primary/10 text-primary"
          : danger
            ? "border-border bg-background text-destructive hover:border-destructive/50"
            : "border-border bg-background text-foreground hover:border-primary/50"
      }`}
    >
      {active && <Check size={10} className="text-primary" />}
      {icon}
      {children}
    </button>
  );
}

function EmptyVersion({
  icon,
  title,
  hint,
}: {
  icon: React.ReactNode;
  title: string;
  hint?: string;
}) {
  return (
    <div className="flex aspect-[4/3] flex-col items-center justify-center gap-1.5 rounded-sm border border-dashed border-border bg-muted/30 p-2 text-center">
      <span className="text-muted-foreground">{icon}</span>
      <span className="text-[10px] leading-tight text-muted-foreground">{title}</span>
      {hint && <span className="text-[9px] uppercase tracking-wider text-primary">{hint}</span>}
    </div>
  );
}