import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createHash } from "crypto";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { getPublishedProperty, type PublicProperty } from "@/lib/public-properties.functions";

/**
 * Public, no-auth server function: returns a PublicProperty fully translated
 * to the requested language. For lang='it' it's a passthrough. For lang='en'
 * it lazily fills the *_en cache columns and the translation_cache table.
 *
 * Falls back silently to Italian on any failure (network, AI errors, etc.)
 * so the page never breaks.
 */
const InputSchema = z.object({
  id: z.string().min(1).max(128),
  lang: z.enum(["it", "en"]).default("en"),
});

const MODEL = "google/gemini-3-flash-preview";
const ENDPOINT = "https://ai.gateway.lovable.dev/v1/chat/completions";

function hashText(text: string): string {
  return createHash("sha256").update(text.trim().toLowerCase()).digest("hex");
}

async function callAI(system: string, user: string): Promise<string | null> {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) return null;
  try {
    const r = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": apiKey,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        response_format: { type: "json_object" },
      }),
    });
    if (!r.ok) return null;
    const json = (await r.json()) as { choices?: Array<{ message?: { content?: string } }> };
    return json.choices?.[0]?.message?.content ?? null;
  } catch {
    return null;
  }
}

/** Translate property long-form texts and persist into *_en columns. Idempotent. */
async function ensurePropertyEnglish(p: PublicProperty): Promise<{
  title?: string; subtitleEn?: string | null; summaryEn?: string | null;
  locationDescriptionEn?: string | null; descriptionEn?: string | null;
}> {
  const needsTitle = !p.titleEn && !!p.title;
  const needsDesc = !p.descriptionEn && !!p.description;
  // subtitleEn/summaryEn/locationDescriptionEn are already on PublicProperty; if not set, we'll fill from AI when present in source. Source-side data for these is not currently exposed on PublicProperty, so we only translate title + description here (the visible parts). Subtitle/summary/locationDescription remain whatever the EN cache has.

  if (!needsTitle && !needsDesc) {
    return {
      title: p.titleEn ?? undefined,
      subtitleEn: p.subtitleEn,
      summaryEn: p.summaryEn,
      locationDescriptionEn: p.locationDescriptionEn,
      descriptionEn: p.descriptionEn,
    };
  }

  const system =
    "You are a professional real-estate copywriter translating Italian property listings to elegant, natural English. " +
    "Preserve tone and terminology. Keep proper nouns (place names) in Italian. Do not invent details. " +
    "Return ONLY JSON: { \"title_en\": string, \"description_en\": string }. Empty string if input field is empty.";
  const user = JSON.stringify({
    title_it: p.title ?? "",
    description_it: p.description ?? "",
  });
  const raw = await callAI(system, user);
  if (!raw) return { subtitleEn: p.subtitleEn, summaryEn: p.summaryEn, locationDescriptionEn: p.locationDescriptionEn, descriptionEn: p.descriptionEn };

  let parsed: { title_en?: string; description_en?: string } = {};
  try { parsed = JSON.parse(raw); } catch { /* keep empty */ }

  const newTitle = needsTitle ? (parsed.title_en || "").trim() || null : p.titleEn;
  const newDesc = needsDesc ? (parsed.description_en || "").trim() || null : p.descriptionEn;

  // Persist into DB cache (best-effort; ignore errors)
  try {
    if (needsTitle && newTitle) {
      await supabaseAdmin.from("properties").update({ title_en: newTitle }).eq("id", p.id);
    }
    if (needsDesc && newDesc) {
      // property_descriptions row may not exist; upsert by property_id
      await supabaseAdmin
        .from("property_descriptions")
        .upsert({ property_id: p.id, description_en: newDesc }, { onConflict: "property_id" });
    }
  } catch { /* ignore */ }

  return {
    title: newTitle ?? undefined,
    subtitleEn: p.subtitleEn,
    summaryEn: p.summaryEn,
    locationDescriptionEn: p.locationDescriptionEn,
    descriptionEn: newDesc,
  };
}

