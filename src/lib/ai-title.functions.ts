import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { buildFallbackTitle } from "@/lib/property-title";

const Input = z.object({ propertyId: z.string().uuid() });

export const generateTitle = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => Input.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase } = context;

    const { data: roleRow } = await supabase
      .from("user_roles")
      .select("role")
      .eq("role", "admin")
      .maybeSingle();
    if (!roleRow) throw new Error("Accesso negato: ruolo admin richiesto.");

    const { data: p, error: e1 } = await supabase
      .from("properties")
      .select(
        "property_type, contract_type, municipality, area_zone, province, bedrooms, bathrooms, size_sqm, condition, panoramic_view, historic_property, garden, terrace, balcony, garage, cellar, elevator, furnished, short_notes",
      )
      .eq("id", data.propertyId)
      .maybeSingle();
    if (e1 || !p) throw new Error("Immobile non trovato.");

    const fallback = buildFallbackTitle(p as never);
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) return { title: fallback, source: "fallback" as const };

    const facts: string[] = [];
    if (p.property_type) facts.push(`Tipologia: ${p.property_type}`);
    if (p.contract_type) facts.push(`Contratto: ${p.contract_type}`);
    if (p.municipality)
      facts.push(`Comune: ${p.municipality}${p.province ? ` (${p.province})` : ""}`);
    if (p.area_zone) facts.push(`Zona: ${p.area_zone}`);
    if (p.size_sqm) facts.push(`Superficie: ${p.size_sqm} m²`);
    if (p.bedrooms != null) facts.push(`Camere: ${p.bedrooms}`);
    if (p.bathrooms != null) facts.push(`Bagni: ${p.bathrooms}`);
    if (p.condition) facts.push(`Stato: ${p.condition}`);
    const dot: string[] = [];
    if (p.panoramic_view) dot.push("vista panoramica");
    if (p.historic_property) dot.push("storico");
    if (p.garden) dot.push("giardino");
    if (p.terrace) dot.push("terrazzo");
    if (p.balcony) dot.push("balcone");
    if (p.garage) dot.push("garage");
    if (p.cellar) dot.push("cantina");
    if (p.elevator) dot.push("ascensore");
    if (p.furnished) dot.push("arredato");
    if (dot.length) facts.push(`Dotazioni: ${dot.join(", ")}`);
    if (p.short_notes) facts.push(`Note: ${p.short_notes.slice(0, 200)}`);

    const system =
      "Sei un copywriter immobiliare italiano. Generi titoli annuncio brevi, chiari, professionali, adatti ai portali immobiliari (Idealista, Immobiliare.it). Niente frasi commerciali esagerate, niente promesse, niente emoji, niente punto finale. Massimo 70 caratteri. Una sola riga. Non inventare dati non forniti.";
    const userPrompt = [
      "Genera UN solo titolo annuncio in italiano, max 70 caratteri.",
      "Restituisci SOLO il titolo, senza virgolette né spiegazioni.",
      "",
      "Dati immobile:",
      ...facts.map((f) => `- ${f}`),
    ].join("\n");

    try {
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: system },
            { role: "user", content: userPrompt },
          ],
        }),
      });
      if (!res.ok) {
        if (res.status === 429) throw new Error("Limite richieste AI raggiunto, riprova fra poco.");
        if (res.status === 402) throw new Error("Crediti AI esauriti per il workspace.");
        return { title: fallback, source: "fallback" as const };
      }
      const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
      let text = json.choices?.[0]?.message?.content?.trim() ?? "";
      // strip wrapping quotes and trailing punctuation
      text = text.replace(/^["'«»\s]+|["'«»\s]+$/g, "").replace(/\.+$/, "");
      // single line
      text = text.split(/\r?\n/)[0].trim();
      if (text.length > 90) text = text.slice(0, 87).trimEnd() + "…";
      if (!text) return { title: fallback, source: "fallback" as const };
      return { title: text, source: "ai" as const };
    } catch (err) {
      if (err instanceof Error && /AI/.test(err.message)) throw err;
      return { title: fallback, source: "fallback" as const };
    }
  });