import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { MULTI_SELECT_FIELDS, parseMultiSelect, formatEpi } from "@/lib/admin/property-constants";

const SIGNED_TTL = 60 * 60 * 24; // 24h

/**
 * Image variant presets backed by Supabase Image Transformations.
 * Each variant is a separately-signed URL where the transform options
 * are baked into the JWT token. The bucket stays private; originals
 * remain untouched and are still used by A3 download, AI render and
 * enhancement flows (which sign their own URLs).
 */
export type ImageVariants = { card?: string; hero?: string; thumb?: string };

const VARIANT_OPTS = {
  card:  { width:  800, quality: 75, resize: "cover"   as const },
  hero:  { width: 1600, quality: 78, resize: "contain" as const },
  thumb: { width:  320, quality: 65, resize: "cover"   as const },
};
type VariantKey = keyof typeof VARIANT_OPTS;

export type PublicProperty = {
  id: string;
  slug: string | null;
  reference: string;
  title: string;
  titleEn: string | null;
  subtitleEn: string | null;
  summaryEn: string | null;
  locationDescriptionEn: string | null;
  location: string;
  price: string;
  priceRent: string;
  priceValue: number | null;
  type: string;
  sqm: number | null;
  sqmLabel: string | null;
  rooms: number | null;
  roomsLabel: string | null;
  bathrooms: number | null;
  bathroomsLabel: string | null;
  floor: string | null;
  energyClass: string | null;
  epi: string;
  image: string;
  gallery: string[];
  description: string;
  descriptionEn: string | null;
  attributes: Record<string, string>;
  amenities: string[];
  altreDotazioni: string | null;
  highlights: Array<{ key: string; label: string; items: string[]; note: string | null }>;
  commercialHighlights: string[];
  /**
   * Configurazione dell'evidenza per la voce "Occasione". `null` quando
   * l'etichetta non è selezionata o non deve essere messa in evidenza —
   * in quel caso "Occasione" resta tra i badge normali della valorizzazione.
   */
  occasione: {
    style: "badge" | "headline";
    onCard: boolean;
    onDetail: boolean;
    onFlyer: boolean;
  } | null;
  category: "vendita" | "affitto" | "scelti-per-voi";
  featured: boolean;
  tag?: string;
  isRent: boolean;
  galleryPairs: Record<string, string>;
  /** URLs of images that are AI renderings (subset of gallery or extra). */
  renderings: string[];
  /** Map of gallery URL -> true when that gallery slot IS a rendering itself. */
  galleryRenderingFlags: Record<string, true>;
  /**
   * Variant URL map keyed by the original signed URL that appears in
   * `image` / `gallery` / `renderings`. When a variant is missing
   * (external URL, transform failed, publisher-supplied URL, etc.)
   * consumers fall back to the original key.
   */
  imageVariants: Record<string, ImageVariants>;
  createdAt: string | null;
};

const PLACEHOLDER =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 4 3'><rect width='4' height='3' fill='%23e8e4dd'/></svg>`,
  );

function formatPrice(price: number | null, priceOnRequest: boolean, contract: string | null): string {
  if (priceOnRequest || price == null) return "Prezzo su richiesta";
  const formatted = new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(price);
  return contract === "affitto" ? `${formatted} / mese` : formatted;
}

function deriveCategory(contract: string | null): PublicProperty["category"] {
  if (contract === "affitto") return "affitto";
  return "vendita";
}

function isExternalUrl(p: string): boolean {
  return /^https?:\/\//i.test(p);
}

async function signMany(paths: string[]): Promise<Record<string, string>> {
  if (paths.length === 0) return {};
  const map: Record<string, string> = {};
  // Legacy rows store the full external URL directly in storage_path — pass through.
  const toSign: string[] = [];
  for (const p of paths) {
    if (isExternalUrl(p)) map[p] = p;
    else toSign.push(p);
  }
  if (toSign.length === 0) return map;
  const { data, error } = await supabaseAdmin.storage
    .from("property-images")
    .createSignedUrls(toSign, SIGNED_TTL);
  if (error || !data) return map;
  for (const item of data) {
    if (item.path && item.signedUrl) map[item.path] = item.signedUrl;
  }
  return map;
}

/**
 * Sign the given variant for each path in parallel. Returns a
 * `path -> signedUrl` map. Any failure is swallowed and the path is
 * simply omitted — callers fall back to the original URL.
 */
