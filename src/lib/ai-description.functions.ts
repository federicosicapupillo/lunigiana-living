import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { COMMERCIAL_HIGHLIGHT_SENTENCE_IT } from "@/lib/admin/property-constants";

const Input = z.object({
  propertyId: z.string().uuid(),
  length: z.enum(["breve", "media", "editoriale"]).default("media"),
  tone: z.enum(["neutro", "emozionale", "commerciale"]).default("neutro"),
  seoFocus: z.string().max(200).optional(),
});

type Property = {
  title: string;
  property_type: string | null;
  contract_type: string | null;
  price: number | null;
  price_on_request: boolean;
  municipality: string | null;
  area_zone: string | null;
  province: string | null;
  region: string | null;
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
  short_notes: string | null;
  commercial_highlights: string[] | null;
};

function lengthInstruction(l: string) {
  if (l === "breve") return "Lunghezza: 80–120 parole, due paragrafi al massimo.";
  if (l === "editoriale")
    return "Lunghezza: 350–500 parole, struttura editoriale in 4–5 paragrafi: apertura evocativa, contesto/luogo, descrizione spazi, dettagli architettonici, chiusura su vivibilità.";
  return "Lunghezza: 180–250 parole, 3 paragrafi: apertura, descrizione dell'immobile, contesto e vivibilità.";
}

function toneInstruction(t: string) {
  if (t === "emozionale")
    return "Tono: emozionale e raffinato, evocativo, sensoriale, letterario. Usa immagini concrete (luce, materiali, silenzio). Evita aggettivi vuoti.";
  if (t === "commerciale")
    return "Tono: commerciale premium, persuasivo ma elegante. Sottolinea il valore, l'unicità e l'opportunità senza essere insistente.";
  return "Tono: neutro professionale, asciutto e informativo. Frasi nitide, autorevoli, mai banali.";
}

function buildFactList(p: Property, features: Array<{ feature_name: string; feature_value: string | null }>) {
  const facts: string[] = [];
  if (p.property_type) facts.push(`Tipologia: ${p.property_type}`);
  if (p.contract_type) facts.push(`Contratto: ${p.contract_type}`);
  if (p.municipality) facts.push(`Comune: ${p.municipality}${p.province ? ` (${p.province})` : ""}`);
  if (p.area_zone) facts.push(`Zona: ${p.area_zone}`);
  if (p.size_sqm) facts.push(`Superficie: ${p.size_sqm} m²`);
  if (p.bedrooms != null) facts.push(`Camere da letto: ${p.bedrooms}`);
  if (p.bathrooms != null) facts.push(`Bagni: ${p.bathrooms}`);
  if (p.floors != null) facts.push(`Piani: ${p.floors}`);
  if (p.energy_class) facts.push(`Classe energetica: ${p.energy_class}`);
  if (p.condition) facts.push(`Stato: ${p.condition}`);
  if (!p.price_on_request && p.price) facts.push(`Prezzo: € ${p.price.toLocaleString("it-IT")}`);
  if (p.price_on_request) facts.push(`Prezzo: su richiesta`);

  const dotazioni: string[] = [];
  if (p.panoramic_view) dotazioni.push("vista panoramica");
  if (p.historic_property) dotazioni.push("immobile storico");
  if (p.garden) dotazioni.push("giardino");
  if (p.terrace) dotazioni.push("terrazzo");
  if (p.balcony) dotazioni.push("balcone");
  if (p.garage) dotazioni.push("garage");
  if (p.cellar) dotazioni.push("cantina");
  if (p.elevator) dotazioni.push("ascensore");
  if (p.furnished) dotazioni.push("arredato");
  if (dotazioni.length) facts.push(`Dotazioni: ${dotazioni.join(", ")}`);

  if (p.short_notes) facts.push(`Note rapide: ${p.short_notes}`);

  const narrative = features
    .filter((f) => f.feature_value && f.feature_value.trim().length > 0)
    .map((f) => `${f.feature_name.replace(/_/g, " ")}: ${f.feature_value}`);

  const highlightSentences: string[] = (p.commercial_highlights ?? [])
    .map((h) => COMMERCIAL_HIGHLIGHT_SENTENCE_IT[h])
    .filter((s): s is string => !!s);

  return { facts, narrative, highlightSentences };
}

export const generateDescription = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => Input.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase } = context;

    // Admin role check (defence in depth on top of RLS)
    const { data: roleRow } = await supabase
      .from("user_roles")
      .select("role")
      .eq("role", "admin")
      .maybeSingle();
    if (!roleRow) throw new Error("Accesso negato: ruolo admin richiesto.");

    const { data: prop, error: e1 } = await supabase
      .from("properties")
      .select("*")
      .eq("id", data.propertyId)
      .maybeSingle();
    if (e1 || !prop) throw new Error("Immobile non trovato.");

    const { data: feats } = await supabase
      .from("property_features")
      .select("feature_name, feature_value")
      .eq("property_id", data.propertyId);

    const { facts, narrative, highlightSentences } = buildFactList(prop as Property, feats ?? []);

    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("Configurazione AI mancante.");

    const systemPrompt = `Sei un copywriter immobiliare italiano di fascia alta, specializzato in case di carattere in Lunigiana, Toscana e nord Italia. Scrivi annunci eleganti, concreti e mai banali. Eviti il linguaggio standard delle agenzie ("splendida soluzione", "occasione unica", "ottimo affare"). Valorizzi materiali, luce, contesto, vivibilità, atmosfera. Non inventi MAI dati che non ti sono stati forniti: se un dato manca, lo ometti. Scrivi sempre in italiano corretto e fluente, con paragrafi separati da una riga vuota.`;

    const userPrompt = [
      `Titolo annuncio: ${prop.title}`,
      "",
      "DATI CERTI DELL'IMMOBILE (usa solo questi, non inventarne altri):",
      ...facts.map((f) => `- ${f}`),
      "",
      narrative.length
        ? `INDICAZIONI NARRATIVE / COMMERCIALI:\n${narrative.map((n) => `- ${n}`).join("\n")}`
        : "",
      "",
      highlightSentences.length
        ? `FRASI DI VALORIZZAZIONE COMMERCIALE DA INTEGRARE CON NATURALEZZA NEL TESTO (riformulale leggermente, NON copiarle alla lettera, NON elencarle):\n${highlightSentences.map((s) => `- ${s}`).join("\n")}`
        : "",
      "",
      "ISTRUZIONI DI SCRITTURA:",
      `- ${lengthInstruction(data.length)}`,
      `- ${toneInstruction(data.tone)}`,
      data.seoFocus ? `- Inserisci con naturalezza il focus SEO: "${data.seoFocus}"` : "",
      "- Non usare elenchi puntati. Solo prosa.",
      "- Non firmare il testo, non aggiungere call-to-action commerciali.",
      "- Se l'immobile è in Lunigiana, valorizza il territorio (borghi, panorami, qualità del vivere) solo se coerente con i dati forniti.",
      "",
      "Scrivi ora la descrizione finale dell'annuncio.",
    ]
      .filter(Boolean)
      .join("\n");

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      if (res.status === 429) throw new Error("Limite richieste AI raggiunto, riprova fra poco.");
      if (res.status === 402) throw new Error("Crediti AI esauriti per il workspace.");
      throw new Error(`Errore generazione AI (${res.status}): ${errText.slice(0, 200)}`);
    }

    const json = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const text = json.choices?.[0]?.message?.content?.trim() ?? "";
    if (!text) throw new Error("Risposta AI vuota.");

    // Persist
    const { error: upErr } = await supabase
      .from("property_descriptions")
      .upsert(
        {
          property_id: data.propertyId,
          generated_description: text,
          tone_of_voice: data.tone,
          length_preference: data.length,
          seo_focus: data.seoFocus ?? null,
          language: "it",
          generated_at: new Date().toISOString(),
        },
        { onConflict: "property_id" },
      );
    if (upErr) throw new Error(`Salvataggio fallito: ${upErr.message}`);

    return { description: text };
  });