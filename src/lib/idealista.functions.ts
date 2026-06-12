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