async function signVariant(
  paths: string[],
  variant: VariantKey,
): Promise<Record<string, string>> {
  if (paths.length === 0) return {};
  const opts = VARIANT_OPTS[variant];
  const results = await Promise.all(
    paths.map(async (p) => {
      try {
        const { data, error } = await supabaseAdmin.storage
          .from("property-images")
          .createSignedUrl(p, SIGNED_TTL, { transform: opts });
        if (error || !data?.signedUrl) return [p, null] as const;
        return [p, data.signedUrl] as const;
      } catch {
        return [p, null] as const;
      }
    }),
  );
  const out: Record<string, string> = {};
  for (const [p, u] of results) if (u) out[p] = u;
  return out;
}

async function signVariants(
  paths: string[],
  variants: VariantKey[],
): Promise<Record<VariantKey, Record<string, string>>> {
  const transformable = paths.filter((p) => !isExternalUrl(p));
  const entries = await Promise.all(
    variants.map(async (v) => [v, await signVariant(transformable, v)] as const),
  );
  return Object.fromEntries(entries) as Record<VariantKey, Record<string, string>>;
}

type PropertyRow = {
  id: string;
  slug: string | null;
  reference_code: string | null;
  title: string;
  title_en: string | null;
  subtitle_en: string | null;
  summary_en: string | null;
  location_description_en: string | null;
  municipality: string | null;
  area_zone: string | null;
  price: number | null;
  price_on_request: boolean;
  property_type: string | null;
  contract_type: string | null;
  size_sqm: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  floors: number | null;
  short_notes: string | null;
  panoramic_view: boolean;
  historic_property: boolean;
  featured: boolean;
  energy_class: string | null;
  energy_performance_index_status: string | null;
  energy_performance_index_value: number | null;
  commercial_highlights: string[] | null;
  occasione_settings?: Record<string, unknown> | null;
  created_at: string | null;
};

type ImageRow = {
  property_id: string;
  published_image_url: string | null;
  storage_path: string;
  rendered_storage_path: string | null;
  use_rendered: boolean;
  enhanced_storage_path: string | null;
  enhanced_image_url: string | null;
  use_enhanced: boolean;
  alt_text: string | null;
  sort_order: number;
  is_cover: boolean;
  render_publish_mode?: string | null;
  rendered_image_url?: string | null;
};

type FeatureRow = { property_id: string; feature_name: string; feature_value: string | null };
type DescriptionRow = { property_id: string; edited_description: string | null; generated_description: string | null; description_en: string | null };

function buildTag(p: PropertyRow): string | undefined {
  if (p.historic_property) return "Storico";
  if (p.panoramic_view) return "Panoramico";
  return undefined;
}

