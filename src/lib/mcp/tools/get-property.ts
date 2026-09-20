import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "get_property",
  title: "Dettaglio immobile",
  description:
    "Fetch one listing with its full detail (features, description, gallery count) by reference code, slug or id.",
  inputSchema: {
    reference: z
      .string()
      .trim()
      .min(1)
      .max(120)
      .describe("Reference code (e.g. I709), slug, or the listing uuid."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ reference }, ctx) => {
    if (!ctx.isAuthenticated()) throw new ToolError("Not authenticated");
    const supabase = supabaseForUser(ctx);
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(reference);

    const base = supabase.from("properties").select("*").is("deleted_at", null).limit(1);
    const { data, error } = isUuid
      ? await base.eq("id", reference)
      : await base.or(`reference_code.eq.${reference},slug.eq.${reference}`);
    if (error) throw new ToolError(error.message);
    const row = data?.[0];
    if (!row) throw new ToolError(`Nessun immobile trovato per "${reference}".`);

    const [featuresRes, descriptionRes, imagesRes] = await Promise.all([
      supabase
        .from("property_features")
        .select("feature_name, feature_value")
        .eq("property_id", row.id),
      supabase
        .from("property_descriptions")
        .select("edited_description, generated_description, description_en")
        .eq("property_id", row.id)
        .maybeSingle(),
      supabase.from("property_images").select("id").eq("property_id", row.id),
    ]);

    const description =
      descriptionRes.data?.edited_description ?? descriptionRes.data?.generated_description ?? null;

    const property = {
      id: row.id,
      reference_code: row.reference_code,
      slug: row.slug,
      status: row.status,
      title: row.title,
      title_en: row.title_en,
      municipality: row.municipality,
      area_zone: row.area_zone,
      locality: row.locality,
      province: row.province,
      property_type: row.property_type,
      contract_type: row.contract_type,
      condition: row.condition,
      price: row.price,
      price_on_request: row.price_on_request,
      size_sqm: row.size_sqm,
      bedrooms: row.bedrooms,
      bathrooms: row.bathrooms,
      floors: row.floors,
      energy_class: row.energy_class,
      garden: row.garden,
      garage: row.garage,
      terrace: row.terrace,
      balcony: row.balcony,
      cellar: row.cellar,
      elevator: row.elevator,
      furnished: row.furnished,
      panoramic_view: row.panoramic_view,
      historic_property: row.historic_property,
      featured: row.featured,
      short_notes: row.short_notes,
      commercial_highlights: row.commercial_highlights,
      description,
      description_en: descriptionRes.data?.description_en ?? null,
      features: (featuresRes.data ?? []).map((f) => ({
        name: f.feature_name,
        value: f.feature_value,
      })),
      image_count: imagesRes.data?.length ?? 0,
      created_at: row.created_at,
      updated_at: row.updated_at,
      url: row.slug ? `https://furiaimmobiliare.it/immobili/${row.slug}` : null,
    };

    return {
      content: [
        {
          type: "text" as const,
          text: `${property.reference_code ?? property.id} — ${property.title}\nComune: ${
            property.municipality ?? "n/d"
          }\nStato: ${property.status}\n\n${description ?? "(nessuna descrizione)"}`,
        },
      ],
      structuredContent: { property },
    };
  },
});
