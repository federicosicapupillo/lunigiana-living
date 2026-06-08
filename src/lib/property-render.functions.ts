import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  PHOTO_TYPES,
  INTERNAL_CATEGORIES,
  EXTERNAL_CATEGORIES,
  RENDER_STYLES,
  RENDER_GOALS,
  ROOM_CONDITIONS,
  INTERVENTION_LEVELS,
  LIGHTING_OPTIONS,
  VISUAL_TARGETS,
  labelOf,
  type RenderSettings,
} from "@/lib/render-options";

const STRUCTURE_STRICT =
  "STRUCTURAL FIDELITY (mandatory): keep the original photograph's architecture, perspective, camera angle, focal length, framing and proportions IDENTICAL. Do not move, add or remove walls, ceilings, floors, windows, doors, stairs, columns, beams or openings. Do not change the function/typology of the space. Preserve the view beyond windows and the structural materials of walls, floor and ceiling.";

const STRUCTURE_LOOSE =
  "Keep the camera angle and overall layout of the room recognizable; small adjustments to fixtures and finishes are allowed but do not invent new rooms or openings.";

const INTENSITY_HINT: Record<string, string> = {
  molto_leggero:
    "INTENSITY — Very light: preserve the original photo as much as possible; only minor styling improvements, no furniture replacement.",
  leggero:
    "INTENSITY — Light: refresh styling, tidy clutter, soft palette adjustments; keep most existing elements.",
  medio:
    "INTENSITY — Medium: clear restyling of decor and key furniture pieces, refreshed palette, while keeping the room recognizable.",
  forte:
    "INTENSITY — Strong: full restyling of furniture, palette, textiles and lighting; the result must look obviously transformed yet credible and photorealistic.",
};

function joinLabels(parts: (string | null)[]): string {
  return parts.filter((p): p is string => !!p && p.length > 0).join(" · ");
}

function buildPrompt(s: RenderSettings): string {
  const isExternal = s.photo_type === "esterno";
  const categoryLabel =
    labelOf(isExternal ? EXTERNAL_CATEGORIES : INTERNAL_CATEGORIES, s.photo_category) ?? "ambiente";
  const typeLabel = labelOf(PHOTO_TYPES, s.photo_type) ?? (isExternal ? "Esterno" : "Interno");
  const styleLabel = labelOf(RENDER_STYLES, s.render_style) ?? "Neutro valorizzato";
  const goalLabel = labelOf(RENDER_GOALS, s.render_goal);
  const conditionLabel = labelOf(ROOM_CONDITIONS, s.room_condition);
  const lightingLabel = labelOf(LIGHTING_OPTIONS, s.desired_lighting);
  const targetLabel = labelOf(VISUAL_TARGETS, s.visual_target);
  const intensityHint = INTENSITY_HINT[s.intervention_level ?? "medio"] ?? INTENSITY_HINT.medio;

  const structureRule = s.preserve_structure ? STRUCTURE_STRICT : STRUCTURE_LOOSE;

  const sceneLine = `SCENE — Real estate photograph of a ${typeLabel.toLowerCase()} space, specifically a ${categoryLabel.toLowerCase()}.`;
  const styleLine = `STYLE — Apply a "${styleLabel}" treatment suitable for an Italian real-estate listing.`;
  const goalLine = goalLabel ? `GOAL — ${goalLabel}.` : "";
  const conditionLine = conditionLabel
    ? `CURRENT STATE — The original space is ${conditionLabel.toLowerCase()}; respect that as the starting point.`
    : "";
  const lightingLine = lightingLabel ? `LIGHTING — ${lightingLabel}.` : "";
  const targetLine = targetLabel
    ? `TARGET BUYER — Optimize emotional appeal for: ${targetLabel}.`
    : "";
  const notesLine = s.render_notes ? `NOTES FROM AGENT — ${s.render_notes}` : "";

  const outdoorRule = isExternal
    ? "OUTDOOR REALISM — Avoid artificial, plastic or over-saturated results. Keep vegetation, paving and architectural elements credible for Lunigiana / Italian Tuscan context."
    : "";

  const finalCheck =
    "FINAL CHECK — The result must remain the same physical place from the same camera position, but the styling, decor and atmosphere should align with the requested treatment. Output must be a single photorealistic real-estate photograph.";

  return joinLabels([
    structureRule,
    intensityHint,
    sceneLine,
    styleLine,
    goalLine,
    conditionLine,
    lightingLine,
    targetLine,
    outdoorRule,
    notesLine,
    finalCheck,
  ]).replace(/ · /g, "\n\n");
}