function adapt(
  p: PropertyRow,
  images: ImageRow[],
  features: FeatureRow[],
  description: DescriptionRow | undefined,
  signedMap: Record<string, string>,
  variantMaps: Partial<Record<VariantKey, Record<string, string>>> = {},
): PublicProperty {
  const sortedImages = [...images].sort((a, b) => {
    if (a.is_cover !== b.is_cover) return a.is_cover ? -1 : 1;
    return a.sort_order - b.sort_order;
  });
  const resolveBefore = (i: ImageRow): string | undefined => {
    if (i.published_image_url) return i.published_image_url;
    if (i.use_enhanced && i.enhanced_storage_path) {
      return i.enhanced_image_url ?? signedMap[i.enhanced_storage_path];
    }
    return signedMap[i.storage_path];
  };
  const resolveRender = (i: ImageRow): string | undefined => {
    if (i.rendered_image_url) return i.rendered_image_url;
    if (i.rendered_storage_path) return signedMap[i.rendered_storage_path];
    return undefined;
  };
  const galleryPairs: Record<string, string> = {};
  const renderings: string[] = [];
  const galleryRenderingFlags: Record<string, true> = {};
  const gallery = sortedImages
    .map((i) => {
      const before = resolveBefore(i);
      const render = resolveRender(i);
      // Emotional mode: keep original in gallery, attach render as Before/After overlay.
      if (i.render_publish_mode === "emotional" && render && before) {
        galleryPairs[before] = render;
        renderings.push(render);
        return before;
      }
      // Main-replacement mode: render becomes the gallery image (legacy behavior).
      if (i.use_rendered && render) return render;
      return before;
    })
    .filter((v): v is string => !!v);
  // Mark gallery slots that ARE rendering images (main-replacement mode).
  sortedImages.forEach((i) => {
    const render = resolveRender(i);
    if (!render) return;
    const isMainRender = i.use_rendered || i.render_publish_mode === "main";
    if (isMainRender) {
      galleryRenderingFlags[render] = true;
      if (!renderings.includes(render)) renderings.push(render);
    }
  });
  const cover = gallery[0] ?? PLACEHOLDER;
  // Build imageVariants keyed by the URL that consumers will pass.
  // We walk every image row and, for each "original" path that was
  // signed via signedMap, attach the matching variant URLs if present.
  const imageVariants: Record<string, ImageVariants> = {};
  const attach = (path: string | null | undefined) => {
    if (!path || isExternalUrl(path)) return;
    const origUrl = signedMap[path];
    if (!origUrl) return;
    const v: ImageVariants = {};
    if (variantMaps.card?.[path])  v.card  = variantMaps.card[path];
    if (variantMaps.hero?.[path])  v.hero  = variantMaps.hero[path];
    if (variantMaps.thumb?.[path]) v.thumb = variantMaps.thumb[path];
    if (v.card || v.hero || v.thumb) imageVariants[origUrl] = v;
  };
  for (const i of sortedImages) {
    attach(i.storage_path);
    attach(i.enhanced_storage_path);
    attach(i.rendered_storage_path);
  }
  const attrs: Record<string, string> = {};
  const amenities: string[] = [];
  let altre: string | null = null;
  const multiKeys: Set<string> = new Set(MULTI_SELECT_FIELDS.map((m) => m.key));
  const multiRaw: Record<string, string> = {};
  for (const f of features) {
    if (!f.feature_value) continue;
    if (f.feature_name.startsWith("amenity:")) {
      amenities.push(f.feature_value);
      continue;
    }
    if (f.feature_name === "altre_dotazioni") {
      altre = f.feature_value;
      continue;
    }
    if (multiKeys.has(f.feature_name)) {
      multiRaw[f.feature_name] = f.feature_value;
      continue;
    }
    attrs[f.feature_name] = f.feature_value;
  }
  const highlights = MULTI_SELECT_FIELDS.map((m) => {
    const parsed = parseMultiSelect(multiRaw[m.key]);
    const items = parsed.selected.filter((s) => s !== "Altro");
    return {
      key: m.key,
      label: m.label,
      items,
      note: null as string | null,
    };
  }).filter((h) => h.items.length > 0);
  const ch = Array.isArray(p.commercial_highlights) ? p.commercial_highlights : [];
  const occRaw = (p.occasione_settings ?? {}) as Record<string, unknown>;
  const occEnabled = ch.includes("Occasione") && occRaw.enabled === true;
  const occasione = occEnabled
    ? {
        style: (occRaw.style === "headline" ? "headline" : "badge") as "badge" | "headline",
        onCard: occRaw.on_card !== false,
        onDetail: occRaw.on_detail !== false,
        onFlyer: occRaw.on_flyer !== false,
      }
    : null;
  const location = [p.municipality, p.area_zone].filter(Boolean).join(" · ") || "Lunigiana";
  const sqmLabel = attrs["size_range"] || (p.size_sqm != null ? `${p.size_sqm} m²` : null);
  const roomsLabel = attrs["bedrooms_label"] || (p.bedrooms != null ? String(p.bedrooms) : null);
  const bathroomsLabel = attrs["bathrooms_label"] || (p.bathrooms != null ? String(p.bathrooms) : null);
  const floor = attrs["floor_label"] || (p.floors != null ? String(p.floors) : null);
  const epi = formatEpi(p.energy_performance_index_status, p.energy_performance_index_value);
  if (p.energy_class) attrs["Classe energetica"] = p.energy_class;
  attrs["IPE"] = epi;
  return {
    id: p.id,
    slug: p.slug,
    reference: p.reference_code || p.id.slice(0, 8).toUpperCase(),
    title: p.title,
    titleEn: p.title_en,
    subtitleEn: p.subtitle_en,
    summaryEn: p.summary_en,
    locationDescriptionEn: p.location_description_en,
    location,
    price: formatPrice(p.price, p.price_on_request, p.contract_type),
    priceRent: p.contract_type === "affitto" ? formatPrice(p.price, p.price_on_request, p.contract_type) : "",
    priceValue: p.price_on_request ? null : p.price,
    type: p.property_type || "Immobile",
    sqm: p.size_sqm,
    sqmLabel,
    rooms: p.bedrooms,
    roomsLabel,
    bathrooms: p.bathrooms,
    bathroomsLabel,
    floor,
    energyClass: p.energy_class,
    epi,
    image: cover,
    gallery: gallery.length ? gallery : [PLACEHOLDER],
    description: description?.edited_description || description?.generated_description || p.short_notes || "",
    descriptionEn: description?.description_en || null,
    attributes: attrs,
    amenities,
    altreDotazioni: altre,
    highlights,
    commercialHighlights: ch,
    occasione,
    category: deriveCategory(p.contract_type),
    featured: !!p.featured,
    tag: buildTag(p),
    isRent: p.contract_type === "affitto",
    galleryPairs,
    renderings,
    galleryRenderingFlags,
    imageVariants,
    createdAt: p.created_at,
  };
}

