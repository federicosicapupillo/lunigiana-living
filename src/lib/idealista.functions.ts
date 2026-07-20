import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type IdealistaStatus =
  | "not_published"
  | "to_publish"
  | "published"
  | "error"
  | "to_update"
  | "removed";

const REQUIRED_FIELDS: Array<{ key: string; label: string; check: (p: any, d: any) => boolean }> = [
  { key: "title", label: "Titolo", check: (p) => !!p?.title?.trim() },
  {
    key: "description",
    label: "Descrizione (min. 40 caratteri)",
    check: (_p, d) => {
      const t = (d?.edited_description || d?.generated_description || "").trim();
      return t.length >= 40;
    },
  },
  { key: "price", label: "Prezzo", check: (p) => !!p?.price_on_request || (p?.price != null && p.price > 0) },
  { key: "contract_type", label: "Vendita/Affitto", check: (p) => !!p?.contract_type },
  { key: "property_type", label: "Tipologia immobile", check: (p) => !!p?.property_type },
  { key: "municipality", label: "Comune", check: (p) => !!p?.municipality },
  { key: "province", label: "Provincia", check: (p) => !!p?.province },
  { key: "size_sqm", label: "Metratura (mq)", check: (p) => p?.size_sqm != null && p.size_sqm > 0 },
  { key: "bedrooms", label: "Camere", check: (p) => p?.bedrooms != null },
  { key: "bathrooms", label: "Bagni", check: (p) => p?.bathrooms != null },
  { key: "energy_class", label: "Classe energetica", check: (p) => !!p?.energy_class },
];

function missingFields(property: any, description: any): string[] {
  return REQUIRED_FIELDS.filter((f) => !f.check(property, description)).map((f) => f.label);
}

function parseFeedSettings(raw: string | null | undefined) {
  if (!raw) return { token: null as string | null, last_generated_at: null as string | null };
  try {
    const j = JSON.parse(raw);
    return { token: j.token ?? null, last_generated_at: j.last_generated_at ?? null };
  } catch {
    return { token: null, last_generated_at: null };
  }
}

async function assertAdmin(userId: string) {
  const { data } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (!data) throw new Error("Forbidden");
}

export const getIdealistaOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);

    const { data: props } = await supabaseAdmin
      .from("properties")
      .select(
        "id, title, reference_code, status, contract_type, property_type, municipality, province, price, price_on_request, size_sqm, bedrooms, bathrooms, energy_class, idealista_status, idealista_last_sync_at, idealista_last_error, short_notes",
      )
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    const ids = (props ?? []).map((p) => p.id);
    const { data: descs } = ids.length
      ? await supabaseAdmin
          .from("property_descriptions")
          .select("property_id, generated_description, edited_description")
          .in("property_id", ids)
      : { data: [] as any[] };
    const descMap = new Map((descs ?? []).map((d: any) => [d.property_id, d]));

    const { data: imgCounts } = ids.length
      ? await supabaseAdmin
          .from("property_images")
          .select("property_id, idealista_included")
          .in("property_id", ids)
      : { data: [] as any[] };
    const imgMap = new Map<string, { total: number; included: number }>();
    for (const r of imgCounts ?? []) {
      const cur = imgMap.get(r.property_id) ?? { total: 0, included: 0 };
      cur.total += 1;
      if (r.idealista_included) cur.included += 1;
      imgMap.set(r.property_id, cur);
    }

    const enriched = (props ?? []).map((p: any) => {
      const missing = missingFields(p, descMap.get(p.id));
      const counts = imgMap.get(p.id) ?? { total: 0, included: 0 };
      return {
        ...p,
        missing,
        photos_total: counts.total,
        photos_included: counts.included,
      };
    });

    const { data: feedRow } = await supabaseAdmin
      .from("site_settings")
      .select("value, updated_at")
      .eq("key", "idealista_feed")
      .maybeSingle();
    const feed = parseFeedSettings(feedRow?.value);

    return { properties: enriched, feed };
  });