const SettingsSchema = z.object({
  photo_type: z.enum(["interno", "esterno"]).nullable(),
  photo_category: z.string().max(64).nullable(),
  render_style: z.string().max(64).nullable(),
  render_goal: z.string().max(64).nullable(),
  room_condition: z.string().max(64).nullable(),
  intervention_level: z.string().max(32).nullable(),
  preserve_structure: z.boolean(),
  desired_lighting: z.string().max(32).nullable(),
  visual_target: z.string().max(32).nullable(),
  render_notes: z.string().max(500).nullable(),
});

const BUCKET = "property-images";
const SIGNED_URL_TTL_SECONDS = 60 * 60 * 24 * 365 * 5;
const IMPORTED_NOT_SYNCED_MESSAGE =
  "Questa foto è stata importata da una fonte esterna. Prima di generare il rendering, sincronizzala nello storage.";
const SYNC_ERROR_MESSAGE =
  "Impossibile recuperare questa foto dalla fonte originale. Ricarica manualmente l’immagine.";

type ImageAvailability = {
  imageId: string;
  canRender: boolean;
  state: "ready_manual" | "imported_external" | "ready_synced" | "sync_error";
  statusLabel: string;
  message: string | null;
  originalImageUrl: string | null;
};

function isExternalUrl(value: string | null | undefined): boolean {
  return !!value && /^https?:\/\//i.test(value);
}

function sanitizeRenderingError(err: unknown): string {
  const raw = err instanceof Error ? err.message : "Errore rendering";
  if (/object not found|download fallito|not found/i.test(raw)) return IMPORTED_NOT_SYNCED_MESSAGE;
  return raw;
}

async function verifyInternalStorageImage(
  supabaseAdmin: any,
  img: {
    id: string;
    storage_path: string | null;
    is_imported?: boolean | null;
    import_status?: string | null;
    imported_source_url?: string | null;
  },
): Promise<ImageAvailability> {
  const importedStatus = img.import_status === "external_only" || img.import_status === "imported_external_only";
  const isImportedExternal = !!img.is_imported || importedStatus || !!img.imported_source_url;
  const externalStoragePath = isExternalUrl(img.storage_path);

  if (!img.storage_path || externalStoragePath || importedStatus) {
    await supabaseAdmin
      .from("property_images")
      .update({
        import_status: "external_only",
        is_imported: isImportedExternal,
        imported_source_url: img.imported_source_url ?? (externalStoragePath ? img.storage_path : null),
        render_status: "not_generated",
        render_error: null,
      })
      .eq("id", img.id);
    return {
      imageId: img.id,
      canRender: false,
      state: "imported_external",
      statusLabel: "Foto importata non sincronizzata",
      message: IMPORTED_NOT_SYNCED_MESSAGE,
      originalImageUrl: null,
    };
  }

  const { data: signed, error: signErr } = await supabaseAdmin.storage
    .from(BUCKET)
    .createSignedUrl(img.storage_path, SIGNED_URL_TTL_SECONDS);
  if (signErr || !signed?.signedUrl) {
    await supabaseAdmin
      .from("property_images")
      .update({ import_status: "sync_error", render_status: "error", render_error: SYNC_ERROR_MESSAGE })
      .eq("id", img.id);
    return {
      imageId: img.id,
      canRender: false,
      state: "sync_error",
      statusLabel: "Errore sincronizzazione",
      message: SYNC_ERROR_MESSAGE,
      originalImageUrl: null,
    };
  }

  const urlCheck = await fetch(signed.signedUrl, { headers: { Range: "bytes=0-0" } }).catch(() => null);
  if (!urlCheck || !urlCheck.ok) {
    await supabaseAdmin
      .from("property_images")
      .update({ import_status: "sync_error", render_status: "error", render_error: SYNC_ERROR_MESSAGE })
      .eq("id", img.id);
    return {
      imageId: img.id,
      canRender: false,
      state: "sync_error",
      statusLabel: "Errore sincronizzazione",
      message: SYNC_ERROR_MESSAGE,
      originalImageUrl: null,
    };
  }

  if (img.import_status === "sync_error") {
    await supabaseAdmin
      .from("property_images")
      .update({
        image_url: signed.signedUrl,
        original_image_url: signed.signedUrl,
        import_status: "synced_to_storage",
        render_status: "not_generated",
        render_error: null,
      })
      .eq("id", img.id);
  } else {
    await supabaseAdmin
      .from("property_images")
      .update({
        image_url: signed.signedUrl,
        original_image_url: signed.signedUrl,
        import_status: "synced_to_storage",
      })
      .eq("id", img.id);
  }

  return {
    imageId: img.id,
    canRender: true,
    state: img.is_imported ? "ready_synced" : "ready_manual",
    statusLabel: img.is_imported ? "Foto sincronizzata nello storage" : "Foto caricata correttamente",
    message: null,
    originalImageUrl: signed.signedUrl,
  };
}