export const listPublishedProperties = createServerFn({ method: "GET" }).handler(async () => {
  const { data: props, error } = await supabaseAdmin
    .from("properties")
    .select(
      "id, slug, reference_code, title, title_en, subtitle_en, summary_en, location_description_en, municipality, area_zone, price, price_on_request, property_type, contract_type, size_sqm, bedrooms, bathrooms, floors, short_notes, panoramic_view, historic_property, featured, homepage_order, featured_at, energy_class, energy_performance_index_status, energy_performance_index_value, commercial_highlights, occasione_settings, created_at",
    )
    .eq("status", "published")
    .order("homepage_order", { ascending: true, nullsFirst: false })
    .order("featured_at", { ascending: false, nullsFirst: false })
    .order("updated_at", { ascending: false });
  if (error) throw new Error(error.message);
  const propRows = (props ?? []) as PropertyRow[];
  if (propRows.length === 0) return { properties: [] as PublicProperty[] };

  const ids = propRows.map((p) => p.id);

  const [imgRes, featRes, descRes] = await Promise.all([
    supabaseAdmin
      .from("property_images")
      .select("property_id, published_image_url, storage_path, rendered_storage_path, rendered_image_url, render_publish_mode, use_rendered, enhanced_storage_path, enhanced_image_url, use_enhanced, alt_text, sort_order, is_cover")
      .in("property_id", ids),
    supabaseAdmin
      .from("property_features")
      .select("property_id, feature_name, feature_value")
      .in("property_id", ids),
    supabaseAdmin
      .from("property_descriptions")
      .select("property_id, edited_description, generated_description, description_en")
      .in("property_id", ids),
  ]);

  const images = (imgRes.data ?? []) as ImageRow[];
  const features = (featRes.data ?? []) as FeatureRow[];
  const descriptions = (descRes.data ?? []) as DescriptionRow[];

  const allPaths = images.flatMap((i) => [
    i.storage_path,
    ...(i.rendered_storage_path ? [i.rendered_storage_path] : []),
    ...(i.enhanced_storage_path ? [i.enhanced_storage_path] : []),
  ]);
  const [signedMap, variantMaps] = await Promise.all([
    signMany(allPaths),
    signVariants(allPaths, ["card", "thumb"]),
  ]);

  const byProp = (arr: { property_id: string }[]) => {
    const m = new Map<string, any[]>();
    for (const r of arr) {
      const list = m.get(r.property_id) ?? [];
      list.push(r);
      m.set(r.property_id, list);
    }
    return m;
  };
  const imgMap = byProp(images);
  const featMap = byProp(features);
  const descMap = new Map(descriptions.map((d) => [d.property_id, d]));

  const result = propRows.map((p) =>
    adapt(p, imgMap.get(p.id) ?? [], featMap.get(p.id) ?? [], descMap.get(p.id), signedMap, variantMaps),
  );
  return { properties: result };
});

export const getPublishedProperty = createServerFn({ method: "GET" })
  .inputValidator((data: { id: string }) => z.object({ id: z.string().min(1).max(128) }).parse(data))
  .handler(async ({ data }) => {
    const { data: p, error } = await supabaseAdmin
      .from("properties")
    .select(
      "id, slug, reference_code, title, title_en, subtitle_en, summary_en, location_description_en, municipality, area_zone, price, price_on_request, property_type, contract_type, size_sqm, bedrooms, bathrooms, floors, short_notes, panoramic_view, historic_property, featured, energy_class, energy_performance_index_status, energy_performance_index_value, commercial_highlights, occasione_settings, created_at",
    )
      .eq("status", "published")
      .or(`id.eq.${data.id},slug.eq.${data.id}`)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!p) return { property: null };

    const propRow = p as PropertyRow;
    const [imgRes, featRes, descRes] = await Promise.all([
      supabaseAdmin
        .from("property_images")
        .select("property_id, published_image_url, storage_path, rendered_storage_path, rendered_image_url, render_publish_mode, use_rendered, enhanced_storage_path, enhanced_image_url, use_enhanced, alt_text, sort_order, is_cover")
        .eq("property_id", propRow.id),
      supabaseAdmin
        .from("property_features")
        .select("property_id, feature_name, feature_value")
        .eq("property_id", propRow.id),
      supabaseAdmin
        .from("property_descriptions")
        .select("property_id, edited_description, generated_description, description_en")
        .eq("property_id", propRow.id)
        .maybeSingle(),
    ]);

    const images = (imgRes.data ?? []) as ImageRow[];
    const features = (featRes.data ?? []) as FeatureRow[];
    const description = (descRes.data ?? undefined) as DescriptionRow | undefined;
    const allPaths = images.flatMap((i) => [
      i.storage_path,
      ...(i.rendered_storage_path ? [i.rendered_storage_path] : []),
      ...(i.enhanced_storage_path ? [i.enhanced_storage_path] : []),
    ]);
    const [signedMap, variantMaps] = await Promise.all([
      signMany(allPaths),
      signVariants(allPaths, ["card", "hero", "thumb"]),
    ]);

    return { property: adapt(propRow, images, features, description, signedMap, variantMaps) };
  });