export const setIdealistaStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { propertyId: string; status: IdealistaStatus }) =>
    z
      .object({
        propertyId: z.string().uuid(),
        status: z.enum(["not_published", "to_publish", "published", "error", "to_update", "removed"]),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { error } = await supabaseAdmin
      .from("properties")
      .update({
        idealista_status: data.status,
        idealista_last_error: data.status === "error" ? "Dati mancanti" : null,
      })
      .eq("id", data.propertyId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const setIdealistaImageIncluded = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { imageId: string; included: boolean }) =>
    z.object({ imageId: z.string().uuid(), included: z.boolean() }).parse(data),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { error } = await supabaseAdmin
      .from("property_images")
      .update({ idealista_included: data.included })
      .eq("id", data.imageId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getIdealistaPropertyImages = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { propertyId: string }) =>
    z.object({ propertyId: z.string().uuid() }).parse(data),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { data: imgs } = await supabaseAdmin
      .from("property_images")
      .select(
        "id, image_url, rendered_image_url, enhanced_image_url, is_cover, sort_order, use_rendered, use_enhanced, render_status, idealista_included",
      )
      .eq("property_id", data.propertyId)
      .order("sort_order", { ascending: true });
    return { images: imgs ?? [] };
  });

export const rotateIdealistaFeedToken = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const token = Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    const { data: existing } = await supabaseAdmin
      .from("site_settings")
      .select("value")
      .eq("key", "idealista_feed")
      .maybeSingle();
    const parsed = parseFeedSettings(existing?.value);
    const value = JSON.stringify({ ...parsed, token });
    const { error } = await supabaseAdmin
      .from("site_settings")
      .upsert({ key: "idealista_feed", value, updated_at: new Date().toISOString(), updated_by: context.userId });
    if (error) throw new Error(error.message);
    return { token };
  });

// --- Idealista account configuration (email only; never store passwords) ---

function parseAccount(raw: string | null | undefined): { email: string | null } {
  if (!raw) return { email: null };
  try {
    const j = JSON.parse(raw);
    return { email: typeof j.email === "string" ? j.email : null };
  } catch {
    return { email: null };
  }
}

export const getIdealistaAccount = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { data } = await supabaseAdmin
      .from("site_settings")
      .select("value, updated_at")
      .eq("key", "idealista_account")
      .maybeSingle();
    return { account: parseAccount(data?.value), updated_at: data?.updated_at ?? null };
  });

