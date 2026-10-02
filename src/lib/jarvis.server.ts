// Integrazione Jack (n8n). Solo server. Mai dati personali nei payload o nelle risposte.
import { timingSafeEqual } from "crypto";

export const CLICK_EVENTS = [
  "property_detail_whatsapp_click",
  "whatsapp_click",
  "contact_whatsapp_fallback_click",
  "phone_click",
  "property_detail_mobile_sticky_click",
  "property_detail_request_info_click",
] as const;

const CRM_BASE = "https://furiaimmobiliare.it/admin/richieste";

export function safeEqual(a: string | null | undefined, b: string | null | undefined): boolean {
  if (!a || !b) return false;
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  if (x.length !== y.length) {
    timingSafeEqual(y, y);
    return false;
  }
  return timingSafeEqual(x, y);
}

/** Traffico di test: utm_medium "qa" oppure utm_source che inizia con "jarvis_" o "test". */
export function isTestTraffic(source: string | null | undefined, medium: string | null | undefined): boolean {
  const s = (source ?? "").toLowerCase();
  return (medium ?? "").toLowerCase() === "qa" || s.startsWith("jarvis_") || s.startsWith("test");
}

export function channelOf(source: string | null | undefined, medium: string | null | undefined): string {
  if (!source && !medium) return "diretto";
  return [source, medium].filter(Boolean).join("/");
}

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

/** Verifica la chiave interna dei trigger (custodita nel vault del database). */
export async function verifyInternalKey(given: string | null): Promise<boolean> {
  if (!given) return false;
  const db = await admin();
  const { data, error } = await db.rpc("jarvis_internal_key" as never);
  if (error || typeof data !== "string") return false;
  return safeEqual(given, data);
}

async function propertyRef(id: string | null) {
  if (!id) return { immobile_codice: null, immobile_titolo: null };
  const db = await admin();
  const { data } = await db.from("properties").select("reference_code, title").eq("id", id).maybeSingle();
  return { immobile_codice: data?.reference_code ?? null, immobile_titolo: data?.title ?? null };
}

export async function buildPayload(tipo: "lead" | "clic", id: string) {
  const db = await admin();
  if (tipo === "lead") {
    // Solo colonne non personali.
    const { data } = await db
      .from("leads")
      .select("id, created_at, source, source_page, utm_source, utm_medium, property_id")
      .eq("id", id)
      .maybeSingle();
    if (!data || isTestTraffic(data.utm_source, data.utm_medium)) return null;
    return {
      tipo: "lead" as const,
      evento: `lead_${data.source ?? "form"}`,
      quando: data.created_at,
      lead_id: data.id,
      ...(await propertyRef(data.property_id)),
      canale: channelOf(data.utm_source, data.utm_medium),
      pagina: data.source_page ?? null,
      lingua: null as string | null,
      link_crm: `${CRM_BASE}?lead=${data.id}`,
    };
  }
  const { data } = await db
    .from("site_events")
    .select("event_name, created_at, page_path, language, property_id, property_code, lead_id, utm_source, utm_medium")
    .eq("id", id)
    .maybeSingle();
  if (!data || !(CLICK_EVENTS as readonly string[]).includes(data.event_name)) return null;
  if (isTestTraffic(data.utm_source, data.utm_medium)) return null;
  const ref = await propertyRef(data.property_id);
  return {
    tipo: "clic" as const,
    evento: data.event_name,
    quando: data.created_at,
    immobile_codice: ref.immobile_codice ?? data.property_code ?? null,
    immobile_titolo: ref.immobile_titolo,
    canale: channelOf(data.utm_source, data.utm_medium),
    pagina: data.page_path,
    lingua: data.language,
    link_crm: data.lead_id ? `${CRM_BASE}?lead=${data.lead_id}` : null,
  };
}

/** POST a n8n con timeout 5 s. Errori solo nei log. Senza secret non invia nulla. */
export async function sendToN8n(payload: unknown): Promise<boolean> {
  const url = process.env["JARVIS_N8N_URL"];
  const key = process.env["JARVIS_N8N_KEY"];
  if (!url || !key) return false;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Jack-Key": key },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) console.error("[jarvis] n8n status", res.status);
    return res.ok;
  } catch (e) {
    console.error("[jarvis] n8n error", e);
    return false;
  }
}

/** Autorizzazione per gli endpoint chiamati da n8n. */
export function checkFuriaKey(request: Request): Response | null {
  const expected = process.env["JARVIS_FURIA_KEY"];
  if (!expected) return new Response("Service unavailable", { status: 503 });
  if (!safeEqual(request.headers.get("x-jarvis-key"), expected)) {
    return new Response("Unauthorized", { status: 401 });
  }
  return null;
}