/**
 * Lightweight listing endpoint: returns only the data needed by property
 * cards and the listing filters. Skips descriptions entirely and loads only
 * the cover image (or first image by sort_order) per property — and signs
 * just those paths. ~10x fewer rows + signed-URL calls than
 * listPublishedProperties when the catalogue has many photos.
 */
export const listPublishedPropertiesSummary = createServerFn({ method: "GET" }).handler(async () => {
  const { data: props, error } = await supabaseAdmin
    .from("properties")
    .select(
      "id, slug, reference_code, title, title_en, subtitle_en, summary_en, location_description_en, municipality, area_zone, price, price_on_request, property_type, contract_type, size_sqm, bedrooms, bathrooms, floors, short_notes, panoramic_view, historic_property, featured, homepage_order, featured_at, energy_class, energy_performance_index_status, energy_performance_index_value, commercial_highlights, occasione_settings, created_at",
    )
    .eq("status", "published")
    .order("homepage_order", { ascending: true, nullsFirst: false })
    .order("featured_at", { ascending: false, nullsFirst: false })
    .order("updated_at", { ascending: false });
  if (error) throw new Error(error.message);
  const propRows = (props ?? []) as PropertyRow[];
  if (propRows.length === 0) return { properties: [] as PublicProperty[] };

  const ids = propRows.map((p) => p.id);

  // Only fetch images flagged as cover, plus one fallback image per property
  // via sort_order. We over-fetch slightly (cover + first non-cover) but skip
  // every other photo and all render/enhanced variants from signing.
  const [imgRes, featRes] = await Promise.all([
    supabaseAdmin
      .from("property_images")
      .select("property_id, published_image_url, storage_path, rendered_storage_path, rendered_image_url, render_publish_mode, use_rendered, enhanced_storage_path, enhanced_image_url, use_enhanced, alt_text, sort_order, is_cover")
      .in("property_id", ids)
      .order("is_cover", { ascending: false })
      .order("sort_order", { ascending: true })
      ,
    supabaseAdmin
      .from("property_features")
      .select("property_id, feature_name, feature_value")
      .in("property_id", ids),
  ]);

  const allImages = (imgRes.data ?? []) as ImageRow[];
  const features = (featRes.data ?? []) as FeatureRow[];

  // Keep only the first (cover) image per property — that's all the card needs.
  const coverByProp = new Map<string, ImageRow>();
  for (const img of allImages) {
    if (!coverByProp.has(img.property_id)) coverByProp.set(img.property_id, img);
  }
  const coverImages = Array.from(coverByProp.values());

  // Sign only paths actually used to render the cover.
  const pathsToSign: string[] = [];
  for (const i of coverImages) {
    if (i.published_image_url) continue;
    // pick the one path that resolveBefore/resolveRender will actually read
    if (i.use_rendered && i.rendered_image_url) continue;
    if (i.use_rendered && i.rendered_storage_path) {
      pathsToSign.push(i.rendered_storage_path);
      continue;
    }
    if (i.use_enhanced && i.enhanced_storage_path) {
      if (!i.enhanced_image_url) pathsToSign.push(i.enhanced_storage_path);
      continue;
    }
    pathsToSign.push(i.storage_path);
  }
  const [signedMap, variantMaps] = await Promise.all([
    signMany(pathsToSign),
    signVariants(pathsToSign, ["card", "thumb"]),
  ]);

  const featMap = new Map<string, FeatureRow[]>();
  for (const f of features) {
    const list = featMap.get(f.property_id) ?? [];
    list.push(f);
    featMap.set(f.property_id, list);
  }

  const result = propRows.map((p) => {
    const cover = coverByProp.get(p.id);
    return adapt(p, cover ? [cover] : [], featMap.get(p.id) ?? [], undefined, signedMap, variantMaps);
  });
  return { properties: result };
});