export const setIdealistaAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { email: string }) =>
    z
      .object({
        email: z.string().trim().email("Email non valida").max(255),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const value = JSON.stringify({ email: data.email });
    const { error } = await supabaseAdmin
      .from("site_settings")
      .upsert({
        key: "idealista_account",
        value,
        updated_at: new Date().toISOString(),
        updated_by: context.userId,
      });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// --- Server-only feed builder (used by /api/public/idealista/feed.xml) ---

function escapeXml(s: string | number | null | undefined): string {
  if (s == null) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function buildIdealistaFeedXml(): Promise<{ xml: string; count: number }> {
  const { data: props } = await supabaseAdmin
    .from("properties")
    .select("*")
    .eq("status", "published")
    .in("idealista_status", ["to_publish", "published"])
    .is("deleted_at", null);

  const items: string[] = [];
  let count = 0;
  for (const p of (props as any[]) ?? []) {
    const { data: desc } = await supabaseAdmin
      .from("property_descriptions")
      .select("generated_description, edited_description")
      .eq("property_id", p.id)
      .maybeSingle();
    const missing = missingFields(p, desc);
    if (missing.length > 0) continue;

    const { data: imgs } = await supabaseAdmin
      .from("property_images")
      .select("image_url, rendered_image_url, enhanced_image_url, use_rendered, use_enhanced, is_cover, sort_order, idealista_included")
      .eq("property_id", p.id)
      .eq("idealista_included", true)
      .order("sort_order", { ascending: true });

    const photoTags = (imgs ?? [])
      .map((img: any) => {
        const url = img.use_enhanced && img.enhanced_image_url
          ? img.enhanced_image_url
          : img.image_url;
        return `      <photo><url>${escapeXml(url)}</url></photo>`;
      })
      .join("\n");

    const description = (desc?.edited_description || desc?.generated_description || "").trim();

    items.push(
      `  <property>\n` +
        `    <reference>${escapeXml(p.reference_code)}</reference>\n` +
        `    <operation>${escapeXml(p.contract_type)}</operation>\n` +
        `    <type>${escapeXml(p.property_type)}</type>\n` +
        `    <title><![CDATA[${p.title ?? ""}]]></title>\n` +
        `    <description><![CDATA[${description}]]></description>\n` +
        `    <price>${p.price_on_request ? "" : escapeXml(p.price ?? "")}</price>\n` +
        `    <price_on_request>${p.price_on_request ? "true" : "false"}</price_on_request>\n` +
        `    <currency>EUR</currency>\n` +
        `    <address>\n` +
        `      <country>${escapeXml(p.country ?? "Italia")}</country>\n` +
        `      <province>${escapeXml(p.province)}</province>\n` +
        `      <municipality>${escapeXml(p.municipality)}</municipality>\n` +
        `      <zone>${escapeXml(p.area_zone ?? p.locality ?? "")}</zone>\n` +
        `      <postal_code>${escapeXml(p.postal_code ?? "")}</postal_code>\n` +
        `      <show_address>${p.show_full_address ? "true" : "false"}</show_address>\n` +
        `      <street>${escapeXml(p.show_full_address ? (p.address ?? "") : "")}</street>\n` +
        `      <latitude>${escapeXml(p.latitude ?? "")}</latitude>\n` +
        `      <longitude>${escapeXml(p.longitude ?? "")}</longitude>\n` +
        `    </address>\n` +
        `    <features>\n` +
        `      <size_sqm>${escapeXml(p.size_sqm)}</size_sqm>\n` +
        `      <bedrooms>${escapeXml(p.bedrooms)}</bedrooms>\n` +
        `      <bathrooms>${escapeXml(p.bathrooms)}</bathrooms>\n` +
        `      <floor>${escapeXml(p.floors ?? "")}</floor>\n` +
        `      <energy_class>${escapeXml(p.energy_class)}</energy_class>\n` +
        `      <epi_value>${escapeXml(p.energy_performance_index_value ?? "")}</epi_value>\n` +
        `      <epi_status>${escapeXml(p.energy_performance_index_status ?? "")}</epi_status>\n` +
        `      <panoramic_view>${p.panoramic_view ? "true" : "false"}</panoramic_view>\n` +
        `      <historic_property>${p.historic_property ? "true" : "false"}</historic_property>\n` +
        `      <garden>${p.garden ? "true" : "false"}</garden>\n` +
        `      <terrace>${p.terrace ? "true" : "false"}</terrace>\n` +
        `      <balcony>${p.balcony ? "true" : "false"}</balcony>\n` +
        `      <garage>${p.garage ? "true" : "false"}</garage>\n` +
        `      <cellar>${p.cellar ? "true" : "false"}</cellar>\n` +
        `      <elevator>${p.elevator ? "true" : "false"}</elevator>\n` +
        `      <furnished>${p.furnished ? "true" : "false"}</furnished>\n` +
        `    </features>\n` +
        `    <photos>\n${photoTags}\n    </photos>\n` +
        `  </property>`,
    );
    count += 1;
  }

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<properties generated_at="${new Date().toISOString()}" source="furia-immobiliare">\n` +
    items.join("\n") +
    `\n</properties>`;

  return { xml, count };
}

export async function touchIdealistaFeedTimestamp() {
  const { data: existing } = await supabaseAdmin
    .from("site_settings")
    .select("value")
    .eq("key", "idealista_feed")
    .maybeSingle();
  const parsed = parseFeedSettings(existing?.value);
  const value = JSON.stringify({ ...parsed, last_generated_at: new Date().toISOString() });
  await supabaseAdmin
    .from("site_settings")
    .upsert({ key: "idealista_feed", value, updated_at: new Date().toISOString() });
}

export async function getIdealistaFeedToken(): Promise<string | null> {
  const { data } = await supabaseAdmin
    .from("site_settings")
    .select("value")
    .eq("key", "idealista_feed")
    .maybeSingle();
  return parseFeedSettings(data?.value).token;
}

// --- Feed verification ---

export const verifyIdealistaFeed = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);

    const token = await getIdealistaFeedToken();
    if (!token) {
      return {
        ok: false,
        errors: ["Token feed mancante. Rigenera il token."],
        warnings: [],
        propertyCount: 0,
        photoCount: 0,
        excluded: [] as { reference: string; reason: string }[],
        renderIncluded: [] as { reference: string; count: number }[],
        unreachablePhotos: [] as { reference: string; url: string; status: number | string }[],
        xmlBytes: 0,
      };
    }

    const errors: string[] = [];
    const warnings: string[] = [];
    const excluded: { reference: string; reason: string }[] = [];
    const renderIncluded: { reference: string; count: number }[] = [];
    const unreachablePhotos: { reference: string; url: string; status: number | string }[] = [];

    // Re-run the same query as buildIdealistaFeedXml to know who's in/out and why
    const { data: props } = await supabaseAdmin
      .from("properties")
      .select("*")
      .eq("status", "published")
      .in("idealista_status", ["to_publish", "published"])
      .is("deleted_at", null);

    let propertyCount = 0;
    let photoCount = 0;
    const photoUrls: { reference: string; url: string }[] = [];

    for (const p of (props as any[]) ?? []) {
      const { data: desc } = await supabaseAdmin
        .from("property_descriptions")
        .select("generated_description, edited_description")
        .eq("property_id", p.id)
        .maybeSingle();
      const missing = missingFields(p, desc);
      if (missing.length > 0) {
        excluded.push({ reference: p.reference_code, reason: `Campi mancanti: ${missing.join(", ")}` });
        continue;
      }

      const { data: imgs } = await supabaseAdmin
        .from("property_images")
        .select("image_url, rendered_image_url, enhanced_image_url, use_rendered, use_enhanced, render_status, idealista_included")
        .eq("property_id", p.id)
        .eq("idealista_included", true);

      const list = imgs ?? [];
      if (list.length === 0) {
        excluded.push({ reference: p.reference_code, reason: "Nessuna foto inclusa" });
        continue;
      }

      const aiRenders = list.filter((i: any) => i.use_rendered || (i.render_status === "completed" && i.rendered_image_url));
      if (aiRenders.length > 0) {
        renderIncluded.push({ reference: p.reference_code, count: aiRenders.length });
      }

      propertyCount += 1;
      photoCount += list.length;
      for (const img of list as any[]) {
        const url = img.use_enhanced && img.enhanced_image_url ? img.enhanced_image_url : img.image_url;
        if (url) photoUrls.push({ reference: p.reference_code, url });
      }
    }

    if (propertyCount === 0) {
      errors.push("Il feed è vuoto: nessun immobile pronto per Idealista.");
    }

    // Sample-check first N photos to keep this fast
    const sample = photoUrls.slice(0, 20);
    await Promise.all(
      sample.map(async ({ reference, url }) => {
        try {
          const res = await fetch(url, { method: "HEAD" });
          if (!res.ok) unreachablePhotos.push({ reference, url, status: res.status });
        } catch (e: any) {
          unreachablePhotos.push({ reference, url, status: e?.message ?? "fetch error" });
        }
      }),
    );

    // Validate XML builds without throwing
    let xmlBytes = 0;
    try {
      const { xml } = await buildIdealistaFeedXml();
      xmlBytes = new TextEncoder().encode(xml).length;
    } catch (e: any) {
      errors.push(`Errore generazione XML: ${e?.message ?? "sconosciuto"}`);
    }

    if (renderIncluded.length > 0) {
      warnings.push(
        `Rendering AI inclusi in ${renderIncluded.length} immobili. Verifica che siano autorizzati.`,
      );
    }
    if (unreachablePhotos.length > 0) {
      errors.push(`${unreachablePhotos.length} foto non raggiungibili su ${sample.length} verificate.`);
    }

    return {
      ok: errors.length === 0,
      errors,
      warnings,
      propertyCount,
      photoCount,
      excluded,
      renderIncluded,
      unreachablePhotos,
      xmlBytes,
    };
  });

// --- Idealista V6 JSON sample export ---
// Builds a JSON payload conforming to the Idealista "properties integration V6"
// bulk format, populated from currently published Furia Immobiliare properties.
// Note: some V6 enumerated values (heating types, condition, etc.) are best-effort
// mappings from Furia's Italian free-text fields. Idealista schemas were not
// available at build time; a follow-up pass should validate against the official
// JSON Schemas once provided.

const PROPERTY_TYPE_TO_V6: Record<string, string> = {
  appartamento: "flat",
  attico: "flat",
  monolocale: "flat",
  bilocale: "flat",
  trilocale: "flat",
  loft: "flat",
  casa: "house",
  villa: "house",
  villetta: "house",
  "casa singola": "house",
  "casa indipendente": "house",
  "casa semindipendente": "house",
  "casa a schiera": "house",
  rustico: "rustic",
  casale: "rustic",
  cascina: "rustic",
  fattoria: "rustic",
  terreno: "land",
  "terreno agricolo": "land",
  "terreno edificabile": "land",
  box: "garage",
  garage: "garage",
  posto: "garage",
  "posto auto": "garage",
  ufficio: "office",
  "locale commerciale": "premises_commercial",
  negozio: "premises_commercial",
  magazzino: "storage",
  deposito: "storage",
  cantina: "storage",
  palazzo: "building",
  edificio: "building",
  stabile: "building",
};

function mapPropertyTypeToV6(pt: string | null | undefined): string {
  if (!pt) return "house";
  const key = pt.trim().toLowerCase();
  if (PROPERTY_TYPE_TO_V6[key]) return PROPERTY_TYPE_TO_V6[key];
  for (const [k, v] of Object.entries(PROPERTY_TYPE_TO_V6)) {
    if (key.includes(k)) return v;
  }
  return "house";
}

function mapContractTypeToV6(ct: string | null | undefined): "sale" | "rent" {
  const k = (ct ?? "").toLowerCase();
  if (k.includes("affitt") || k.includes("rent") || k.includes("locaz")) return "rent";
  return "sale";
}

function mapConditionToV6(c: string | null | undefined): string | undefined {
  if (!c) return undefined;
  const k = c.toLowerCase();
  if (k.includes("nuov")) return "new";
  if (k.includes("ottim") || k.includes("ristruttur") || k.includes("buon")) return "good";
  if (k.includes("ristruttur")) return "renewed";
  if (k.includes("da ristr") || k.includes("restaur") || k.includes("rudere")) return "toRestore";
  return "good";
}

function digits(s: string | null | undefined): string {
  return (s ?? "").replace(/\D+/g, "");
}

function splitPhone(raw: string | null | undefined, defaultPrefix = "39"): {
  prefix: string;
  number: string;
} | null {
  if (!raw) return null;
  const t = raw.trim();
  if (!t) return null;
  const m = t.match(/^\+?(\d{1,3})[\s\-]?(\d{5,})$/);
  if (m) return { prefix: m[1], number: m[2] };
  const d = digits(t);
  if (!d) return null;
  if (d.startsWith("00")) {
    const rest = d.slice(2);
    return { prefix: rest.slice(0, 2), number: rest.slice(2) };
  }
  return { prefix: defaultPrefix, number: d };
}

function languageCode(lang: string): string {
  const k = lang.toLowerCase();
  if (k.startsWith("it")) return "italian";
  if (k.startsWith("en")) return "english";
  if (k.startsWith("es")) return "spanish";
  if (k.startsWith("fr")) return "french";
  if (k.startsWith("de")) return "german";
  if (k.startsWith("pt")) return "portuguese";
  if (k.startsWith("ru")) return "russian";
  if (k.startsWith("zh")) return "chinese";
  return "italian";
}

function formatSendDate(d: Date): string {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export const buildIdealistaV6Sample = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);

    // Load customer config from site_settings
    const { data: cfgRow } = await supabaseAdmin
      .from("site_settings")
      .select("value")
      .eq("key", "idealista_v6_customer")
      .maybeSingle();
    let cfg: any = {};
    try {
      cfg = cfgRow?.value ? JSON.parse(cfgRow.value) : {};
    } catch {
      cfg = {};
    }
    const { data: acctRow } = await supabaseAdmin
      .from("site_settings")
      .select("value")
      .eq("key", "idealista_account")
      .maybeSingle();
    const acctEmail = (() => {
      try {
        return acctRow?.value ? JSON.parse(acctRow.value).email : null;
      } catch {
        return null;
      }
    })();

    const contactPhone = splitPhone(cfg.contactPrimaryPhone ?? "+39 0187 831165");
    const contactPhone2 = splitPhone(cfg.contactSecondaryPhone ?? "+39 335 6360402");

    // Load published properties eligible for Idealista
    const { data: props } = await supabaseAdmin
      .from("properties")
      .select("*")
      .eq("status", "published")
      .in("idealista_status", ["to_publish", "published"])
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    const propList: any[] = props ?? [];
    const propIds = propList.map((p) => p.id);

    const { data: descs } = propIds.length
      ? await supabaseAdmin
          .from("property_descriptions")
          .select("property_id, generated_description, edited_description, language")
          .in("property_id", propIds)
      : { data: [] as any[] };
    const descByProp = new Map<string, any[]>();
    for (const d of descs ?? []) {
      const arr = descByProp.get(d.property_id) ?? [];
      arr.push(d);
      descByProp.set(d.property_id, arr);
    }

    const { data: imgs } = propIds.length
      ? await supabaseAdmin
          .from("property_images")
          .select(
            "property_id, image_url, enhanced_image_url, use_enhanced, sort_order, is_cover, idealista_included",
          )
          .in("property_id", propIds)
          .eq("idealista_included", true)
          .order("sort_order", { ascending: true })
      : { data: [] as any[] };
    const imgsByProp = new Map<string, any[]>();
    for (const im of imgs ?? []) {
      const arr = imgsByProp.get(im.property_id) ?? [];
      arr.push(im);
      imgsByProp.set(im.property_id, arr);
    }

    const customerProperties = propList.map((p) => {
      const featuresType = mapPropertyTypeToV6(p.property_type);
      const operationType = mapContractTypeToV6(p.contract_type);
      const price = p.price_on_request ? undefined : Number(p.price ?? 0) || undefined;

      const propertyDescriptions: any[] = [];
      const seen = new Set<string>();
      // From property_descriptions (may hold multiple languages)
      for (const d of descByProp.get(p.id) ?? []) {
        const text = (d.edited_description || d.generated_description || "").trim();
        if (!text) continue;
        const lang = languageCode(d.language ?? "it");
        if (seen.has(lang)) continue;
        seen.add(lang);
        propertyDescriptions.push({ descriptionLanguage: lang, descriptionText: text });
      }
      // Fallback to summary_en for english if missing
      if (!seen.has("english") && p.summary_en) {
        propertyDescriptions.push({
          descriptionLanguage: "english",
          descriptionText: String(p.summary_en).trim(),
        });
      }

      const propertyImages = (imgsByProp.get(p.id) ?? []).map((im, i) => {
        const url = im.use_enhanced && im.enhanced_image_url ? im.enhanced_image_url : im.image_url;
        return {
          imageOrder: i + 1,
          imageLabel: im.is_cover ? "facade" : "details",
          imageUrl: url,
        };
      });

      const conservation = mapConditionToV6(p.condition);

      const property: any = {
        propertyCode: p.reference_code || p.id,
        propertyReference: p.slug || p.reference_code || p.id,
        propertyVisibility: "idealista",
        propertyOperation: {
          operationType,
          ...(price != null ? { operationPrice: price } : {}),
        },
        propertyAddress: {
          addressVisibility: p.show_full_address ? "street" : "hidden",
          ...(p.address ? { addressStreetName: p.address } : {}),
          ...(p.postal_code ? { addressPostalCode: p.postal_code } : {}),
          addressTown: p.municipality ?? "",
          addressCountry: "Italy",
          addressCoordinatesPrecision: p.show_full_address ? "exact" : "moved",
          ...(p.latitude != null ? { addressCoordinatesLatitude: Number(p.latitude) } : {}),
          ...(p.longitude != null ? { addressCoordinatesLongitude: Number(p.longitude) } : {}),
        },
        propertyFeatures: {
          featuresType,
          ...(p.size_sqm != null ? { featuresAreaConstructed: Number(p.size_sqm) } : {}),
          ...(p.bedrooms != null ? { featuresBedroomNumber: Number(p.bedrooms) } : {}),
          ...(p.bathrooms != null ? { featuresBathroomNumber: Number(p.bathrooms) } : {}),
          ...(conservation ? { featuresConservation: conservation } : {}),
          ...(p.energy_class ? { featuresEnergyCertificateRating: p.energy_class } : {}),
          ...(p.energy_performance_index_value != null
            ? { featuresEnergyCertificatePerformance: Number(p.energy_performance_index_value) }
            : {}),
          ...(p.garden ? { featuresGarden: true } : {}),
          ...(p.terrace ? { featuresTerrace: true } : {}),
          ...(p.garage ? { featuresParkingAvailable: true } : {}),
          ...(p.elevator ? { featuresLiftAvailable: true } : {}),
          ...(p.furnished ? { featuresEquippedWithFurniture: true } : {}),
          ...(p.historic_property ? { featuresHistoric: true } : {}),
        },
        propertyDescriptions,
        propertyImages,
      };

      return property;
    });

    const payload = {
      customerCountry: "Italy",
      customerCode: cfg.customerCode ?? "FURIA-PENDING",
      customerReference: cfg.customerReference ?? "furia-immobiliare",
      customerSendDate: formatSendDate(new Date()),
      customerContact: {
        contactName: cfg.contactName ?? "Furia Immobiliare",
        contactEmail: cfg.contactEmail ?? acctEmail ?? "info@furiaimmobiliare.it",
        ...(contactPhone
          ? {
              contactPrimaryPhonePrefix: contactPhone.prefix,
              contactPrimaryPhoneNumber: contactPhone.number,
            }
          : {}),
        ...(contactPhone2
          ? {
              contactSecondaryPhonePrefix: contactPhone2.prefix,
              contactSecondaryPhoneNumber: contactPhone2.number,
            }
          : {}),
      },
      customerProperties,
    };

    return {
      json: JSON.stringify(payload, null, 2),
      propertyCount: customerProperties.length,
      generatedAt: new Date().toISOString(),
    };
  });