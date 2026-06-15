import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const BUCKET = "property-images";
const SIGNED_URL_TTL_SECONDS = 60 * 60 * 24 * 365 * 5;

const ENHANCE_PROMPT = `You are a professional real-estate photo retoucher.
Improve this real-estate photograph in a SUBTLE, REALISTIC, PROFESSIONAL way — the goal is a polished MLS-quality listing photo, NOT a render.

APPLY (gently):
- mild brightness lift if the photo is dark
- gentle, natural contrast
- white-balance correction: remove yellow / blue / grey color casts
- light sharpening (no halos, no artifacts)
- slight color vibrancy (avoid over-saturation)
- recover shadow and highlight detail without HDR look
- light noise reduction if needed
- only minor perspective correction for obvious leaning verticals — do not warp the scene

ABSOLUTE RULES — DO NOT VIOLATE:
- DO NOT add, remove or move any furniture, objects, walls, doors, windows or architectural elements
- DO NOT change the room layout, geometry, materials or finishes
- DO NOT restage, redecorate or stylize the space
- DO NOT alter the framing significantly (no aggressive crops, no zoom)
- DO NOT change the perceived size of the room
- DO NOT generate a render or an artificial / CGI look
- DO NOT hide structural defects, cracks, stains or damage
- DO NOT replace the view outside the windows
- Keep the exact same camera angle, perspective and proportions
- The output must be visibly the SAME photograph, just cleaner, brighter and more professional

Output: a single photorealistic enhanced version of the input image.`;

async function ensureAdmin(supabase: any, userId: string) {
  const { data: roleRow } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (!roleRow) throw new Error("Solo gli admin possono migliorare le foto");
}

async function enhanceOne(imageId: string): Promise<{ ok: true; enhancedPath: string }> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: img, error } = await supabaseAdmin
    .from("property_images")
    .select("id, property_id, storage_path, use_enhanced")
    .eq("id", imageId)
    .maybeSingle();
  if (error || !img) throw new Error("Immagine non trovata");
  if (!img.storage_path || /^https?:\/\//i.test(img.storage_path)) {
    throw new Error("Sincronizza prima la foto nello storage interno");
  }

  await supabaseAdmin
    .from("property_images")
    .update({ enhancement_status: "processing", enhancement_error: null })
    .eq("id", imageId);

  try {
    const { data: blob, error: dlErr } = await supabaseAdmin.storage
      .from(BUCKET)
      .download(img.storage_path);
    if (dlErr || !blob) throw new Error("Foto originale non trovata nello storage");
    const mime = blob.type || "image/jpeg";
    const bytesIn = new Uint8Array(await blob.arrayBuffer());
    let bin = "";
    for (let i = 0; i < bytesIn.length; i++) bin += String.fromCharCode(bytesIn[i]);
    const dataUrl = `data:${mime};base64,${btoa(bin)}`;

    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("AI non configurata");

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
              { type: "text", text: ENHANCE_PROMPT },
              { type: "image_url", image_url: { url: dataUrl } },
            ],
          },
        ],
      }),
    });
    if (!upstream.ok) {
      const text = await upstream.text();
      throw new Error(`Errore AI ${upstream.status}: ${text.slice(0, 180)}`);
    }
    const json = (await upstream.json()) as { data?: Array<{ b64_json?: string }> };
    const b64 = json.data?.[0]?.b64_json;
    if (!b64) throw new Error("Nessuna immagine restituita");

    const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    const enhancedPath = `${img.property_id}/enhanced/${img.id}-${Date.now()}.png`;
    const { error: upErr } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(enhancedPath, bytes, { contentType: "image/png", upsert: false });
    if (upErr) throw new Error(`Upload fallito: ${upErr.message}`);
    const { data: signed } = await supabaseAdmin.storage
      .from(BUCKET)
      .createSignedUrl(enhancedPath, SIGNED_URL_TTL_SECONDS);

    const baseUpdate = {
      enhanced_storage_path: enhancedPath,
      enhanced_image_url: signed?.signedUrl ?? null,
      enhancement_status: "enhanced",
      enhancement_error: null,
      enhancement_created_at: new Date().toISOString(),
    } as const;
    const { error: updErr } = await supabaseAdmin
      .from("property_images")
      .update(
        img.use_enhanced && signed?.signedUrl
          ? { ...baseUpdate, published_image_url: signed.signedUrl }
          : baseUpdate,
      )
      .eq("id", imageId);
    if (updErr) throw new Error(updErr.message);

    return { ok: true as const, enhancedPath };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Errore miglioramento";
    await supabaseAdmin
      .from("property_images")
      .update({ enhancement_status: "error", enhancement_error: msg })
      .eq("id", imageId);
    throw new Error(msg);
  }
}

export const enhancePropertyImage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { imageId: string }) =>
    z.object({ imageId: z.string().uuid() }).parse(data),
  )
  .handler(async ({ data, context }) => {
    await ensureAdmin(context.supabase, context.userId);
    return enhanceOne(data.imageId);
  });

