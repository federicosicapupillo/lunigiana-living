import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ImagePlus, Star, StarOff, Trash2, ArrowUp, ArrowDown, Loader2, Sparkles, Check } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import {
  renderPropertyImage,
  setPropertyImagePublished,
} from "@/lib/property-render.functions";
import { RenderSettingsPanel } from "@/components/admin/render-settings-panel";
import type { RenderSettings } from "@/lib/render-options";

type Image = {
  id: string;
  image_url: string;
  storage_path: string;
  alt_text: string | null;
  sort_order: number;
  is_cover: boolean;
  rendered_storage_path: string | null;
  render_status: string;
  render_error: string | null;
  use_rendered: boolean;
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
};

const SIGNED_URL_TTL_SECONDS = 60 * 60 * 24 * 365 * 5; // ~5 anni

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
  const fileRef = useRef<HTMLInputElement>(null);
  const runRender = useServerFn(renderPropertyImage);
  const runSetPublished = useServerFn(setPropertyImagePublished);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("property_images")
      .select(
        "id, image_url, storage_path, alt_text, sort_order, is_cover, rendered_storage_path, render_status, render_error, use_rendered, photo_type, photo_category, render_style, render_goal, room_condition, intervention_level, preserve_structure, desired_lighting, visual_target, render_notes",
      )
      .eq("property_id", propertyId)
      .order("sort_order", { ascending: true });
    if (error) toast.error(error.message);
    const rows = (data ?? []) as Image[];
    // Sign rendered paths
    const paths = rows.map((r) => r.rendered_storage_path).filter((p): p is string => !!p);
    let signedMap: Record<string, string> = {};
    if (paths.length > 0) {
      const { data: signed } = await supabase.storage
        .from("property-images")
        .createSignedUrls(paths, SIGNED_URL_TTL_SECONDS);
      if (signed) {
        for (const s of signed) {
          if (s.path && s.signedUrl) signedMap[s.path] = s.signedUrl;
        }
      }
    }
    setImages(
      rows.map((r) => ({
        ...r,
        rendered_signed_url: r.rendered_storage_path ? signedMap[r.rendered_storage_path] ?? null : null,
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
    try {
      const baseOrder = images.length;
      const willBeFirstUpload = images.length === 0;
      let count = 0;
      for (const file of Array.from(files)) {
        const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
        const path = `${propertyId}/${crypto.randomUUID()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("property-images")
          .upload(path, file, { cacheControl: "31536000", upsert: false });
        if (upErr) {
          toast.error(`Upload fallito (${file.name}): ${upErr.message}`);
          continue;
        }
        const { data: signed, error: signErr } = await supabase.storage
          .from("property-images")
          .createSignedUrl(path, SIGNED_URL_TTL_SECONDS);
        if (signErr || !signed) {
          toast.error(`URL fallito: ${signErr?.message ?? "n/d"}`);
          continue;
        }
        const { error: insErr } = await supabase.from("property_images").insert({
          property_id: propertyId,
          image_url: signed.signedUrl,
          storage_path: path,
          sort_order: baseOrder + count,
          is_cover: willBeFirstUpload && count === 0,
        });
        if (insErr) toast.error(`Salvataggio metadati: ${insErr.message}`);
        count++;
      }
      toast.success(`${count} immagine/i caricate`);
      await load();
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
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
    await supabase.storage.from("property-images").remove([img.storage_path]);
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
    if (!img.photo_type) {
      toast.error("Configura prima le impostazioni rendering (Tipo foto)");
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

  const togglePublished = async (img: Image, useRendered: boolean) => {
    try {
      await runSetPublished({ data: { imageId: img.id, useRendered } });
      toast.success(useRendered ? "Rendering pubblicato" : "Originale pubblicato");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Errore");
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

      {loading ? (
        <div className="mt-8 flex justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </div>
      ) : images.length === 0 ? (
        <label className="mt-6 flex h-48 cursor-pointer items-center justify-center rounded-sm border-2 border-dashed border-border bg-muted/30 text-sm text-muted-foreground hover:border-primary/50">
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
          Trascina o seleziona le foto per iniziare
        </label>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((img, idx) => (
            <div
              key={img.id}
              className={`group relative overflow-hidden rounded-sm border bg-card ${
                img.is_cover ? "border-primary" : "border-border"
              }`}
            >
              <div className="grid grid-cols-2 gap-px bg-border">
                <div className="relative aspect-[4/3] bg-muted">
                  <img src={img.image_url} alt={img.alt_text ?? ""} className="h-full w-full object-cover" />
                  <span className="absolute left-1 top-1 rounded-sm bg-background/80 px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-muted-foreground">
                    Originale {!img.use_rendered && "· in uso"}
                  </span>
                </div>
                <div className="relative aspect-[4/3] bg-muted">
                  {img.rendered_signed_url ? (
                    <img src={img.rendered_signed_url} alt="Rendering" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[10px] uppercase tracking-wider text-muted-foreground">
                      Nessun rendering
                    </div>
                  )}
                  {img.rendered_signed_url && (
                    <span className="absolute left-1 top-1 rounded-sm bg-background/80 px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-muted-foreground">
                      Rendering {img.use_rendered && "· in uso"}
                    </span>
                  )}
                </div>
              </div>
              {img.is_cover && (
                <span className="absolute left-2 top-2 rounded-sm bg-primary px-2 py-0.5 text-[10px] uppercase tracking-wider text-primary-foreground">
                  Cover
                </span>
              )}
              <div className="space-y-2 p-3">
                <input
                  defaultValue={img.alt_text ?? ""}
                  onBlur={(e) => updateAlt(img.id, e.target.value)}
                  placeholder="Descrizione (alt text)"
                  className="w-full rounded-sm border border-border bg-background px-2 py-1 text-xs focus:border-primary focus:outline-none"
                />
                {/* Rendering controls */}
                <div className="space-y-2 rounded-sm border border-border bg-muted/30 p-2">
                  <RenderSettingsPanel
                    imageId={img.id}
                    initial={extractSettings(img)}
                  />
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => generate(img)}
                      disabled={renderingId === img.id || !img.photo_type}
                      className="inline-flex flex-1 items-center justify-center gap-1 rounded-sm bg-primary px-2 py-1.5 text-[10px] uppercase tracking-wider text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                    >
                      {renderingId === img.id ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <Sparkles size={12} />
                      )}
                      {img.rendered_storage_path ? "Rigenera rendering" : "Genera rendering"}
                    </button>
                  </div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Stato:{" "}
                    <span
                      className={
                        img.render_status === "error"
                          ? "text-destructive"
                          : img.render_status === "done"
                          ? "text-primary"
                          : ""
                      }
                    >
                      {img.render_status === "idle" && "Non generato"}
                      {img.render_status === "processing" && "In elaborazione"}
                      {img.render_status === "done" && "Rendering generato"}
                      {img.render_status === "error" && "Errore"}
                    </span>
                  </div>
                  {img.render_error && (
                    <div className="text-[10px] text-destructive">{img.render_error}</div>
                  )}
                  {img.rendered_storage_path && (
                    <div className="flex flex-wrap gap-1">
                      <button
                        type="button"
                        onClick={() => togglePublished(img, true)}
                        disabled={img.use_rendered}
                        className="inline-flex items-center gap-1 rounded-sm border border-border bg-background px-2 py-1 text-[10px] uppercase tracking-wider hover:border-primary/50 disabled:opacity-40"
                      >
                        {img.use_rendered && <Check size={11} className="text-primary" />}
                        Usa rendering
                      </button>
                      <button
                        type="button"
                        onClick={() => togglePublished(img, false)}
                        disabled={!img.use_rendered}
                        className="inline-flex items-center gap-1 rounded-sm border border-border bg-background px-2 py-1 text-[10px] uppercase tracking-wider hover:border-primary/50 disabled:opacity-40"
                      >
                        {!img.use_rendered && <Check size={11} className="text-primary" />}
                        Usa originale
                      </button>
                    </div>
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