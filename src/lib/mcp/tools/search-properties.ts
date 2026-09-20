import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

const SELECT =
  "id, reference_code, slug, title, municipality, area_zone, property_type, contract_type, price, price_on_request, size_sqm, bedrooms, bathrooms, energy_class, garden, panoramic_view, historic_property, featured, status, short_notes, created_at";

type Row = {
  id: string;
  reference_code: string | null;
  slug: string | null;
  title: string;
  municipality: string | null;
  area_zone: string | null;
  property_type: string | null;
  contract_type: string | null;
  price: number | null;
  price_on_request: boolean;
  size_sqm: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  energy_class: string | null;
  garden: boolean;
  panoramic_view: boolean;
  historic_property: boolean;
  featured: boolean;
  status: string;
  short_notes: string | null;
  created_at: string;
};

export const toPropertyJson = (row: Row) => ({
  id: row.id,
  reference_code: row.reference_code,
  slug: row.slug,
  title: row.title,
  municipality: row.municipality,
  area_zone: row.area_zone,
  property_type: row.property_type,
  contract_type: row.contract_type,
  price: row.price,
  price_on_request: row.price_on_request,
  size_sqm: row.size_sqm,
  bedrooms: row.bedrooms,
  bathrooms: row.bathrooms,
  energy_class: row.energy_class,
  garden: row.garden,
  panoramic_view: row.panoramic_view,
  historic_property: row.historic_property,
  featured: row.featured,
  status: row.status,
  short_notes: row.short_notes,
  created_at: row.created_at,
  url: row.slug ? `https://furiaimmobiliare.it/immobili/${row.slug}` : null,
});

export default defineTool({
  name: "search_properties",
  title: "Cerca immobili",
  description:
    "Search the Furia Immobiliare portfolio (published listings by default) by comune, type, contract, price and size.",
  inputSchema: {
    query: z
      .string()
      .trim()
      .max(200)
      .nullable()
      .describe("Free text matched against title and reference code. Null for no text filter."),
    municipality: z
      .string()
      .trim()
      .max(100)
      .nullable()
      .describe("Comune, e.g. Pontremoli. Null for any."),
    property_type: z
      .string()
      .trim()
      .max(60)
      .nullable()
      .describe("Property type as stored, e.g. casa, villa, rustico. Null for any."),
    contract_type: z
      .enum(["vendita", "affitto"])
      .nullable()
      .describe("Sale or rent. Null for any."),
    max_price: z.number().positive().nullable().describe("Maximum price in EUR. Null for any."),
    min_size_sqm: z.number().positive().nullable().describe("Minimum size in sqm. Null for any."),
    include_unpublished: z
      .boolean()
      .describe("When true, also return drafts and other non-published listings (staff only)."),
    limit: z.number().int().min(1).max(50).describe("Maximum number of results, 1-50."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (args, ctx) => {
    if (!ctx.isAuthenticated()) throw new ToolError("Not authenticated");
    const supabase = supabaseForUser(ctx);
    let q = supabase
      .from("properties")
      .select(SELECT)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(args.limit);

    if (!args.include_unpublished) q = q.eq("status", "published");
    if (args.municipality) q = q.ilike("municipality", `%${args.municipality}%`);
    if (args.property_type) q = q.ilike("property_type", `%${args.property_type}%`);
    if (args.contract_type) q = q.eq("contract_type", args.contract_type);
    if (args.max_price) q = q.lte("price", args.max_price);
    if (args.min_size_sqm) q = q.gte("size_sqm", args.min_size_sqm);
    if (args.query) {
      const safe = args.query.replace(/[,()]/g, " ");
      q = q.or(`title.ilike.%${safe}%,reference_code.ilike.%${safe}%`);
    }

    const { data, error } = await q;
    if (error) throw new ToolError(error.message);
    const properties = (data ?? []).map((row) => toPropertyJson(row as Row));
    return {
      content: [
        {
          type: "text" as const,
          text:
            properties.length === 0
              ? "Nessun immobile trovato con questi criteri."
              : properties
                  .map(
                    (p) =>
                      `${p.reference_code ?? p.id} — ${p.title} (${p.municipality ?? "n/d"}) — ${
                        p.price_on_request || p.price == null ? "prezzo su richiesta" : `${p.price} EUR`
                      }`,
                  )
                  .join("\n"),
        },
      ],
      structuredContent: { properties },
    };
  },
});