/**
 * Scarica una foto da un URL esterno e la carica nello storage interno.
 * Aggiorna la riga `property_images` impostando storage_path al nuovo path
 * interno e marcando import_status = 'synced_to_storage'.
 * Restituisce il nuovo storage_path interno.
 */
async function syncImportedImageToBucket(
  imageId: string,
  propertyId: string,
  sourceUrl: string,
): Promise<{ storagePath: string; mime: string; bytes: Uint8Array }> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const r = await fetch(sourceUrl);
  if (!r.ok) {
    throw new Error(SYNC_ERROR_MESSAGE);
  }
  const mime = r.headers.get("content-type") || "image/jpeg";
  if (!mime.startsWith("image/")) throw new Error(SYNC_ERROR_MESSAGE);
  const bytes = new Uint8Array(await r.arrayBuffer());
  if (bytes.length === 0) throw new Error(SYNC_ERROR_MESSAGE);
  const ext = mime.includes("png") ? "png" : mime.includes("webp") ? "webp" : "jpg";
  const storagePath = `${propertyId}/imported/${imageId}.${ext}`;

  const { error: upErr } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(storagePath, bytes, { contentType: mime, upsert: true });
  if (upErr) {
    await supabaseAdmin
      .from("property_images")
      .update({ import_status: "sync_error", render_status: "error", render_error: SYNC_ERROR_MESSAGE })
      .eq("id", imageId);
    throw new Error(SYNC_ERROR_MESSAGE);
  }

  // Firma per 5 anni così image_url resta valido nelle viste pubbliche già fatte.
  const { data: signed } = await supabaseAdmin.storage
    .from(BUCKET)
    .createSignedUrl(storagePath, 60 * 60 * 24 * 365 * 5);
  if (!signed?.signedUrl) throw new Error(SYNC_ERROR_MESSAGE);

  await supabaseAdmin
    .from("property_images")
    .update({
      storage_path: storagePath,
      image_url: signed.signedUrl,
      original_image_url: signed.signedUrl,
      published_image_url: signed.signedUrl,
      imported_source_url: sourceUrl,
      is_imported: true,
      import_status: "synced_to_storage",
      render_status: "not_generated",
      render_error: null,
    })
    .eq("id", imageId);

  return { storagePath, mime, bytes };
}

