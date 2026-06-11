import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const InputSchema = z.object({
  title: z.string().max(500).optional().nullable(),
  subtitle: z.string().max(500).optional().nullable(),
  summary: z.string().max(2000).optional().nullable(),
  locationDescription: z.string().max(4000).optional().nullable(),
  description: z.string().max(20000).optional().nullable(),
});

type Out = {
  title_en: string;
  subtitle_en: string;
  summary_en: string;
  location_description_en: string;
  description_en: string;
};

/**
 * Translates Italian property texts to English using Lovable AI Gateway.
 * Returns the EN equivalents; preserves real estate tone and terminology.
 * Requires admin role.
 */
export const translatePropertyToEnglish = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => InputSchema.parse(data))
  .handler(async ({ data, context }): Promise<Out> => {
    // Authorize admin
    const { data: isAdmin, error: roleErr } = await context.supabase
      .rpc("has_role", { _user_id: context.userId, _role: "admin" as never });
    if (roleErr || !isAdmin) throw new Error("Forbidden");

    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("AI service not configured");

    const fields = {
      title: (data.title ?? "").trim(),
      subtitle: (data.subtitle ?? "").trim(),
      summary: (data.summary ?? "").trim(),
      locationDescription: (data.locationDescription ?? "").trim(),
      description: (data.description ?? "").trim(),
    };

    const anyContent = Object.values(fields).some((v) => v.length > 0);
    if (!anyContent) {
      return {
        title_en: "",
        subtitle_en: "",
        summary_en: "",
        location_description_en: "",
        description_en: "",
      };
    }

    const systemPrompt =
      "You are a professional real estate copywriter translating Italian property listings into elegant, natural English for an international audience. " +
      "Preserve tone, atmosphere and real estate terminology. Keep proper nouns (place names, regions) as in Italian. " +
      "Do NOT add information that is not present in the source. If a field is empty, return an empty string for it. " +
      "Return ONLY a JSON object with keys: title_en, subtitle_en, summary_en, location_description_en, description_en. No prose, no markdown.";

    const userPrompt = JSON.stringify({
      title_it: fields.title,
      subtitle_it: fields.subtitle,
      summary_it: fields.summary,
      location_description_it: fields.locationDescription,
      description_it: fields.description,
    });

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": apiKey,
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!resp.ok) {
      const txt = await resp.text().catch(() => "");
      if (resp.status === 429) throw new Error("Rate limit. Riprova tra qualche secondo.");
      if (resp.status === 402) throw new Error("Crediti AI esauriti.");
      throw new Error(`AI error ${resp.status}: ${txt.slice(0, 200)}`);
    }

    const json = (await resp.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const content = json.choices?.[0]?.message?.content ?? "{}";
    let parsed: Partial<Out> = {};
    try {
      parsed = JSON.parse(content) as Partial<Out>;
    } catch {
      throw new Error("AI ha restituito un output non valido.");
    }

    return {
      title_en: String(parsed.title_en ?? "").trim(),
      subtitle_en: String(parsed.subtitle_en ?? "").trim(),
      summary_en: String(parsed.summary_en ?? "").trim(),
      location_description_en: String(parsed.location_description_en ?? "").trim(),
      description_en: String(parsed.description_en ?? "").trim(),
    };
  });