export const setPropertyImageEnhancedPublished = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { imageId: string; useEnhanced: boolean }) =>
    z.object({ imageId: z.string().uuid(), useEnhanced: z.boolean() }).parse(data),
  )
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await ensureAdmin(context.supabase, context.userId);
    const { data: img, error } = await supabaseAdmin
      .from("property_images")
      .select("storage_path, enhanced_storage_path, enhanced_image_url, original_image_url")
      .eq("id", data.imageId)
      .maybeSingle();
    if (error || !img) throw new Error("Immagine non trovata");
    let publishedUrl = data.useEnhanced ? img.enhanced_image_url : img.original_image_url;
    const fallbackPath = data.useEnhanced ? img.enhanced_storage_path : img.storage_path;
    if (!publishedUrl && fallbackPath) {
      const { data: signed } = await supabaseAdmin.storage
        .from(BUCKET)
        .createSignedUrl(fallbackPath, SIGNED_URL_TTL_SECONDS);
      publishedUrl = signed?.signedUrl ?? null;
    }
    if (data.useEnhanced && !img.enhanced_storage_path) {
      throw new Error("Nessuna foto migliorata disponibile");
    }
    const { error: updErr } = await supabaseAdmin
      .from("property_images")
      .update({ use_enhanced: data.useEnhanced, published_image_url: publishedUrl })
      .eq("id", data.imageId);
    if (updErr) throw new Error(updErr.message);
    return { ok: true as const };
  });

export const enhanceAllImages = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { onlyErrors?: boolean; autoPublish?: boolean; reprocessAll?: boolean; limit?: number } | undefined) =>
    z
      .object({
        onlyErrors: z.boolean().optional(),
        autoPublish: z.boolean().optional(),
        reprocessAll: z.boolean().optional(),
        limit: z.number().int().positive().max(200).optional(),
      })
      .parse(data ?? {}),
  )
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await ensureAdmin(context.supabase, context.userId);

    let query = supabaseAdmin
      .from("property_images")
      .select("id, enhancement_status, storage_path, import_status");
    if (data.onlyErrors) query = query.eq("enhancement_status", "error");
    else if (!data.reprocessAll)
      query = query.in("enhancement_status", ["not_enhanced", "error"]);
    // reprocessAll: no status filter → tutte le foto eleggibili
    const { data: rows, error } = await query;
    if (error) throw new Error(error.message);

    let eligible = (rows ?? []).filter(
      (r) =>
        r.storage_path &&
        !/^https?:\/\//i.test(r.storage_path) &&
        r.import_status !== "external_only",
    );
    if (data.limit && eligible.length > data.limit) eligible = eligible.slice(0, data.limit);

    let enhanced = 0;
    let failed = 0;
    const errors: Array<{ imageId: string; message: string }> = [];
    for (const r of eligible) {
      try {
        await enhanceOne(r.id);
        enhanced++;
      } catch (err) {
        failed++;
        errors.push({
          imageId: r.id,
          message: err instanceof Error ? err.message : "Errore",
        });
      }
    }
    return {
      ok: true as const,
      total: eligible.length,
      skipped: (rows?.length ?? 0) - eligible.length,
      enhanced,
      failed,
      errors,
    };
  });

export const publishAllEnhancedImages = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await ensureAdmin(context.supabase, context.userId);
    // Conteggio totale per il riepilogo (tutte le foto immobili)
    const { count: checked } = await supabaseAdmin
      .from("property_images")
      .select("id", { count: "exact", head: true });
    const { data: rows, error } = await supabaseAdmin
      .from("property_images")
      .select("id, enhanced_storage_path, enhanced_image_url, use_enhanced, published_image_url")
      .not("enhanced_storage_path", "is", null);
    if (error) throw new Error(error.message);
    let published = 0;
    let alreadyPublished = 0;
    const errors: Array<{ imageId: string; message: string }> = [];
    for (const r of rows ?? []) {
      if (!r.enhanced_storage_path) continue;
      let url = r.enhanced_image_url;
      if (!url) {
        const { data: signed } = await supabaseAdmin.storage
          .from(BUCKET)
          .createSignedUrl(r.enhanced_storage_path, SIGNED_URL_TTL_SECONDS);
        url = signed?.signedUrl ?? null;
      }
      if (r.use_enhanced && r.published_image_url === url) {
        alreadyPublished++;
        continue;
      }
      const { error: updErr } = await supabaseAdmin
        .from("property_images")
        .update({ use_enhanced: true, published_image_url: url })
        .eq("id", r.id);
      if (!updErr) published++;
      else errors.push({ imageId: r.id, message: updErr.message });
    }
    const totalChecked = checked ?? 0;
    const withEnhanced = rows?.length ?? 0;
    return {
      ok: true as const,
      checked: totalChecked,
      withEnhanced,
      published,
      alreadyPublished,
      skippedNoEnhanced: Math.max(0, totalChecked - withEnhanced),
      renderingsIgnored: true,
      errors,
    };
  });