/** Translate a list of short strings using translation_cache + a single AI call for misses. */
async function translateShortStrings(texts: string[]): Promise<Record<string, string>> {
  const unique = Array.from(new Set(texts.map((t) => t.trim()).filter(Boolean)));
  if (unique.length === 0) return {};
  const hashes = unique.map((t) => ({ text: t, hash: hashText(t) }));

  const out: Record<string, string> = {};
  try {
    const { data: cached } = await supabaseAdmin
      .from("translation_cache")
      .select("source_hash, translated_text")
      .eq("target_lang", "en")
      .in("source_hash", hashes.map((h) => h.hash));
    const cachedMap = new Map((cached ?? []).map((r) => [r.source_hash, r.translated_text]));
    for (const { text, hash } of hashes) {
      const hit = cachedMap.get(hash);
      if (hit) out[text] = hit;
    }
  } catch { /* ignore cache read errors */ }

  const missing = hashes.filter(({ text }) => !out[text]);
  if (missing.length === 0) return out;

  const system =
    "You translate short Italian real-estate labels and tags (amenities, features, badges) to natural English. " +
    "Keep them short, idiomatic, and in the same Title Case style as the input. Keep Italian proper nouns. " +
    "Return ONLY JSON: { \"translations\": [string, ...] } in the SAME ORDER as the input array.";
  const user = JSON.stringify({ items: missing.map((m) => m.text) });
  const raw = await callAI(system, user);
  if (!raw) return out;

  let translated: string[] = [];
  try {
    const parsed = JSON.parse(raw) as { translations?: string[] };
    translated = Array.isArray(parsed.translations) ? parsed.translations : [];
  } catch { /* leave empty */ }

  const rowsToInsert: Array<{ source_hash: string; target_lang: string; source_text: string; translated_text: string }> = [];
  for (let i = 0; i < missing.length; i++) {
    const src = missing[i].text;
    const dst = (translated[i] || "").trim();
    if (!dst) continue;
    out[src] = dst;
    rowsToInsert.push({
      source_hash: missing[i].hash,
      target_lang: "en",
      source_text: src,
      translated_text: dst,
    });
  }
  if (rowsToInsert.length > 0) {
    try {
      await supabaseAdmin
        .from("translation_cache")
        .upsert(rowsToInsert, { onConflict: "source_hash,target_lang" });
    } catch { /* ignore */ }
  }
  return out;
}

function applyEn(p: PublicProperty, longEn: Awaited<ReturnType<typeof ensurePropertyEnglish>>, shortMap: Record<string, string>): PublicProperty {
  const tr = (s: string) => shortMap[s.trim()] || s;
  return {
    ...p,
    title: longEn.title || p.titleEn || p.title,
    description: longEn.descriptionEn || p.descriptionEn || p.description,
    price: p.isRent ? p.price.replace("/ mese", "/ month").replace("Prezzo su richiesta", "Price on request") : p.price.replace("Prezzo su richiesta", "Price on request"),
    priceRent: p.priceRent ? p.priceRent.replace("/ mese", "/ month") : p.priceRent,
    amenities: p.amenities.map(tr),
    altreDotazioni: p.altreDotazioni ? tr(p.altreDotazioni) : p.altreDotazioni,
    tag: p.tag ? tr(p.tag) : p.tag,
    highlights: p.highlights.map((h) => ({ ...h, items: h.items.map(tr) })),
  };
}

export const getLocalizedProperty = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => InputSchema.parse(data))
  .handler(async ({ data }) => {
    const { property } = await getPublishedProperty({ data: { id: data.id } });
    if (!property) return { property: null };
    if (data.lang === "it") return { property };

    try {
      const longEn = await ensurePropertyEnglish(property);
      const shortInputs: string[] = [
        ...property.amenities,
        ...property.highlights.flatMap((h) => h.items),
        ...(property.altreDotazioni ? [property.altreDotazioni] : []),
        ...(property.tag ? [property.tag] : []),
      ];
      const shortMap = await translateShortStrings(shortInputs);
      return { property: applyEn(property, longEn, shortMap) };
    } catch {
      // Total failure → return IT property (fallback)
      return { property };
    }
  });