export const syncImportedImage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { imageId: string }) =>
    z.object({ imageId: z.string().uuid() }).parse(data),
  )
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { supabase, userId } = context;
    const { data: roleRow } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    if (!roleRow) throw new Error("Solo gli admin possono sincronizzare le foto");

    const { data: img, error: imgErr } = await supabaseAdmin
      .from("property_images")
      .select("id, property_id, image_url, original_image_url, storage_path, imported_source_url, import_status, is_imported")
      .eq("id", data.imageId)
      .maybeSingle();
    if (imgErr || !img) throw new Error("Immagine non trovata");

    const sourceUrl =
      img.imported_source_url ??
      (isExternalUrl(img.storage_path) ? img.storage_path : null) ??
      (isExternalUrl(img.original_image_url) ? img.original_image_url : null) ??
      (isExternalUrl(img.image_url) ? img.image_url : null);
    if (!sourceUrl) {
      const availability = await verifyInternalStorageImage(supabaseAdmin, img);
      return { ok: availability.canRender, alreadySynced: availability.canRender, availability };
    }

    try {
      const synced = await syncImportedImageToBucket(img.id, img.property_id, sourceUrl);
      const availability = await verifyInternalStorageImage(supabaseAdmin, {
        ...img,
        storage_path: synced.storagePath,
        import_status: "synced_to_storage",
        is_imported: true,
      });
      return { ok: true as const, alreadySynced: false, availability };
    } catch (err) {
      await supabaseAdmin
        .from("property_images")
        .update({ import_status: "sync_error", render_status: "error", render_error: SYNC_ERROR_MESSAGE })
        .eq("id", img.id);
      throw new Error(SYNC_ERROR_MESSAGE);
    }
  });

export const checkImageRenderAvailability = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { imageId: string }) =>
    z.object({ imageId: z.string().uuid() }).parse(data),
  )
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { supabase, userId } = context;
    const { data: roleRow } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    if (!roleRow) throw new Error("Solo gli admin");

    const { data: img, error } = await supabaseAdmin
      .from("property_images")
      .select("id, storage_path, imported_source_url, import_status, is_imported")
      .eq("id", data.imageId)
      .maybeSingle();
    if (error || !img) throw new Error("Immagine non trovata");
    return verifyInternalStorageImage(supabaseAdmin, img);
  });

export const renderPropertyImage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { imageId: string }) =>
    z
      .object({
        imageId: z.string().uuid(),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { supabase, userId } = context;

    // Admin check
    const { data: roleRow, error: roleErr } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    if (roleErr || !roleRow) throw new Error("Solo gli admin possono generare rendering");

    const { data: img, error: imgErr } = await supabaseAdmin
      .from("property_images")
      .select(
        "id, property_id, storage_path, imported_source_url, import_status, is_imported, use_rendered, photo_type, photo_category, render_style, render_goal, room_condition, intervention_level, preserve_structure, desired_lighting, visual_target, render_notes",
      )
      .eq("id", data.imageId)
      .maybeSingle();
    if (imgErr || !img) throw new Error("Immagine non trovata");
    if (!img.photo_type) throw new Error("Seleziona prima il tipo foto (Interno/Esterno)");

    const availability = await verifyInternalStorageImage(supabaseAdmin, img);
    if (!availability.canRender) {
      await supabaseAdmin
        .from("property_images")
        .update({ render_status: "not_generated", render_error: availability.message })
        .eq("id", data.imageId);
      throw new Error(availability.message ?? IMPORTED_NOT_SYNCED_MESSAGE);
    }

    const settings: RenderSettings = {
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

    await supabaseAdmin
      .from("property_images")
      .update({ render_status: "processing", render_error: null })
      .eq("id", data.imageId);

    try {
      let bytesIn: Uint8Array;
      let mime = "image/jpeg";
      const { data: blob, error: dlErr } = await supabaseAdmin.storage
        .from(BUCKET)
        .download(img.storage_path);
      if (dlErr || !blob) {
        await supabaseAdmin
          .from("property_images")
          .update({ import_status: "sync_error", render_status: "error", render_error: IMPORTED_NOT_SYNCED_MESSAGE })
          .eq("id", data.imageId);
        throw new Error(IMPORTED_NOT_SYNCED_MESSAGE);
      }
      mime = blob.type || mime;
      bytesIn = new Uint8Array(await blob.arrayBuffer());
      let bin = "";
      for (let i = 0; i < bytesIn.length; i++) bin += String.fromCharCode(bytesIn[i]);
      const dataUrl = `data:${mime};base64,${btoa(bin)}`;

      const key = process.env.LOVABLE_API_KEY;
      if (!key) throw new Error("AI non configurata");

      const prompt = buildPrompt(settings);
      const upstream = await fetch("https://ai.gateway.lovable.dev/v1/images/generations", {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-3.1-flash-image-preview",
          modalities: ["image", "text"],
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: prompt },
                { type: "image_url", image_url: { url: dataUrl } },
              ],
            },
          ],
        }),
      });
      if (!upstream.ok) {
        const text = await upstream.text();
        throw new Error(`Errore AI ${upstream.status}: ${text.slice(0, 200)}`);
      }
      const json = (await upstream.json()) as { data?: Array<{ b64_json?: string }> };
      const b64 = json.data?.[0]?.b64_json;
      if (!b64) throw new Error("Nessuna immagine generata");

      const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
      const renderedPath = `${img.property_id}/rendered/${img.id}-${Date.now()}.png`;
      const { error: upErr } = await supabaseAdmin.storage
        .from(BUCKET)
        .upload(renderedPath, bytes, { contentType: "image/png", upsert: false });
      if (upErr) throw new Error(`Upload rendering fallito: ${upErr.message}`);
      const { data: renderedSigned } = await supabaseAdmin.storage
        .from(BUCKET)
        .createSignedUrl(renderedPath, SIGNED_URL_TTL_SECONDS);

      const { error: updErr } = await supabaseAdmin
        .from("property_images")
        .update({
          rendered_storage_path: renderedPath,
          rendered_image_url: renderedSigned?.signedUrl ?? null,
          published_image_url: img.use_rendered ? renderedSigned?.signedUrl ?? null : availability.originalImageUrl,
          render_status: "completed",
          render_error: null,
          render_created_at: new Date().toISOString(),
        })
        .eq("id", data.imageId);
      if (updErr) throw new Error(updErr.message);

      return { ok: true as const, renderedPath };
    } catch (err) {
      const msg = sanitizeRenderingError(err);
      await supabaseAdmin
        .from("property_images")
        .update({ render_status: "error", render_error: msg })
        .eq("id", data.imageId);
      throw new Error(msg);
    }
  });

export const saveRenderSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (data: { imageId: string; settings: RenderSettings }) =>
      z
        .object({
          imageId: z.string().uuid(),
          settings: SettingsSchema,
        })
        .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { supabase, userId } = context;
    const { data: roleRow } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    if (!roleRow) throw new Error("Solo gli admin");
    const { error } = await supabaseAdmin
      .from("property_images")
      .update(data.settings)
      .eq("id", data.imageId);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const setPropertyImagePublished = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { imageId: string; useRendered: boolean }) =>
    z.object({ imageId: z.string().uuid(), useRendered: z.boolean() }).parse(data),
  )
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { supabase, userId } = context;
    const { data: roleRow } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    if (!roleRow) throw new Error("Solo gli admin");
    const { data: img, error: imgErr } = await supabaseAdmin
      .from("property_images")
      .select("storage_path, rendered_storage_path, original_image_url, rendered_image_url")
      .eq("id", data.imageId)
      .maybeSingle();
    if (imgErr || !img) throw new Error("Immagine non trovata");

    let publishedUrl = data.useRendered ? img.rendered_image_url : img.original_image_url;
    const fallbackPath = data.useRendered ? img.rendered_storage_path : img.storage_path;
    if (!publishedUrl && fallbackPath) {
      const { data: signed } = await supabaseAdmin.storage
        .from(BUCKET)
        .createSignedUrl(fallbackPath, SIGNED_URL_TTL_SECONDS);
      publishedUrl = signed?.signedUrl ?? null;
    }
    const { error } = await supabaseAdmin
      .from("property_images")
      .update({ use_rendered: data.useRendered, published_image_url: publishedUrl })
      .eq("id", data.imageId);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });