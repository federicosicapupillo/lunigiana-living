import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

type ChatMsg = { role: "system" | "user" | "assistant"; content: string };
type GwContent =
  | { type: "text"; text: string }
  | { type: "input_audio"; input_audio: { data: string; format: string } };
type GwMsg = { role: "system" | "user" | "assistant"; content: string | GwContent[] };

const SYSTEM_PROMPT = `Sei l'assistente IA interno dell'agenzia Furia Immobiliare (Lunigiana, Toscana).
Aiuti Elena a creare la bozza di un nuovo annuncio immobiliare facendo domande SEMPLICI, una alla volta o in piccoli blocchi tematici.

Procedi in questi blocchi, in ordine:
1) Tipo operazione (vendita / affitto)
2) Tipologia immobile (appartamento, villa, rustico, casa indipendente, villetta a schiera, terreno, fondo commerciale, ecc.)
3) Localizzazione (regione, provincia, comune, frazione/zona, indirizzo, se mostrare indirizzo pubblico)
4) Prezzo (valore reale, e se mostrarlo o tenerlo come "Prezzo su richiesta" — il valore reale resta comunque salvato)
5) Superfici e spazi (mq, locali, camere, bagni, piani; dotazioni: balcone, terrazza, giardino, garage, cantina, posto auto, ecc.)
6) Stato (nuovo / ristrutturato / abitabile / da rinfrescare / da ristrutturare), arredamento, classe energetica, indice prestazione energetica
7) Caratteristiche extra (vista panoramica, centro storico, collina, indipendente, ideale prima casa/seconda casa/investimento/casa vacanza, ecc.)
8) Racconto commerciale (punto forte, target ideale, aspetti da valorizzare, aspetti da non enfatizzare)
9) Note private (solo per l'agenzia, mai pubblicate) — opzionale

Regole tassative:
- Fai poche domande per turno (max 3) e usa un tono cortese, professionale, conciso.
- Non inventare MAI dati: se Elena non risponde, lascia il campo vuoto.
- Non inventare prezzo, mq, classe energetica, camere, bagni, indirizzo.
- Quando un blocco è completo, riepiloga brevemente in 1-2 righe e passa al successivo.
- Quando hai raccolto tutti i blocchi (o Elena dice "basta così" / "genera"), rispondi SOLO con questa riga su una nuova riga finale:
  [PRONTO_PER_RIEPILOGO]
- Non scrivere mai JSON o codice nella chat. La generazione strutturata avviene in un secondo passaggio.`;

async function callGateway(messages: GwMsg[] | ChatMsg[], jsonMode = false): Promise<string> {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) throw new Error("Configurazione AI mancante.");
  const body: Record<string, unknown> = {
    model: "google/gemini-2.5-flash",
    messages,
  };
  if (jsonMode) body.response_format = { type: "json_object" };
  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    if (res.status === 429) throw new Error("Limite richieste AI raggiunto, riprova tra poco.");
    if (res.status === 402) throw new Error("Crediti AI esauriti per il workspace.");
    throw new Error(`Errore AI (${res.status}): ${t.slice(0, 200)}`);
  }
  const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const text = json.choices?.[0]?.message?.content?.trim() ?? "";
  if (!text) throw new Error("Risposta AI vuota.");
  return text;
}

const ChatInput = z.object({
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string().min(1).max(8000),
    }),
  ).min(1).max(60),
});

export const aiAssistantReply = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => ChatInput.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: roleRow } = await supabase.from("user_roles").select("role").eq("role", "admin").maybeSingle();
    if (!roleRow) throw new Error("Accesso negato: ruolo admin richiesto.");
    const msgs: ChatMsg[] = [
      { role: "system", content: SYSTEM_PROMPT },
      ...data.messages,
    ];
    const reply = await callGateway(msgs);
    return { reply };
  });

const DraftSchemaPrompt = `Estrai dalla conversazione i dati per creare la BOZZA di un annuncio immobiliare.
Rispondi SOLO con un oggetto JSON valido, senza testo aggiuntivo.
Schema richiesto (usa null o stringa vuota per i campi non emersi nella conversazione — NON inventare):
{
  "title": string,
  "contract_type": "Vendita" | "Affitto" | null,
  "property_type": string | null,
  "price": number | null,
  "price_on_request": boolean,
  "region": string | null,
  "province": string | null,
  "municipality": string | null,
  "locality": string | null,
  "area_zone": string | null,
  "postal_code": string | null,
  "address": string | null,
  "show_full_address": boolean,
  "size_sqm": number | null,
  "bedrooms": number | null,
  "bathrooms": number | null,
  "floors": number | null,
  "condition": string | null,
  "energy_class": string | null,
  "furnished": boolean,
  "garden": boolean,
  "terrace": boolean,
  "balcony": boolean,
  "garage": boolean,
  "cellar": boolean,
  "elevator": boolean,
  "panoramic_view": boolean,
  "historic_property": boolean,
  "public_description": string,
  "short_preview": string,
  "meta_description": string,
  "highlights": string,
  "target_buyer": string,
  "internal_notes": string
}

Regole:
- title: titolo commerciale elegante, in italiano, ~60 caratteri (es. "Villetta a schiera con giardino in contesto riservato"). Non inventare elementi non emersi.
- public_description: descrizione pubblica in prosa, elegante, concreta, 150–300 parole, senza elenchi puntati e senza dati non forniti.
- short_preview: 1–2 frasi (max 200 caratteri) per le card.
- meta_description: max 155 caratteri, naturale, con luogo se noto.
- price: numero in euro (intero), o null se non fornito.
- price_on_request: true SOLO se Elena ha chiesto di non mostrare il prezzo pubblicamente.
- internal_notes: SOLO eventuali note private fornite da Elena; mai testo pubblico.
- Non inventare classe energetica, mq, prezzo, camere, bagni, indirizzo.`;

const FinalizeInput = z.object({
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string().min(1).max(8000),
    }),
  ).min(1).max(60),
});

export type AiDraft = {
  title: string;
  contract_type: string | null;
  property_type: string | null;
  price: number | null;
  price_on_request: boolean;
  region: string | null;
  province: string | null;
  municipality: string | null;
  locality: string | null;
  area_zone: string | null;
  postal_code: string | null;
  address: string | null;
  show_full_address: boolean;
  size_sqm: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  floors: number | null;
  condition: string | null;
  energy_class: string | null;
  furnished: boolean;
  garden: boolean;
  terrace: boolean;
  balcony: boolean;
  garage: boolean;
  cellar: boolean;
  elevator: boolean;
  panoramic_view: boolean;
  historic_property: boolean;
  public_description: string;
  short_preview: string;
  meta_description: string;
  highlights: string;
  target_buyer: string;
  internal_notes: string;
};

export const aiAssistantFinalize = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => FinalizeInput.parse(input))
  .handler(async ({ data, context }): Promise<{ draft: AiDraft }> => {
    const { supabase } = context;
    const { data: roleRow } = await supabase.from("user_roles").select("role").eq("role", "admin").maybeSingle();
    if (!roleRow) throw new Error("Accesso negato: ruolo admin richiesto.");
    const transcript = data.messages
      .map((m) => `${m.role === "user" ? "Elena" : "Assistente"}: ${m.content}`)
      .join("\n");
    const reply = await callGateway(
      [
        { role: "system", content: DraftSchemaPrompt },
        { role: "user", content: `Conversazione raccolta:\n\n${transcript}\n\nRestituisci ora il JSON della bozza.` },
      ],
      true,
    );
    let parsed: AiDraft;
    try {
      parsed = JSON.parse(reply) as AiDraft;
    } catch {
      throw new Error("Risposta IA non in formato JSON valido. Riprova.");
    }
    return { draft: parsed };
  });

const ApplyInput = z.object({
  draft: z.record(z.any()),
  messages: z.array(z.object({ role: z.string(), content: z.string() })).max(60),
  aiInputType: z.enum(["text", "audio"]).optional(),
  audioTranscript: z.string().max(20000).optional(),
});

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

export const aiAssistantApplyDraft = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => ApplyInput.parse(input))
  .handler(async ({ data, context }): Promise<{ propertyId: string }> => {
    const { supabase, userId } = context;
    const { data: roleRow } = await supabase.from("user_roles").select("role").eq("role", "admin").maybeSingle();
    if (!roleRow) throw new Error("Accesso negato: ruolo admin richiesto.");

    const d = data.draft as Partial<AiDraft>;
    const title = (d.title && String(d.title).trim()) || "Nuovo immobile (IA)";

    const payload: Record<string, unknown> = {
      title,
      slug: slugify([title, d.municipality ?? ""].filter(Boolean).join(" ") || "immobile") + "-" + Math.random().toString(36).slice(2, 6),
      status: "draft",
      created_with_ai: true,
      ai_generated_at: new Date().toISOString(),
      ai_generation_notes: { messages: data.messages, draft: d },
      ai_input_type: data.aiInputType ?? "text",
      ai_audio_transcript: data.audioTranscript ?? null,
      property_type: d.property_type ?? null,
      contract_type: d.contract_type ?? null,
      price: typeof d.price === "number" ? d.price : null,
      price_on_request: !!d.price_on_request,
      region: d.region ?? null,
      province: d.province ?? null,
      municipality: d.municipality ?? null,
      locality: d.locality ?? null,
      area_zone: d.area_zone ?? null,
      postal_code: d.postal_code ?? null,
      address: d.address ?? null,
      show_full_address: !!d.show_full_address,
      size_sqm: typeof d.size_sqm === "number" ? d.size_sqm : null,
      bedrooms: typeof d.bedrooms === "number" ? d.bedrooms : null,
      bathrooms: typeof d.bathrooms === "number" ? d.bathrooms : null,
      floors: typeof d.floors === "number" ? d.floors : null,
      condition: d.condition ?? null,
      energy_class: d.energy_class ?? null,
      furnished: !!d.furnished,
      garden: !!d.garden,
      terrace: !!d.terrace,
      balcony: !!d.balcony,
      garage: !!d.garage,
      cellar: !!d.cellar,
      elevator: !!d.elevator,
      panoramic_view: !!d.panoramic_view,
      historic_property: !!d.historic_property,
      short_notes: d.short_preview ? String(d.short_preview).slice(0, 280) : null,
      internal_notes: d.internal_notes ? String(d.internal_notes) : null,
      created_by: userId,
    };

    const { data: inserted, error } = await supabase
      .from("properties")
      .insert(payload as never)
      .select("id")
      .single();
    if (error || !inserted) throw new Error(`Salvataggio bozza fallito: ${error?.message ?? ""}`);
    const propertyId = inserted.id as string;

    // Save AI public description into property_descriptions
    if (d.public_description) {
      await supabase.from("property_descriptions").upsert(
        {
          property_id: propertyId,
          generated_description: String(d.public_description),
          edited_description: null,
          tone_of_voice: "emozionale",
          length_preference: "media",
          seo_focus: d.meta_description ? String(d.meta_description).slice(0, 200) : null,
          language: "it",
          generated_at: new Date().toISOString(),
        },
        { onConflict: "property_id" },
      );
    }

    // Save narrative features
    const feats: Array<{ property_id: string; feature_name: string; feature_value: string }> = [];
    const pushIf = (k: string, v: string | null | undefined) => {
      if (v && String(v).trim()) feats.push({ property_id: propertyId, feature_name: k, feature_value: String(v).trim() });
    };
    pushIf("highlights", d.highlights);
    pushIf("target_buyer", d.target_buyer);
    pushIf("meta_description", d.meta_description);
    pushIf("short_preview", d.short_preview);
    if (feats.length) await supabase.from("property_features").insert(feats);

    return { propertyId };
  });