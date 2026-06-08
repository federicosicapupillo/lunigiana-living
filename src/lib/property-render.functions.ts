import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const RENDER_STYLES = [
  { id: "home_staging", label: "Home staging elegante" },
  { id: "rustico", label: "Rustico raffinato" },
  { id: "moderno", label: "Moderno luminoso" },
  { id: "esterno", label: "Esterno curato" },
  { id: "giardino", label: "Giardino valorizzato" },
  { id: "ristrutturazione", label: "Ristrutturazione leggera" },
  { id: "neutro", label: "Rendering neutro" },
] as const;

export type RenderStyleId = (typeof RENDER_STYLES)[number]["id"];

const STRUCTURE_RULE =
  "STRUCTURAL FIDELITY (mandatory): keep the original photograph's architecture, perspective, camera angle, focal length, framing and proportions IDENTICAL. Do not move, add or remove walls, ceilings, floors, windows, doors, stairs, columns, beams or openings. Do not change the function/typology of the space. Preserve the view beyond windows and the structural materials of walls, floor and ceiling.";

const STYLE_PROMPTS: Record<RenderStyleId, string> = {
  home_staging:
    "Elegant Italian home staging: refined contemporary furniture, warm neutral palette, soft natural daylight, curated decor, magazine-quality interior photography.",
  rustico:
    "Refined rustic Lunigiana interior: aged chestnut wood furniture, natural linen textiles in cream and terracotta, handcrafted ceramics, exposed beams or stone where appropriate, warm tungsten lighting.",
  moderno:
    "Modern luminous interior: clean minimal furniture, white and pale oak palette, abundant natural light, sleek matte finishes, sculptural single statement piece, editorial photorealistic photography.",
  esterno:
    "Curated outdoor area: tidy paved or stone surfaces, elegant outdoor furniture in neutral tones, large terracotta planters with Mediterranean greenery, warm late-afternoon natural light.",
  giardino:
    "Valorized garden: lush manicured lawn, olive trees, lavender and rosemary borders, stone paths, soft natural light, photorealistic landscape photography that elevates the existing garden.",
  ristrutturazione:
    "Light refurbishment preview: freshly painted walls in warm white, refinished floors, updated fixtures, clean window frames — same room, visibly cleaner and renovated, no structural changes.",
  neutro:
    "Neutral professional real-estate rendering: clean depersonalized styling, neutral palette, soft natural light, minimal essential furniture only, suitable for any buyer.",
};

function buildPrompt(style: RenderStyleId): string {
  return `${STRUCTURE_RULE}\n\nSTYLE — ${STYLE_PROMPTS[style]}\n\nThis is a full restyling, not a light retouch: replace existing furniture and decor with a cohesive new set in the chosen style while keeping the room's structure identical.`;
}

export const renderPropertyImage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { imageId: string; style: RenderStyleId }) =>
    z
      .object({
        imageId: z.string().uuid(),
        style: z.enum(RENDER_STYLES.map((s) => s.id) as [RenderStyleId, ...RenderStyleId[]]),
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
      .select("id, property_id, storage_path")
      .eq("id", data.imageId)
      .maybeSingle();
    if (imgErr || !img) throw new Error("Immagine non trovata");

    await supabaseAdmin
      .from("property_images")
      .update({ render_status: "processing", render_error: null })
      .eq("id", data.imageId);

    try {
      const { data: blob, error: dlErr } = await supabaseAdmin.storage
        .from("property-images")
        .download(img.storage_path);
      if (dlErr || !blob) throw new Error(`Download fallito: ${dlErr?.message ?? "n/d"}`);
      const buf = new Uint8Array(await blob.arrayBuffer());
      let bin = "";
      for (let i = 0; i < buf.length; i++) bin += String.fromCharCode(buf[i]);
      const dataUrl = `data:${blob.type || "image/jpeg"};base64,${btoa(bin)}`;

      const key = process.env.LOVABLE_API_KEY;
      if (!key) throw new Error("AI non configurata");

      const prompt = buildPrompt(data.style);
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
        .from("property-images")
        .upload(renderedPath, bytes, { contentType: "image/png", upsert: false });
      if (upErr) throw new Error(`Upload rendering fallito: ${upErr.message}`);

      const { error: updErr } = await supabaseAdmin
        .from("property_images")
        .update({
          rendered_storage_path: renderedPath,
          render_status: "done",
          render_style: data.style,
          render_error: null,
          render_created_at: new Date().toISOString(),
        })
        .eq("id", data.imageId);
      if (updErr) throw new Error(updErr.message);

      return { ok: true as const, renderedPath };
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Errore";
      await supabaseAdmin
        .from("property_images")
        .update({ render_status: "error", render_error: msg })
        .eq("id", data.imageId);
      throw new Error(msg);
    }
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
    const { error } = await supabaseAdmin
      .from("property_images")
      .update({ use_rendered: data.useRendered })
      .eq("id", data.imageId);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });